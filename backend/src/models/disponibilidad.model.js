import mongoose from "mongoose";

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
            enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            required: true
        },
        horaInicio: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/
        },
        horaFin: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

const Disponibilidad = mongoose.model('Disponibilidad', disponibilidadSchema);
export default Disponibilidad;