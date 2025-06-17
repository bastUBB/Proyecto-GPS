// Historial de las notas de un estudiante para tomarla en cuenta al momento de crear la mejor combinación de horarios
import mongoose from "mongoose";

const historialSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    asignaturas: [{
        asignatura: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asignatura',
            required: true
        },
        nota: {
            type: Number,
            required: true,
            min: 1,
            max: 7
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Historial = mongoose.model('Historial', historialSchema);
export default Historial;