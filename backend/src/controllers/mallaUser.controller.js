import{
createMallaUserService,
getMallaUserService,
updateMallaUserService,
deleteMallaUserService
} from '../services/mallaUser.service.js';
import { mallaUserQueryValidation, mallaUserBodyValidation } from '../validations/mallaUser.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

export async function createMallaUser(req, res) {
    try {
        const mallaUser = req.body;

        const { value, error } = mallaUserBodyValidation.validate(mallaUser);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newMallaUser, errorNewMallaUser] = await createMallaUserService(value);

        if (errorNewMallaUser) return handleErrorClient(res, 400, "Error creando la malla del usuario", errorNewMallaUser);

        handleSuccess(res, 201, "Malla del usuario creada con éxito", newMallaUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getMallaUser(req, res) {
    try {
        const { rutUser } = req.query;
        
        console.log('Datos recibidos para obtener la malla del usuario:', rutUser);

        const { error } = mallaUserQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [mallaUser, errorMallaUser] = await getMallaUserService({ rutUser });

        if (errorMallaUser) return handleErrorClient(res, 404, "Malla del usuario no encontrada", errorMallaUser);

        handleSuccess(res, 200, "Malla del usuario encontrada", mallaUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateMallaUser(req, res) {
    try {
        const { rutUser } = req.query;

        console.log('Datos recibidos para actualizar la malla del usuario:', req.body);

        const { error: errorQuery } = mallaUserQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const { error: errorBody } = mallaUserBodyValidation.validate(req.body);

        if (errorBody) {
            console.log('Error de validación en el cuerpo:', errorBody.details);
            return handleErrorClient(res, 400, "Error de validación en el cuerpo de la solicitud", errorBody.message);
        }

        const [updatedMallaUser, errorUpdate] = await updateMallaUserService({ rutUser }, req.body);

        if (errorUpdate) return handleErrorClient(res, 404, "Error actualizando la malla del usuario", errorUpdate);

        handleSuccess(res, 200, "Malla del usuario actualizada con éxito", updatedMallaUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteMallaUser(req, res) {
    try {
        const { rutUser } = req.query;

        const { error } = mallaUserQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [deletedMallaUser, errorDelete] = await deleteMallaUserService({ rutUser });

        if (errorDelete) return handleErrorClient(res, 404, "Malla del usuario no encontrada", errorDelete);

        handleSuccess(res, 200, "Malla del usuario eliminada con éxito", deletedMallaUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}