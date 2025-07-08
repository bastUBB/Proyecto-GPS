import evaluacionDocente from "../models/evaluacionDocente.model.js";
import User from "../models/user.model.js";
import Asignatura from "../models/asignaturas.model.js";

export async function createEvaluacionDocenteService(dataEvaluacion) {
    try {

        const { docente, alumno, asignatura, fecha } = dataEvaluacion;

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea evaluar no existe'];

        const existAlumno = await User.findOne({ nombreCompleto: alumno, rol: "alumno" });

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