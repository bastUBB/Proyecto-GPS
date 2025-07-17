import mongoose from "mongoose";

const evaluacionDocenteSchema = new mongoose.Schema({
    docente: {
        type: String,
        required: true,
    },
    alumno: {
        type: String,
        required: true
    },
    asignatura: {
        type: String,
        required: true
    },
    visibilidad: {
        type: String,
        required: true,
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true
    },
    texto: {
        type: String,
        required: true,
    },
    calificacion: {
        type: Number,
        required: true,
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobada', 'rechazada'],
        default: 'pendiente',
        required: true
    },
}, {
    timestamps: true,
    versionKey: false
});

const evaluacionDocente = mongoose.model('evaluacionDocente', evaluacionDocenteSchema);
export default evaluacionDocente;