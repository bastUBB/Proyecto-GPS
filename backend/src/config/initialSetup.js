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

async function createAsignaturas() {
    try {
        await Asignatura.create([ // Se deberia sacar de internet pero nose de donde sacar los prerequisitos
            // Primer Año
            {
                name: 'Álgebra y Trigonometría',
                codigo: '220143',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Cálculo Diferencial',
                codigo: '220144',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Introducción a la Ingeniería',
                codigo: '620432',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Química General',
                codigo: '210020',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Comunicación Oral y Escrita',
                codigo: '340266',
                creditos: 4,
                prerequisitos: []
            },
            {
                name: 'Introducción a la Programación',
                codigo: '620431',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Formación Integral Oferta Institucional I',
                codigo: '340556',
                creditos: 3,
                prerequisitos: []
            },
            {
                name: 'Formación Integral Oferta Institucional II',
                codigo: '340557',
                creditos: 3,
                prerequisitos: []
            },
            {
                name: 'Administración General',
                codigo: '610227',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Álgebra Lineal',
                codigo: '220145',
                creditos: 5,
                prerequisitos: [
                    'Álgebra y Trigonometría'
                ]
            },
            {
                name: 'Física Newtoniana',
                codigo: '230033',
                creditos: 5,
                prerequisitos: [
                    'Álgebra y Trigonometría'
                ]
            },
            {
                name: 'Estructuras Discretas para Ciencias de la Computación',
                codigo: '620434',
                creditos: 5,
                prerequisitos: [
                    'Álgebra y Trigonometría'
                ]
            },
            {
                name: 'Programación Orientada a Objeto',
                codigo: '620433',
                creditos: 5,
                prerequisitos: [
                    'Introducción a la Programación'
                ]
            },
            {
                name: 'Inglés I',
                codigo: '340276',
                creditos: 4,
                prerequisitos: []
            },

            // Segundo Año
            {
                name: 'Cálculo Integral',
                codigo: '220146',
                creditos: 5,
                prerequisitos: [
                    'Cálculo Diferencial'
                ]
            },
            {
                name: 'Ecuaciones Diferenciales',
                codigo: '220147',
                creditos: 5,
                prerequisitos: [
                    'Cálculo Integral'
                ]
            },
            {
                name: 'Electro-magnetismo',
                codigo: '230034',
                creditos: 5,
                prerequisitos: [
                    'Física Newtoniana'
                ]
            },
            {
                name: 'Fundamentos de Ciencias de la Computación',
                codigo: '620437',
                creditos: 5,
                prerequisitos: [
                    'Estructuras Discretas para Ciencias de la Computación'
                ]
            },
            {
                name: 'Modelamiento de Procesos e Información',
                codigo: '620436',
                creditos: 5,
                prerequisitos: [
                    'Programación Orientada a Objeto'
                ]
            },
            {
                name: 'Inglés II',
                codigo: '340277',
                creditos: 4,
                prerequisitos: [
                    'Inglés I'
                ]
            },
            {
                name: 'Formación Integral Oferta Institucional III',
                codigo: '340556',
                creditos: 3,
                prerequisitos: []
            },
            {
                name: 'Gestión Contable',
                codigo: '610228',
                creditos: 5,
                prerequisitos: [
                    'Administración General'
                ]
            },
            {
                name: 'Cálculo en Varias Variables',
                codigo: '220148',
                creditos: 5,
                prerequisitos: [
                    'Cálculo Integral'
                ]
            },
            {
                name: 'Sistemas Digitales',
                codigo: '410268',
                creditos: 5,
                prerequisitos: [
                    'Fundamentos de Ciencias de la Computación'
                ]
            },
            {
                name: 'Análisis y Diseño de Algoritmos',
                codigo: '620448',
                creditos: 5,
                prerequisitos: [
                    'Modelamiento de Procesos e Información'
                ]
            },
            {
                name: 'Teoría de Sistemas',
                codigo: '620438',
                creditos: 5,
                prerequisitos: [
                    'Sistemas Digitales'
                ]
            },
            {
                name: 'Inglés III',
                codigo: '340278',
                creditos: 4,
                prerequisitos: [
                    'Inglés II'
                ]
            },

            // Tercer Año
            {
                name: 'Ondas, Óptica y Física Moderna',
                codigo: '230035',
                creditos: 5,
                prerequisitos: [
                    'Electro-magnetismo'
                ]
            },
            {
                name: 'Estadística y Probabilidades',
                codigo: '220149',
                creditos: 5,
                prerequisitos: [
                    'Cálculo en Varias Variables'
                ]
            },
            {
                name: 'Economía',
                codigo: '610409',
                creditos: 5,
                prerequisitos: [
                    'Estadística y Probabilidades'
                ]
            },
            {
                name: 'Base de Datos',
                codigo: '620439',
                creditos: 5,
                prerequisitos: [
                    'Teoría de Sistemas'
                ]
            },
            {
                name: 'Práctica Profesional I',
                codigo: '620449',
                creditos: 5,
                prerequisitos: [
                    'Base de Datos'
                ]
            },
            {
                name: 'Inglés IV',
                codigo: '340279',
                creditos: 4,
                prerequisitos: [
                    'Inglés III'
                ]
            },
            {
                name: 'Arquitectura de Computadores',
                codigo: '620450',
                creditos: 5,
                prerequisitos: [
                    'Sistemas Digitales'
                ]
            },
            {
                name: 'Administración y Programación de Base de Datos',
                codigo: '620451',
                creditos: 5,
                prerequisitos: [
                    'Base de Datos'
                ]
            },
            {
                name: 'Sistemas de Información',
                codigo: '620452',
                creditos: 5,
                prerequisitos: [
                    'Administración y Programación de Base de Datos'
                ]
            },
            {
                name: 'Gestión Estratégica',
                codigo: '612239',
                creditos: 5,
                prerequisitos: [
                    'Economía'
                ]
            },
            {
                name: 'Gestión Presupuestaria y Financiera',
                codigo: '610229',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                name: 'Práctica Profesional II',
                codigo: '620456',
                creditos: 5,
                prerequisitos: [
                    'Sistemas de Información'
                ]
            },

            // Cuarto Año
            {
                name: 'Investigación de Operaciones',
                codigo: '430183',
                creditos: 5,
                prerequisitos: [
                    'Estadística y Probabilidades'
                ]
            },
            {
                name: 'Legislación *',
                codigo: '613017',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                name: 'Anteproyecto de Título *',
                codigo: '620472',
                creditos: 5,
                prerequisitos: [
                    'Practica Profesional II'
                ]
            },
            {
                name: 'Sistemas Operativos',
                codigo: '620453',
                creditos: 5,
                prerequisitos: [
                    'Arquitectura de Computadores'
                ]
            },
            {
                name: 'Inteligencia Artificial',
                codigo: '620454',
                creditos: 5,
                prerequisitos: [
                    'Análisis y Diseño de Algoritmos'
                ]
            },
            {
                name: 'Ingeniería de Software',
                codigo: '620455',
                creditos: 5,
                prerequisitos: [
                    'Sistemas de Información'
                ]
            },
            {
                name: 'Gestión de Proyectos de Software',
                codigo: '620458',
                creditos: 5,
                prerequisitos: [
                    'Ingeniería de Software'
                ]
            },
            {
                name: 'Formulación y Evaluación de Proyectos',
                codigo: '611050',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                name: 'Gestión de Recursos Humanos',
                codigo: '610231',
                creditos: 5,
                prerequisitos: [
                    'Gestión Estratégica'
                ]
            },
            {
                name: 'Electivo Profesional I *',
                codigo: '620459',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Electivo Profesional II *',
                codigo: '620470',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Electivo Profesional III *',
                codigo: '620471',
                creditos: 5,
                prerequisitos: []
            },

            // Quinto Año
            {
                name: 'Proyecto de Título',
                codigo: '620477',
                creditos: 5,
                prerequisitos: [
                    'Anteproyecto de Título *'
                ]
            },
            {
                name: 'Seguridad Informática *',
                codigo: '620473',
                creditos: 5,
                prerequisitos: [
                    'Sistemas Operativos'
                ]
            },
            {
                name: 'Electivo Profesional IV *',
                codigo: '620474',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Electivo Profesional V *',
                codigo: '620475',
                creditos: 5,
                prerequisitos: []
            },
            {
                name: 'Electivo Profesional VI *',
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