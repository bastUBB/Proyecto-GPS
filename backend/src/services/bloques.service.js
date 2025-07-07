import Bloque from '../models/bloques.model.js';

//TODO: Agregar en todo el CRUD el nuevo campo 'tipo'

export async function createBloqueService(dataBloque) {
    try {
        const { horaInicio, horaFin, dia, tipo } = dataBloque;
        
        if (horaInicio >= horaFin) return [null, 'La hora de inicio debe ser menor a la hora de fin'];

        const existingBloque = await Bloque.findOne({ horaInicio, horaFin, dia, tipo });

        if (existingBloque) return [null, 'El bloque que desea crear ya existe'];
   
        const newBloque = new Bloque(dataBloque);

        if (!newBloque) return [null, 'Error al crear el bloque'];

        const bloqueSaved = await newBloque.save();

        return [bloqueSaved, null];
    } catch (error) {
        console.error('Error al crear el bloque:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getBloqueService(query) {
    try {
        const { horaInicio, horaFin, dia, tipo } = query;

        if (horaInicio >= horaFin) return [null, 'La hora de inicio debe ser menor a la hora de fin'];

        const existingBloque = await Bloque.findOne({ horaInicio, horaFin, dia, tipo });

        if (!existingBloque) return [null, 'Bloque no encontrado'];

        return [existingBloque, null];
    } catch (error) {
        console.error('Error al obtener el bloque:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllBloquesService(){
    try {
        const bloques = await Bloque.find();

        if (!bloques || bloques.length === 0) return [null, 'No hay bloques registrados'];

        return [bloques, null];
    } catch (error) {
        console.error('Error al obtener los bloques:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateBloqueService(query, body) {
    try {
        const { horaInicio, horaFin, dia, tipo } = query;

        if (horaInicio >= horaFin) return [null, 'La hora de inicio debe ser menor a la hora de fin'];

        const { horaInicio: nuevaHoraInicio, horaFin: nuevaHoraFin, dia: nuevoDia, tipo: nuevoTipo } = body;

        if (nuevaHoraInicio >= nuevaHoraFin) return [null, 'La nueva hora de inicio debe ser menor a la nueva hora de fin'];

        const existingBloque = await Bloque.findOne({ horaInicio, horaFin, dia, tipo });

        if (!existingBloque) return [null, 'El bloque de la consulta no existe'];
        
        const bloqueConflicto = await Bloque.findOne({ nuevaHoraInicio, nuevaHoraFin, nuevoDia, nuevoTipo });

        if (bloqueConflicto) return [null, 'El bloque que desea actualizar ya existe con esos datos'];

        const updatedBloque = await Bloque.findOneAndUpdate(
            { horaInicio, horaFin, dia, tipo },
            body,
            { new: true }
        );

        if (!updatedBloque) return [null, 'Error al actualizar el bloque'];

        return [updatedBloque, null];
    } catch (error) {
        console.error('Error al actualizar el bloque:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteBloqueService(query) {
    try {
        const { horaInicio, horaFin, dia, tipo } = query;

        if (horaInicio >= horaFin) return [null, 'La hora de inicio debe ser menor a la hora de fin'];

        const existingBloque = await Bloque.findOne({ horaInicio, horaFin, dia, tipo });

        if (!existingBloque) return [null, 'Bloque que desea eliminar no existe'];
        
        await Bloque.deleteOne({ horaInicio, horaFin, dia, tipo });

        const bloqueEliminado = await Bloque.findOne({ horaInicio, horaFin, dia, tipo });

        if (bloqueEliminado) return [null, 'Error al eliminar el bloque'];

        return [bloqueEliminado, null];
    } catch (error) {
        console.error('Error al eliminar el bloque:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getBloqueIdService(query) {
    try {
        const { horaInicio, horaFin, dia, tipo } = query;

        if (horaInicio >= horaFin) return [null, 'La hora de inicio debe ser menor a la hora de fin'];

        const existingBloque = await Bloque.findOne({ horaInicio, horaFin, dia, tipo });

        if (!existingBloque) return [null, 'Bloque no encontrado'];

        return [existingBloque._id, null];
    } catch (error) {
        console.error('Error al obtener el ID del bloque:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getBloqueByIdService(id) {
    try {
        const bloque = await Bloque.findById(id);

        if (!bloque) return [null, 'Bloque no encontrado'];

        return [bloque, null];
        
    } catch (error) {
        console.error('Error al obtener el bloque por ID:', error);
        return [null, 'Error interno del servidor'];
    }
}