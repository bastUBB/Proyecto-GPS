"use strict";
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../helpers/bcrypt.helper.js';
import User from '../models/user.model.js';
import Asignatura from '../models/asignaturas.model.js';
import rendimientoAsignatura from '../models/rendimientoAsignatura.model.js';
import { crearTodosLosRendimientosExistentes } from '../services/rendimientoAsignatura.service.js';
import { crearAsignaturasDocentes } from '../services/asignaturasDocente.service.js';
import { generarProfesoresSimple } from '../../scripts/extraccionRutsSimple.js';
import { crearEvaluacionesDocentes } from '../../scripts/creadorEvaluaciones.js';
// import { crearRecomendacionInscripcionService } from '../services/inscripcion.service.js';

const asignaturasPath = path.resolve('output/horario_manual.json');
const asignaturasRaw = fs.readFileSync(asignaturasPath);
const Asignaturas = JSON.parse(asignaturasRaw);

const profesoresPath = path.resolve('output/profesores_sin_rut.json');
const profesoresRaw = fs.readFileSync(profesoresPath);
const Profesores = JSON.parse(profesoresRaw).profesores;

// Cargar datos de rendimiento
const datosRendimientoPath = path.resolve('output/datos_rendimiento.json');
const datosRendimientoRaw = fs.readFileSync(datosRendimientoPath);
const datosRendimiento = JSON.parse(datosRendimientoRaw).datos;

// Cargar horario manual (el que contiene docentes y secciones, no el de asignaturas)
const horarioManualPath = path.resolve('output/horario_extraido.json');
const horarioManualRaw = fs.readFileSync(horarioManualPath);
const horarioManual = JSON.parse(horarioManualRaw);

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
                rut: '12245678-9',
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
                password: 'estudiante123',
                role: 'alumno'
            },
            {
                nombreCompleto: 'Nicolás Gómez Morgado',
                email: 'nicolas.gomez2101@ubiobio.cl',
                rut: '21279536-4',
                password: 'estudiante123',
                role: 'alumno'
            },
            {
                nombreCompleto: 'Bastian Rodriguez Campusano',
                email: 'bastian.rodriguez2101@ubiobio.cl',
                rut: '21548761-2',
                password: 'estudiante123',
                role: 'alumno'
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

async function createProfesores() {
    try {
        if (!Profesores || Profesores.length === 0) {
            console.log('No hay profesores en el JSON para crear.');
            return;
        }

        const profesoresACrear = Profesores.slice(0, 85);
        
        const profesoresExistentes = await User.find({ 
            rut: { $in: profesoresACrear.map(p => p.rut) },
            role: 'profesor'
        });
        const rutsExistentes = profesoresExistentes.map(p => p.rut);

        const profesoresNuevos = profesoresACrear.filter(profesor => 
            !rutsExistentes.includes(profesor.rut)
        );

        if (profesoresNuevos.length === 0) {
            console.log('Todos los profesores ya existen en la base de datos.');
            return;
        }

        const profesoresPromises = profesoresNuevos.map(async (profesor) => {
            const hashedPassword = await hashPassword(profesor.password);
            return User.create({
                nombreCompleto: profesor.nombreCompleto,
                email: profesor.email,
                rut: profesor.rut,
                password: hashedPassword,
                role: 'profesor'
            });
        });

        await Promise.all(profesoresPromises);

    } catch (error) {
        console.error('Error al crear profesores iniciales:', error.message);
    }
}

async function createRendimientos() {
    try {
        await crearTodosLosRendimientosExistentes();
    } catch (error) {
        console.error('Error al crear rendimientos iniciales:', error.message);
    }
}

async function createAsignaturasDocentes() {
    try {
        await crearAsignaturasDocentes();    } catch (error) {
        console.error('Error al crear asignaturas docentes:', error.message);
    }
}

async function createEvaluaciones() {
    try {
        await crearEvaluacionesDocentes();
        console.log('✅ Evaluaciones docentes creadas exitosamente');
    } catch (error) {
        console.error('❌ Error al crear evaluaciones docentes:', error.message);
    }
}

async function createRecomendacion() {
    try {
        await crearRecomendacionInscripcionService("19876543-5");
        console.log('✅ Recomendaciones de inscripción creadas exitosamente');
    } catch (error) {
        console.error('❌ Error al crear recomendaciones de inscripción:', error.message);
    }
}

async function initialSetup() {
    await generarProfesoresSimple();
    await createInitialUsers();
    await createAsignaturas();
    await createProfesores();
    await createRendimientos();
    await createAsignaturasDocentes();
    await createEvaluaciones();
    // await createRecomendacion();
}

export { initialSetup };