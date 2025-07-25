import mongoose from "mongoose";

const evaluacionDocenteSchema = new mongoose.Schema({
    docente: {
        type: String,
        required: true,
        cast: false
    },
    alumno: {
        type: String,
        required: true,
        cast: false,
    },
    asignatura: {
        type: String,
        required: true,
        cast: false,
    },
    visibilidad: {
        type: String,
        required: true,
        cast: false,
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true,
        cast: false,
    },
    texto: {
        type: String,
        required: true,
        cast: false,
    },
    calificacion: {
        type: Number,
        required: true,
        cast: false,
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobada', 'rechazada'],
        default: 'pendiente',
        required: true,
        cast: false,
    },
}, {
    timestamps: true,
    versionKey: false
});

const evaluacionDocente = mongoose.model('evaluacionDocente', evaluacionDocenteSchema);
export default evaluacionDocente;