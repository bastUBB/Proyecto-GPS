import PorcentHist from '../models/porcentHist.model.js';

export const guardarPorcentajeAprob = async ({ asignatura, profesor, prorcentajeAprob, fechaRegistro }) => {

    return PorcentHist.findOneAndUpdate(
        { asignatura, profesor },
        { prorcentajeAprob, fechaRegistro: fechaRegistro || new Date() },
        { upsert: true, new: true }
    );
};