import Asignatura from '../models/asignaturas.model.js';
import Historial from '../models/historial.model.js';
import RendimientoAsignatura from '../models/rendimientoAsignatura.model.js';
import Horario from '../models/horariosExcell.model.js';
import Bloque from '../models/bloques.model.js';

// Configuración de parámetros
const CREDITOS_MIN = 24;
const CREDITOS_MAX = 36;
const NOTA_APROBACION = 4.0;

/**
 * Genera combinaciones de horarios óptimas para un estudiante
 * @param {string} alumnoId - ID del estudiante
 * @param {string} semestre - Semestre para el cual generar horarios
 * @param {number} maxCombinaciones - Número máximo de combinaciones a generar
 * @returns {Object} Combinaciones de horarios generadas
 */
export const generarCombinacionesHorarios = async (alumnoId, semestre, maxCombinaciones = 5) => {
    try {
        // 1. Obtener historial académico del estudiante
        const historial = await obtenerHistorialEstudiante(alumnoId);
        
        // 2. Identificar asignaturas disponibles para inscribir
        const asignaturasDisponibles = await obtenerAsignaturasDisponibles(historial, semestre);
        
        // 3. Obtener horarios de las asignaturas disponibles
        const horariosDisponibles = await obtenerHorariosAsignaturas(asignaturasDisponibles);
        
        // 4. Obtener rendimiento de las asignaturas
        const rendimientoAsignaturas = await obtenerRendimientoAsignaturas(asignaturasDisponibles);
        
        // 5. Generar combinaciones válidas
        const combinaciones = await generarCombinacionesValidas(
            asignaturasDisponibles,
            horariosDisponibles,
            rendimientoAsignaturas,
            maxCombinaciones
        );
        
        return {
            alumnoId,
            semestre,
            creditosMinimos: CREDITOS_MIN,
            creditosMaximos: CREDITOS_MAX,
            asignaturasDisponibles: asignaturasDisponibles.length,
            combinacionesGeneradas: combinaciones.length,
            combinaciones,
            fechaGeneracion: new Date()
        };
        
    } catch (error) {
        throw new Error(`Error al generar combinaciones de horarios: ${error.message}`);
    }
};

/**
 * Obtiene el historial académico del estudiante
 * @param {string} alumnoId - ID del estudiante
 * @returns {Object} Historial académico
 */
const obtenerHistorialEstudiante = async (alumnoId) => {
    const historial = await Historial.findOne({ alumno: alumnoId });
    
    if (!historial) {
        return { alumno: alumnoId, asignaturasCursadas: [] };
    }
    
    return historial;
};

/**
 * Obtiene asignaturas disponibles para inscribir considerando prerrequisitos
 * @param {Object} historial - Historial académico del estudiante
 * @param {string} semestre - Semestre objetivo
 * @returns {Array} Asignaturas disponibles
 */
const obtenerAsignaturasDisponibles = async (historial, semestre) => {
    try {
        // Obtener todas las asignaturas del semestre
        const todasAsignaturas = await Asignatura.find({ semestre });
        
        // Obtener códigos de asignaturas aprobadas
        const asignaturasAprobadas = historial.asignaturasCursadas
            .filter(cursada => cursada.notaFinal >= NOTA_APROBACION)
            .map(cursada => cursada.asignatura);
        
        // Filtrar asignaturas disponibles (que cumplan prerrequisitos y no estén aprobadas)
        const asignaturasDisponibles = todasAsignaturas.filter(asignatura => {
            // No inscribir asignaturas ya aprobadas
            if (asignaturasAprobadas.includes(asignatura.codigo)) {
                return false;
            }
            
            // Verificar que se cumplan todos los prerrequisitos
            if (asignatura.prerrequisitos && asignatura.prerrequisitos.length > 0) {
                return asignatura.prerrequisitos.every(prerrequisito => 
                    asignaturasAprobadas.includes(prerrequisito)
                );
            }
            
            return true;
        });
        
        return asignaturasDisponibles;
    } catch (error) {
        throw new Error(`Error al obtener asignaturas disponibles: ${error.message}`);
    }
};

/**
 * Obtiene horarios disponibles para las asignaturas
 * @param {Array} asignaturas - Asignaturas disponibles
 * @returns {Array} Horarios con información de bloques
 */
const obtenerHorariosAsignaturas = async (asignaturas) => {
    try {
        const codigosAsignaturas = asignaturas.map(asig => asig.codigo);
        
        const horarios = await Horario.find({
            codigoAsignatura: { $in: codigosAsignaturas }
        }).populate('bloques');
        
        // Agrupar horarios por asignatura y agregar información adicional
        const horariosConInfo = horarios.map(horario => {
            const asignatura = asignaturas.find(asig => asig.codigo === horario.codigoAsignatura);
            
            return {
                ...horario.toObject(),
                nombreAsignatura: asignatura.nombre,
                creditos: asignatura.creditos,
                semestre: asignatura.semestre
            };
        });
        
        return horariosConInfo;
    } catch (error) {
        throw new Error(`Error al obtener horarios: ${error.message}`);
    }
};

/**
 * Obtiene el rendimiento de las asignaturas
 * @param {Array} asignaturas - Asignaturas disponibles
 * @returns {Object} Rendimiento por asignatura
 */
const obtenerRendimientoAsignaturas = async (asignaturas) => {
    try {
        const idsAsignaturas = asignaturas.map(asig => asig._id);
        
        const rendimientos = await RendimientoAsignatura.find({
            asignatura: { $in: idsAsignaturas }
        }).populate('asignatura');
        
        // Crear mapa de rendimiento por asignatura
        const rendimientoPorAsignatura = {};
        
        rendimientos.forEach(rendimiento => {
            const codigoAsignatura = rendimiento.asignatura.codigo;
            
            if (!rendimientoPorAsignatura[codigoAsignatura]) {
                rendimientoPorAsignatura[codigoAsignatura] = [];
            }
            
            rendimientoPorAsignatura[codigoAsignatura].push({
                docente: rendimiento.docente,
                porcentajeAprob: rendimiento.porcentajeAprob,
                porcentajeDesaprob: rendimiento.porcentajeDesaprob,
                porcentajeNCR: rendimiento.porcentajeNCR,
                añoRegistro: rendimiento.añoRegistro,
                totalInscritos: rendimiento.totalInscritos
            });
        });
        
        return rendimientoPorAsignatura;
    } catch (error) {
        throw new Error(`Error al obtener rendimiento: ${error.message}`);
    }
};

/**
 * Genera combinaciones válidas de horarios
 * @param {Array} asignaturas - Asignaturas disponibles
 * @param {Array} horarios - Horarios disponibles
 * @param {Object} rendimientos - Rendimiento por asignatura
 * @param {number} maxCombinaciones - Máximo número de combinaciones
 * @returns {Array} Combinaciones válidas ordenadas por puntuación
 */
const generarCombinacionesValidas = async (asignaturas, horarios, rendimientos, maxCombinaciones) => {
    try {
        const combinacionesValidas = [];
        
        // Agrupar horarios por asignatura
        const horariosPorAsignatura = agruparHorariosPorAsignatura(horarios);
        
        // Generar todas las combinaciones posibles
        const combinacionesPosibles = generarCombinacionesRecursivo(
            Object.keys(horariosPorAsignatura),
            horariosPorAsignatura,
            [],
            asignaturas
        );
        
        // Filtrar combinaciones válidas (créditos y horarios)
        for (const combinacion of combinacionesPosibles) {
            if (esCombinaciónValida(combinacion, asignaturas)) {
                const combinacionConPuntuacion = calcularPuntuacionCombinacion(
                    combinacion,
                    rendimientos,
                    asignaturas
                );
                
                combinacionesValidas.push(combinacionConPuntuacion);
            }
            
            // Limitar número de combinaciones para rendimiento
            if (combinacionesValidas.length >= maxCombinaciones * 3) {
                break;
            }
        }
        
        // Ordenar por puntuación y tomar las mejores
        combinacionesValidas.sort((a, b) => b.puntuacion - a.puntuacion);
        
        return combinacionesValidas.slice(0, maxCombinaciones);
    } catch (error) {
        throw new Error(`Error al generar combinaciones: ${error.message}`);
    }
};

/**
 * Agrupa horarios por código de asignatura
 * @param {Array} horarios - Horarios disponibles
 * @returns {Object} Horarios agrupados por asignatura
 */
const agruparHorariosPorAsignatura = (horarios) => {
    const horariosPorAsignatura = {};
    
    horarios.forEach(horario => {
        if (!horariosPorAsignatura[horario.codigoAsignatura]) {
            horariosPorAsignatura[horario.codigoAsignatura] = [];
        }
        horariosPorAsignatura[horario.codigoAsignatura].push(horario);
    });
    
    return horariosPorAsignatura;
};

/**
 * Genera combinaciones recursivamente
 * @param {Array} codigosAsignaturas - Códigos de asignaturas disponibles
 * @param {Object} horariosPorAsignatura - Horarios agrupados
 * @param {Array} combinacionActual - Combinación en construcción
 * @param {Array} asignaturas - Información de asignaturas
 * @returns {Array} Combinaciones generadas
 */
const generarCombinacionesRecursivo = (codigosAsignaturas, horariosPorAsignatura, combinacionActual, asignaturas) => {
    const combinaciones = [];
    
    // Calcular créditos actuales
    const creditosActuales = combinacionActual.reduce((total, horario) => {
        const asignatura = asignaturas.find(asig => asig.codigo === horario.codigoAsignatura);
        return total + (asignatura ? asignatura.creditos : 0);
    }, 0);
    
    // Si ya cumple el mínimo de créditos, agregar como combinación válida
    if (creditosActuales >= CREDITOS_MIN && creditosActuales <= CREDITOS_MAX) {
        combinaciones.push([...combinacionActual]);
    }
    
    // Si ya alcanzó el máximo, no seguir agregando
    if (creditosActuales >= CREDITOS_MAX) {
        return combinaciones;
    }
    
    // Intentar agregar más asignaturas
    for (let i = 0; i < codigosAsignaturas.length; i++) {
        const codigoAsignatura = codigosAsignaturas[i];
        
        // No repetir asignaturas ya en la combinación
        if (combinacionActual.some(h => h.codigoAsignatura === codigoAsignatura)) {
            continue;
        }
        
        const asignatura = asignaturas.find(asig => asig.codigo === codigoAsignatura);
        if (!asignatura) continue;
        
        // Verificar que no exceda el máximo de créditos
        if (creditosActuales + asignatura.creditos > CREDITOS_MAX) {
            continue;
        }
        
        // Probar cada horario de esta asignatura
        for (const horario of horariosPorAsignatura[codigoAsignatura]) {
            // Verificar que no haya conflictos de horario
            if (!tieneConflictoHorario(combinacionActual, horario)) {
                const nuevaCombinacion = [...combinacionActual, horario];
                const restantesAsignaturas = codigosAsignaturas.slice(i + 1);
                
                combinaciones.push(
                    ...generarCombinacionesRecursivo(
                        restantesAsignaturas,
                        horariosPorAsignatura,
                        nuevaCombinacion,
                        asignaturas
                    )
                );
            }
        }
    }
    
    return combinaciones;
};

/**
 * Verifica si una combinación es válida
 * @param {Array} combinacion - Combinación de horarios
 * @param {Array} asignaturas - Información de asignaturas
 * @returns {boolean} True si es válida
 */
const esCombinaciónValida = (combinacion, asignaturas) => {
    const creditosTotales = combinacion.reduce((total, horario) => {
        const asignatura = asignaturas.find(asig => asig.codigo === horario.codigoAsignatura);
        return total + (asignatura ? asignatura.creditos : 0);
    }, 0);
    
    return creditosTotales >= CREDITOS_MIN && creditosTotales <= CREDITOS_MAX;
};

/**
 * Verifica si hay conflicto de horario entre dos horarios
 * @param {Array} combinacionActual - Horarios ya seleccionados
 * @param {Object} nuevoHorario - Nuevo horario a verificar
 * @returns {boolean} True si hay conflicto
 */
const tieneConflictoHorario = (combinacionActual, nuevoHorario) => {
    for (const horarioExistente of combinacionActual) {
        // Verificar conflictos entre bloques
        for (const bloqueExistente of horarioExistente.bloques) {
            for (const bloqueNuevo of nuevoHorario.bloques) {
                if (hayConflictoBloques(bloqueExistente, bloqueNuevo)) {
                    return true;
                }
            }
        }
    }
    return false;
};

/**
 * Verifica conflicto entre dos bloques específicos
 * @param {Object} bloque1 - Primer bloque
 * @param {Object} bloque2 - Segundo bloque
 * @returns {boolean} True si hay conflicto
 */
const hayConflictoBloques = (bloque1, bloque2) => {
    if (bloque1.dia !== bloque2.dia) {
        return false;
    }
    
    const inicio1 = convertirHoraAMinutos(bloque1.horaInicio);
    const fin1 = convertirHoraAMinutos(bloque1.horaFin);
    const inicio2 = convertirHoraAMinutos(bloque2.horaInicio);
    const fin2 = convertirHoraAMinutos(bloque2.horaFin);
    
    return !(fin1 <= inicio2 || fin2 <= inicio1);
};

/**
 * Convierte hora en formato HH:MM a minutos
 * @param {string} hora - Hora en formato HH:MM
 * @returns {number} Minutos desde medianoche
 */
const convertirHoraAMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
};

/**
 * Calcula la puntuación de una combinación
 * @param {Array} combinacion - Combinación de horarios
 * @param {Object} rendimientos - Rendimiento por asignatura
 * @param {Array} asignaturas - Información de asignaturas
 * @returns {Object} Combinación con puntuación
 */
const calcularPuntuacionCombinacion = (combinacion, rendimientos, asignaturas) => {
    let puntuacionTotal = 0;
    let detallesPuntuacion = [];
    
    const creditosTotales = combinacion.reduce((total, horario) => {
        const asignatura = asignaturas.find(asig => asig.codigo === horario.codigoAsignatura);
        const rendimiento = rendimientos[horario.codigoAsignatura];
        
        let puntuacionAsignatura = 0;
        
        if (rendimiento && rendimiento.length > 0) {
            // Buscar rendimiento del docente específico
            const rendimientoDocente = rendimiento.find(r => r.docente === horario.docente);
            
            if (rendimientoDocente) {
                // Puntuación basada en porcentaje de aprobación
                puntuacionAsignatura = rendimientoDocente.porcentajeAprob * 0.7 +
                                    (100 - rendimientoDocente.porcentajeDesaprob) * 0.2 +
                                    (100 - rendimientoDocente.porcentajeNCR) * 0.1;
            } else {
                // Promedio de todos los docentes si no se encuentra el específico
                const promedioAprobacion = rendimiento.reduce((sum, r) => sum + r.porcentajeAprob, 0) / rendimiento.length;
                puntuacionAsignatura = promedioAprobacion * 0.8;
            }
        } else {
            // Puntuación neutra si no hay datos de rendimiento
            puntuacionAsignatura = 50;
        }
        
        detallesPuntuacion.push({
            asignatura: horario.codigoAsignatura,
            nombre: horario.nombreAsignatura,
            docente: horario.docente,
            creditos: asignatura ? asignatura.creditos : 0,
            puntuacion: Math.round(puntuacionAsignatura * 100) / 100
        });
        
        puntuacionTotal += puntuacionAsignatura;
        
        return total + (asignatura ? asignatura.creditos : 0);
    }, 0);
    
    // Bonificación por distribución equilibrada de créditos
    const bonificacionCreditos = creditosTotales >= 30 && creditosTotales <= 33 ? 5 : 0;
    
    return {
        horarios: combinacion,
        creditosTotales,
        numeroAsignaturas: combinacion.length,
        puntuacion: Math.round((puntuacionTotal / combinacion.length + bonificacionCreditos) * 100) / 100,
        detallesPuntuacion,
        recomendacion: generarRecomendacion(puntuacionTotal / combinacion.length, creditosTotales)
    };
};

/**
 * Genera recomendación textual para la combinación
 * @param {number} puntuacionPromedio - Puntuación promedio
 * @param {number} creditos - Total de créditos
 * @returns {string} Recomendación
 */
const generarRecomendacion = (puntuacionPromedio, creditos) => {
    let recomendacion = '';
    
    if (puntuacionPromedio >= 80) {
        recomendacion = 'Excelente combinación - Alta probabilidad de éxito';
    } else if (puntuacionPromedio >= 70) {
        recomendacion = 'Buena combinación - Probabilidad favorable';
    } else if (puntuacionPromedio >= 60) {
        recomendacion = 'Combinación moderada - Requiere dedicación extra';
    } else {
        recomendacion = 'Combinación desafiante - Considerar alternativas';
    }
    
    if (creditos > 33) {
        recomendacion += ' - Carga académica alta';
    } else if (creditos < 27) {
        recomendacion += ' - Carga académica ligera';
    }
    
    return recomendacion;
};

/**
 * Obtiene estadísticas de las asignaturas disponibles para un estudiante
 * @param {string} alumnoId - ID del estudiante
 * @param {string} semestre - Semestre objetivo
 * @returns {Object} Estadísticas
 */
export const obtenerEstadisticasAsignaturas = async (alumnoId, semestre) => {
    try {
        const historial = await obtenerHistorialEstudiante(alumnoId);
        const asignaturasDisponibles = await obtenerAsignaturasDisponibles(historial, semestre);
        const horariosDisponibles = await obtenerHorariosAsignaturas(asignaturasDisponibles);
        
        const estadisticas = {
            alumnoId,
            semestre,
            asignaturasAprobadas: historial.asignaturasCursadas.filter(c => c.notaFinal >= NOTA_APROBACION).length,
            asignaturasDisponibles: asignaturasDisponibles.length,
            creditosDisponibles: asignaturasDisponibles.reduce((total, asig) => total + asig.creditos, 0),
            horariosDisponibles: horariosDisponibles.length,
            asignaturasPorCreditos: asignaturasDisponibles.reduce((acc, asig) => {
                acc[asig.creditos] = (acc[asig.creditos] || 0) + 1;
                return acc;
            }, {}),
            combinacionesMaximas: Math.min(1000, Math.pow(2, asignaturasDisponibles.length))
        };
        
        return estadisticas;
    } catch (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
};
