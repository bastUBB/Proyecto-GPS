import {
createUserService,
getAllUsersService,
getUserService,
updateUserService,
deleteUserService,
} from '../services/user.service.js';
import { userQueryValidation, userBodyValidation } from '../validations/user.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';

export async function createUser(req, res) {
    try {
        const user = req.body;

        const { value, error } = userBodyValidation.validate(user);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newUser, errorNewUser] = await createUserService(value);

        if (errorNewUser) return handleErrorClient(res, 400, "Error registrando el usuario", errorNewUser);

        handleSuccess(res, 201, "Usuario registrado con éxito", newUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getUser(req, res) {
    try {
        const { rut } = req.query;

        const { error } = userQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [user, errorUser] = await getUserService({ rut });

        if (errorUser) return handleErrorClient(res, 404, "Usuario no encontrado", errorUser);

        handleSuccess(res, 200, "Usuario encontrado", user);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllUsers(req, res) {
    try {
        const [users, errorUsers] = await getAllUsersService();

        if (errorUsers) return handleErrorClient(res, 404, "No hay usuarios registrados", errorUsers);

        handleSuccess(res, 200, "Usuarios encontrados", users);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateUser(req, res) {
    try {
        const body = req.body;

        const { errorQuery } = userQueryValidation.validate(req.query);
        
        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const { errorBody } = userBodyValidation.validate(body);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación", errorBody.message);

        const [updatedUser, errorUpdatedUser] = await updateUserService(req.query, body);

        if (errorUpdatedUser) return handleErrorClient(res, 404, "Usuario no encontrado", errorUpdatedUser);

        handleSuccess(res, 200, "Usuario actualizado con éxito", updatedUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteUser(req, res) {
    try {
        const { rut } = req.query;

        const { error } = userQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [deletedUser, errorDeletedUser] = await deleteUserService({ rut });

        if (errorDeletedUser) return handleErrorClient(res, 404, "Usuario no encontrado", errorDeletedUser);

        handleSuccess(res, 200, "Usuario eliminado con éxito", deletedUser);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}