import Disponibilidad from '../models/disponibilidad.model.js';

export const guardarDisponibilidad = async (profesorId, bloques) => {
    return Disponibilidad.findOneAndUpdate(
        { profesor: profesorId },
        { bloques },
        { upsert: true, new: true }
    );
};