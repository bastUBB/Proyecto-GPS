import { generarCombinacionHorarios } from '../services/combiHorarios.service.js';

export const obtenerCombinacionHorarios = async (req, res) => {
    try {
        const { profesorId, horasSemana } = req.query;
        if (!profesorId || !horasSemana) {
            return res.status(400).json({ error: 'Se requiere el ID del profesor y la cantidad de horas' });
        }

        const combinacion = await generarCombinacionHorarios(profesorId, Number(horasSemana));
        res.json({ combinacion });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error al generar la combinación de horarios' });
    }
};