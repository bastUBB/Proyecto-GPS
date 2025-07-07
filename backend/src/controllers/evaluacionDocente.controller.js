import{
createEvaluacionDocenteService,
getEvaluacionDocenteService,
getAllEvaluacionesDocenteService,
updateEvaluacionDocenteService,
deleteEvaluacionDocenteService
} from '../services/evaluacionDocente.service.js';
import { evaluacionDocenteQueryValidation, evaluacionDocenteBodyValidation } from '../validations/evaluacionDocente.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function createEvaluacionDocente(req, res) {
    try {
        const evaluacionDocente = req.body;

        const { value, error } = evaluacionDocenteBodyValidation.validate(evaluacionDocente);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newEvaluacionDocente, errorNewEvaluacionDocente] = await createEvaluacionDocenteService(value);

        if (errorNewEvaluacionDocente) return handleErrorClient(res, 400, "Error registrando la evaluación docente", errorNewEvaluacionDocente);

        handleSuccess(res, 201, "Evaluación docente registrada con éxito", newEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getEvaluacionDocente(req, res) {
    try {
        const evaluacionDocenteQuery = req.query;

        const { errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [evaluacionDocente, errorEvaluacionDocente] = await getEvaluacionDocenteService(evaluacionDocenteQuery);

        if (errorEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente encontrada", evaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllEvaluacionesDocente(req, res) {
    try {
        const [evaluacionesDocente, errorEvaluacionesDocente] = await getAllEvaluacionesDocenteService();

        if (errorEvaluacionesDocente) return handleErrorClient(res, 404, "No hay evaluaciones docentes registradas", errorEvaluacionesDocente);

        handleSuccess(res, 200, "Evaluaciones docentes encontradas", evaluacionesDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateEvaluacionDocente(req, res) {
    try {
        const evaluacionDocenteQuery = req.query;

        const { errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const { value, errorBody } = evaluacionDocenteBodyValidation.validate(req.body);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación en el cuerpo", errorBody.message);

        const [updatedEvaluacionDocente, errorUpdatedEvaluacionDocente] = await updateEvaluacionDocenteService(evaluacionDocenteQuery, value);

        if (errorUpdatedEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorUpdatedEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente actualizada con éxito", updatedEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteEvaluacionDocente(req, res) {
    try {
        const evaluacionDocenteQuery = req.query;

        const { errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [deletedEvaluacionDocente, errorDeletedEvaluacionDocente] = await deleteEvaluacionDocenteService(evaluacionDocenteQuery);

        if (errorDeletedEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorDeletedEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente eliminada con éxito", deletedEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}