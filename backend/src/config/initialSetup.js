"use strict";
import { hashPassword } from '../helpers/bcrypt.helper.js';
import User from '../models/user.model.js';

async function createInitialUsers() {
    try {
        // Verificar si ya existe el usuario admin
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('Usuario inicial ya existe');
            return;
        }

        // Encriptar contraseña
        const hashedPassword = await hashPassword('123456');

        // Crear usuario admin
        await User.create({
            name: 'Administrador',
            email: 'admin@example.com',
            rut: '12345678-9',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Usuario inicial creado: admin@example.com');
    } catch (error) {
        console.error('Error al crear usuario inicial:', error.message);
    }
};

export { createInitialUsers };