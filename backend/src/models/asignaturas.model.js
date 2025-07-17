import mongoose from "mongoose";

//TODO: Representar la malla a través de mapeo y hacer dinámica (check de asignatura) a través del modelo historial

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
        type: String,
        required: true,
        cast: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    strict: true
});

const Asignatura = mongoose.model('Asignatura', asignaturaSchema);
export default Asignatura;