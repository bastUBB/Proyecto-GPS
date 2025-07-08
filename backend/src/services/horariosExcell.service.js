import horarioExcell from '../models/horariosExcell.model.js';
import Asignatura from '../models/asignaturas.model.js';
import User from '../models/user.model.js';
import Bloques from '../models/bloques.model.js';   

export async function createHorarioExcellService(dataHorario) {
    try {
        
        const { codigoAsignatura, bloques, docente } = dataHorario;

        const existAsignatura = await Asignatura.findOne({ codigo: codigoAsignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea agregar no existe'];

        const existBloques = await Bloques.find({ _id: { $in: bloques } });

        if (existBloques.length !== bloques.length) return [null, 'Uno o más bloques que desea agregar no existen'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });
        
        if (!existDocente) return [null, 'El docente que desea agregar no existe'];

        const newHorario = new horarioExcell(dataHorario);

        if (!newHorario) return [null, 'Error al crear el horario'];

        const horarioSaved = await newHorario.save();

        return [horarioSaved, null];
    } catch (error) {
        console.error('Error al crear el horario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getHorarioExcellService(query) {
    try {
        const { codigoAsignatura, seccion, docente } = query;

        const existAsignatura = await Asignatura.findOne({ codigo: codigoAsignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea consultar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea consultar no existe'];

        const horario = await horarioExcell.find({ codigoAsignatura, seccion, docente })

        if (!horario || horario.length === 0) return [null, 'No se encontraron horarios con los datos proporcionados'];

        return [horario, null];
    } catch (error) {
        console.error('Error al obtener el horario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllHorariosExcellService() {
    try {
        const horarios = await horarioExcell.find();

        if (!horarios || horarios.length === 0) return [null, 'No hay horarios registrados'];

        return [horarios, null];
    } catch (error) {
        console.error('Error al obtener los horarios:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateHorarioExcellService(query, body) {
    try {
        const { codigoAsignatura, seccion, docente } = query;

        const existAsignatura = await Asignatura.findOne({ codigo: codigoAsignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea actualizar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea actualizar no existe'];

        const {codigoAsignatura: nuevoCodigoAsignatura, bloques, seccion: nuevaSeccion, docente: nuevoDocente } = body;

        const existNuevaAsignatura = await Asignatura.findOne({ codigo: nuevoCodigoAsignatura });

        if (!existNuevaAsignatura) return [null, 'La nueva asignatura que desea actualizar no existe'];

        const existBloque = await Bloques.find({ _id: { $in: bloques } });

        if (existBloque.length !== bloques.length) return [null, 'Uno o más bloques que desea agregar no existen'];

        const existnuevoDocente = await User.findOne({ nombreCompleto: nuevoDocente, rol: "docente" });

        if (!existnuevoDocente) return [null, 'El nuevo docente que desea actualizar no existe'];
        
        const existHorarioExcell = await horarioExcell.findOne({ nuevoCodigoAsignatura, bloques, nuevaSeccion, nuevoDocente });

        if (existHorarioExcell) return [null, 'Ya existe un horario con los mismos datos'];

        const horarioUpdated = await horarioExcell.findOneAndUpdate(
            { codigoAsignatura, seccion, docente },
            body,
            { new: true }
        );

        if (!horarioUpdated) return [null, 'Error al actualizar el horario'];

        return [horarioUpdated, null];
    } catch (error) {
        console.error('Error al actualizar el horario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteHorarioExcellService(query) {
    try {
        const { codigoAsignatura, seccion, docente } = query;

        const existAsignatura = await Asignatura.findOne({ codigo: codigoAsignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea eliminar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea eliminar no existe'];

        const horarioDeleted = await horarioExcell.findOneAndDelete({ codigoAsignatura, seccion, docente });

        if (!horarioDeleted) return [null, 'Error al eliminar el horario'];

        return [horarioDeleted, null];
    } catch (error) {
        console.error('Error al eliminar el horario:', error);
        return [null, 'Error interno del servidor'];
    }
}