import { 
    obtenerListaProfesores,
    obtenerSalasDisponibles,
    obtenerTiposBloques,
    validarDisponibilidadProfesor,
    generarHorarioProfesor,
    generarHorarioConValidacion as generarHorarioConValidacionService,
    obtenerEstadisticasHorarios as obtenerEstadisticasHorariosService,
    generarCombinacionGlobalService
} from '../services/combiHorarioProfesor.service.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';
import User from '../models/user.model.js';

/**
 * Generar horario básico para un profesor
 */
export const generarHorario = async (req, res) => {
    try {
        const { profesorId, asignaturas, preferencias } = req.body;

        // Validaciones básicas
        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        if (!asignaturas || !Array.isArray(asignaturas) || asignaturas.length === 0) {
            return handleErrorClient(res, 400, 'Debe especificar al menos una asignatura');
        }

        // Generar horario
        const resultado = await generarHorarioProfesor({
            profesorId,
            asignaturas,
            preferencias: preferencias || {}
        });

        if (resultado.combinacionesGeneradas === 0) {
            return handleErrorClient(res, 404, 'No se pudieron generar combinaciones válidas de horario');
        }

        handleSuccess(res, 200, 'Horario generado exitosamente', resultado);
    } catch (error) {
        console.error('Error al generar horario:', error);
        
        if (error.message.includes('no encontrado') || error.message.includes('no configurada')) {
            return handleErrorClient(res, 404, error.message);
        }
        
        handleErrorServer(res, 500, 'Error interno del servidor al generar horario');
    }
};

/**
 * Generar horario con validaciones previas
 */
export const generarHorarioValidado = async (req, res) => {
    try {
        const { profesorId, asignaturas, preferencias } = req.body;

        // Validaciones básicas
        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        if (!asignaturas || !Array.isArray(asignaturas) || asignaturas.length === 0) {
            return handleErrorClient(res, 400, 'Debe especificar al menos una asignatura');
        }

        // Generar horario con validación
        const resultado = await generarHorarioConValidacionService({
            profesorId,
            asignaturas,
            preferencias: preferencias || {}
        });

        if (!resultado.exito) {
            return handleErrorClient(res, 400, 'Errores en la validación', {
                errores: resultado.errores,
                advertencias: resultado.advertencias
            });
        }

        handleSuccess(res, 200, 'Horario validado y generado exitosamente', {
            ...resultado,
            mensaje: resultado.validaciones?.length > 0 ? 'Horario generado con advertencias' : 'Horario generado exitosamente'
        });
    } catch (error) {
        console.error('Error al generar horario con validación:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al generar horario con validación');
    }
};

/**
 * Obtener lista de profesores
 */
export const obtenerProfesores = async (req, res) => {
    try {
        const profesores = await obtenerListaProfesores();
        
        handleSuccess(res, 200, 'Lista de profesores obtenida exitosamente', {
            total: profesores.length,
            profesores
        });
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener profesores');
    }
};

/**
 * Obtener salas disponibles
 */
export const obtenerSalas = async (req, res) => {
    try {
        const salas = obtenerSalasDisponibles();
        
        handleSuccess(res, 200, 'Salas obtenidas exitosamente', {
            total: salas.length,
            salas
        });
    } catch (error) {
        console.error('Error al obtener salas:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener salas');
    }
};

/**
 * Obtener tipos de bloques disponibles
 */
export const obtenerTiposBloquesController = async (req, res) => {
    try {
        const tiposBloques = obtenerTiposBloques();
        
        handleSuccess(res, 200, 'Tipos de bloques obtenidos exitosamente', {
            tipos: tiposBloques
        });
    } catch (error) {
        console.error('Error al obtener tipos de bloques:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener tipos de bloques');
    }
};

/**
 * Obtener asignaturas disponibles desde la base de datos
 */
export const obtenerAsignaturasDisponibles = async (req, res) => {
    try {
        // Importar el servicio de asignaturas
        const { getAllAsignaturasService } = await import('../services/asignaturas.service.js');
        
        const [asignaturas, errorAsignaturas] = await getAllAsignaturasService();

        if (errorAsignaturas) {
            return handleErrorClient(res, 404, 'No hay asignaturas registradas', errorAsignaturas);
        }

        handleSuccess(res, 200, 'Asignaturas obtenidas exitosamente', asignaturas);
    } catch (error) {
        console.error('Error al obtener asignaturas disponibles:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener asignaturas');
    }
};

/**
 * Validar disponibilidad de un profesor
 */
export const validarDisponibilidad = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const { dia, horaInicio, horaFin } = req.query;

        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        // Si no se proporcionan parámetros de validación específica, obtener disponibilidad general
        if (!dia || !horaInicio || !horaFin) {
            const estadisticas = await obtenerEstadisticasHorarios(profesorId);
            return handleSuccess(res, 200, 'Disponibilidad general obtenida', {
                disponibilidadGeneral: estadisticas.estadisticas,
                bloques: estadisticas.disponibilidad
            });
        }

        // Validar disponibilidad específica
        const resultado = await validarDisponibilidadProfesor(profesorId, dia, horaInicio, horaFin);
        
        const mensaje = resultado.disponible 
            ? 'Profesor disponible en el horario solicitado'
            : 'Profesor no disponible en el horario solicitado';

        handleSuccess(res, 200, mensaje, resultado);
    } catch (error) {
        console.error('Error al validar disponibilidad:', error);
        
        if (error.message.includes('no encontrado')) {
            return handleErrorClient(res, 404, error.message);
        }
        
        handleErrorServer(res, 500, 'Error interno del servidor al validar disponibilidad');
    }
};

/**
 * Obtener estadísticas de horarios de un profesor
 */
export const obtenerEstadisticasHorarios = async (req, res) => {
    try {
        const { profesorId } = req.params;

        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        const estadisticas = await obtenerEstadisticasHorariosService(profesorId);
        
        handleSuccess(res, 200, 'Estadísticas obtenidas exitosamente', estadisticas);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        
        if (error.message.includes('no encontrado')) {
            return handleErrorClient(res, 404, error.message);
        }
        
        handleErrorServer(res, 500, 'Error interno del servidor al obtener estadísticas');
    }
};

/**
 * Guardar asignaturas que impartirá un profesor
 */
export const guardarAsignaturasProfesor = async (req, res) => {
    try {
        const { profesorId } = req.params;
        const { asignaturas } = req.body;

        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        if (!asignaturas || !Array.isArray(asignaturas)) {
            return handleErrorClient(res, 400, 'Las asignaturas deben ser un array válido');
        }

        // Guardar en el usuario (profesor)
        const profesor = await User.findByIdAndUpdate(
            profesorId,
            { asignaturasImpartidas: asignaturas },
            { new: true }
        );

        if (!profesor) {
            return handleErrorClient(res, 404, 'Profesor no encontrado');
        }

        handleSuccess(res, 200, 'Asignaturas guardadas exitosamente', {
            profesorId,
            asignaturas: profesor.asignaturasImpartidas,
            fechaActualizacion: new Date()
        });
    } catch (error) {
        console.error('Error al guardar asignaturas del profesor:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al guardar asignaturas');
    }
};

/**
 * Obtener asignaturas de un profesor
 */
export const obtenerAsignaturasProfesor = async (req, res) => {
    try {
        const { profesorId } = req.params;

        if (!profesorId) {
            return handleErrorClient(res, 400, 'El ID del profesor es requerido');
        }

        const profesor = await User.findById(profesorId).lean();

        if (!profesor) {
            return handleErrorClient(res, 404, 'Profesor no encontrado');
        }

        handleSuccess(res, 200, 'Asignaturas obtenidas exitosamente', {
            profesorId,
            asignaturas: profesor.asignaturasImpartidas || [],
            fechaConsulta: new Date()
        });
    } catch (error) {
        console.error('Error al obtener asignaturas del profesor:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener asignaturas');
    }
};

export const generarCombinacionGlobal = async (req, res) => {
  try {
    const resultado = await generarCombinacionGlobalService(req.body);
    handleSuccess(res, 200, 'Combinación global generada exitosamente', resultado);
  } catch (error) {
    console.error('Error al generar la combinación global:', error);
    handleErrorServer(res, 500, 'Error al generar la combinación global');
  }
};