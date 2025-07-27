import mongoose from "mongoose";

const asignaturaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        cast: false,
    },
    codigo: {
        type: String,
        required: true,
        unique: true,
        cast: false,
    },
    creditos: {
        type: Number,
        required: true,
        cast: false,
    },
    prerrequisitos: [{
        type: String,
        cast: false,
    }],
    semestre: {
        type: Number,
        required: true,
        cast: false,
    },
    ambito: {
        type: String,
        required: true,
        cast: false,
    },
    area: {
        type: String,
        required: true,
        cast: false,
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: true
});

const Asignatura = mongoose.model('Asignatura', asignaturaSchema);
export default Asignatura;