// Modelo para almacenar los promedios historicos de cada asignatiras y profesor, exraidos de DGAI

import mongoose from "mongoose";

//TODO: Cambiar asignatura -> codigoAsignatura. Esto para evitar usar el Type ObjectId y usar el codigo de asignatura

const rendimientoAsignaturaSchema = new mongoose.Schema({
    asignatura: {
        type: String,
        required: true,
        cast: false,
    },
    docente: {
        type: String,
        required: true,
        cast: false,
    },
    seccion: {
        type: Number,
        required: true,
        cast: false,
    },
    semestre: {
        type: Number,
        required: true,
        cast: false,
    },
    porcentajeAprob: {
        type: Number,
        required: true,
        cast: false,
    },
    año: {
        type: String,
        required: true,
        cast: false,
    },
    totalInscritos: {
        type: Number,
        required: true,
        cast: false,
    },
}, {
    timestamps: true,
    versionKey: false
});

const rendimientoAsignatura = mongoose.model('rendimientoAsignatura', rendimientoAsignaturaSchema);
export default rendimientoAsignatura;