import mongoose from "mongoose";

//TODO: Representar la malla a través de mapeo y hacer dinámica (check de asignatura) a través del modelo historial

const asignaturaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    codigo: {
        type: String,
        required: true,
        unique: true,
    },
    creditos: {
        type: Number,
        required: true,
    },
    prerrequisitos: [{
        type: String,
    }],
    semestre: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false
});

const Asignatura = mongoose.model('Asignatura', asignaturaSchema);
export default Asignatura;