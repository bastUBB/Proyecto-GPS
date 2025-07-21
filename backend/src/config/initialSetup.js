"use strict";
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../helpers/bcrypt.helper.js';
import User from '../models/user.model.js';
import Asignatura from '../models/asignaturas.model.js';

const asignaturasPath = path.resolve('output/horario_manual.json');
const asignaturasRaw = fs.readFileSync(asignaturasPath);
const Asignaturas = JSON.parse(asignaturasRaw);

async function createInitialUsers() {
    try {
        // Verificar si ya existen los usuarios iniciales
        const existingUsers = await User.find({});
        if (existingUsers.length > 0) {
            console.log('Usuarios iniciales ya existen');
            return;
        }

        // Array de usuarios iniciales
        const usersData = [
            {
                nombreCompleto: 'Administrador',
                email: 'admin@ubiobio.cl',
                rut: '12345678-9',
                password: 'admin1234',
                role: 'admin'
            },
            {
                nombreCompleto: 'Juan Carlos Pérez Quijada',
                email: 'juan.perez@ubiobio.cl',
                rut: '15876543-2',
                password: 'profesor123',
                role: 'profesor'
            },
            {
                nombreCompleto: 'Pedro Arturo Flores Paredes',
                email: 'predro.flores@ubiobio.cl',
                rut: '14342134-5',
                password: 'profesor123',
                role: 'profesor'
            },
            {
                nombreCompleto: 'María Fernanda González',
                email: 'maria.gonzalez@alumnos.ubiobio.cl',
                rut: '19876543-5',
                password: 'estudiante123',
                role: 'alumno'
            },
            {
                nombreCompleto: 'Ana Isabel Morales',
                email: 'ana.morales@ubiobio.cl',
                rut: '14567890-1',
                password: 'admin456',
                role: 'admin'
            }
        ];

        // Crear usuarios con contraseñas encriptadas
        const usersPromises = usersData.map(async (userData) => {
            const hashedPassword = await hashPassword(userData.password);
            return User.create({
                nombreCompleto: userData.nombreCompleto,
                email: userData.email,
                rut: userData.rut,
                password: hashedPassword,
                role: userData.role
            });
        });

        await Promise.all(usersPromises);

        console.log('Usuarios iniciales creados exitosamente:');
        usersData.forEach(user => {
            console.log(`- ${user.nombreCompleto} (${user.role}): ${user.email}`);
        });
    } catch (error) {
        console.error('Error al crear usuarios iniciales:', error.message);
    }
};

async function createAsignaturas() {
    try {

        if (!Asignaturas || Asignaturas.length === 0) {
            console.log('No hay asignaturas en el JSON para crear.');
            return;
        }

        const asignaturasExistentes = await Asignatura.find({ codigo: { $in: Asignaturas.map(a => a.codigo) } });
        if (asignaturasExistentes.length > 0) {
            console.log('Algunas asignaturas iniciales ya existen en la base de datos.');
            return;
        }

        // mapear cada asignatura de asignaturasData y crearla en la base de datos
        const asignaturasPromises = Asignaturas.map(asignatura => {
            return Asignatura.create({
                nombre: asignatura.nombre,
                codigo: asignatura.codigo,
                creditos: asignatura.creditos,
                prerrequisitos: asignatura.prerrequisitos,
                semestre: asignatura.semestre,
                ambito: asignatura.ambito,
                area: asignatura.area
            });
        }
        );

        await Promise.all(asignaturasPromises);

        // Si todas las asignaturas se crean correctamente, imprimir un mensaje de éxito
        console.log('Asignaturas iniciales creadas exitosamente');

    } catch (error) {
        console.error('Error al crear asignaturas iniciales:', error.message);
    }
}

async function initialSetup() {
    await createInitialUsers();
    await createAsignaturas();
}

export { initialSetup };