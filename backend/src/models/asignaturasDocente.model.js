import mongoose from "mongoose";

const asignaturasDocenteSchema = new mongoose.Schema({
    docente: {
        type: String,
        required: true,
        cast: false
    },
    asignaturas: [{
        type: String,
        required: true,
        cast: false
    }]
}, {
    timestamps: true,
    versionKey: false
});

const asignaturasDocente = mongoose.model('asignaturasDocente', asignaturasDocenteSchema);
export default asignaturasDocente;
