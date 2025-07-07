// Bloques de tiempo para impartir clases
import mongoose from "mongoose";

const bloqueSchema = new mongoose.Schema({
    horaInicio: {
        type: String,
        required: true,
    },
    horaFin: {
        type: String,
        required: true,
    },
    dia:{
        type: String,
        required: true,
    },
    tipo: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false
});

const Bloque = mongoose.model('Bloque', bloqueSchema);
export default Bloque;
