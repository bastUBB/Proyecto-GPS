import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: true
    },
    rut: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    asignaturasImpartidas: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;