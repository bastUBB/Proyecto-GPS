import Inscripcion from "../models/inscripcion.model.js";
import User from "../models/user.model.js";
import Asignatura from "../models/asignaturas.model.js";
import evluacionDocente from "../models/evaluacionDocente.model.js";
import mallaUser from "../models/mallaUser.model.js";
import asignaturasDocente from "../models/asignaturasDocente.model.js";
import rendimientoAsignatura from "../models/rendimientoAsignatura.model.js";
import fs from 'fs';
import path from 'path';

export async function crearRecomendacionInscripcionService(rutEstudiante) {
    try {
        // Cargar datos del horario extraído
        const horarioPath = path.resolve('output/horario_extraido.json');
        const horarioRaw = fs.readFileSync(horarioPath);
        const horario = JSON.parse(horarioRaw);

        // 1. Obtener asignaturas cursadas del estudiante
        const estudiante = await User.findOne({ rut: rutEstudiante, role: "alumno" });
        if (!estudiante) return [null, 'Estudiante no encontrado'];

        // console.log(`Estudiante encontrado: ${estudiante.nombreCompleto} (${estudiante.rut})`);

        const mallaEstudiante = await mallaUser.findOne({ rutUser: rutEstudiante });

        if (!mallaEstudiante) return [null, 'Malla del estudiante no encontrada'];

        // console.log(`Malla del estudiante encontrada: ${mallaEstudiante}`);

        const asignaturasInscribibles = mallaEstudiante.asignaturasInscribibles || [];

        // console.log(`Asignaturas inscribibles: ${asignaturasInscribibles}`);

        // 2. Encontrar profesores que imparten esas asignaturas
        const profesoresPorAsignatura = {};
        for (const asignatura of asignaturasInscribibles) {
            // console.log(`Buscando profesores para asignatura: ${asignatura}`);
            const registros = await asignaturasDocente.find({
                asignaturas: { $in: [asignatura] }
            });

            if (registros.length > 0) {
                // Usar Set para eliminar duplicados
                const profesoresUnicos = [...new Set(registros.map(r => r.docente))];
                profesoresPorAsignatura[asignatura] = profesoresUnicos;
            }
        }

        //mostrar asignaturas inscribibles que no están ofertadas en el horario
        // const asignaturasNoOfertadas = asignaturasInscribibles.filter(asignatura => !profesoresPorAsignatura[asignatura]);

        // console.log(`Asignaturas no ofertadas: ${JSON.stringify(asignaturasNoOfertadas, null, 2)}`);    

        // console.log(`Profesores encontrados: ${Object.keys(profesoresPorAsignatura).length} asignaturas`);

        // console.log(`Profesores por asignatura: ${JSON.stringify(profesoresPorAsignatura, null, 2)}`);

        // console.log("Profesores por asignatura:", profesoresPorAsignatura);

        // 3. Buscar datos de horario (bloques y cupos)
        const datosHorario = [];
        for (const [asignatura, profesores] of Object.entries(profesoresPorAsignatura)) {
            for (const profesor of profesores) {
                // Función para formatear nombre del docente para comparación
                function formatearNombreParaComparacion(nombre) {
                    const partes = nombre.split(' ');
                    if (partes.length >= 2) {
                        // Tomar los últimos 2 elementos como apellidos
                        return partes.slice(-2).join(' ').toUpperCase();
                    }
                    return nombre.toUpperCase();
                }

                const apellidosProfesor = formatearNombreParaComparacion(profesor);

                const registrosHorario = horario.filter(h =>
                    h.asignatura.toUpperCase() === asignatura.toUpperCase() &&
                    h.docente.toUpperCase().includes(apellidosProfesor)
                );

                for (const registro of registrosHorario) {
                    datosHorario.push({
                        asignatura: registro.asignatura,
                        profesor: profesor,
                        seccion: registro.seccion,
                        bloques: registro.bloques,
                        asignaturaCodigo: registro.asignaturaCodigo,
                        cupos: registro.cupos || 40
                    });
                }
            }
        }
        // console.log(`Datos de horario encontrados: ${datosHorario.length} registros`);
        // console.log("Datos de horario:", JSON.stringify(datosHorario, null, 2));

        // Normalizar nombres de asignaturas usando códigos
        for (let i = 0; i < datosHorario.length; i++) {
            const dato = datosHorario[i];
            if (dato.asignaturaCodigo) {
                // Buscar el nombre correcto de la asignatura usando el código
                const asignaturaDB = await Asignatura.findOne({ codigo: dato.asignaturaCodigo });
                if (asignaturaDB) {
                    datosHorario[i].asignatura = asignaturaDB.nombre;
                    // console.log(`Asignatura normalizada: ${dato.asignaturaCodigo} -> ${asignaturaDB.nombre}`);
                } else {
                    console.log(`No se encontró asignatura con código: ${dato.asignaturaCodigo}`);
                }
            }
        }

        // console.log(`Datos de horario normalizados: ${datosHorario.length} registros`);

        // console.log("Datos de horario:", JSON.stringify(datosHorario, null, 2));

        // 4. Obtener rendimientos generales de los profesores (promedio de todos los años y secciones)
        const rendimientos = [];
        const profesoresAnalizados = new Set();

        for (const dato of datosHorario) {
            const claveProfesorAsignatura = `${dato.profesor}|${dato.asignatura}`;

            // Evitar calcular el mismo profesor-asignatura múltiples veces
            if (!profesoresAnalizados.has(claveProfesorAsignatura)) {
                const rendimientosProfesor = await rendimientoAsignatura.find({
                    docente: dato.profesor,
                    asignatura: dato.asignatura
                    // Sin filtro de sección ni año - todos los registros históricos
                });

                if (rendimientosProfesor.length > 0) {
                    const promedioAprobacion = rendimientosProfesor.reduce((sum, r) =>
                        sum + parseFloat(r.porcentajeAprob), 0) / rendimientosProfesor.length;

                    const promedioInscritos = rendimientosProfesor.reduce((sum, r) =>
                        sum + parseInt(r.totalInscritos), 0) / rendimientosProfesor.length;

                    rendimientos.push({
                        asignatura: dato.asignatura,
                        profesor: dato.profesor,
                        promedioAprobacion: promedioAprobacion,
                        promedioInscritos: promedioInscritos,
                        totalRegistrosHistoricos: rendimientosProfesor.length,
                        añosImpartidos: [...new Set(rendimientosProfesor.map(r => r.año))].length
                    });

                    profesoresAnalizados.add(claveProfesorAsignatura);
                }
            }
        }
        // console.log(`Rendimientos encontrados: ${rendimientos.length} registros`);

        // console.log("Rendimientos:", JSON.stringify(rendimientos, null, 2));

        // 5. Obtener evaluaciones generales de los docentes (promedio de todas las evaluaciones por asignatura)
        const evaluaciones = [];
        const profesoresEvaluados = new Set();

        for (const dato of datosHorario) {
            const claveProfesorAsignatura = `${dato.profesor}|${dato.asignatura}`;

            // Evitar calcular el mismo profesor-asignatura múltiples veces
            if (!profesoresEvaluados.has(claveProfesorAsignatura)) {
                const evaluacionesProfesor = await evluacionDocente.find({
                    docente: dato.profesor,
                    asignatura: dato.asignatura,
                    estado: 'aprobada' // Solo evaluaciones aprobadas
                });

                if (evaluacionesProfesor.length > 0) {
                    const promedioEvaluacion = evaluacionesProfesor.reduce((sum, e) =>
                        sum + parseFloat(e.calificacion), 0) / evaluacionesProfesor.length;

                    evaluaciones.push({
                        asignatura: dato.asignatura,
                        profesor: dato.profesor,
                        promedioEvaluacion: promedioEvaluacion,
                        totalEvaluaciones: evaluacionesProfesor.length
                    });

                    profesoresEvaluados.add(claveProfesorAsignatura);
                }
            }
        }
        // console.log(`Evaluaciones encontradas: ${evaluaciones.length} registros`);
        // console.log("Evaluaciones:", JSON.stringify(evaluaciones, null, 2));

        // 6. Crear datos completos combinando toda la información
        const datosCompletos = datosHorario.map(dato => {
            const rendimiento = rendimientos.find(r =>
                r.asignatura === dato.asignatura &&
                r.profesor === dato.profesor
                // Sin filtro de sección - rendimiento general del profesor
            );

            const evaluacion = evaluaciones.find(e =>
                e.asignatura === dato.asignatura &&
                e.profesor === dato.profesor
                // Sin filtro de sección - evaluación general del profesor
            );

            // Calcular puntaje compuesto
            const promedioAprobacion = rendimiento?.promedioAprobacion || 0;
            const promedioInscritos = rendimiento?.promedioInscritos || 0;
            const promedioEvaluacion = evaluacion?.promedioEvaluacion || 0;

            const puntajeRendimiento = rendimiento ?
                (promedioAprobacion * 0.6 + (promedioInscritos / 50) * 0.2) : 0;

            const puntajeEvaluacion = evaluacion ?
                (promedioEvaluacion / 7) * 100 * 0.4 : 0;

            const puntaje = puntajeRendimiento + puntajeEvaluacion;

            return {
                ...dato,
                promedioAprobacion,
                promedioInscritos,
                promedioEvaluacion,
                puntaje,
                añosImpartidos: rendimiento?.añosImpartidos || 0,
                totalRegistrosHistoricos: rendimiento?.totalRegistrosHistoricos || 0
            };
        });

        // console.log("Datos completos:", JSON.stringify(datosCompletos, null, 2));

        // Filtrar datos válidos
        const datosValidos = datosCompletos.filter(d => d.puntaje > 0);

        // console.log("Datos válidos:", JSON.stringify(datosValidos, null, 2));

        // 7. Función para detectar solapamiento de horarios
        function detectarSolapamiento(bloques1, bloques2) {
            if (!bloques1 || !bloques2 || !Array.isArray(bloques1) || !Array.isArray(bloques2)) {
                return false;
            }

            for (const bloque1 of bloques1) {
                for (const bloque2 of bloques2) {
                    // Verificar si es el mismo día
                    if (bloque1.dia === bloque2.dia) {
                        // Convertir horas a minutos para comparación más fácil
                        const inicio1 = convertirHoraAMinutos(bloque1.horaInicio);
                        const fin1 = convertirHoraAMinutos(bloque1.horaFin);
                        const inicio2 = convertirHoraAMinutos(bloque2.horaInicio);
                        const fin2 = convertirHoraAMinutos(bloque2.horaFin);

                        // Verificar solapamiento: A se solapa con B si inicio1 < fin2 && inicio2 < fin1
                        if (inicio1 < fin2 && inicio2 < fin1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function convertirHoraAMinutos(hora) {
            if (!hora || typeof hora !== 'string') return 0;
            const [horas, minutos] = hora.split(':').map(Number);
            return horas * 60 + minutos;
        }

        // Función para seleccionar recomendaciones sin solapamiento
        function seleccionarSinSolapamiento(datosSorted, maxRecomendaciones = 10) {
            const seleccionadas = [];
            const procesados = new Set();

            for (const dato of datosSorted) {
                const claveAsignatura = dato.asignatura;

                // Verificar si ya procesamos esta asignatura
                if (procesados.has(claveAsignatura)) continue;

                // Verificar si hay solapamiento con asignaturas ya seleccionadas
                let haySolapamiento = false;
                for (const seleccionada of seleccionadas) {
                    if (detectarSolapamiento(dato.bloques, seleccionada.bloques)) {
                        haySolapamiento = true;
                        break;
                    }
                }

                // Si no hay solapamiento y no hemos alcanzado el máximo, agregar
                if (!haySolapamiento && seleccionadas.length < maxRecomendaciones) {
                    seleccionadas.push(dato);
                    procesados.add(claveAsignatura);
                }
            }

            return seleccionadas;
        }

        // 8. Crear 3 sets de recomendaciones

        // Set 1: Excelencia Académica (priorizar % aprobación)
        const datosExcelenciaOrdenados = datosValidos
            .sort((a, b) => b.promedioAprobacion - a.promedioAprobacion);

        const datosExcelencia = seleccionarSinSolapamiento(datosExcelenciaOrdenados, 10);

        const excelenciaAcademica = datosExcelencia.map(d => ({
            asignatura: d.asignatura,
            profesor: d.profesor,
            seccion: d.seccion,
            bloques: d.bloques,
            cupos: d.cupos,
            razon: `Alto rendimiento: ${d.promedioAprobacion.toFixed(1)}% aprobación`,
            puntaje: d.puntaje.toFixed(1),
            tipo: 'Excelencia Académica'
        }));

        // Calcular detalles generales para Excelencia Académica
        const detallesExcelencia = datosExcelencia.length > 0 ? {
            porcentajeAprobacionPromedio: (datosExcelencia.reduce((sum, d) => sum + d.promedioAprobacion, 0) / datosExcelencia.length).toFixed(1),
            promedioInscritosGeneral: (datosExcelencia.reduce((sum, d) => sum + d.promedioInscritos, 0) / datosExcelencia.length).toFixed(0),
            evaluacionDocentePromedio: (datosExcelencia.reduce((sum, d) => sum + d.promedioEvaluacion, 0) / datosExcelencia.length).toFixed(1),
            totalAsignaturas: datosExcelencia.length,
            añosImpartidosPromedio: (datosExcelencia.reduce((sum, d) => sum + d.añosImpartidos, 0) / datosExcelencia.length).toFixed(1),
            registrosHistoricosTotal: datosExcelencia.reduce((sum, d) => sum + d.totalRegistrosHistoricos, 0),
            sinSolapamientoHorario: true
        } : null;

        // console.log("Excelencia Académica:", JSON.stringify(excelenciaAcademica, null, 2));

        // Set 2: Equilibrado (balance entre rendimiento y evaluación)
        const datosEquilibradoOrdenados = datosValidos
            .sort((a, b) => b.puntaje - a.puntaje);

        const datosEquilibrado = seleccionarSinSolapamiento(datosEquilibradoOrdenados, 10);

        const equilibrado = datosEquilibrado.map(d => ({
            asignatura: d.asignatura,
            profesor: d.profesor,
            seccion: d.seccion,
            bloques: d.bloques,
            cupos: d.cupos,
            razon: `Balance óptimo: ${d.promedioAprobacion.toFixed(1)}% aprob. + ${d.promedioEvaluacion.toFixed(1)} eval.`,
            puntaje: d.puntaje.toFixed(1),
            tipo: 'Equilibrado'
        }));

        // Calcular detalles generales para Equilibrado
        const detallesEquilibrado = datosEquilibrado.length > 0 ? {
            porcentajeAprobacionPromedio: (datosEquilibrado.reduce((sum, d) => sum + d.promedioAprobacion, 0) / datosEquilibrado.length).toFixed(1),
            promedioInscritosGeneral: (datosEquilibrado.reduce((sum, d) => sum + d.promedioInscritos, 0) / datosEquilibrado.length).toFixed(0),
            evaluacionDocentePromedio: (datosEquilibrado.reduce((sum, d) => sum + d.promedioEvaluacion, 0) / datosEquilibrado.length).toFixed(1),
            totalAsignaturas: datosEquilibrado.length,
            añosImpartidosPromedio: (datosEquilibrado.reduce((sum, d) => sum + d.añosImpartidos, 0) / datosEquilibrado.length).toFixed(1),
            registrosHistoricosTotal: datosEquilibrado.reduce((sum, d) => sum + d.totalRegistrosHistoricos, 0),
            puntajePromedio: (datosEquilibrado.reduce((sum, d) => sum + d.puntaje, 0) / datosEquilibrado.length).toFixed(1),
            sinSolapamientoHorario: true
        } : null;

        // console.log("Equilibrado:", JSON.stringify(equilibrado, null, 2));

        // Set 3: Mejor Evaluado (priorizar evaluación docente)
        const datosEvaluacionOrdenados = datosValidos
            .filter(d => d.promedioEvaluacion > 0)
            .sort((a, b) => b.promedioEvaluacion - a.promedioEvaluacion);

        const datosEvaluacion = seleccionarSinSolapamiento(datosEvaluacionOrdenados, 10);

        const evaluacionDocente = datosEvaluacion.map(d => ({
            asignatura: d.asignatura,
            profesor: d.profesor,
            seccion: d.seccion,
            bloques: d.bloques,
            cupos: d.cupos,
            razon: `Excelente evaluación: ${d.promedioEvaluacion.toFixed(1)}/7.0`,
            puntaje: d.puntaje.toFixed(1),
            tipo: 'Mejor Evaluado'
        }));

        // Calcular detalles generales para Mejor Evaluado
        const detallesEvaluacion = datosEvaluacion.length > 0 ? {
            porcentajeAprobacionPromedio: (datosEvaluacion.reduce((sum, d) => sum + d.promedioAprobacion, 0) / datosEvaluacion.length).toFixed(1),
            promedioInscritosGeneral: (datosEvaluacion.reduce((sum, d) => sum + d.promedioInscritos, 0) / datosEvaluacion.length).toFixed(0),
            evaluacionDocentePromedio: (datosEvaluacion.reduce((sum, d) => sum + d.promedioEvaluacion, 0) / datosEvaluacion.length).toFixed(1),
            totalAsignaturas: datosEvaluacion.length,
            añosImpartidosPromedio: (datosEvaluacion.reduce((sum, d) => sum + d.añosImpartidos, 0) / datosEvaluacion.length).toFixed(1),
            registrosHistoricosTotal: datosEvaluacion.reduce((sum, d) => sum + d.totalRegistrosHistoricos, 0),
            sinSolapamientoHorario: true
        } : null;

        // console.log("Evaluación Docente:", JSON.stringify(evaluacionDocente, null, 2));

        const recomendaciones = {
            estudiante: estudiante.nombreCompleto,
            rut: rutEstudiante,
            totalasignaturasInscribibles: asignaturasInscribibles.length,
            totalOpcionesAnalizadas: datosCompletos.length,
            setsRecomendaciones: {
                excelenciaAcademica: {
                    recomendaciones: excelenciaAcademica,
                    detalles: detallesExcelencia
                },
                equilibrado: {
                    recomendaciones: equilibrado,
                    detalles: detallesEquilibrado
                },
                evaluacionDocente: {
                    recomendaciones: evaluacionDocente,
                    detalles: detallesEvaluacion
                }
            },
            resumen: {
                totalProfesoresAnalizados: [...new Set(datosCompletos.map(d => d.profesor))].length,
                totalAsignaturasDisponibles: [...new Set(datosCompletos.map(d => d.asignatura))].length,
                promedioAprobacionGeneral: datosValidos.length > 0 ?
                    (datosValidos.reduce((sum, d) => sum + d.promedioAprobacion, 0) / datosValidos.length).toFixed(1) : 0,
                promedioEvaluacionGeneral: datosValidos.filter(d => d.promedioEvaluacion > 0).length > 0 ?
                    (datosValidos.filter(d => d.promedioEvaluacion > 0).reduce((sum, d) => sum + d.promedioEvaluacion, 0) /
                        datosValidos.filter(d => d.promedioEvaluacion > 0).length).toFixed(1) : 0
            }
        };

        console.log("Recomendaciones generadas:", JSON.stringify(recomendaciones, null, 2));

        console.log('\n=== RESUMEN RECOMENDACIONES ===');
        console.log(`Estudiante: ${estudiante.nombreCompleto}`);
        console.log(`Asignaturas inscribibles: ${asignaturasInscribibles.length}`);
        console.log(`Opciones analizadas: ${datosCompletos.length}`);
        console.log(`Recomendaciones generadas (sin solapamiento): ${excelenciaAcademica.length + equilibrado.length + evaluacionDocente.length}`);
        console.log(`- Excelencia Académica: ${excelenciaAcademica.length} asignaturas`);
        console.log(`- Equilibrado: ${equilibrado.length} asignaturas`);
        console.log(`- Mejor Evaluado: ${evaluacionDocente.length} asignaturas`);

        return [recomendaciones, null];
    } catch (error) {
        console.error('Error al crear recomendación:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function crearInscripcionService(inscripcionData) {
    try {
        const { profesor, rutParaEnviar, asignatura } = inscripcionData;

        console.log("Datos de inscripción (Service):", inscripcionData);

        const profesorExist = await User.findOne({ nombreCompleto: profesor, role: 'profesor' });

        if (!profesorExist) return [null, 'Profesor no encontrado'];

        const alumnoExist = await User.findOne({ rut: rutParaEnviar, role: 'alumno' });

        if (!alumnoExist) return [null, 'Alumno no encontrado'];

        const asignaturaExist = await Asignatura.findOne({ nombre: asignatura });

        if (!asignaturaExist) return [null, 'Asignatura no encontrada'];

        // buscar inscripcion existente con parametros: profesor, asignatura, seccion, semestre, año

        const inscripcionExist = await Inscripcion.findOne({
            profesor: profesor,
            asignatura: asignatura,
            seccion: inscripcionData.seccion,
            semestre: inscripcionData.semestre,
            año: inscripcionData.año
        });

        // consultar si el array RutAlumnos esta vacio
        let rutAlumnos = [];
        if (inscripcionExist) rutAlumnos = inscripcionExist.rutAlumnos || [];

        // consultar si inscritos es 0
        let inscritos = 0; // <--- Agrega esta línea
        if (inscripcionExist) inscritos = inscripcionExist.inscritos || 0;

        console.log(`Inscripción existente: ${inscritos}`);

        // consultar si el rutParaEnviar esta presente en el array de rutAlumnos de inscripcionExist
        if (inscripcionExist && inscripcionExist.rutAlumnos.includes(rutParaEnviar)) {
            return [null, 'El alumno ya está inscrito en esta asignatura'];
        }

        rutAlumnos.push(rutParaEnviar);

        inscritos += 1;

        console.log("Datos a guardar:", {
            profesor: profesor,
            rutAlumnos: rutAlumnos,
            rutParaEnviar: '',
            asignatura: asignatura,
            seccion: inscripcionData.seccion,
            semestre: inscripcionData.semestre,
            año: inscripcionData.año,
            bloques: inscripcionData.bloques,
            cupo: inscripcionData.cupo || 40, 
            inscritos: inscritos
        });

        const inscripcionNew = new Inscripcion({
            profesor: profesor,
            rutAlumnos: rutAlumnos,
            rutParaEnviar: '',
            asignatura: asignatura,
            seccion: inscripcionData.seccion,
            semestre: inscripcionData.semestre,
            año: inscripcionData.año,
            bloques: inscripcionData.bloques,
            cupos: inscripcionData.cupos,
            inscritos: inscritos
        });

        const savedInscripcion = await inscripcionNew.save();

        return [savedInscripcion, null];
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        return [null, 'Error al crear inscripción'];
    }
}

export async function getInscripcionService(dataInscripcion) {
    try {

        const { profesor, asignatura, año } = dataInscripcion;

        const profesorExist = await User.findOne({ nombreCompleto: profesor, role: 'profesor' });

        if (!profesorExist) return [null, 'Profesor no encontrado'];

        const asignaturaExist = await Asignatura.findOne({ nombre: asignatura });

        if (!asignaturaExist) return [null, 'Asignatura no encontrada'];

        //formatear "año" a año
        const añoFormateado = año.toString();

        // console.log(`Año formateado: ${añoFormateado}`);

        const inscripcion = await Inscripcion.findOne({
            profesor: profesor,
            asignatura: asignatura,
            año: añoFormateado,
            semestre: dataInscripcion.semestre,
            seccion: dataInscripcion.seccion
        })

        if (!inscripcion) return [null, 'Inscripción no encontrada'];

        return [inscripcion, null];
    } catch (error) {
        console.error('Error al obtener inscripción:', error);
        return [null, 'Error al obtener inscripción'];
    }
}

export async function deleteInscripcionService(dataInscripcion) {
    try {
        const { profesor, asignatura, rutParaEnviar } = dataInscripcion;

        const profesorExist = await User.findOne({ nombreCompleto: profesor, role: 'profesor' });

        if (!profesorExist) return [null, 'Profesor no encontrado'];

        const asignaturaExist = await Asignatura.findOne({ nombre: asignatura });

        if (!asignaturaExist) return [null, 'Asignatura no encontrada'];

        const userExist = await User.findOne({ rut: rutParaEnviar, role: 'alumno' });

        if (!userExist) return [null, 'Alumno no encontrado'];

        const inscripcion = await Inscripcion.findOne({
            profesor: profesor,
            asignatura: asignatura,
            año: dataInscripcion.año,
            semestre: dataInscripcion.semestre,
            seccion: dataInscripcion.seccion
        });

        if (!inscripcion) return [null, 'Inscripción no encontrada'];

        // Eliminar el rut del array rutAlumnos
        const rutAlumnosActualizado = inscripcion.rutAlumnos.filter(rut => rut !== rutParaEnviar);

        inscripcion.rutAlumnos = rutAlumnosActualizado;

        // Actualizar el número de inscritos
        inscripcion.inscritos = rutAlumnosActualizado.length;

        await inscripcion.save();

        return [inscripcion, null];

    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        return [null, 'Error al eliminar inscripción'];
    }
}

export async function getInscripcionesPorEstudianteService(rutEstudiante) {
    try {
        const inscripciones = await Inscripcion.find({
            rutAlumnos: { $in: [rutEstudiante] }
        });

        if (!inscripciones || inscripciones.length === 0) {
            return [[], null];
        }

        return [inscripciones, null];
    } catch (error) {
        console.error('Error al obtener inscripciones del estudiante:', error);
        return [null, 'Error al obtener inscripciones del estudiante'];
    }
}

export async function eliminarTodasInscripcionesEstudianteService(rutEstudiante) {
    try {
        // Buscar todas las inscripciones donde el estudiante esté inscrito
        const inscripciones = await Inscripcion.find({
            rutAlumnos: { $in: [rutEstudiante] }
        });

        if (!inscripciones || inscripciones.length === 0) {
            return [[], null];
        }

        const resultados = [];

        for (const inscripcion of inscripciones) {
            // Eliminar el RUT del estudiante del array rutAlumnos
            const rutAlumnosActualizado = inscripcion.rutAlumnos.filter(rut => rut !== rutEstudiante);
            
            // Actualizar el número de inscritos
            inscripcion.rutAlumnos = rutAlumnosActualizado;
            inscripcion.inscritos = rutAlumnosActualizado.length;

            await inscripcion.save();
            resultados.push(inscripcion);
        }

        return [resultados, null];
    } catch (error) {
        console.error('Error al eliminar inscripciones del estudiante:', error);
        return [null, 'Error al eliminar inscripciones del estudiante'];
    }
}

export async function updateInscripcionService(dataInscripcion) {
    try {

    } catch (error) {
        console.error('Error al actualizar inscripción:', error);
        return [null, 'Error al actualizar inscripción'];
    }
}