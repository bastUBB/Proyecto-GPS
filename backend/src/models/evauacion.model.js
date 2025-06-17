import mongoose from "mongoose";

const evaluacionSchema = new mongoose.Schema({
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        validate: {
            validator: async function (profesorId) {
                const busqueda_docente = await mongoose.model('Usuario').findById(profesorId);
                return busqueda_docente && busqueda_docente.role === 'docente';
            },
        }
    },
    asignatura: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asignatura',
        required: true
    },
    visibilidad: {
        type: String,
        required: true,
        enum: ['Anonima', 'Publica']
    },
    fecha: {
        type: Date,
        required: true
    },
    texto: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    calificacion: {
        type: Number,
        required: false,
        min: 1,
        max: 7
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Evaluacion = mongoose.model('Evaluacion', evaluacionSchema);
export default Evaluacion;