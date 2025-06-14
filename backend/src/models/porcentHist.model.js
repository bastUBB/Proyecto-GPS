// Modelo para almacenar los promedios historicos de cada asignatiras y profesor, exraidos de DGAI

import mongoose from "mongoose";

const porcentHistSchema = new mongoose.Schema({
    asignatura: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asignatura',
        required: true
    },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    prorcentajeAprob: {
        type: Number,
        required: true,
        min: 1,
        max: 7
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

const PorcentHist = mongoose.model('PorcentHist', porcentHistSchema);
export default PorcentHist;