import {
    crearRecomendacionInscripcionService,
    crearInscripcionService
} from '../services/inscripcion.service.js';
import { inscripcionBodyValidation } from '../validations/inscripcion.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

export async function crearInscripcion(req, res) {
    try {
        const inscripcionData = req.body;

        const { value, error } = inscripcionBodyValidation.validate(inscripcionData);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newInscripcion, errorNewInscripcion] = await crearInscripcionService(value);

        if (errorNewInscripcion) return handleErrorClient(res, 400, "Error creando la inscripción", errorNewInscripcion);

        handleSuccess(res, 201, "Inscripción creada con éxito", newInscripcion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function crearRecomendacionInscripcion(req, res) {
    try {
        const { rutEstudiante } = req.body;

        if (!rutEstudiante) return handleErrorClient(res, 400, "Error de validación", "El campo 'rutEstudiante' es obligatorio");

        const [recomendacion, errorRecomendacion] = await crearRecomendacionInscripcionService(rutEstudiante);

        if (errorRecomendacion) return handleErrorClient(res, 400, "Error creando la recomendación de inscripción", errorRecomendacion);

        handleSuccess(res, 201, "Recomendación de inscripción creada con éxito", recomendacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}