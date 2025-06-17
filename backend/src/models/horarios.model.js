// Horarios que se extraen del excel que sube el Admin
import mongoose from "mongoose";

const horarioSchema = new mongoose.Schema({
    asignatura: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asignatura',
        required: true
    },
    bloque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bloque', // Referencia al modelo Bloque, que debe existir en la base de datos
    },
    seccion: {
        type: Number,
        required: false,
        min: 1,
    },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Referencia al modelo Usuario, nose si dejarlo asi pq requeriría que el profesor exista en la base de datos
    },
}, {
    timestamps: true,
    versionKey: false
});

const Horario = mongoose.model('Horarios', horarioSchema);
export default Horario;