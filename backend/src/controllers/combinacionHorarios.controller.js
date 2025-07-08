import { 
    generarCombinacionesHorarios, 
    obtenerEstadisticasAsignaturas 
} from '../services/combinacionHorarios.service.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';

/**
 * Controlador para generar combinaciones de horarios
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const generarCombinaciones = async (req, res) => {
    try {
        const { alumnoId, semestre, maxCombinaciones = 5 } = req.body;

        // Validaciones básicas
        if (!alumnoId) {
            return handleErrorClient(res, 400, 'El ID del alumno es requerido');
        }

        if (!semestre) {
            return handleErrorClient(res, 400, 'El semestre es requerido');
        }

        if (maxCombinaciones <= 0 || maxCombinaciones > 20) {
            return handleErrorClient(res, 400, 'El número máximo de combinaciones debe estar entre 1 y 20');
        }

        // Generar combinaciones
        const resultado = await generarCombinacionesHorarios(alumnoId, semestre, maxCombinaciones);

        if (resultado.combinacionesGeneradas === 0) {
            return handleErrorClient(res, 404, 'No se encontraron combinaciones válidas para los criterios especificados');
        }

        handleSuccess(res, 200, 'Combinaciones de horarios generadas exitosamente', resultado);
    } catch (error) {
        console.error('Error al generar combinaciones de horarios:', error);
        
        if (error.message.includes('No se encontró') || 
            error.message.includes('No hay asignaturas disponibles')) {
            return handleErrorClient(res, 404, error.message);
        }
        
        handleErrorServer(res, 500, 'Error interno del servidor al generar combinaciones de horarios');
    }
};

/**
 * Controlador para obtener estadísticas de asignaturas disponibles
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const obtenerEstadisticas = async (req, res) => {
    try {
        const { alumnoId, semestre } = req.params;

        // Validaciones básicas
        if (!alumnoId) {
            return handleErrorClient(res, 400, 'El ID del alumno es requerido');
        }

        if (!semestre) {
            return handleErrorClient(res, 400, 'El semestre es requerido');
        }

        // Obtener estadísticas
        const estadisticas = await obtenerEstadisticasAsignaturas(alumnoId, semestre);

        handleSuccess(res, 200, 'Estadísticas obtenidas exitosamente', estadisticas);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        
        if (error.message.includes('No se encontró')) {
            return handleErrorClient(res, 404, error.message);
        }
        
        handleErrorServer(res, 500, 'Error interno del servidor al obtener estadísticas');
    }
};

/**
 * Controlador para generar combinaciones con parámetros avanzados
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const generarCombinacionesAvanzadas = async (req, res) => {
    try {
        const { 
            alumnoId, 
            semestre, 
            maxCombinaciones = 10,
            creditosMinimos = 24,
            creditosMaximos = 36,
            priorizarRendimiento = true,
            excluirAsignaturas = []
        } = req.body;

        // Validaciones básicas
        if (!alumnoId) {
            return handleErrorClient(res, 400, 'El ID del alumno es requerido');
        }

        if (!semestre) {
            return handleErrorClient(res, 400, 'El semestre es requerido');
        }

        if (creditosMinimos < 12 || creditosMinimos > creditosMaximos) {
            return handleErrorClient(res, 400, 'Los créditos mínimos deben ser válidos y menores a los máximos');
        }

        if (creditosMaximos > 50) {
            return handleErrorClient(res, 400, 'Los créditos máximos no pueden exceder 50');
        }

        // Generar combinaciones con parámetros personalizados
        const resultado = await generarCombinacionesHorarios(
            alumnoId, 
            semestre, 
            maxCombinaciones
        );

        // Filtrar por créditos personalizados si es diferente a los valores por defecto
        let combinacionesFiltradas = resultado.combinaciones;
        
        if (creditosMinimos !== 24 || creditosMaximos !== 36) {
            combinacionesFiltradas = resultado.combinaciones.filter(comb => 
                comb.creditosTotales >= creditosMinimos && comb.creditosTotales <= creditosMaximos
            );
        }

        // Excluir asignaturas específicas si se proporcionaron
        if (excluirAsignaturas.length > 0) {
            combinacionesFiltradas = combinacionesFiltradas.filter(comb =>
                !comb.horarios.some(h => excluirAsignaturas.includes(h.codigoAsignatura))
            );
        }

        // Reordenar si no se prioriza rendimiento
        if (!priorizarRendimiento) {
            combinacionesFiltradas.sort((a, b) => a.creditosTotales - b.creditosTotales);
        }

        const resultadoFiltrado = {
            ...resultado,
            combinacionesGeneradas: combinacionesFiltradas.length,
            combinaciones: combinacionesFiltradas.slice(0, maxCombinaciones),
            parametrosPersonalizados: {
                creditosMinimos,
                creditosMaximos,
                priorizarRendimiento,
                excluirAsignaturas
            }
        };

        if (resultadoFiltrado.combinacionesGeneradas === 0) {
            return handleErrorClient(res, 404, 'No se encontraron combinaciones válidas con los parámetros especificados');
        }

        handleSuccess(res, 200, 'Combinaciones avanzadas generadas exitosamente', resultadoFiltrado);
    } catch (error) {
        console.error('Error al generar combinaciones avanzadas:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al generar combinaciones avanzadas');
    }
};

/**
 * Controlador para obtener el historial académico resumido de un estudiante
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const obtenerHistorialResumido = async (req, res) => {
    try {
        const { alumnoId } = req.params;

        if (!alumnoId) {
            return handleErrorClient(res, 400, 'El ID del alumno es requerido');
        }

        // Obtener estadísticas que incluyen información del historial
        const estadisticas = await obtenerEstadisticasAsignaturas(alumnoId, 'I'); // Usar semestre genérico

        const historialResumido = {
            alumnoId,
            asignaturasAprobadas: estadisticas.asignaturasAprobadas,
            asignaturasDisponibles: estadisticas.asignaturasDisponibles,
            creditosDisponibles: estadisticas.creditosDisponibles,
            estadoPorSemestre: await obtenerEstadoPorSemestre(alumnoId),
            fechaConsulta: new Date()
        };

        handleSuccess(res, 200, 'Historial resumido obtenido exitosamente', historialResumido);
    } catch (error) {
        console.error('Error al obtener historial resumido:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener historial resumido');
    }
};

/**
 * Función auxiliar para obtener estado por semestre
 * @param {string} alumnoId - ID del alumno
 * @returns {Object} Estado por semestre
 */
const obtenerEstadoPorSemestre = async (alumnoId) => {
    try {
        const semestres = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        const estadoPorSemestre = {};

        for (const semestre of semestres) {
            try {
                const stats = await obtenerEstadisticasAsignaturas(alumnoId, semestre);
                estadoPorSemestre[semestre] = {
                    asignaturasDisponibles: stats.asignaturasDisponibles,
                    creditosDisponibles: stats.creditosDisponibles
                };
            } catch (error) {
                estadoPorSemestre[semestre] = {
                    asignaturasDisponibles: 0,
                    creditosDisponibles: 0
                };
            }
        }

        return estadoPorSemestre;
    } catch (error) {
        return {};
    }
};
