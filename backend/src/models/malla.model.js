import mongoose from "mongoose";

const mallaSchema = new mongoose.Schema({
    carrera: {
        type: String,
        required: false,
        trim: true,
    },
    añoIngreso: {
        type: Number,
        required: false,
        min: 2000,
        max: new Date().getFullYear(),
    },
    listaAsignaturas: [{
        asignatura: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asignatura',
            required: true
        },
        semestre: {
            type: Number,
            required: true,
            min: 1
        }
    }],
}, {
    timestamps: true,
    versionKey: false
});

const Malla = mongoose.model('Malla', mallaSchema);
export default Malla;