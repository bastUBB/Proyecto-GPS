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
        semestre: {
            type: Number,
            required: true,
            enum: [1, 2],
            cast: false,
        },
        estado: {
            type: String,
            enum: ['cursada', 'inscribible'],
            default: 'cursada',
            cast: false,
        },
        notasParciales: [{
            evaluacion: {
                type: String,
                required: true,
                cast: false,
            },
            nota: {
                type: Number,
                required: true,
                min: 1.0,
                max: 7.0,
                cast: false,
            },
            ponderacion: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
                cast: false,
            }
        }]
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Historial = mongoose.model('Historial', historialSchema);
export default Historial;