import evaluacionDocente from "../models/evaluacionDocente.model.js";
import User from "../models/user.model.js";
import Asignatura from "../models/asignaturas.model.js";

export async function createEvaluacionDocenteService(dataEvaluacion, alumnoId) {
    try {
        const { docente, asignatura, texto, calificacion, visibilidad } = dataEvaluacion;

        const existDocente = await User.findOne({ 
            nombreCompleto: docente, 
            $or: [
                { role: "profesor" },
                { role: "docente" }
            ]
        });
        if (!existDocente) return [null, 'El docente seleccionado no existe'];

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });
        if (!existAsignatura) return [null, 'La asignatura seleccionada no existe'];

        const alumno = await User.findById(alumnoId);
        if (!alumno || alumno.role !== "alumno") return [null, 'Usuario no autorizado para crear evaluaciones'];

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
            calificacion,
            estado: 'pendiente'
        });

        const evaluacionGuardada = await nuevaEvaluacion.save();
        return [evaluacionGuardada, null];

    } catch (error) {
        console.error('Error al crear evaluación:', error);
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

export async function getEvaluacionesByDocenteService(docenteNombre) {
    try {
        const evaluaciones = await evaluacionDocente.find({
            docente: docenteNombre,
            estado: 'aprobada'
        })
            .select('-__v')
            .sort({ fecha: -1 });

        if (!evaluaciones || evaluaciones.length === 0) {
            return [null, 'No tienes evaluaciones aprobadas disponibles'];
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

export async function updateEvaluacionDocenteService(query, body) {
    try {
        const { _id } = query;

        if (_id) {
            const evaluacion = await evaluacionDocente.findByIdAndUpdate(
                _id,
                body,
                { new: true }
            );

            if (!evaluacion) return [null, 'Evaluación docente no encontrada'];
            return [evaluacion, null];
        }

        // Lógica alternativa para actualización por campos específicos
        const { docente, alumno, asignatura, fecha } = query;
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
        const { _id } = query;

        if (_id) {
            const evaluacion = await evaluacionDocente.findByIdAndDelete(_id);
            if (!evaluacion) return [null, 'Evaluación docente no encontrada'];
            return [evaluacion, null];
        }

        // Lógica alternativa para eliminación por campos específicos
        const { docente, alumno, asignatura, fecha } = query;
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
