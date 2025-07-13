import evaluacionDocente from "../models/evaluacionDocente.model.js";
import User from "../models/user.model.js";
import Asignatura from "../models/asignaturas.model.js";

export async function createEvaluacionDocenteService(dataEvaluacion) {
    try {

        const { docente, alumno, asignatura, fecha } = dataEvaluacion;

        const existDocente = await User.findOne({ nombreCompleto: docente, role: "docente" });

        if (!existDocente) return [null, 'El docente que desea evaluar no existe'];

        const existAlumno = await User.findOne({ nombreCompleto: alumno, role: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea evaluar no existe'];

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea evaluar no existe'];

        const currentDate = new Date();
        
        if (fecha < currentDate) return [null, 'La fecha de la evaluación no puede ser anterior a la fecha actual'];

        const newEvaluacion = new evaluacionDocente(dataEvaluacion);

        if (!newEvaluacion) return [null, 'Error al crear la evaluación docente'];

        const evaluacionSaved = await newEvaluacion.save();

        return [evaluacionSaved, null];
    } catch (error) {
        console.error('Error al crear la evaluación docente:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getEvaluacionDocenteService(query) {
    try {
        const { docente, alumno, asignatura, fecha } = query;

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea evaluar no existe'];

        const existAlumno = await User.findOne({ nombreCompleto: alumno, rol: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea evaluar no existe'];

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea evaluar no existe'];

        const evaluacion = await evaluacionDocente.find({ docente, alumno, asignatura, fecha});

        if (!evaluacion || evaluacion.length === 0) return [null, 'No se encontró la evaluación docente con los datos proporcionados'];

        //TODO: Verificar si debo de validar la visibilidad de la evaluación para poder obtenerla

        return [evaluacion, null];
    } catch (error) {
        console.error('Error al obtener la evaluación docente:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllEvaluacionesDocenteService() {
    try {
        const evaluaciones = await evaluacionDocente.find();

        if (!evaluaciones || evaluaciones.length === 0) return [null, 'No hay evaluaciones docentes registradas'];

        return [evaluaciones, null];
    } catch (error) {
        console.error('Error al obtener las evaluaciones docentes:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateEvaluacionDocenteService(query, body) {
    try {
        const { docente, alumno, asignatura, fecha } = query;

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea evaluar no existe'];

        const existAlumno = await User.findOne({ nombreCompleto: alumno, rol: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea evaluar no existe'];

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea evaluar no existe'];

        const { docente: nuevoDocente, alumno: nuevoAlumno, asignatura: nuevaAsignatura, fecha: nuevaFecha } = body;

        const evaluacionExistente = await evaluacionDocente.findOne({
            docente: nuevoDocente, 
            alumno: nuevoAlumno,
            asignatura: nuevaAsignatura,
            fecha: nuevaFecha
        });

        if (evaluacionExistente) return [null, 'Ya existe una evaluación docente con los mismos datos'];

        const evaluacion = await evaluacionDocente.findOneAndUpdate(
            { docente, alumno, asignatura, fecha },
            body,
            { new: true }
        );

        if (!evaluacion) return [null, 'Error al actualizar la evaluación docente'];

        return [evaluacion, null];
    } catch (error) {
        console.error('Error al actualizar la evaluación docente:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteEvaluacionDocenteService(query) {
    try {
        const { docente, alumno, asignatura, fecha } = query;

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea evaluar no existe'];

        const existAlumno = await User.findOne({ nombreCompleto: alumno, rol: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea evaluar no existe'];

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea evaluar no existe'];

        const evaluacion = await evaluacionDocente.findOneAndDelete({
            docente, 
            alumno,
            asignatura,
            fecha
        });

        if (!evaluacion) return [null, 'Error al eliminar la evaluación docente'];

        return [evaluacion, null];
    } catch (error) {
        console.error('Error al eliminar la evaluación docente:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function createEvaluacionByAlumnoService(dataEvaluacion, alumnoId) {
    try {
        const { docente, asignatura, texto, calificacion, visibilidad } = dataEvaluacion;

        // Verificar que el docente existe
        const existDocente = await User.findOne({ nombreCompleto: docente, role: "profesor" });
        if (!existDocente) return [null, 'El docente seleccionado no existe'];

        // Verificar que la asignatura existe
        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });
        if (!existAsignatura) return [null, 'La asignatura seleccionada no existe'];

        // Verificar que el alumno existe y obtener su información
        const alumno = await User.findById(alumnoId);
        if (!alumno || alumno.role !== "alumno") return [null, 'Usuario no autorizado para crear evaluaciones'];

        // Verificar que no existe una evaluación duplicada del mismo alumno al mismo docente en la misma asignatura
        const evaluacionExistente = await evaluacionDocente.findOne({
            docente,
            alumno: alumno.nombreCompleto,
            asignatura
        });

        if (evaluacionExistente) {
            return [null, 'Ya has evaluado a este docente en esta asignatura'];
        }

        // Crear la nueva evaluación
        const nuevaEvaluacion = new evaluacionDocente({
            docente,
            alumno: alumno.nombreCompleto,
            asignatura,
            visibilidad: visibilidad || 'Anónima',
            fecha: new Date(),
            texto,
            calificacion
        });

        const evaluacionGuardada = await nuevaEvaluacion.save();
        return [evaluacionGuardada, null];

    } catch (error) {
        console.error('Error al crear evaluación:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getEvaluacionesByDocenteService(docenteNombre) {
    try {
        const evaluaciones = await evaluacionDocente.find({ docente: docenteNombre })
            .select('-__v')
            .sort({ fecha: -1 }); // Ordenar por fecha más reciente primero

        if (!evaluaciones || evaluaciones.length === 0) {
            return [null, 'No tienes evaluaciones disponibles'];
        }

        // Si la evaluación es anónima, no mostrar el nombre del alumno
        const evaluacionesProcesadas = evaluaciones.map(evaluacion => {
            const evalObj = evaluacion.toObject();
            if (evalObj.visibilidad === 'Anónima' || evalObj.visibilidad === 'anónima') {
                evalObj.alumno = 'Anónimo';
            }
            return evalObj;
        });

        return [evaluacionesProcesadas, null];
    } catch (error) {
        console.error('Error al obtener evaluaciones del docente:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getDocentesListService() {
    try {
        const docentes = await User.find({ role: "profesor" })
            .select('nombreCompleto email')
            .sort({ nombreCompleto: 1 });

        if (!docentes || docentes.length === 0) {
            return [null, 'No hay docentes registrados'];
        }

        return [docentes, null];
    } catch (error) {
        console.error('Error al obtener lista de docentes:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAsignaturasListService() {
    try {
        const asignaturas = await Asignatura.find()
            .select('nombre codigo')
            .sort({ nombre: 1 });

        if (!asignaturas || asignaturas.length === 0) {
            return [null, 'No hay asignaturas registradas'];
        }

        return [asignaturas, null];
    } catch (error) {
        console.error('Error al obtener lista de asignaturas:', error);
        return [null, 'Error interno del servidor'];
    }
}