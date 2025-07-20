import mongoose from "mongoose";

const mallaUserSchema = new mongoose.Schema({
    rutUser: {
        type: String,
        required: true,
        unique: true,
        cast: false
    },
    asignaturasCursadas: [{
        type: String,
        cast: false,
    }],
    asignaturasInscribibles: [{
        type: String,
        cast: false,
    }],
    asignaturasNoInscribibles: [{
        type: String,
        cast: false,
    }],
}, {
    timestamps: true,
    versionKey: false,
    strict: true
});

const MallaUser = mongoose.model('MallaUser', mallaUserSchema);
export default MallaUser;



