import { 
    guardarDisponibilidad, 
    obtenerDisponibilidad, 
    eliminarDisponibilidad as eliminarDisponibilidadService 
} from '../services/disponibilidad.service.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { 
    disponibilidadBodyValidation, 
    disponibilidadQueryValidation 
} from '../validations/disponibilidad.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

// Función auxiliar para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const subirDisponibilidad = async (req, res) => {
    try {
        const { bloques } = req.body;
        const profesorId = req.user?.id || req.user?._id;
        
        console.log('Datos recibidos:', { bloques, profesorId, user: req.user });
        
        // Validar que profesorId sea un ObjectId válido
        if (!isValidObjectId(profesorId)) {
            return handleErrorClient(res, 400, "ID de profesor inválido");
        }
        
        // Validar solo los bloques (no incluir profesor en la validación)
        const { value, error } = disponibilidadBodyValidation.validate({ bloques });
        
        if (error) {
            console.log('Error de validación:', error.details);
            return handleErrorClient(res, 400, "Error de validación", error.details.map(detail => detail.message));
        }
        
        // Verificar que el usuario sea profesor
        const user = await User.findById(profesorId);
        if (!user || user.role !== 'profesor') {
            return handleErrorClient(res, 403, 'Solo los profesores pueden subir disponibilidad');
        }

        // --- VALIDACIÓN DE BLOQUES SEGUIDOS Y PRIMER BLOQUE DE 1:20 ---
        // Agrupar bloques por día
        const bloquesPorDia = {};
        for (const bloque of value.bloques) {
            if (!bloquesPorDia[bloque.dia]) bloquesPorDia[bloque.dia] = [];
            bloquesPorDia[bloque.dia].push(bloque);
        }

        let disponibilidadValida = true;

        for (const dia in bloquesPorDia) {
            // Ordenar por hora de inicio
            const bloquesDia = bloquesPorDia[dia].sort((a, b) => {
                const [ha, ma] = a.horaInicio.split(':').map(Number);
                const [hb, mb] = b.horaInicio.split(':').map(Number);
                return ha * 60 + ma - (hb * 60 + mb);
            });

            let i = 0;
            while (i < bloquesDia.length) {
                // Calcular duración del bloque actual
                const bloqueActual = bloquesDia[i];
                const [hi, mi] = bloqueActual.horaInicio.split(':').map(Number);
                const [hf, mf] = bloqueActual.horaFin.split(':').map(Number);
                const duracion = ((hf * 60 + mf) - (hi * 60 + mi)) / 60;

                // Debe comenzar con bloque de 1:20h
                if (!(duracion >= 1.3 && duracion <= 1.4)) {
                    disponibilidadValida = false;
                    break;
                }

                // Debe haber al menos un siguiente bloque consecutivo
                if (i + 1 >= bloquesDia.length) {
                    disponibilidadValida = false;
                    break;
                }
                const siguiente = bloquesDia[i + 1];
                if (bloqueActual.horaFin !== siguiente.horaInicio) {
                    disponibilidadValida = false;
                    break;
                }

                // Avanza al siguiente par (puedes permitir secuencias más largas si quieres)
                i += 2;
                // Si quieres permitir secuencias más largas, puedes hacer un while interno aquí
            }
            if (!disponibilidadValida) break;
        }

        if (!disponibilidadValida) {
            return handleErrorClient(
                res,
                400,
                "Cada secuencia de bloques debe tener al menos 2 bloques consecutivos comenzando por uno de duración 1:20 horas. No se permiten bloques sueltos."
            );
        }
        // --- FIN VALIDACIÓN ---

        // Guardar disponibilidad
        const disponibilidad = await guardarDisponibilidad(profesorId, value.bloques);
        
        console.log('Disponibilidad guardada exitosamente:', disponibilidad);
        handleSuccess(res, 200, 'Disponibilidad guardada exitosamente', disponibilidad);
    } catch (error) {
        console.error('Error al guardar disponibilidad:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al guardar disponibilidad');
    }
};

export const verDisponibilidad = async (req, res) => {
    try {
        const { profesorId } = req.query;
        
        // Si no se proporciona profesorId, usar el ID del usuario autenticado
        const idProfesor = profesorId || req.user?.id || req.user?._id;
        
        // Validar que profesorId sea un ObjectId válido
        if (!isValidObjectId(idProfesor)) {
            return handleErrorClient(res, 400, "ID de profesor inválido");
        }
        
        // Obtener disponibilidad
        const disponibilidad = await obtenerDisponibilidad(idProfesor);
        
        if (!disponibilidad) {
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
        
        // Validar que profesorId sea un ObjectId válido
        if (!isValidObjectId(profesorId)) {
            return handleErrorClient(res, 400, "ID de profesor inválido");
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