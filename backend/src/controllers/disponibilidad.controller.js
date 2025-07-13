import { 
    guardarDisponibilidad, 
    obtenerDisponibilidad, 
    eliminarDisponibilidad as eliminarDisponibilidadService 
} from '../services/disponibilidad.service.js';
import User from '../models/user.model.js';
import { 
    disponibilidadBodyValidation, 
    disponibilidadQueryValidation 
} from '../validations/disponibilidad.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

export const subirDisponibilidad = async (req, res) => {
    try {
        const { bloques } = req.body;
        const profesorId = req.user?.id || req.body.profesorId;
        
        // Validar datos de entrada
        const datosValidar = { profesor: profesorId, bloques };
        const { value, error } = disponibilidadBodyValidation.validate(datosValidar);
        
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.details.map(detail => detail.message));
        }
        
        // Verificar que el usuario sea profesor
        const user = await User.findById(profesorId);
        if (!user || user.role !== 'profesor') {
            return handleErrorClient(res, 403, 'Solo los profesores pueden subir disponibilidad');
        }

        // Guardar disponibilidad
        const disponibilidad = await guardarDisponibilidad(profesorId, bloques);
        
        handleSuccess(res, 200, 'Disponibilidad guardada exitosamente', disponibilidad);
    } catch (error) {
        console.error('Error al guardar disponibilidad:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al guardar disponibilidad');
    }
};

export const verDisponibilidad = async (req, res) => {
    try {
        const { profesorId } = req.query;
        
        // Validar parámetros de consulta si se proporciona profesorId
        if (profesorId) {
            const { value, error } = disponibilidadQueryValidation.validate({ profesor: profesorId });
            
            if (error) {
                return handleErrorClient(res, 400, "Error de validación", error.details.map(detail => detail.message));
            }
        }
        
        // Obtener disponibilidad
        const disponibilidad = await obtenerDisponibilidad(profesorId);
        
        if (!disponibilidad || (Array.isArray(disponibilidad) && disponibilidad.length === 0)) {
            return handleErrorClient(res, 404, 'No se encontró disponibilidad');
        }
        
        handleSuccess(res, 200, 'Disponibilidad obtenida exitosamente', disponibilidad);
    } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener disponibilidad');
    }
};

export const eliminarDisponibilidad = async (req, res) => {
    try {
        const { profesorId } = req.params;
        
        // Validar parámetros
        const { value, error } = disponibilidadQueryValidation.validate({ profesor: profesorId });
        
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.details.map(detail => detail.message));
        }
        
        // Verificar que el usuario sea profesor
        const user = await User.findById(profesorId);
        if (!user || user.role !== 'profesor') {
            return handleErrorClient(res, 403, 'Solo se puede eliminar disponibilidad de profesores');
        }

        // Verificar que la disponibilidad existe
        const disponibilidadExistente = await obtenerDisponibilidad(profesorId);
        if (!disponibilidadExistente) {
            return handleErrorClient(res, 404, 'No se encontró disponibilidad para eliminar');
        }

        // Eliminar disponibilidad
        const resultado = await eliminarDisponibilidadService(profesorId);
        
        if (!resultado) {
            return handleErrorClient(res, 404, 'No se pudo eliminar la disponibilidad');
        }
        
        handleSuccess(res, 200, 'Disponibilidad eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar disponibilidad:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al eliminar disponibilidad');
    }
};