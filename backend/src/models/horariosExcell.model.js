// Horarios que se extraen del excel que sube el Admin
import mongoose from "mongoose";

const horarioSchema = new mongoose.Schema({
    codigoAsignatura: {
        type: String,
        required: true,
    },
    bloques: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bloque',
        required: true,
    }],
    seccion: {
        type: Number,
        required: false,
    },
    docente: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false
});

const Horario = mongoose.model('Horarios', horarioSchema);
export default Horario;