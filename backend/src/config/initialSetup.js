"use strict";
import { hashPassword } from '../helpers/bcrypt.helper.js';
import User from '../models/user.model.js';
import Asignatura from '../models/asignaturas.model.js';

async function createInitialUsers() {
    try {
        // Verificar si ya existe el usuario admin
        const adminExists = await User.findOne({ email: 'admin@ubiobio.cl' });
        if (adminExists) {
            console.log('Usuario inicial ya existe');
            return;
        }

        // Encriptar contraseña
        const hashedPassword = await hashPassword('admin1234');

        // Crear usuario admin
        await User.create({
            name: 'Administrador',
            email: 'admin@ubiobio.cl',
            rut: '12345678-9',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Usuario inicial creado: admin@ubiobio.cl');
    } catch (error) {
        console.error('Error al crear usuario inicial:', error.message);
    }
};

async function createAsignaturas() {
    try {
        const asignaturasData = [
            // Primer Año
            {
                nombre: "Álgebra y Trigonometría",
                codigo: "220143",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Cálculo Diferencial",
                codigo: "220144",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Introducción a la Ingeniería",
                codigo: "620432",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Química General",
                codigo: "210020",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Comunicación Oral y Escrita",
                codigo: "340266",
                creditos: 4,
                prerrequisitos: []
            },
            {
                nombre: "Introducción a la Programación",
                codigo: "620431",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Formación Integral Oferta Institucional I",
                codigo: "340556",
                creditos: 3,
                prerrequisitos: []
            },
            {
                nombre: "Formación Integral Oferta Institucional II",
                codigo: "340557",
                creditos: 3,
                prerrequisitos: []
            },
            {
                nombre: "Administración General",
                codigo: "610227",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Álgebra Lineal",
                codigo: "220145",
                creditos: 5,
                prerrequisitos: ["Álgebra y Trigonometría"]
            },
            {
                nombre: "Física Newtoniana",
                codigo: "230033",
                creditos: 5,
                prerrequisitos: ["Álgebra y Trigonometría"]
            },
            {
                nombre: "Estructuras Discretas para Ciencias de la Computación",
                codigo: "620434",
                creditos: 5,
                prerrequisitos: ["Álgebra y Trigonometría"]
            },
            {
                nombre: "Programación Orientada a Objeto",
                codigo: "620433",
                creditos: 5,
                prerrequisitos: ["Introducción a la Programación"]
            },
            {
                nombre: "Inglés I",
                codigo: "340276",
                creditos: 4,
                prerrequisitos: []
            },
            // Segundo Año
            {
                nombre: "Cálculo Integral",
                codigo: "220146",
                creditos: 5,
                prerrequisitos: ["Cálculo Diferencial"]
            },
            {
                nombre: "Ecuaciones Diferenciales",
                codigo: "220147",
                creditos: 5,
                prerrequisitos: ["Cálculo Integral"]
            },
            {
                nombre: "Electro-magnetismo",
                codigo: "230034",
                creditos: 5,
                prerrequisitos: ["Física Newtoniana"]
            },
            {
                nombre: "Fundamentos de Ciencias de la Computación",
                codigo: "620437",
                creditos: 5,
                prerrequisitos: ["Estructuras Discretas para Ciencias de la Computación"]
            },
            {
                nombre: "Modelamiento de Procesos e Información",
                codigo: "620436",
                creditos: 5,
                prerrequisitos: ["Programación Orientada a Objeto"]
            },
            {
                nombre: "Inglés II",
                codigo: "340277",
                creditos: 4,
                prerrequisitos: ["Inglés I"]
            },
            {
                nombre: "Formación Integral Oferta Institucional III",
                codigo: "340558",
                creditos: 3,
                prerrequisitos: []
            },
            {
                nombre: "Gestión Contable",
                codigo: "610228",
                creditos: 5,
                prerrequisitos: ["Administración General"]
            },
            {
                nombre: "Cálculo en Varias Variables",
                codigo: "220148",
                creditos: 5,
                prerrequisitos: ["Cálculo Integral"]
            },
            {
                nombre: "Sistemas Digitales",
                codigo: "410268",
                creditos: 5,
                prerrequisitos: ["Fundamentos de Ciencias de la Computación"]
            },
            {
                nombre: "Análisis y Diseño de Algoritmos",
                codigo: "620448",
                creditos: 5,
                prerrequisitos: ["Modelamiento de Procesos e Información"]
            },
            {
                nombre: "Teoría de Sistemas",
                codigo: "620438",
                creditos: 5,
                prerrequisitos: ["Sistemas Digitales"]
            },
            {
                nombre: "Inglés III",
                codigo: "340278",
                creditos: 4,
                prerrequisitos: ["Inglés II"]
            },
            // Tercer Año
            {
                nombre: "Ondas, Óptica y Física Moderna",
                codigo: "230035",
                creditos: 5,
                prerrequisitos: ["Electro-magnetismo"]
            },
            {
                nombre: "Estadística y Probabilidades",
                codigo: "220149",
                creditos: 5,
                prerrequisitos: ["Cálculo en Varias Variables"]
            },
            {
                nombre: "Economía",
                codigo: "610409",
                creditos: 5,
                prerrequisitos: ["Estadística y Probabilidades"]
            },
            {
                nombre: "Base de Datos",
                codigo: "620439",
                creditos: 5,
                prerrequisitos: ["Teoría de Sistemas"]
            },
            {
                nombre: "Práctica Profesional I",
                codigo: "620449",
                creditos: 5,
                prerrequisitos: ["Base de Datos"]
            },
            {
                nombre: "Inglés IV",
                codigo: "340279",
                creditos: 4,
                prerrequisitos: ["Inglés III"]
            },
            {
                nombre: "Arquitectura de Computadores",
                codigo: "620450",
                creditos: 5,
                prerrequisitos: ["Sistemas Digitales"]
            },
            {
                nombre: "Administración y Programación de Base de Datos",
                codigo: "620451",
                creditos: 5,
                prerrequisitos: ["Base de Datos"]
            },
            {
                nombre: "Sistemas de Información",
                codigo: "620452",
                creditos: 5,
                prerrequisitos: ["Administración y Programación de Base de Datos"]
            },
            {
                nombre: "Gestión Estratégica",
                codigo: "612239",
                creditos: 5,
                prerrequisitos: ["Economía"]
            },
            {
                nombre: "Gestión Presupuestaria y Financiera",
                codigo: "610229",
                creditos: 5,
                prerrequisitos: ["Gestión Estratégica"]
            },
            {
                nombre: "Práctica Profesional II",
                codigo: "620456",
                creditos: 5,
                prerrequisitos: ["Sistemas de Información"]
            },
            // Cuarto Año
            {
                nombre: "Investigación de Operaciones",
                codigo: "430183",
                creditos: 5,
                prerrequisitos: ["Estadística y Probabilidades"]
            },
            {
                nombre: "Legislación *",
                codigo: "613017",
                creditos: 5,
                prerrequisitos: ["Gestión Estratégica"]
            },
            {
                nombre: "Anteproyecto de Título *",
                codigo: "620472",
                creditos: 5,
                prerrequisitos: ["Practica Profesional II"]
            },
            {
                nombre: "Sistemas Operativos",
                codigo: "620453",
                creditos: 5,
                prerrequisitos: ["Arquitectura de Computadores"]
            },
            {
                nombre: "Inteligencia Artificial",
                codigo: "620454",
                creditos: 5,
                prerrequisitos: ["Análisis y Diseño de Algoritmos"]
            },
            {
                nombre: "Ingeniería de Software",
                codigo: "620455",
                creditos: 5,
                prerrequisitos: ["Sistemas de Información"]
            },
            {
                nombre: "Gestión de Proyectos de Software",
                codigo: "620458",
                creditos: 5,
                prerrequisitos: ["Ingeniería de Software"]
            },
            {
                nombre: "Formulación y Evaluación de Proyectos",
                codigo: "611050",
                creditos: 5,
                prerrequisitos: ["Gestión Estratégica"]
            },
            {
                nombre: "Gestión de Recursos Humanos",
                codigo: "610231",
                creditos: 5,
                prerrequisitos: ["Gestión Estratégica"]
            },
            {
                nombre: "Electivo Profesional I ",
                codigo: "620459",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Electivo Profesional II ",
                codigo: "620470",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Electivo Profesional III ",
                codigo: "620471",
                creditos: 5,
                prerrequisitos: []
            },
            // Quinto Año
            {
                nombre: "Proyecto de Título",
                codigo: "620477",
                creditos: 5,
                prerrequisitos: ["Anteproyecto de Título "]
            },
            {
                nombre: "Seguridad Informática ",
                codigo: "620473",
                creditos: 5,
                prerrequisitos: ["Sistemas Operativos"]
            },
            {
                nombre: "Electivo Profesional IV ",
                codigo: "620474",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Electivo Profesional V ",
                codigo: "620475",
                creditos: 5,
                prerrequisitos: []
            },
            {
                nombre: "Electivo Profesional VI ",
                codigo: "620476",
                creditos: 5,
                prerrequisitos: []
            }
        ]

        // Verificar si ya existen las asignaturas
        const asignaturasExistentes = await Asignatura.find({});
        if (asignaturasExistentes.length > 0) {
            console.log('Asignaturas iniciales ya existen');
            return;
        }

        // mapear cada asignatura de asignaturasData y crearla en la base de datos
        const asignaturasPromises = asignaturasData.map(asignatura => {
            return Asignatura.create({
                nombre: asignatura.nombre,
                codigo: asignatura.codigo,
                creditos: asignatura.creditos,
                prerrequisitos: asignatura.prerrequisitos
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