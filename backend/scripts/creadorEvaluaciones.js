import EvaluacionDocente from '../src/models/evaluacionDocente.model.js';
import User from '../src/models/user.model.js';
import Asignatura from '../src/models/asignaturas.model.js';
import RendimientoAsignatura from '../src/models/rendimientoAsignatura.model.js';

// Función para generar un número aleatorio entre min y max
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para generar nombres de estudiantes ficticios
function generarNombreEstudiante() {
    const nombres = [
        "Ana García", "Carlos Rodríguez", "María González", "Juan Pérez", "Luis Martín",
        "Carmen López", "José Fernández", "Isabel Sánchez", "Miguel Torres", "Laura Ruiz",
        "Antonio Moreno", "Pilar Jiménez", "Francisco Muñoz", "Rosa Álvarez", "Manuel Romero",
        "Elena Navarro", "Pedro Gutiérrez", "Lucía Herrera", "Ángel Vargas", "Cristina Ramos",
        "Raúl Castillo", "Mónica Ortega", "Sergio Delgado", "Patricia Castro", "Alberto Ortiz"
    ];
    
    return nombres[random(0, nombres.length - 1)];
}

// Función para generar una calificación realista (1-7)
function generarCalificacion() {
    // Generar calificaciones más realistas con distribución normal hacia el centro
    const base = Math.random();
    if (base < 0.1) return random(1, 3); // 10% notas bajas
    if (base < 0.8) return random(4, 6); // 70% notas medias  
    return 7; // 20% nota máxima
}

// Función para generar un comentario aleatorio
function generarComentario() {
    const comentarios = [
        "Excelente profesor, muy claro en sus explicaciones.",
        "Las clases son muy dinámicas y entretenidas.",
        "Domina muy bien la materia y transmite conocimiento.",
        "Profesor muy dedicado y siempre dispuesto a ayudar.",
        "Metodología clara y efectiva para el aprendizaje.",
        "Muy buena disposición para resolver dudas.",
        "Las evaluaciones son justas y acordes al contenido.",
        "Profesor comprometido con el proceso de enseñanza.",
        "Genera un buen ambiente de aprendizaje en clase.",
        "Muy puntual y responsable con los horarios.",
        "Utiliza buenos recursos didácticos.",
        "Fomenta la participación activa de los estudiantes.",
        "Tiene paciencia para explicar conceptos difíciles.",
        "Relaciona bien la teoría con la práctica.",
        "Mantiene el interés de los estudiantes durante la clase.",
        "Muy organizado en la presentación de contenidos.",
        "Profesor actualizado en su área de conocimiento.",
        "Brinda retroalimentación constructiva.",
        "Crea un ambiente de respeto y confianza.",
        "Motiva a los estudiantes a seguir aprendiendo."
    ];
    
    return comentarios[random(0, comentarios.length - 1)];
}// Función principal para crear evaluaciones docentes
export async function crearEvaluacionesDocentes() {
    try {
        console.log('🚀 Iniciando creación de evaluaciones docentes...');

        // Obtener todos los datos de rendimiento
        const rendimientos = await RendimientoAsignatura.find({});

        if (rendimientos.length === 0) {
            console.log('⚠️ No se encontraron datos de rendimiento. Ejecuta primero procesarDatosRendimiento.js');
            return;
        }

        console.log(`📊 Se encontraron ${rendimientos.length} registros de rendimiento`);

        // Debug: mostrar algunos registros de ejemplo
        if (rendimientos.length > 0) {
            console.log('🔍 Ejemplo de registro de rendimiento:');
            console.log(JSON.stringify(rendimientos[0], null, 2));
        }

        // Crear un mapa de profesores únicos con sus asignaturas por año
        const profesorAsignaturas = new Map();

        for (const rendimiento of rendimientos) {
            const nombreDocente = rendimiento.docente;
            const nombreAsignatura = rendimiento.asignatura;
            const año = rendimiento.año;
            const semestre = rendimiento.semestre;

            // Validar que tengamos datos válidos
            if (!nombreDocente || !nombreAsignatura || !año) {
                console.log(`⚠️ Registro con datos incompletos: docente="${nombreDocente}", asignatura="${nombreAsignatura}", año="${año}"`);
                continue;
            }

            const claveProfesor = nombreDocente;

            if (!profesorAsignaturas.has(claveProfesor)) {
                profesorAsignaturas.set(claveProfesor, {
                    nombre: nombreDocente,
                    asignaturasPorAño: new Map()
                });
            }

            const profesorData = profesorAsignaturas.get(claveProfesor);

            if (!profesorData.asignaturasPorAño.has(año)) {
                profesorData.asignaturasPorAño.set(año, new Set());
            }

            profesorData.asignaturasPorAño.get(año).add(nombreAsignatura);
        }

        console.log(`👨‍🏫 Se encontraron ${profesorAsignaturas.size} profesores únicos`);

        // Debug: mostrar profesores encontrados
        console.log('🔍 Profesores en datos de rendimiento:');
        for (const [nombre, data] of profesorAsignaturas) {
            const totalAsignaturas = Array.from(data.asignaturasPorAño.values())
                .reduce((total, asignaturas) => total + asignaturas.size, 0);
            const años = Array.from(data.asignaturasPorAño.keys()).sort();
            console.log(`   - ${nombre} (${totalAsignaturas} asignaturas en años: ${años.join(', ')})`);
        }

        // Verificar que existan usuarios profesores (para validación, pero no los usaremos directamente)
        const profesores = await User.find({ role: 'profesor' });
        console.log(`👥 Se encontraron ${profesores.length} usuarios con rol profesor en la BD`);

        // Obtener todas las asignaturas (para validación, pero no las usaremos directamente)
        const asignaturas = await Asignatura.find({});
        console.log(`📚 Se encontraron ${asignaturas.length} asignaturas en la BD`);

        const evaluacionesCreadas = [];
        let totalEvaluaciones = 0;

        // Para cada profesor en los datos de rendimiento
        for (const [nombreDocente, profesorData] of profesorAsignaturas) {
            // Validar que el nombre del docente no sea undefined o vacío
            if (!nombreDocente || nombreDocente.trim() === '') {
                console.log(`⚠️ Nombre de docente vacío o undefined, saltando...`);
                continue;
            }

            console.log(`✅ Procesando profesor: ${nombreDocente}`);

            // Para cada año que enseñó este profesor
            for (const [año, asignaturasDelAño] of profesorData.asignaturasPorAño) {
                console.log(`📅 Procesando año ${año} para ${nombreDocente}`);

                // Para cada asignatura que enseñó en ese año
                for (const nombreAsignatura of asignaturasDelAño) {
                    if (!nombreAsignatura || nombreAsignatura.trim() === '') {
                        console.log(`⚠️ Nombre de asignatura vacío, saltando...`);
                        continue;
                    }

                    console.log(`📚 Procesando: ${nombreDocente} -> ${nombreAsignatura} (${año})`);

                    // Verificar si ya existe una evaluación para este profesor-asignatura
                    const evaluacionExistente = await EvaluacionDocente.findOne({
                        docente: nombreDocente,
                        asignatura: nombreAsignatura
                    });

                    if (evaluacionExistente) {
                        console.log(`⚠️ Ya existe evaluación para ${nombreDocente} en ${nombreAsignatura}`);
                        continue;
                    }

                    // Generar entre 3 y 8 evaluaciones por profesor-asignatura
                    const numeroEvaluaciones = random(3, 8);

                    for (let i = 0; i < numeroEvaluaciones; i++) {
                        const comentario = generarComentario();
                        const calificacion = generarCalificacion();
                        const nombreAlumno = generarNombreEstudiante();

                        // Estados disponibles según el modelo: 'pendiente', 'aprobada', 'rechazada'
                        const estados = ['pendiente', 'aprobada', 'rechazada'];
                        const estado = estados[random(0, estados.length - 1)];
                        
                        // Visibilidades disponibles: 'Anónima' y 'Pública'  
                        const visibilidades = ['Anónima', 'Pública'];
                        const visibilidad = visibilidades[random(0, visibilidades.length - 1)];

                        // Usar el año de los datos de rendimiento para generar fechas más realistas
                        const añoEvaluacion = parseInt(año);

                        const nuevaEvaluacion = new EvaluacionDocente({
                            docente: nombreDocente,
                            alumno: nombreAlumno,
                            asignatura: nombreAsignatura,
                            visibilidad: visibilidad,
                            fecha: new Date(
                                añoEvaluacion,
                                random(0, 11),
                                random(1, 28)
                            ),
                            texto: comentario || "Sin comentarios adicionales",
                            calificacion: calificacion,
                            estado: estado
                        });

                        evaluacionesCreadas.push(nuevaEvaluacion);
                        totalEvaluaciones++;
                    }
                }
            }
        }

        // Guardar todas las evaluaciones en lotes
        if (evaluacionesCreadas.length > 0) {
            console.log(`💾 Guardando ${evaluacionesCreadas.length} evaluaciones...`);

            const batchSize = 100;
            for (let i = 0; i < evaluacionesCreadas.length; i += batchSize) {
                const batch = evaluacionesCreadas.slice(i, i + batchSize);
                await Promise.all(batch.map(evaluacion => evaluacion.save()));
                console.log(`✅ Guardado lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(evaluacionesCreadas.length / batchSize)}`);
            }
        }

        console.log(`\n✅ Proceso completado exitosamente!`);
        console.log(`📊 Estadísticas:`);
        console.log(`   - Profesores procesados: ${profesorAsignaturas.size}`);
        console.log(`   - Evaluaciones creadas: ${totalEvaluaciones}`);
        console.log(`   - Asignaturas evaluadas: ${new Set(evaluacionesCreadas.map(e => e.asignatura)).size}`);

    } catch (error) {
        console.error('❌ Error al crear evaluaciones docentes:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    crearEvaluacionesDocentes()
        .then(() => {
            console.log('✅ Script ejecutado correctamente');
        })
        .catch(error => {
            console.error('❌ Error en el script:', error);
        });
}
