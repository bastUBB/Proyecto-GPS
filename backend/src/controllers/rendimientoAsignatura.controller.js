import{
    createRendimientoAsignaturaService,
    getRendimientoAsignaturaService,
    getAllRendimientosAsignaturaService,
    updateRendimientoAsignaturaService,
    deleteRendimientoAsignaturaService
} from '../services/rendimientoAsignatura.service.js';
import { rendimientoAsignaturaQueryValidation, rendimientoAsignaturaBodyValidation } from '../validations/rendimientoAsignatura.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function createRendimientoAsignatura(req, res) {
    try {
        const rendimientoAsignatura = req.body;

        const { value, error } = rendimientoAsignaturaBodyValidation.validate(rendimientoAsignatura);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newRendimientoAsignatura, errorNewRendimientoAsignatura] = await createRendimientoAsignaturaService(value);

        if (errorNewRendimientoAsignatura) return handleErrorClient(res, 400, "Error creando el rendimiento de la asignatura", errorNewRendimientoAsignatura);

        handleSuccess(res, 201, "Rendimiento de asignatura creado con éxito", newRendimientoAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getRendimientoAsignatura(req, res) {
    try {
        const rendimientoAsignaturaQuery = req.query;

        const { errorQuery } = rendimientoAsignaturaQueryValidation.validate(rendimientoAsignaturaQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [rendimientoAsignatura, errorRendimientoAsignatura] = await getRendimientoAsignaturaService(rendimientoAsignaturaQuery);

        if (errorRendimientoAsignatura) return handleErrorClient(res, 404, "Rendimiento de asignatura no encontrado", errorRendimientoAsignatura);

        handleSuccess(res, 200, "Rendimiento de asignatura encontrado", rendimientoAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllRendimientosAsignatura(req, res) {
    try {
        const [rendimientosAsignatura, errorRendimientosAsignatura] = await getAllRendimientosAsignaturaService();

        if (errorRendimientosAsignatura) return handleErrorClient(res, 404, "No hay rendimientos de asignaturas registrados", errorRendimientosAsignatura);

        handleSuccess(res, 200, "Rendimientos de asignaturas encontrados", rendimientosAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateRendimientoAsignatura(req, res) {
    try {
        const { errorQuery } = rendimientoAsignaturaQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const rendimientoAsignaturaBody = req.body;

        const { value, error } = rendimientoAsignaturaBodyValidation.validate(rendimientoAsignaturaBody);

        if (error) return handleErrorClient(res, 400, "Error de validación en el cuerpo", error.message);

        const [updatedRendimientoAsignatura, errorUpdate] = await updateRendimientoAsignaturaService(req.query, value);

        if (errorUpdate) return handleErrorClient(res, 404, "Rendimiento de asignatura no encontrado", errorUpdate);

        handleSuccess(res, 200, "Rendimiento de asignatura actualizado con éxito", updatedRendimientoAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteRendimientoAsignatura(req, res) {
    try {
        const { errorQuery } = rendimientoAsignaturaQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const [deletedRendimientoAsignatura, errorDelete] = await deleteRendimientoAsignaturaService(req.query);

        if (errorDelete) return handleErrorClient(res, 404, "Rendimiento de asignatura no encontrado", errorDelete);

        handleSuccess(res, 200, "Rendimiento de asignatura eliminado con éxito", deletedRendimientoAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}