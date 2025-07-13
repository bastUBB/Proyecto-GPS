// Historial de las notas de un estudiante para tomarla en cuenta al momento de crear la mejor combinación de horarios
import mongoose from "mongoose";

const historialSchema = new mongoose.Schema({
    alumno: {
        type: String,
        required: true
    },
    asignaturasCursadas: [{
        asignatura: {
            type: String,
            required: true
        },
        notaFinal: {
            type: Number,
            required: true,
        },
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Historial = mongoose.model('Historial', historialSchema);
export default Historial;