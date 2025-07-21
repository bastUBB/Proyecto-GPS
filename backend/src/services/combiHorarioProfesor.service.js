import Disponibilidad from '../models/disponibilidad.model.js';
import User from '../models/user.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_SALAS = 20;
const SALAS_DISPONIBLES = Array.from({ length: TOTAL_SALAS }, (_, i) => `Sala ${i + 1}`);

const TIPOS_BLOQUE = [
    { tipo: 'TEO', nombre: 'Teórico', color: '#3B82F6' },
    { tipo: 'LAB', nombre: 'Laboratorio', color: '#10B981' },
    { tipo: 'PRA', nombre: 'Práctico', color: '#F59E0B' }
];

const DIAS_SEMANA = ['LU', 'MA', 'MI', 'JU', 'VI'];

const HORAS_DISPONIBLES = [
    '08:10', '09:30', '09:40', '11:00', '11:10', '12:30',
    '12:40', '14:00', '14:10', '15:30', '15:40', '17:00',
    '17:10', '18:30', '18:40', '20:00'
];

/**
 * Cargar datos de horarios desde el archivo JSON
 */
const cargarHorariosExtraidos = () => {
    try {
        const filePath = path.join(__dirname, '../../output/horario_extraido.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar horarios extraídos:', error);
        return [];
    }
};

/**
 * Obtener disponibilidad de un profesor específico
 */
export const obtenerDisponibilidadProfesor = async (profesorId) => {
    try {
        const disponibilidad = await Disponibilidad.findOne({ profesor: profesorId }).populate('bloques');
        
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

export const generarCombinacionGlobalService = async () => {
    try {
        // 1. Obtener todos los profesores
        const profesores = await User.find({ role: 'profesor' }).lean();

        // 2. Cargar disponibilidades de todos los profesores
        const disponibilidades = {};
        for (const prof of profesores) {
            const disp = await Disponibilidad.findOne({ profesor: prof._id }).populate('bloques').lean();
            disponibilidades[prof._id.toString()] = disp ? disp.bloques : [];
        }

        // 3. Cargar todos los horarios extraídos
        const horariosExtraidos = cargarHorariosExtraidos();

        // 4. Preparar resultado
        const resultado = [];

        // 5. Para cada profesor, asignar bloques de sus asignaturas seleccionadas (por nombre)
        for (const prof of profesores) {
            // Obtener nombres y códigos de asignaturas seleccionadas por el profesor
            const nombresAsignaturas = Array.isArray(prof.asignaturasImpartidas)
                ? prof.asignaturasImpartidas.map(a => (a.nombre || a).toUpperCase().trim())
                : [];
            const codigosAsignaturas = Array.isArray(prof.asignaturasImpartidas)
                ? prof.asignaturasImpartidas.map(a => (a.codigo || a).toString().trim())
                : [];

            // Filtrar horarios del JSON por nombre O código de asignatura
            const horariosProfesor = horariosExtraidos.filter(
                h =>
                    (h.asignatura && nombresAsignaturas.includes(h.asignatura.toUpperCase().trim())) ||
                    (h.asignaturaCodigo && codigosAsignaturas.includes(h.asignaturaCodigo.toString().trim()))
            );

            // Disponibilidad del profesor
            const bloquesDisponibles = disponibilidades[prof._id.toString()] || [];

            // Para evitar conflictos, vamos a ir ocupando los bloques a medida que los asignamos
            const bloquesOcupados = [];

            const horariosAsignados = [];

            for (const horario of horariosProfesor) {
                for (const bloque of horario.bloques) {
                    // Convertir día a formato de disponibilidad
                    const diaFormateado = convertirDiaFormato(bloque.dia);

                    // Buscar bloque disponible del profesor que calce con este bloque
                    const disponible = bloquesDisponibles.find(bd =>
                        bd.dia === diaFormateado &&
                        estaEnRangoHorario(bloque.horaInicio, bloque.horaFin, bd.horaInicio, bd.horaFin) &&
                        !bloquesOcupados.some(
                            bo => bo.dia === diaFormateado &&
                                ((bo.horaInicio < bloque.horaFin && bo.horaFin > bloque.horaInicio))
                        )
                    );

                    if (disponible) {
                        // Asignar bloque
                        const salaAsignada = SALAS_DISPONIBLES[Math.floor(Math.random() * SALAS_DISPONIBLES.length)];
                        horariosAsignados.push({
                            asignatura: horario.asignatura,
                            codigo: horario.asignaturaCodigo,
                            tipo: bloque.tipo,
                            dia: diaFormateado,
                            horaInicio: bloque.horaInicio,
                            horaFin: bloque.horaFin,
                            sala: salaAsignada,
                            profesor: prof.nombreCompleto
                        });
                        // Marcar bloque como ocupado
                        bloquesOcupados.push({
                            dia: diaFormateado,
                            horaInicio: bloque.horaInicio,
                            horaFin: bloque.horaFin
                        });
                    }
                    // Si no hay disponibilidad, simplemente no se asigna ese bloque
                }
            }

            resultado.push({
                profesorId: prof._id,
                nombreProfesor: prof.nombreCompleto,
                horarios: horariosAsignados
            });
        }

        return resultado;    
    } catch (error) {
        console.error('Error en generarCombinacionGlobalService:', error);
        throw error;
    }
};