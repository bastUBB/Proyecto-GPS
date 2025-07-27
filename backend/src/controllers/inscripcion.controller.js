import {
    crearRecomendacionInscripcionService,
    crearInscripcionService,
    getInscripcionService,
    deleteInscripcionService,
    updateInscripcionService
} from '../services/inscripcion.service.js';
import { inscripcionQueryValidation, inscripcionBodyValidation } from '../validations/inscripcion.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

export async function crearInscripcion(req, res) {
    try {
        const inscripcionData = req.body;

        console.log('Datos de inscripción recibidos:', inscripcionData);

        const { value, error } = inscripcionBodyValidation.validate(inscripcionData);

        console.log('Datos de inscripción validados:', value);

        console.log('Error1?', error);
        
        if (error) {
            const mensaje = error.details?.[0]?.message || error.message || "Datos inválidos";
            return handleErrorClient(res, 400, "Error de validación", mensaje);
        }

        console.log('Error2?', error);

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

export async function getInscripcion(req, res) {
    try {
        const dataInscripcion = req.query;

        const { error, value } = inscripcionQueryValidation.validate(dataInscripcion);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [inscripcion, errorInscripcion] = await getInscripcionService(value);

        if (errorInscripcion) return handleErrorClient(res, 404, "Inscripción no encontrada", errorInscripcion);

        handleSuccess(res, 200, "Inscripción obtenida con éxito", inscripcion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteInscripcion(req, res) {
    try {
        const dataInscripcion = req.query;

        const { error, value } = inscripcionQueryValidation.validate(dataInscripcion);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [deletedInscripcion, errorDelete] = await deleteInscripcionService(value);

        if (errorDelete) return handleErrorClient(res, 404, "Inscripción no encontrada", errorDelete);

        handleSuccess(res, 200, "Inscripción eliminada con éxito", deletedInscripcion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateInscripcion(req, res) {
    try {
        const dataInscripcionQuery = req.query;

        const { error, value } = inscripcionQueryValidation.validate(dataInscripcionQuery);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const dataInscripcionBody = req.body;

        const { error: bodyError, value: bodyValue } = inscripcionBodyValidation.validate(dataInscripcionBody);

        if (bodyError) return handleErrorClient(res, 400, "Error de validación", bodyError.message);

        const [updatedInscripcion, errorUpdate] = await updateInscripcionService(value, bodyValue);

        if (errorUpdate) return handleErrorClient(res, 404, "Inscripción no encontrada", errorUpdate);

        handleSuccess(res, 200, "Inscripción actualizada con éxito", updatedInscripcion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}