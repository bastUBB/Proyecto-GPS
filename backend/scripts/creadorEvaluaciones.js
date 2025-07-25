import EvaluacionDocente from '../src/models/evaluacionDocente.model.js';
import User from '../src/models/user.model.js';
import Asignatura from '../src/models/asignaturas.model.js';

// Datos de alumnos del initialSetup
const ALUMNOS_INICIALES = [
    {
        nombreCompleto: 'María Fernanda González',
        email: 'maria.gonzalez@alumnos.ubiobio.cl',
        rut: '19876543-5'
    },
    {
        nombreCompleto: 'Ana Isabel Morales',
        email: 'ana.morales@ubiobio.cl',
        rut: '14567890-1'
    },
    {
        nombreCompleto: 'Nicolás Gómez Morgado',
        email: 'nicolas.gomez2101@ubiobio.cl',
        rut: '21279536-4'
    },
    {
        nombreCompleto: 'Bastian Rodriguez Campusano',
        email: 'bastian.rodriguez2101@ubiobio.cl',
        rut: '21548761-2'
    }
];

// Tipos de visibilidad
const VISIBILIDADES = ['Pública', 'Privada', 'Anónima'];

// Comentarios aleatorios para evaluaciones
const COMENTARIOS_POSITIVOS = [
    'Excelente profesor, muy didáctico y claro en sus explicaciones.',
    'Las clases son muy interesantes y el profesor domina muy bien la materia.',
    'Siempre está dispuesto a resolver dudas y ayudar a los estudiantes.',
    'Metodología de enseñanza muy efectiva, se nota la preparación.',
    'Profesor muy comprometido con el aprendizaje de los estudiantes.',
    'Explica de manera clara y con buenos ejemplos prácticos.',
    'Muy buen manejo del grupo y ambiente de clase favorable.',
    'Conocimiento profundo de la materia y buena pedagogía.',
    'Fomenta la participación y el pensamiento crítico.',
    'Puntual, organizado y siempre bien preparado para las clases.'
];

const COMENTARIOS_NEUTROS = [
    'Profesor con conocimientos adecuados, podría mejorar la metodología.',
    'Las clases son correctas, aunque a veces un poco monótonas.',
    'Maneja bien el contenido pero podría ser más dinámico.',
    'Cumple con el programa, aunque podría innovar más en sus métodos.',
    'Profesor responsable, pero podría involucrar más a los estudiantes.',
    'Conoce la materia pero podría explicar de forma más clara.',
    'Las evaluaciones son justas pero podría dar más retroalimentación.',
    'Buen profesor en general, con espacio para mejorar.',
    'Cumple con las expectativas básicas de la asignatura.',
    'Profesor competente, aunque podría ser más accesible.'
];

const COMENTARIOS_NEGATIVOS = [
    'Podría mejorar la claridad en las explicaciones.',
    'A veces es difícil seguir el ritmo de la clase.',
    'Sería bueno que fuera más flexible con los estudiantes.',
    'Podría utilizar métodos de enseñanza más modernos.',
    'Le falta un poco más de paciencia para resolver dudas.',
    'Podría ser más organizado en la presentación del contenido.',
    'Sería útil que diera más ejemplos prácticos.',
    'Podría mejorar la comunicación con los estudiantes.',
    'Le vendría bien actualizar su metodología de enseñanza.',
    'Podría ser más comprensivo con las dificultades de los estudiantes.'
];

// Función para generar calificación y comentario coherentes
function generarEvaluacion() {
    const calificacion = Math.floor(Math.random() * 5) + 1; // 1-5
    let comentarios;
    
    if (calificacion >= 4) {
        comentarios = COMENTARIOS_POSITIVOS;
    } else if (calificacion >= 3) {
        comentarios = COMENTARIOS_NEUTROS;
    } else {
        comentarios = COMENTARIOS_NEGATIVOS;
    }
    
    const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
    const visibilidad = VISIBILIDADES[Math.floor(Math.random() * VISIBILIDADES.length)];
    
    return {
        calificacion,
        texto: comentario,
        visibilidad
    };
}

// Función para generar fecha aleatoria en los últimos 6 meses
function generarFechaAleatoria() {
    const ahora = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(ahora.getMonth() - 6);
    
    const fechaAleatoria = new Date(hace6Meses.getTime() + Math.random() * (ahora.getTime() - hace6Meses.getTime()));
    return fechaAleatoria;
}

// Función principal para crear evaluaciones
async function crearEvaluacionesDocentes() {
    try {
        console.log('🚀 Iniciando creación de evaluaciones docentes...');

        // Verificar si ya existen evaluaciones
        const evaluacionesExistentes = await EvaluacionDocente.find({});
        if (evaluacionesExistentes.length > 0) {
            console.log('⚠️  Ya existen evaluaciones en la base de datos. Saltando creación.');
            return;
        }

        // Obtener todos los profesores de la base de datos
        const profesores = await User.find({ role: 'profesor' });
        console.log(`📋 Encontrados ${profesores.length} profesores en la base de datos`);

        // Obtener todas las asignaturas
        const asignaturas = await Asignatura.find({});
        console.log(`📚 Encontradas ${asignaturas.length} asignaturas en la base de datos`);

        if (profesores.length === 0) {
            console.log('⚠️  No hay profesores en la base de datos.');
            return;
        }

        if (asignaturas.length === 0) {
            console.log('⚠️  No hay asignaturas en la base de datos.');
            return;
        }

        const evaluaciones = [];

        // Para cada alumno
        for (const alumno of ALUMNOS_INICIALES) {
            console.log(`👤 Generando evaluaciones para: ${alumno.nombreCompleto}`);
            
            // Para cada profesor
            for (const profesor of profesores) {
                // Seleccionar una asignatura aleatoria para esta evaluación
                const asignaturaAleatoria = asignaturas[Math.floor(Math.random() * asignaturas.length)];
                
                // Generar evaluación aleatoria
                const { calificacion, texto, visibilidad } = generarEvaluacion();
                const fechaAleatoria = generarFechaAleatoria();
                
                const evaluacion = {
                    docente: profesor.nombreCompleto,
                    alumno: alumno.nombreCompleto,
                    asignatura: asignaturaAleatoria.nombre,
                    visibilidad: visibilidad,
                    fecha: fechaAleatoria,
                    texto: texto,
                    calificacion: calificacion,
                    estado: 'aprobada'
                };
                
                evaluaciones.push(evaluacion);
            }
        }

        console.log(`📝 Creando ${evaluaciones.length} evaluaciones...`);

        // Crear todas las evaluaciones usando Promise.all
        const evaluacionesPromises = evaluaciones.map(evaluacion => {
            return EvaluacionDocente.create(evaluacion);
        });

        await Promise.all(evaluacionesPromises);

        console.log(`✅ ¡Proceso completado exitosamente!`);
        console.log(`📊 Total de evaluaciones creadas: ${evaluaciones.length}`);
        console.log(`👥 Alumnos que evaluaron: ${ALUMNOS_INICIALES.length}`);
        console.log(`👨‍🏫 Profesores evaluados: ${profesores.length}`);

        // Mostrar estadísticas por calificación
        const stats = evaluaciones.reduce((acc, ev) => {
            acc[ev.calificacion] = (acc[ev.calificacion] || 0) + 1;
            return acc;
        }, {});

        console.log('\n📈 Distribución de calificaciones:');
        for (let i = 1; i <= 5; i++) {
            console.log(`⭐ ${i} estrella${i > 1 ? 's' : ''}: ${stats[i] || 0} evaluaciones`);
        }

        // Mostrar distribución por visibilidad
        const visibilidadStats = evaluaciones.reduce((acc, ev) => {
            acc[ev.visibilidad] = (acc[ev.visibilidad] || 0) + 1;
            return acc;
        }, {});

        console.log('\n👁️ Distribución por visibilidad:');
        Object.entries(visibilidadStats).forEach(([tipo, cantidad]) => {
            console.log(`${tipo}: ${cantidad} evaluaciones`);
        });

    } catch (error) {
        console.error('❌ Error al crear evaluaciones:', error.message);
        throw error;
    }
}

// Ejecutar script directamente solo si se ejecuta como script principal
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('� Iniciando script de creación de evaluaciones...');

    // Conectar a la base de datos solo si se ejecuta directamente
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('📡 Conectado a la base de datos');
            return crearEvaluacionesDocentes();
        })
        .then(() => {
            console.log('\n🎉 Script ejecutado exitosamente');
            return mongoose.disconnect();
        })
        .then(() => {
            console.log('📡 Desconectado de la base de datos');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error fatal:', error.message);
            console.error('Stack:', error.stack);
            mongoose.disconnect().finally(() => process.exit(1));
        });
}

export {
    crearEvaluacionesDocentes,
    generarEvaluacion,
    generarFechaAleatoria
};
