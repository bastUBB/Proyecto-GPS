// Bloques de tiempo para impartir clases
import mongoose from "mongoose";

const bloqueSchema = new mongoose.Schema({
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
    dia:{
        type: String,
        required: true,
        cast: false,
    },
    tipo: {
        type: String,
        required: true,
        cast: false,
    }
}, {
    timestamps: true,
    versionKey: false
});

const Bloque = mongoose.model('Bloque', bloqueSchema);
export default Bloque;
