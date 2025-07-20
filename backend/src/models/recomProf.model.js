// Modelo de la recomendación de horarios para un profesor tomando en cuenta su disponibilidad y las asignaturas que imparte
// SIento que falta algo para saber la cantidad de horas que deben impartirse por cada asignatura
import mongoose from "mongoose";

//TODO: arreglar modelo -> CRUD completo

const recomProfSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        
    },
    bloquesAsignaturas: [{
        bloque: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bloque',
            required: true
        },
        asignatura: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asignatura',
            required: true
        },
        horas: {
            type: Number,
            required: false // Puedes poner true si siempre quieres registrar las horas
        }
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    criterios: {
        tipo: {
            type: String,
            required: true,
            enum: ['Disponibilidad', 'Asignaturas']
        },
        descripcion: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

const RecomProf = mongoose.model('RecomProf', recomProfSchema);
export default RecomProf;