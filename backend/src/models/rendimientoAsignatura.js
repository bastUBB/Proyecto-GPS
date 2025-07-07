// Modelo para almacenar los promedios historicos de cada asignatiras y profesor, exraidos de DGAI

import mongoose from "mongoose";

//TODO: Cambiar asignatura -> codigoAsignatura. Esto para evitar usar el Type ObjectId y usar el codigo de asignatura

const rendimientoAsignaturaSchema = new mongoose.Schema({
    asignatura: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asignatura',
        required: true
    },
    docente: {
        type: String,
        required: true,
    },
    porcentajeAprob: {
        type: Number,
        required: true,
    },
    porcentajeDesaprob: {
        type: Number,
        required: true,
    },
    porcentajeNCR:{
        type: Number,
        required: true,
    },
    añoRegistro: {
        type: String,
        required: true,
    },
    totalInscritos: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false
});

const rendimientoAsignatura = mongoose.model('rendimientoAsignatura', rendimientoAsignaturaSchema);
export default rendimientoAsignatura;