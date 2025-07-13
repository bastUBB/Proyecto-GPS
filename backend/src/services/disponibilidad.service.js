import Disponibilidad from '../models/disponibilidad.model.js';

export const guardarDisponibilidad = async (profesorId, bloques) => {
    return Disponibilidad.findOneAndUpdate(
        { profesor: profesorId },
        { bloques },
        { upsert: true, new: true }
    );
};

export const obtenerDisponibilidad = async (profesorId) => {
    if (profesorId) {
        return Disponibilidad.findOne({ profesor: profesorId });
    } else {
        return Disponibilidad.find().populate('profesor', 'name email');
    }
};

export const eliminarDisponibilidad = async (profesorId) => {
    return Disponibilidad.findOneAndDelete({ profesor: profesorId });
};