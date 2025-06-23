import { guardarPorcentajeAprob } from '../services/porcentHist.service.js';
import User from '../models/user.model.js';

export const subirPorcentajeAprob = async (req, res) => {
    try {
        const { asignatura, profesor, prorcentajeAprob, fechaRegistro } = req.body;

        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Solo el administrador puede subir porcentajes de aprobación.' });
        }

        if (!asignatura || !profesor || typeof prorcentajeAprob !== 'number') {
            return res.status(400).json({ error: 'Faltan datos requeridos.' });
        }

        const resultado = await guardarPorcentajeAprob({ asignatura, profesor, prorcentajeAprob, fechaRegistro });
        res.json({ message: 'Porcentaje de aprobación guardado', data: resultado });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el porcentaje de aprobación.' });
    }
};