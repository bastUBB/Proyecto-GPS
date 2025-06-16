// Modelo que crea la mejor combinación de horarios para un estudiante
import mongoose from "mongoose";

const combiHorariosSchema = new mongoose.Schema({
    horarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horario',
        required: true
    }],
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    conflictos: [{ // Conflictos de horarios que se generan al crear la mejor combinación, No se si sea necesario
        tipo: {
            type: String,
            required: true,
            enum: ['Horario', 'Asignatura']
        },
        descripcion: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

const CombiHorarios = mongoose.model('CombiHorarios', combiHorariosSchema);
export default CombiHorarios;