import Inscripcion from "../models/inscripcion.model.js";
import User from "../models/user.model.js";
import Asignatura from "../models/asignaturas.model.js";
import evluacionDocente from "../models/evaluacionDocente.model.js";
import rendimientoAsignatura from "../models/rendimientoAsignatura.model.js";

export async function crearRecomendacionInscripcion(){
    
}

export async function crearInscripcion(inscripcionData) {
    try {
        const { profesor, rutAlumnos, asignatura } = inscripcionData;

        const profesorExist = await User.findOne({ nombreCompleto: profesor, role: "profesor" });

        if (!profesorExist) return [null, 'El profesor no existe'];

        const alumnosExist = await User.find({ rut: { $in: rutAlumnos }, role: "alumno" });

        if (alumnosExist.length !== rutAlumnos.length) return [null, 'Uno o más alumnos no existen'];

        const asignaturaExist = await Asignatura.findOne({ nombre: asignatura });

        if (!asignaturaExist) return [null, 'La asignatura no existe'];

        const inscripcion = new Inscripcion(inscripcionData);

        const savedInscripcion = await inscripcion.save();

        return [savedInscripcion, null];
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        return [null, 'Error al crear inscripción'];
    }
}