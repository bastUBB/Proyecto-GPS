import {
    createHistorialService,
    getHistorialService,
    getAllHistorialService,
    updateHistorialService,
    deleteHistorialService
} from '../services/historial.service.js';
import { historialQueryValidation, historialBodyValidation } from '../validations/historial.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function createHistorial(req, res) {
    try {
        const dataHistorial = req.body;

        const { value, errorBody } = historialBodyValidation.validate(dataHistorial);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación", errorBody.message);

        const [newHistorial, errorNewHistorial] = await createHistorialService(value);

        if (errorNewHistorial) return handleErrorClient(res, 400, "Error registrando el historial", errorNewHistorial);

        handleSuccess(res, 201, "Historial registrado con éxito", newHistorial);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getHistorial(req, res) {
    try {

        const { errorQuery } = historialQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [historial, errorHistorial] = await getHistorialService(req.query);

        if (errorHistorial) return handleErrorClient(res, 404, "Historial no encontrado", errorHistorial);

        handleSuccess(res, 200, "Historial encontrado", historial);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllHistorial(req, res) {
    try {
        const [historiales, errorHistoriales] = await getAllHistorialService();

        if (errorHistoriales) return handleErrorClient(res, 404, "No hay historiales registrados", errorHistoriales);

        handleSuccess(res, 200, "Historiales encontrados", historiales);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateHistorial(req, res) {
    try {

        const { errorQuery } = historialQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const { value, errorBody } = historialBodyValidation.validate(req.body);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación", errorBody.message);

        const [updatedHistorial, errorUpdatedHistorial] = await updateHistorialService(req.query, value);

        if (errorUpdatedHistorial) return handleErrorClient(res, 404, "Historial no encontrado", errorUpdatedHistorial);

        handleSuccess(res, 200, "Historial actualizado con éxito", updatedHistorial);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteHistorial(req, res) {
    try {

        const { errorQuery } = historialQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [deletedHistorial, errorDeletedHistorial] = await deleteHistorialService(req.query);

        if (errorDeletedHistorial) return handleErrorClient(res, 404, "Historial no encontrado", errorDeletedHistorial);

        handleSuccess(res, 200, "Historial eliminado con éxito", deletedHistorial);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}