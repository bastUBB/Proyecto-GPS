// Modelo que crea la mejor combinación de horarios para un estudiante
import mongoose from "mongoose";

//TODO: arreglar modelo -> CRUD completo

const combiHorariosSchema = new mongoose.Schema({
    horarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horario',
        required: true,
        cast: false
    }],
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        cast: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
        cast: false,
    },
    conflictos: [{ // Conflictos de horarios que se generan al crear la mejor combinación, No se si sea necesario
        tipo: {
            type: String,
            required: true,
            enum: ['Horario', 'Asignatura'],
            cast: false,
        },
        descripcion: {
            type: String,
            required: true,
            cast: false,
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

const CombiHorarios = mongoose.model('CombiHorarios', combiHorariosSchema);
export default CombiHorarios;