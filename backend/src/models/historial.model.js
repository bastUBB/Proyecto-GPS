// Historial de las notas de un estudiante para tomarla en cuenta al momento de crear la mejor combinación de horarios
import mongoose from "mongoose";

//TODOS: contabilizar los creditos que lleva el alumnno

const historialSchema = new mongoose.Schema({
    alumno: {
        type: String,
        required: true,
        cast: false,
    },
    asignaturasCursadas: [{
        asignatura: {
            type: String,
            required: true,
            cast: false,
        },
        notaFinal: {
            type: Number,
            required: true,
            cast: false,
        },
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Historial = mongoose.model('Historial', historialSchema);
export default Historial;