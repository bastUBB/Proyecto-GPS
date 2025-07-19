import mongoose from "mongoose";

//TODO: arreglar modelo -> CRUD completo

// Disponibilidad horaria de los profesores
const disponibilidadSchema = new mongoose.Schema({
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Un profesor solo puede tener una disponibilidad
        cast: false,
    },
    bloques: [{
        dia: {
            type: String,
            required: true,
            cast: false,
        },
        horaInicio: {
            type: String,
            required: true,
            cast: false,
        },
        horaFin: {
            type: String,
            required: true,
            cast: false,
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Disponibilidad = mongoose.model('Disponibilidad', disponibilidadSchema);
export default Disponibilidad;