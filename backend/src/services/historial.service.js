import Historial from "../models/historial.model.js";
import User from "../models/user.model.js";
import Asignatura from "../models/asignaturas.model.js";

export async function createHistorialService(dataHistorial) {
    try {
        const { alumno, asignaturasCursadas } = dataHistorial;

        const existAlumno = await User.findOne({ nombreCompleto: alumno, role: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea registrar no existe'];

        const nombresAsignaturas = asignaturasCursadas.map(asignatura => asignatura.asignatura);

        const asignaturasExistentes = await Asignatura.find({ nombre: { $in: nombresAsignaturas } });

        if (asignaturasExistentes.length !== nombresAsignaturas.length) {
            const asignaturasNoExistentes = nombresAsignaturas.filter(nombre =>
                !asignaturasExistentes.some(asignatura => asignatura.nombre === nombre)
            );
            return [null, `Las siguientes asignaturas no existen: ${asignaturasNoExistentes.join(', ')}`];
        }

        const newHistorial = new Historial(dataHistorial);

        if (!newHistorial) return [null, 'Error al crear el historial'];

        const historialSaved = await newHistorial.save();

        return [historialSaved, null];
    } catch (error) {
        console.error('Error al crear el historial:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getHistorialService(query) {
    try {
        const { alumno } = query;

        const existAlumno = await User.findOne({ nombreCompleto: alumno, role: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea consultar no existe'];

        const historial = await Historial.find({ alumno });

        if (!historial || historial.length === 0) return [null, 'No se encontraron registros para el alumno'];

        return [historial, null];
    } catch (error) {
        console.error('Error al obtener el historial:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllHistorialService() {
    try {
        const historiales = await Historial.find();

        if (!historiales || historiales.length === 0) return [null, 'No hay historiales registrados'];

        return [historiales, null];
    } catch (error) {
        console.error('Error al obtener todos los historiales:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateHistorialService(query, body) {
    try {
        const { alumno } = query;

        const existAlumno = await User.findOne({ nombreCompleto: alumno, role: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea actualizar no existe'];

        const {  alumno: nuevoAlumno, asignaturasCursadas: nuevasAsignaturasCursadas } = body;

        const existNewAlumno = await User.findOne({ nombreCompleto: nuevoAlumno, role: "alumno" });

        if (!existNewAlumno) return [null, 'El nuevo alumno que desea actualizar no existe'];

        const nuevasAsignaturasExistentes = await Asignatura.find({ nombre: { $in: nuevasAsignaturasCursadas.map(asignatura => asignatura.asignatura) } });

        if (nuevasAsignaturasExistentes.length !== nuevasAsignaturasCursadas.length) {

            const asignaturasNoExistentes = nuevasAsignaturasCursadas.map(asignatura => asignatura.asignatura)

                .filter(nombre => !nuevasAsignaturasExistentes.some(asignatura => asignatura.nombre === nombre));

            return [null, `Las siguientes asignturas no existen: ${asignaturasNoExistentes.join(', ')}`];
        }

        const historialUpdated = await Historial.findOneAndUpdate(
            { alumno },
            body,
            { new: true }
        );

        if (!historialUpdated) return [null, 'Error al actualizar el historial'];

        return [historialUpdated, null];
    } catch (error) {
        console.error('Error al actualizar el historial:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteHistorialService(query) {
    try {
        const { alumno } = query;

        const existAlumno = await User.findOne({ nombreCompleto: alumno, role: "alumno" });

        if (!existAlumno) return [null, 'El alumno que desea eliminar no existe'];

        const historialDeleted = await Historial.findOneAndDelete({ alumno });

        if (!historialDeleted) return [null, 'Error al eliminar el historial'];

        return [historialDeleted, null];
    } catch (error) {
        console.error('Error al eliminar el historial:', error);
        return [null, 'Error interno del servidor'];
    }
}