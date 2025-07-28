import Disponibilidad from '../models/disponibilidad.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

const TOTAL_SALAS = 20;
const SALAS_DISPONIBLES = Array.from({ length: TOTAL_SALAS }, (_, i) => `Sala ${i + 1}`);

const TIPOS_BLOQUE = [
    { tipo: 'TEO', nombre: 'Teórico', color: '#3B82F6' },
    { tipo: 'LAB', nombre: 'Laboratorio', color: '#10B981' },
    { tipo: 'PRA', nombre: 'Práctico', color: '#F59E0B' }
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const HORAS_DISPONIBLES = [
    '08:10', '09:30', '09:40', '11:00', '11:10', '12:30',
    '12:40', '14:00', '14:10', '15:30', '15:40', '17:00',
    '17:10', '18:30', '18:40', '20:00'
];


/**
 * Obtener disponibilidad de un profesor específico
 */
export const obtenerDisponibilidadProfesor = async (profesorId) => {
    try {
        // Convierte el string a ObjectId correctamente
        const objectId = new mongoose.Types.ObjectId(profesorId);

        const disponibilidad = await Disponibilidad.findOne({ profesor: objectId }).populate('bloques');
        
        if (!disponibilidad) {
            return { disponible: false, bloques: [] };
        }

        return {
            disponible: true,
            bloques: disponibilidad.bloques || []
        };
    } catch (error) {
        throw new Error(`Error al obtener disponibilidad del profesor: ${error.message}`);
    }
};

/**
 * Obtener lista de todos los profesores
 */
export const obtenerListaProfesores = async () => {
    try {
        const profesores = await User.find({ role: 'profesor' })
            .select('nombreCompleto nombres apellidos email rut')
            .lean();

        return profesores.map(profesor => ({
            ...profesor,
            nombreCompleto: profesor.nombreCompleto || `${profesor.nombres} ${profesor.apellidos}`
        }));
    } catch (error) {
        throw new Error(`Error al obtener lista de profesores: ${error.message}`);
    }
};

/**
 * Obtener salas disponibles
 */
export const obtenerSalasDisponibles = () => {
    return SALAS_DISPONIBLES.map((sala, index) => ({
        id: index + 1,
        nombre: sala,
        capacidad: Math.floor(Math.random() * 30) + 20, // Capacidad aleatoria entre 20-50
        tipo: Math.random() > 0.7 ? 'Laboratorio' : 'Aula'
    }));
};

/**
 * Obtener tipos de bloques disponibles
 */
export const obtenerTiposBloques = () => {
    return TIPOS_BLOQUE;
};

/**
 * Validar disponibilidad de profesor para un horario específico
 */
export const validarDisponibilidadProfesor = async (profesorId, dia, horaInicio, horaFin) => {
    try {
        const disponibilidad = await obtenerDisponibilidadProfesor(profesorId);
        
        if (!disponibilidad.disponible) {
            return { disponible: false, razon: 'Profesor no tiene disponibilidad configurada' };
        }

        // Convertir día del formato del JSON (LU, MA, etc) al formato del modelo
        const diaFormateado = convertirDiaFormato(dia);
        
        // Verificar si el profesor está disponible en ese día y hora
        const bloqueDisponible = disponibilidad.bloques.find(bloque => 
            bloque.dia === diaFormateado && 
            estaEnRangoHorario(horaInicio, horaFin, bloque.horaInicio, bloque.horaFin)
        );

        if (!bloqueDisponible) {
            return { 
                disponible: false, 
                razon: `Profesor no disponible ${diaFormateado} de ${horaInicio} a ${horaFin}` 
            };
        }

        return { disponible: true };
    } catch (error) {
        throw new Error(`Error al validar disponibilidad: ${error.message}`);
    }
};

/**
 * Generar horario básico para un profesor
 */
export const generarHorarioProfesor = async (datosHorario) => {
    try {
        const { profesorId, asignaturas, preferencias = {} } = datosHorario;

        // Validar que el profesor existe
        const profesor = await User.findById(profesorId);
        if (!profesor) {
            throw new Error('Profesor no encontrado');
        }

        // Obtener disponibilidad del profesor
        const disponibilidad = await obtenerDisponibilidadProfesor(profesorId);
        if (!disponibilidad.disponible) {
            throw new Error('Profesor no tiene disponibilidad configurada');
        }

        // Cargar horarios de asignaturas desde el JSON
        const horariosExtraidos = cargarHorariosExtraidos();
        
        // Generar combinaciones posibles
        const combinaciones = generarCombinacionesHorario(
            asignaturas,
            disponibilidad.bloques,
            horariosExtraidos,
            preferencias
        );

        return {
            profesor: {
                id: profesor._id,
                nombre: profesor.nombreCompleto || `${profesor.nombres} ${profesor.apellidos}`,
                email: profesor.email
            },
            combinacionesGeneradas: combinaciones.length,
            combinaciones: combinaciones.slice(0, 5), // Máximo 5 opciones
            fechaGeneracion: new Date()
        };

    } catch (error) {
        throw new Error(`Error al generar horario: ${error.message}`);
    }
};

/**
 * Generar horario con validaciones previas
 */
export const generarHorarioConValidacion = async (datosHorario) => {
    try {
        // Primero validar disponibilidad
        const validaciones = await validarRequerimientosHorario(datosHorario);
        
        if (!validaciones.valido) {
            return {
                exito: false,
                errores: validaciones.errores,
                advertencias: validaciones.advertencias
            };
        }

        // Si las validaciones son exitosas, generar el horario
        const resultado = await generarHorarioProfesor(datosHorario);
        
        return {
            exito: true,
            ...resultado,
            validaciones: validaciones.advertencias
        };

    } catch (error) {
        throw new Error(`Error en generación con validación: ${error.message}`);
    }
};

/**
 * Obtener estadísticas de horarios de un profesor
 */
export const obtenerEstadisticasHorarios = async (profesorId) => {
    try {
        const profesor = await User.findById(profesorId);
        if (!profesor) {
            throw new Error('Profesor no encontrado');
        }

        const disponibilidad = await obtenerDisponibilidadProfesor(profesorId);
        
        // Calcular estadísticas básicas
        const horasDisponibles = disponibilidad.bloques.length * 1.5; // Aproximado 1.5 horas por bloque
        const diasDisponibles = [...new Set(disponibilidad.bloques.map(b => b.dia))].length;

        return {
            profesor: {
                id: profesor._id,
                nombre: profesor.nombreCompleto || `${profesor.nombres} ${profesor.apellidos}`,
                email: profesor.email
            },
            estadisticas: {
                horasDisponibles,
                diasDisponibles,
                bloquesConfigurados: disponibilidad.bloques.length,
                tieneDisponibilidad: disponibilidad.disponible
            },
            disponibilidad: disponibilidad.bloques
        };

    } catch (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
};

// Funciones auxiliares

/**
 * Convertir formato de día
 */
const convertirDiaFormato = (dia) => {
    const mapaDias = {
        'LU': 'Lunes',
        'MA': 'Martes', 
        'MI': 'Miércoles',
        'JU': 'Jueves',
        'VI': 'Viernes'
    };
    return mapaDias[dia] || dia;
};

/**
 * Verificar si un horario está en el rango de disponibilidad
 */
const estaEnRangoHorario = (inicioRequerido, finRequerido, inicioDisponible, finDisponible) => {
    const inicioReq = convertirHoraAMinutos(inicioRequerido);
    const finReq = convertirHoraAMinutos(finRequerido);
    const inicioDisp = convertirHoraAMinutos(inicioDisponible);
    const finDisp = convertirHoraAMinutos(finDisponible);

    return inicioReq >= inicioDisp && finReq <= finDisp;
};

/**
 * Convertir hora a minutos para comparación
 */
const convertirHoraAMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
};

/**
 * Generar combinaciones de horario
 */
const generarCombinacionesHorario = (asignaturas, disponibilidadProfesor, horariosExtraidos, preferencias) => {
    const combinaciones = [];

    // Filtrar horarios extraídos por las asignaturas solicitadas
    const horariosRelevantes = horariosExtraidos.filter(horario => 
        asignaturas.some(asig => asig.codigo === horario.asignaturaCodigo)
    );

    // Generar hasta 5 combinaciones diferentes
    for (let i = 0; i < 5; i++) {
        const combinacion = {
            id: i + 1,
            nombre: `Opción ${i + 1}`,
            horarios: [],
            puntuacion: 0,
            conflictos: []
        };

        asignaturas.forEach(asignatura => {
            const horariosAsignatura = horariosRelevantes.filter(h => h.asignaturaCodigo === asignatura.codigo);
            
            if (horariosAsignatura.length > 0) {
                // Tomar horarios diferentes para cada combinación
                const horarioSeleccionado = horariosAsignatura[i % horariosAsignatura.length];
                
                horarioSeleccionado.bloques.forEach(bloque => {
                    const diaFormateado = convertirDiaFormato(bloque.dia);
                    const salaAsignada = SALAS_DISPONIBLES[Math.floor(Math.random() * SALAS_DISPONIBLES.length)];
                    
                    // Verificar disponibilidad del profesor
                    const disponible = disponibilidadProfesor.some(d => 
                        d.dia === diaFormateado && 
                        estaEnRangoHorario(bloque.horaInicio, bloque.horaFin, d.horaInicio, d.horaFin)
                    );

                    combinacion.horarios.push({
                        asignatura: horarioSeleccionado.asignatura,
                        codigo: asignatura.codigo,
                        tipo: bloque.tipo,
                        dia: diaFormateado,
                        horaInicio: bloque.horaInicio,
                        horaFin: bloque.horaFin,
                        sala: salaAsignada,
                        disponibleProfesor: disponible
                    });

                    if (!disponible) {
                        combinacion.conflictos.push({
                            tipo: 'Disponibilidad',
                            descripcion: `Profesor no disponible ${diaFormateado} ${bloque.horaInicio}-${bloque.horaFin}`
                        });
                    }
                });
            }
        });

        // Calcular puntuación basada en disponibilidad y preferencias
        combinacion.puntuacion = calcularPuntuacionCombinacion(combinacion, preferencias);
        combinaciones.push(combinacion);
    }

    // Ordenar por puntuación descendente
    return combinaciones.sort((a, b) => b.puntuacion - a.puntuacion);
};

/**
 * Calcular puntuación de una combinación
 */
const calcularPuntuacionCombinacion = (combinacion, preferencias) => {
    let puntuacion = 100;

    // Penalizar por conflictos
    puntuacion -= combinacion.conflictos.length * 20;

    // Bonificar por distribución equilibrada
    const diasUsados = [...new Set(combinacion.horarios.map(h => h.dia))].length;
    if (diasUsados >= 3 && diasUsados <= 4) {
        puntuacion += 10;
    }

    // Aplicar preferencias si existen
    if (preferencias.evitarSabado && !combinacion.horarios.some(h => h.dia === 'Sábado')) {
        puntuacion += 5;
    }

    if (preferencias.preferenciaMorning) {
        const clasesMañana = combinacion.horarios.filter(h => 
            convertirHoraAMinutos(h.horaInicio) < 720 // Antes de 12:00
        ).length;
        puntuacion += clasesMañana * 2;
    }

    return Math.max(0, puntuacion);
};

/**
 * Validar requerimientos de horario
 */
const validarRequerimientosHorario = async (datosHorario) => {
    const errores = [];
    const advertencias = [];

    const { profesorId, asignaturas } = datosHorario;

    // Validar profesor
    const profesor = await User.findById(profesorId);
    if (!profesor) {
        errores.push('Profesor no encontrado');
    }

    // Validar disponibilidad
    const disponibilidad = await obtenerDisponibilidadProfesor(profesorId);
    if (!disponibilidad.disponible) {
        errores.push('Profesor no tiene disponibilidad configurada');
    }

    // Validar asignaturas
    if (!asignaturas || asignaturas.length === 0) {
        errores.push('Debe especificar al menos una asignatura');
    }

    // Advertencias
    if (disponibilidad.bloques.length < 10) {
        advertencias.push('Profesor tiene poca disponibilidad horaria');
    }

    return {
        valido: errores.length === 0,
        errores,
        advertencias
    };
};

/**
 * Normaliza nombres para comparación (sin tildes, mayúsculas, comas, espacios extra)
 */
function normalizarNombre(nombre) {
    return nombre
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita tildes
        .replace(/,/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Genera una combinación global de horarios para todos los profesores,
 * asignando bloques según disponibilidad y cantidad de horas semanales requeridas por asignatura.
 * 
 * @param {Array} profesoresAsignaturas - [{ profesorId, asignaturas: [{ codigo, horasSemanales }] }]
 * @returns {Array} combinacionGlobal - [{ profesorId, asignaturas: [{ codigo, bloquesAsignados: [...] }] }]
 */
export const generarCombinacionGlobalService = async (profesoresAsignaturas) => {
    console.log('Solicitud:', profesoresAsignaturas);
    const combinacionGlobal = [];

    for (const profData of profesoresAsignaturas) {
        const { profesorId, asignaturas } = profData;
        // Obtener disponibilidad del profesor
        const disponibilidad = await obtenerDisponibilidadProfesor(profesorId);

        if (!disponibilidad.disponible) {
            combinacionGlobal.push({
                profesorId,
                asignaturas: asignaturas.map(asig => ({
                    codigo: asig.codigo,
                    bloquesAsignados: [],
                    conflicto: 'Sin disponibilidad'
                }))
            });
            continue;
        }

        // Copia mutable de bloques disponibles
        let bloquesDisponibles = [...disponibilidad.bloques];

        // Ordena los bloques por día y hora de inicio
        bloquesDisponibles.sort((a, b) => {
            const diaA = DIAS_SEMANA.indexOf(a.dia); // 'LU' = 0, 'MA' = 1, ...
            const diaB = DIAS_SEMANA.indexOf(b.dia);
            if (diaA !== diaB) return diaA - diaB;
            // Luego por hora de inicio
            const [ha, ma] = a.horaInicio.split(':').map(Number);
            const [hb, mb] = b.horaInicio.split(':').map(Number);
            return ha * 60 + ma - (hb * 60 + mb);
        });

        const asignaturasAsignadas = [];

    for (const asignatura of asignaturas) {
        let horasRestantes = asignatura.horasSemanales;
        let bloquesAsignados = [];

        while (horasRestantes > 0) {
            // Buscar el índice del primer bloque disponible de 1:20h
            let inicioSecuencia = -1;
            for (let i = 0; i < bloquesDisponibles.length; i++) {
                const bloque = bloquesDisponibles[i];
                const [hi, mi] = bloque.horaInicio.split(':').map(Number);
                const [hf, mf] = bloque.horaFin.split(':').map(Number);
                const duracion = ((hf * 60 + mf) - (hi * 60 + mi)) / 60;
                if (duracion >= 1.3 && duracion <= 1.4) {
                    inicioSecuencia = i;
                    break;
                }
            }
            if (inicioSecuencia === -1) break; // No hay más bloques de inicio válidos

            // Intentar armar una secuencia de hasta 5 bloques consecutivos
            let secuencia = [];
            let sumaHorasSecuencia = 0;
            let bloquesEnSecuencia = 0;
            let i = inicioSecuencia;
            while (
                i < bloquesDisponibles.length &&
                bloquesEnSecuencia < 5 &&
                sumaHorasSecuencia < horasRestantes
            ) {
                const bloque = bloquesDisponibles[i];
                // Si no es el primero, debe ser consecutivo al anterior
                if (
                    secuencia.length > 0 &&
                    !(bloque.dia === secuencia[secuencia.length - 1].dia &&
                    bloque.horaInicio === secuencia[secuencia.length - 1].horaFin)
                ) {
                    break;
                }
                const [hi, mi] = bloque.horaInicio.split(':').map(Number);
                const [hf, mf] = bloque.horaFin.split(':').map(Number);
                const duracion = ((hf * 60 + mf) - (hi * 60 + mi)) / 60;

                let color = null;
                if (duracion <= 0.2) color = 'gray';

                secuencia.push({
                    dia: bloque.dia,
                    horaInicio: bloque.horaInicio,
                    horaFin: bloque.horaFin,
                    tipo: bloque.tipo,
                    color
                });
                sumaHorasSecuencia += duracion;
                bloquesEnSecuencia++;
                i++;
            }

            // Solo asignar si la secuencia tiene al menos 2 bloques
            if (secuencia.length >= 2) {
                bloquesAsignados = bloquesAsignados.concat(secuencia);
                horasRestantes -= sumaHorasSecuencia;
                // Eliminar los bloques usados de bloquesDisponibles
                bloquesDisponibles = bloquesDisponibles.filter(b =>
                    !secuencia.some(ba =>
                        ba.dia === b.dia && ba.horaInicio === b.horaInicio && ba.horaFin === b.horaFin
                    )
                );
            } else {
                // No se puede asignar más bloques válidos
                break;
            }
        }

        // Si solo queda un bloque suelto, no lo asignes
        if (bloquesAsignados.length === 1) {
            bloquesAsignados.length = 0;
        }

        asignaturasAsignadas.push({
            codigo: asignatura.codigo,
            bloquesAsignados,
            conflicto: horasRestantes > 0.1 ? `Faltan ${horasRestantes.toFixed(1)} horas` : null
        });
    }

        combinacionGlobal.push({
            profesorId,
            asignaturas: asignaturasAsignadas
        });
    }

    return combinacionGlobal;
};