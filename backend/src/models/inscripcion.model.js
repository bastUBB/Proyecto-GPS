import mongoose from "mongoose";

const inscripcionSchema = new mongoose.Schema({
    profesor: {
        type: String,
        required: true,
        cast: false,
    },
    rutAlumnos: [{
        type: String,
        required: true,
        unique: true,
        cast: false
    }],
    rutParaEnviar: {
        type: String,
        required: true,
        cast: false,
    },
    asignatura: {
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
    año: {
        type: String,
        required: true,
        cast: false,
    },
    bloques : [{
        horaInicio: {
            type: String,
            required: true,
            cast: false,
        },
        horaFin: {
            type: String,
            required: true,
            cast: false,
        },
        dia: {
            type: String,
            required: true,
            cast: false,
        },
        tipo: {
            type: String,
            required: true,
            cast: false,
        },
        sala: {
            type: String,
            required: true,
            cast: false,
        }
    }],
    cupos: {
        type: Number,
        required: true,
    },
    inscritos: {
        type: Number,
        cast: false
    },
}, {
    timestamps: true,
    versionKey: false
});

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);
export default Inscripcion;
