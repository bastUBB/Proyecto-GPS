import User from '../models/user.model.js';
import { comparePassword, hashPassword } from '../helpers/bcrypt.helper.js';

let newUser;

export async function createUserService(dataUser) {
    try {
        const { rut, email } = dataUser; 

        const existingUserRut = await User.findOne({ rut });

        if (existingUserRut) return [null, 'El rut que desea ingresar, ya se encuentra registrado'];

        const existingUserEmail = await User.findOne({ email }); // ← Corregir: usar findOne en lugar de find

        if (existingUserEmail) return [null, 'El correo electrónico que desea ingresar, ya se encuentra registrado'];

        newUser = new User(dataUser);

        if (!newUser) return [null, 'Error al crear el usuario'];

        const userSaved = await newUser.save();

        return [userSaved, null];
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getUserService(query) {
    try {
        const { rut } = query;

        const existingUser = await User.findOne({ rut });

        if (!existingUser) return [null, 'Usuario no encontrado'];

        return [existingUser, null];
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllUsersService() {
    try {
        const users = await User.find();

        if (!users || users.length === 0) return [null, 'No hay usuarios registrados'];

        return [users, null];
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateUserService(query, body) {
    try {
        const { rut } = query

        const existingUser = await User.findOne({ rut });

        if (!existingUser) return [null, 'El usuario que desea actualizar no existe'];

        const { rut: nuevoRutCompleto, email: nuevoEmail, password: nuevaPassword } = body;

        // Verificar si el nuevo RUT ya existe en otro usuario
        const existingUserRut = await User.findOne({ rut: nuevoRutCompleto });
        if (existingUserRut && existingUserRut.rut !== existingUser.rut) {
            return [null, 'El rut que desea ingresar ya se encuentra registrado con otro usuario'];
        }

        // Verificar si el nuevo email ya existe en otro usuario
        const existingUserEmail = await User.findOne({ email: nuevoEmail });
        if (existingUserEmail && existingUserEmail.email !== existingUser.email) {
            return [null, 'El correo electrónico que desea ingresar ya se encuentra registrado con otro usuario'];
        }
        
        if (nuevaPassword) {
            const matchPassword = await comparePassword(nuevaPassword, existingUser.password);
            if (!matchPassword) return [null, "La contraseña no coincide"];
        }

        await User.updateOne(
            { rut: existingUser.rut },
            {
                $set: {
                    ...body, // de donde se toman los valores del body
                    nombreCompleto: body.nombreCompleto,
                    rut: nuevoRutCompleto,
                    email: nuevoEmail,
                    password: nuevaPassword ? await hashPassword(nuevaPassword) : existingUser.password,
                }
            }
        );

        const updatedUser = await User.findOne({ rut: nuevoRutCompleto });

        if (!updatedUser) return [null, 'Usuario no encontrado después de la actualización'];

        return [updatedUser, null];
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteUserService(query) {
    try {
        const { rut } = query;

        const existingUser = await User.findOne({ rut });

        if (!existingUser) return [null, 'El usuario que desea eliminar no existe'];

        const deletedUser = await User.deleteOne({ rut });

        if (!deletedUser) return [null, 'Error al eliminar el usuario'];

        return [deletedUser, null];
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}