import Disponibilidad from '../models/disponibilidad.model.js';
import mongoose from 'mongoose';

export const guardarDisponibilidad = async (profesorId, bloques) => {
    try {
        // Convertir string a ObjectId manualmente
        const profesorObjectId = new mongoose.Types.ObjectId(profesorId);
        
        return await Disponibilidad.findOneAndUpdate(
            { profesor: profesorObjectId },
            { bloques },
            { upsert: true, new: true }
        );
    } catch (error) {
        throw new Error(`Error al guardar disponibilidad: ${error.message}`);
    }
};

export const obtenerDisponibilidad = async (profesorId) => {
    try {
        if (profesorId) {
            // Convertir string a ObjectId manualmente
            const profesorObjectId = new mongoose.Types.ObjectId(profesorId);
            return await Disponibilidad.findOne({ profesor: profesorObjectId });
        } else {
            return await Disponibilidad.find().populate('profesor', 'name email');
        }
    } catch (error) {
        throw new Error(`Error al obtener disponibilidad: ${error.message}`);
    }
};

export const eliminarDisponibilidad = async (profesorId) => {
    try {
        // Convertir string a ObjectId manualmente
        const profesorObjectId = new mongoose.Types.ObjectId(profesorId);
        return await Disponibilidad.findOneAndDelete({ profesor: profesorObjectId });
    } catch (error) {
        throw new Error(`Error al eliminar disponibilidad: ${error.message}`);
    }
};