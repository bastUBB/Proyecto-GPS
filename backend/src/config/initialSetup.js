"use strict";
import { hashPassword } from '../helpers/bcrypt.helper.js';
import User from '../models/user.model.js';
import Asignatura from '../models/asignaturas.model.js';
import Bloque from '../models/bloques.models.js';

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
            nombre: 'Administrador',
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

async function createAsignaturas() {
    try {
        await Asignatura.create([ // Se deberia sacar de internet pero nose de donde sacar los prerequisitos
            // Primer Año
            {
                nombre: 'Álgebra y Trigonometría',
                codigo: '220143',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Cálculo Diferencial',
                codigo: '220144',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Introducción a la Ingeniería',
                codigo: '620432',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Química General',
                codigo: '210020',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Comunicación Oral y Escrita',
                codigo: '340266',
                creditos: 4,
                prerequisitos: []
            },
            {
                nombre: 'Introducción a la Programación',
                codigo: '620431',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Formación Integral Oferta Institucional I',
                codigo: '340556',
                creditos: 3,
                prerequisitos: []
            },
            {
                nombre: 'Formación Integral Oferta Institucional II',
                codigo: '340557',
                creditos: 3,
                prerequisitos: []
            },
            {
                nombre: 'Administración General',
                codigo: '610227',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Álgebra Lineal',
                codigo: '220145',
                creditos: 5,
                prerequisitos: [
                    'Álgebra y Trigonometría'
                ]
            },
            {
                nombre: 'Física Newtoniana',
                codigo: '230033',
                creditos: 5,
                prerequisitos: [
                    'Álgebra y Trigonometría'
                ]
            },
            {
                nombre: 'Estructuras Discretas para Ciencias de la Computación',
                codigo: '620434',
                creditos: 5,
                prerequisitos: [
                    'Álgebra y Trigonometría'
                ]
            },
            {
                nombre: 'Programación Orientada a Objeto',
                codigo: '620433',
                creditos: 5,
                prerequisitos: [
                    'Introducción a la Programación'
                ]
            },
            {
                nombre: 'Inglés I',
                codigo: '340276',
                creditos: 4,
                prerequisitos: []
            },

            // Segundo Año
            {
                nombre: 'Cálculo Integral',
                codigo: '220146',
                creditos: 5,
                prerequisitos: [
                    'Cálculo Diferencial'
                ]
            },
            {
                nombre: 'Ecuaciones Diferenciales',
                codigo: '220147',
                creditos: 5,
                prerequisitos: [
                    'Cálculo Integral'
                ]
            },
            {
                nombre: 'Electro-magnetismo',
                codigo: '230034',
                creditos: 5,
                prerequisitos: [
                    'Física Newtoniana'
                ]
            },
            {
                nombre: 'Fundamentos de Ciencias de la Computación',
                codigo: '620437',
                creditos: 5,
                prerequisitos: [
                    'Estructuras Discretas para Ciencias de la Computación'
                ]
            },
            {
                nombre: 'Modelamiento de Procesos e Información',
                codigo: '620436',
                creditos: 5,
                prerequisitos: [
                    'Programación Orientada a Objeto'
                ]
            },
            {
                nombre: 'Inglés II',
                codigo: '340277',
                creditos: 4,
                prerequisitos: [
                    'Inglés I'
                ]
            },
            {
                nombre: 'Formación Integral Oferta Institucional III',
                codigo: '340556',
                creditos: 3,
                prerequisitos: []
            },
            {
                nombre: 'Gestión Contable',
                codigo: '610228',
                creditos: 5,
                prerequisitos: [
                    'Administración General'
                ]
            },
            {
                nombre: 'Cálculo en Varias Variables',
                codigo: '220148',
                creditos: 5,
                prerequisitos: [
                    'Cálculo Integral'
                ]
            },
            {
                nombre: 'Sistemas Digitales',
                codigo: '410268',
                creditos: 5,
                prerequisitos: [
                    'Fundamentos de Ciencias de la Computación'
                ]
            },
            {
                nombre: 'Análisis y Diseño de Algoritmos',
                codigo: '620448',
                creditos: 5,
                prerequisitos: [
                    'Modelamiento de Procesos e Información'
                ]
            },
            {
                nombre: 'Teoría de Sistemas',
                codigo: '620438',
                creditos: 5,
                prerequisitos: [
                    'Sistemas Digitales'
                ]
            },
            {
                nombre: 'Inglés III',
                codigo: '340278',
                creditos: 4,
                prerequisitos: [
                    'Inglés II'
                ]
            },

            // Tercer Año
            {
                nombre: 'Ondas, Óptica y Física Moderna',
                codigo: '230035',
                creditos: 5,
                prerequisitos: [
                    'Electro-magnetismo'
                ]
            },
            {
                nombre: 'Estadística y Probabilidades',
                codigo: '220149',
                creditos: 5,
                prerequisitos: [
                    'Cálculo en Varias Variables'
                ]
            },
            {
                nombre: 'Economía',
                codigo: '610409',
                creditos: 5,
                prerequisitos: [
                    'Estadística y Probabilidades'
                ]
            },
            {
                nombre: 'Base de Datos',
                codigo: '620439',
                creditos: 5,
                prerequisitos: [
                    'Teoría de Sistemas'
                ]
            },
            {
                nombre: 'Práctica Profesional I',
                codigo: '620449',
                creditos: 5,
                prerequisitos: [
                    'Base de Datos'
                ]
            },
            {
                nombre: 'Inglés IV',
                codigo: '340279',
                creditos: 4,
                prerequisitos: [
                    'Inglés III'
                ]
            },
            {
                nombre: 'Arquitectura de Computadores',
                codigo: '620450',
                creditos: 5,
                prerequisitos: [
                    'Sistemas Digitales'
                ]
            },
            {
                nombre: 'Administración y Programación de Base de Datos',
                codigo: '620451',
                creditos: 5,
                prerequisitos: [
                    'Base de Datos'
                ]
            },
            {
                nombre: 'Sistemas de Información',
                codigo: '620452',
                creditos: 5,
                prerequisitos: [
                    'Administración y Programación de Base de Datos'
                ]
            },
            {
                nombre: 'Gestión Estratégica',
                codigo: '612239',
                creditos: 5,
                prerequisitos: [
                    'Economía'
                ]
            },
            {
                nombre: 'Gestión Presupuestaria y Financiera',
                codigo: '610229',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                nombre: 'Práctica Profesional II',
                codigo: '620456',
                creditos: 5,
                prerequisitos: [
                    'Sistemas de Información'
                ]
            },

            // Cuarto Año
            {
                nombre: 'Investigación de Operaciones',
                codigo: '430183',
                creditos: 5,
                prerequisitos: [
                    'Estadística y Probabilidades'
                ]
            },
            {
                nombre: 'Legislación *',
                codigo: '613017',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                nombre: 'Anteproyecto de Título *',
                codigo: '620472',
                creditos: 5,
                prerequisitos: [
                    'Practica Profesional II'
                ]
            },
            {
                nombre: 'Sistemas Operativos',
                codigo: '620453',
                creditos: 5,
                prerequisitos: [
                    'Arquitectura de Computadores'
                ]
            },
            {
                nombre: 'Inteligencia Artificial',
                codigo: '620454',
                creditos: 5,
                prerequisitos: [
                    'Análisis y Diseño de Algoritmos'
                ]
            },
            {
                nombre: 'Ingeniería de Software',
                codigo: '620455',
                creditos: 5,
                prerequisitos: [
                    'Sistemas de Información'
                ]
            },
            {
                nombre: 'Gestión de Proyectos de Software',
                codigo: '620458',
                creditos: 5,
                prerequisitos: [
                    'Ingeniería de Software'
                ]
            },
            {
                nombre: 'Formulación y Evaluación de Proyectos',
                codigo: '611050',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                nombre: 'Gestión de Recursos Humanos',
                codigo: '610231',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                nombre: 'Electivo Profesional I *',
                codigo: '620459',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Electivo Profesional II *',
                codigo: '620470',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Electivo Profesional III *',
                codigo: '620471',
                creditos: 5,
                prerequisitos: []
            },

            // Quinto Año
            {
                nombre: 'Proyecto de Título',
                codigo: '620477',
                creditos: 5,
                prerequisitos: [
                    'Anteproyecto de Título *'
                ]
            },
            {
                nombre: 'Seguridad Informática *',
                codigo: '620473',
                creditos: 5,
                prerequisitos: [
                    'Sistemas Operativos'
                ]
            },
            {
                nombre: 'Electivo Profesional IV *',
                codigo: '620474',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Electivo Profesional V *',
                codigo: '620475',
                creditos: 5,
                prerequisitos: []
            },
            {
                nombre: 'Electivo Profesional VI *',
                codigo: '620476',
                creditos: 5,
                prerequisitos: []
            },
        ]);
    } catch (error) {
        console.error('Error al crear asignaturas iniciales:', error.message);
    }
}

async function initialSetup() {
    await createInitialUsers();
    await createAsignaturas();
}

export { initialSetup };