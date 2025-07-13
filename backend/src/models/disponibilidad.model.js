import mongoose from "mongoose";

// Disponibilidad horaria de los profesores
const disponibilidadSchema = new mongoose.Schema({
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Un profesor solo puede tener una disponibilidad
    },
    bloques: [{
        dia: {
            type: String,
            required: true
        },
        horaInicio: {
            type: String,
            required: true
        },
        horaFin: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Disponibilidad = mongoose.model('Disponibilidad', disponibilidadSchema);
export default Disponibilidad;