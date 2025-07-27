import {
    createEvaluacionDocenteService,
    getAllEvaluacionesDocenteService,
    getEvaluacionesByDocenteService,
    updateEvaluacionDocenteService,
    deleteEvaluacionDocenteService
} from '../services/evaluacionDocente.service.js';
import {
    evaluacionDocenteQueryValidation,
    evaluacionDocenteBodyValidation,
    createEvaluacionAlumnoValidation
} from '../validations/evaluacionDocente.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function createEvaluacionDocente(req, res) {
    try {
        if (!req.user || !req.user._id) {
            return handleErrorClient(res, 401, "Usuario no autenticado", "No se encontró información del usuario en el token");
        }

        const evaluacionData = req.body;
        const alumnoId = req.user._id;
        const alumnoNombre = req.user.nombreCompleto;

        const { value, error } = createEvaluacionAlumnoValidation.validate(evaluacionData);

        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }

        value.alumno = alumnoNombre;

        const [newEvaluacion, errorEvaluacion] = await createEvaluacionDocenteService(value, alumnoId);

        if (errorEvaluacion) {
            return handleErrorClient(res, 400, "Error creando evaluación", errorEvaluacion);
        }

        handleSuccess(res, 201, "Evaluación creada exitosamente", newEvaluacion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getEvaluacionDocente(req, res) {
    try {
        if (!req.user) {
            return handleErrorClient(res, 401, "Usuario no autenticado", "No se encontró información del usuario en el token");
        }

        // Usar nombreCompleto si existe, sino usar nombre completo construido o email como fallback
        const docenteNombre = req.user.nombreCompleto ||
            `${req.user.nombre} ${req.user.apellido}`.trim() ||
            req.user.email;

        if (!docenteNombre) {
            return handleErrorClient(res, 400, "Datos de usuario incompletos", "No se pudo determinar el nombre del docente");
        }

        const [evaluaciones, error] = await getEvaluacionesByDocenteService(docenteNombre);

        if (error) return handleErrorClient(res, 404, "No se encontraron evaluaciones", error);

        handleSuccess(res, 200, "Evaluaciones encontradas", evaluaciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllEvaluacionesDocente(req, res) {
    try {
        const [evaluaciones, errorEvaluaciones] = await getAllEvaluacionesDocenteService();

        if (errorEvaluaciones) {
            return handleErrorClient(res, 404, "Error al obtener evaluaciones", errorEvaluaciones);
        }

        handleSuccess(res, 200, "Evaluaciones obtenidas exitosamente", evaluaciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateEvaluacionDocente(req, res) {
    try {
        const evaluacionId = req.params.id || req.query._id;
        const evaluacionDocenteQuery = evaluacionId ? { _id: evaluacionId } : req.query;

        const { value: queryValue, error: errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);
        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const { value: bodyValue, error: errorBody } = evaluacionDocenteBodyValidation.validate(req.body);
        if (errorBody) return handleErrorClient(res, 400, "Error de validación en el cuerpo", errorBody.message);

        const [updatedEvaluacionDocente, errorUpdatedEvaluacionDocente] = await updateEvaluacionDocenteService(queryValue, bodyValue);

        if (errorUpdatedEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorUpdatedEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente actualizada con éxito", updatedEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteEvaluacionDocente(req, res) {
    try {
        const evaluacionId = req.params.id || req.query._id;
        const evaluacionDocenteQuery = evaluacionId ? { _id: evaluacionId } : req.query;

        const { value: queryValue, error: errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);
        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [deletedEvaluacionDocente, errorDeletedEvaluacionDocente] = await deleteEvaluacionDocenteService(queryValue);

        if (errorDeletedEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorDeletedEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente eliminada con éxito", deletedEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

