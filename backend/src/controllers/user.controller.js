import {
createUserService,
getAllUsersService,
getUserService,
updateUserService,
deleteUserService,
} from '../services/user.service.js';
import { userQueryValidation, userBodyValidation, userUpdateBodyValidation } from '../validations/user.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';
import User from '../models/user.model.js';
import { hashPassword } from '../helpers/bcrypt.helper.js';

export async function createUser(req, res) {
    try {
        const user = req.body;
        
        // Mapear "estudiante" a "alumno" para mantener compatibilidad
        if (user.role === "estudiante") {
            user.role = "alumno";
        }
        
        //console.log('🔍 Datos recibidos para crear usuario:', user);

        const { value, error } = userBodyValidation.validate(user);
        
        if (error) {
            //console.log('❌ Error de validación:', error.details);
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }

        if (value.password) {
            //console.log('Encriptando contraseña...');
            value.password = await hashPassword(value.password);
            //console.log('Contraseña encriptada correctamente');
        }

        //console.log('✅ Datos validados correctamente:', value);
        const [newUser, errorNewUser] = await createUserService(value);

        if (errorNewUser) {
            //console.log('❌ Error al crear usuario:', errorNewUser);
            return handleErrorClient(res, 400, "Error registrando el usuario", errorNewUser);
        }

        //console.log('✅ Usuario creado exitosamente:', newUser);
        handleSuccess(res, 201, "Usuario registrado con éxito", newUser);
    } catch (error) {
        //console.log('💥 Error inesperado:', error);
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
        
        // Mapear "estudiante" a "alumno" para mantener compatibilidad
        if (body.role === "estudiante") {
            body.role = "alumno";
        }

        const { errorQuery } = userQueryValidation.validate(req.query);
        
        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const { errorBody } = userUpdateBodyValidation.validate(body);

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

export const getFilterUsers = async (req, res) => {
    try {
        const { role } = req.query;
        
        let filter = {};
        if (role) {
            filter.role = role;
        }
        
        const users = await User.find(filter)
            .select('-password') // Excluir contraseñas
            .sort({ createdAt: -1 });
        
        handleSuccess(res, 200, 'Usuarios obtenidos exitosamente', users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        handleErrorServer(res, 500, 'Error interno del servidor al obtener usuarios');
    }
};