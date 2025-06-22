import { guardarDisponibilidad, obtenerDisponibilidad } from '../services/disponibilidad.service.js';
import User from '../models/user.model.js';

export const subirDisponibilidad = async (req, res) => {
    try {
        const { bloques } = req.body;
        const profesorId = req.user?.id || req.body.profesorId;
        
        const user = await User.findById(profesorId);
        if (!user || user.role !== 'profesor') {
            return res.status(403).json({ error: 'Solo los profesores pueden subir disponibilidad' });
        }

        const disponibilidad = await guardarDisponibilidad(profesorId, bloques);
        res.json({ message: 'Disponibilidad guardada', disponibilidad });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar disponibilidad' });
    }
};

export const verDisponibilidad = async (req, res) => {
    try {
        const { profesorId } = req.query; // Puedes pasar ?profesorId=... en la URL
        const disponibilidad = await obtenerDisponibilidad(profesorId);
        if (!disponibilidad || (Array.isArray(disponibilidad) && disponibilidad.length === 0)) {
            return res.status(404).json({ message: 'No se encontró disponibilidad' });
        }
        res.json({ disponibilidad });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener disponibilidad' });
    }
};