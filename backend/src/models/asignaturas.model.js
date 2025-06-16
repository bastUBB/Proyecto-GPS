import mongoose from "mongoose";

const asignaturaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 80
    },
    codigo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 10
    },
    creditos: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    prerequisitos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asignatura'
    }],
}, {
    timestamps: true,
    versionKey: false
});

const Asignatura = mongoose.model('Asignatura', asignaturaSchema);
export default Asignatura;