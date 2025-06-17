// Bloques de tiempo para impartir clases
import mongoose from "mongoose";

const bloqueSchema = new mongoose.Schema({
    horaInicio: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    horaFin: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    dia:{
        type: String,
        required: true,
        // TODO: Coordinar el cómo será el manejo de los días (tildes, minusculas y mayúsculas)
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    }
}, {
    timestamps: true,
    versionKey: false
});

const Bloque = mongoose.model('Bloque', bloqueSchema);
export default Bloque;
