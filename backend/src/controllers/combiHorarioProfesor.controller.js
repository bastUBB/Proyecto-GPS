import { 
    generarHorarioProfesor, 
    obtenerSalasDisponibles, 
    validarDisponibilidadProfesor,
    obtenerTiposBloques
} from '../services/combiHorarioProfesor.service.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';

/**
 * Controlador para generar horario de un profesor
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const generarHorario = async (req, res) => {
    try {
        const { profesorId, bloques } = req.body;

        // Validaciones básicas
        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        if (!bloques || !Array.isArray(bloques) || bloques.length === 0) {
            return handleErrorClient(res, 400, 'Los bloques son requeridos y deben ser un array');
        }

        // Validar que todos los bloques tengan cantidad positiva
        for (const bloque of bloques) {
            if (!bloque.cantidad || bloque.cantidad <= 0) {
                return handleErrorClient(res, 400, `La cantidad del bloque ${bloque.tipo} debe ser mayor a 0`);
            }
        }

        // Generar horario
        const horario = await generarHorarioProfesor(profesorId, bloques);

        handleSuccess(res, 200, 'Horario generado exitosamente', horario);
    } catch (error) {
        console.error('Error al generar horario:', error);
        
        if (error.message.includes('Profesor no encontrado') || 
            error.message.includes('No se encontró disponibilidad') ||
            error.message.includes('No se pudo asignar el bloque')) {
            return handleErrorClient(res, 404, error.message);
        }
        
        handleErrorServer(res, 500, 'Error interno del servidor al generar horario');
    }
};

/**
 * Controlador para obtener la lista de salas disponibles
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const obtenerSalas = async (req, res) => {
    try {
        const salas = obtenerSalasDisponibles();
        handleSuccess(res, 200, 'Salas obtenidas exitosamente', { salas, total: salas.length });
    } catch (error) {
        console.error('Error al obtener salas:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener salas');
    }
};

/**
 * Controlador para obtener los tipos de bloques disponibles
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const obtenerTiposBloquesController = async (req, res) => {
    try {
        const tiposBloques = obtenerTiposBloques();
        handleSuccess(res, 200, 'Tipos de bloques obtenidos exitosamente', tiposBloques);
    } catch (error) {
        console.error('Error al obtener tipos de bloques:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener tipos de bloques');
    }
};

/**
 * Controlador para validar la disponibilidad de un profesor
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const validarDisponibilidad = async (req, res) => {
    try {
        const { profesorId } = req.params;

        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        const validacion = await validarDisponibilidadProfesor(profesorId);

        if (!validacion.valido) {
            return handleErrorClient(res, 404, validacion.mensaje);
        }

        handleSuccess(res, 200, 'Validación exitosa', validacion);
    } catch (error) {
        console.error('Error al validar disponibilidad:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al validar disponibilidad');
    }
};

/**
 * Controlador para generar horario con validación previa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const generarHorarioConValidacion = async (req, res) => {
    try {
        const { profesorId, bloques } = req.body;

        // Validaciones básicas
        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        if (!bloques || !Array.isArray(bloques) || bloques.length === 0) {
            return handleErrorClient(res, 400, 'Los bloques son requeridos y deben ser un array');
        }

        // Validar disponibilidad primero
        const validacion = await validarDisponibilidadProfesor(profesorId);
        
        if (!validacion.valido) {
            return handleErrorClient(res, 404, validacion.mensaje);
        }

        // Verificar si hay suficiente capacidad para cada tipo de bloque
        for (const bloqueRequerido of bloques) {
            const capacidadDisponible = validacion.capacidadPorTipo[bloqueRequerido.tipo] || 0;
            if (capacidadDisponible < bloqueRequerido.cantidad) {
                return handleErrorClient(res, 400, 
                    `No hay suficiente capacidad para el bloque ${bloqueRequerido.tipo}. Disponible: ${capacidadDisponible}, Requerido: ${bloqueRequerido.cantidad}`
                );
            }
        }

        // Generar horario
        const horario = await generarHorarioProfesor(profesorId, bloques);

        handleSuccess(res, 200, 'Horario generado exitosamente', {
            ...horario,
            validacion: {
                diasDisponibles: validacion.diasDisponibles,
                capacidadPorTipo: validacion.capacidadPorTipo,
                totalHorasDisponibles: validacion.totalHorasDisponibles
            }
        });
    } catch (error) {
        console.error('Error al generar horario con validación:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al generar horario');
    }
};

/**
 * Controlador para obtener estadísticas de horarios
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const obtenerEstadisticasHorarios = async (req, res) => {
    try {
        const { profesorId } = req.params;

        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        const validacion = await validarDisponibilidadProfesor(profesorId);

        if (!validacion.valido) {
            return handleErrorClient(res, 404, validacion.mensaje);
        }

        // Agrupar slots por día
        const slotsPorDia = {};
        validacion.slotsDisponibles.forEach(slot => {
            if (!slotsPorDia[slot.dia]) {
                slotsPorDia[slot.dia] = [];
            }
            slotsPorDia[slot.dia].push(slot);
        });

        // Calcular estadísticas
        const estadisticas = {
            profesor: validacion.profesor,
            totalSlotsDisponibles: validacion.totalSlotsDisponibles,
            totalHorasDisponibles: validacion.totalHorasDisponibles,
            diasDisponibles: validacion.diasDisponibles,
            capacidadPorTipo: validacion.capacidadPorTipo,
            distribucionPorDia: Object.keys(slotsPorDia).map(dia => ({
                dia,
                slots: slotsPorDia[dia].length,
                totalMinutos: slotsPorDia[dia].reduce((sum, slot) => sum + slot.duracionMinutos, 0),
                totalHoras: Math.round((slotsPorDia[dia].reduce((sum, slot) => sum + slot.duracionMinutos, 0) / 60) * 100) / 100,
                primerHora: slotsPorDia[dia][0]?.horaInicio || 'N/A',
                ultimaHora: slotsPorDia[dia][slotsPorDia[dia].length - 1]?.horaFin || 'N/A'
            })),
            tiposBloqueDisponibles: validacion.tiposBloqueDisponibles,
            salasDisponibles: obtenerSalasDisponibles().length
        };

        handleSuccess(res, 200, 'Estadísticas obtenidas exitosamente', estadisticas);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener estadísticas');
    }
};
