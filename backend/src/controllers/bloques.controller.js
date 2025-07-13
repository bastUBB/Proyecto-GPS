import {
    createBloqueService,
    getBloqueService,
    getAllBloquesService,
    updateBloqueService,
    deleteBloqueService,
    getBloqueIdService,
    getBloqueByIdService
} from '../services/bloques.service.js';
import { bloqueQueryValidation, bloqueBodyValidation, bloqueIdValidation } from '../validations/bloques.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

export async function createBloque(req, res) {
    try {

        const bloqueBody = req.body;

        const { value, error } = bloqueBodyValidation.validate(bloqueBody);

        if (error) return handleErrorClient(res, 400, "Error de validación en el cuerpo de la solicitud", error.message);

        const [ newBloque, errorNewBloque ] = await createBloqueService(value);

        if (errorNewBloque) return handleErrorClient(res, 400, "Error registrando el bloque", errorNewBloque);

        handleSuccess(res, 201, "Bloque registrado con éxito", newBloque);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getBloque(req, res) {
    try {
        const bloqueQuery = req.query;

        const {value, error} = bloqueQueryValidation.validate(bloqueQuery);

        if (error) return handleErrorClient(res, 400, "Error de validación en la consulta", error.message);

        const [ bloque, errorBloque ] = await getBloqueService(value);

        if (errorBloque) return handleErrorClient(res, 404, "Bloque no encontrado", errorBloque);

        handleSuccess(res, 200, "Bloque encontrado", bloque);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllBloques(req, res) {
    try {
        const [ bloques, errorBloques ] = await getAllBloquesService();

        if (errorBloques) return handleErrorClient(res, 404, "No hay bloques registrados", errorBloques);

        handleSuccess(res, 200, "Bloques encontrados", bloques);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateBloque(req, res) {
    try {
        const { queryValue, queryError } = bloqueQueryValidation.validate(req.query);

        if (queryError) return handleErrorClient(res, 400, "Error de validación en la consulta", queryError.message);

        const { bodyValue, bodyError } = bloqueBodyValidation.validate(req.body);
        
        if (bodyError) return handleErrorClient(res, 400, "Error de validación en el cuerpo de la solicitud", bodyError.message);

        const [ updatedBloque, errorUpdate ] = await updateBloqueService(queryValue, bodyValue);

        if (errorUpdate) return handleErrorClient(res, 404, "Bloque que desea actualizar no existe", errorUpdate);

        handleSuccess(res, 200, "Bloque actualizado con éxito", updatedBloque);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteBloque(req, res) {
    try {
        const { value, error } = bloqueQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación en la consulta", error.message);

        const [ deletedBloque, errorDelete ] = await deleteBloqueService(value);

        if (errorDelete) return handleErrorClient(res, 404, "Bloque no encontrado", errorDelete);

        handleSuccess(res, 200, "Bloque eliminado con éxito", deletedBloque);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getBloqueId(req, res) {
    try {
        const { value, error } = bloqueQueryValidation.validate(req.body);

        if (error) return handleErrorClient(res, 400, "Error de validación en el cuerpo de la solicitud", error.message);

        const [ bloqueId, errorBloqueId ] = await getBloqueIdService(value);

        if (errorBloqueId) return handleErrorClient(res, 404, "Bloque no encontrado", errorBloqueId);

        handleSuccess(res, 200, "ID del bloque encontrado", bloqueId);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getBloqueById(req, res) {
    try {
        const { value, error } = bloqueIdValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación en la consulta", error.message);

        const [ bloqueId, errorBloqueId ] = await getBloqueByIdService(value);

        if (errorBloqueId) return handleErrorClient(res, 404, "Bloque no encontrado", errorBloqueId);

        handleSuccess(res, 200, "ID del bloque encontrado", bloqueId);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}