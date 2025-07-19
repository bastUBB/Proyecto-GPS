import mallaUser from '../models/mallaUser.model.js';
import Asignatura from '../models/asignaturas.model.js';
import User from '../models/user.model.js';
import fs from 'fs';
import path from 'path';

const horarioPath = path.resolve('output/horario_manual.json');
const horarioRaw = fs.readFileSync(horarioPath);
const horario = JSON.parse(horarioRaw);

export async function asignarAsignaturas(asignaturasCursadas) {
    try {
        const malla = await Asignatura.find();

        const cursadasSet = new Set(asignaturasCursadas);

        const codigosOfertados = new Set(horario.map(h => h.asignaturaCodigo));

        const disponibles = malla.filter(asig => {
            if (cursadasSet.has(asig.codigo)) return false;
            if (!codigosOfertados.has(asig.codigo)) return false;
            return asig.prerrequisitos.every(pr => cursadasSet.has(pr));
        });

        const combinacionesValidas = [];

        function backtrack(combo, index, sumaCreditos) {
            if (sumaCreditos >= 24 && sumaCreditos <= 36) {
                combinacionesValidas.push([...combo]);
            }
            if (sumaCreditos >= 36 || index >= disponibles.length) {
                return;
            }

            for (let i = index; i < disponibles.length; i++) {
                const asig = disponibles[i];
                combo.push(asig);
                backtrack(combo, i + 1, sumaCreditos + asig.creditos);
                combo.pop();
            }
        }

        backtrack([], 0, 0);

        // Escoge la mejor combinación (mayor carga dentro del rango permitido)
        const mejorOpcion = combinacionesValidas.sort((a, b) => {
            const sumaA = a.reduce((acc, cur) => acc + cur.creditos, 0);
            const sumaB = b.reduce((acc, cur) => acc + cur.creditos, 0);
            return sumaB - sumaA;
        })[0] || [];

        const asignaturasInscribibles = mejorOpcion.map(asig => asig.nombre);

        const preNoInscribibles = disponibles.filter(asig => !mejorOpcion.includes(asig));

        const asignaturasNoInscribibles = preNoInscribibles.map(asig => asig.nombre);

        return [asignaturasInscribibles, asignaturasNoInscribibles];

    } catch (error) {
        console.error('Error al asignar asignaturas inscribibles:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function createMallaUserService(dataMallaUser) {
    try {
        const { rutUser, asignaturasCursadas } = dataMallaUser;

        const userExist = await User.findOne({ rut: rutUser });

        if (!userExist) return [null, 'El usuario no existe'];

        const asignaturasValidas = await Asignatura.find({ codigo: { $in: asignaturasCursadas } });

        if (asignaturasValidas.length !== asignaturasCursadas.length) return [null, 'Algunas asignaturas cursadas no son válidas'];

        const existingMallaUser = await mallaUser.findOne({ rutUser });

        if (existingMallaUser) return [null, 'El usuario ya tiene una malla creada'];

        const [asignaturasInscribibles, asignaturasNoInscribibles] = await asignarAsignaturas(asignaturasCursadas);

        if (!asignaturasInscribibles && !asignaturasNoInscribibles) return [null, 'Error al asignar asignaturas'];

        const newMallaUser = new mallaUser({
            rutUser,
            asignaturasCursadas,
            asignaturasInscribibles,
            asignaturasNoInscribibles
        });

        const savedMallaUser = await newMallaUser.save();

        return [savedMallaUser, null];

    } catch (error) {
        console.error('Error al crear la malla del usuario:', error);
        return [null, 'Error al crear el usuario de la malla'];
    }
}

export async function getMallaUserService(query) {
    try {
        const { rutUser } = query;

        const mallaUser = await mallaUser.findOne({ rutUser });

        if (!mallaUser) return [null, 'Malla del usuario no encontrada'];

        return [mallaUser, null];
    } catch (error) {
        console.error('Error al obtener la malla del usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateMallaUserService(query, body) {
    try {
        const { rutUser } = query;

        const userExist = await User.findOne({ rut: rutUser });

        if (!userExist) return [null, 'El usuario no existe'];

        const { rutUser: nuevoRutUser, asignaturasCursadas: nuevasAsignaturasCursadas } = body;

        const newUserExist = await mallaUser.findOne({ rutUser: nuevoRutUser });

        if (!newUserExist && nuevoRutUser !== rutUser) return [null, 'El nuevo rut del usuario ya está en uso'];
        
        const asignaturasValidas = await Asignatura.find({ codigo: { $in: nuevasAsignaturasCursadas } });

        if (asignaturasValidas.length !== nuevasAsignaturasCursadas.length) return [null, 'Algunas asignaturas cursadas no son válidas'];

        const mallaUserExist = await mallaUser.findOne({ rutUser: nuevoRutUser, asignaturasCursadas: nuevasAsignaturasCursadas });

        if (mallaUserExist) return [null, 'La malla del usuario ya existe con las asignaturas cursadas proporcionadas'];

        const [asignaturasInscribibles, asignaturasNoInscribibles] = await asignarAsignaturas(nuevasAsignaturasCursadas);

        if (!asignaturasInscribibles && !asignaturasNoInscribibles) return [null, 'Error al asignar asignaturas'];

        const updatedMallaUser = await mallaUser.findOneAndUpdate(
            { rutUser },
            body,
            { new: true }
        );

        if (!updatedMallaUser) return [null, 'Error al actualizar la malla del usuario'];

        return [updatedMallaUser, null];

    } catch (error) {
        console.error('Error al actualizar la malla del usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteMallaUserService(query) {
    try {
        const { rutUser } = query;

        const mallaUserExist = await mallaUser.findOne({ rutUser });

        if (!mallaUserExist) return [null, 'Malla del usuario no encontrada'];

        const deletedMallaUser = await mallaUser.findOneAndDelete({ rutUser });

        if (!deletedMallaUser) return [null, 'Error al eliminar la malla del usuario'];

        return [deletedMallaUser, null];
    } catch (error) {
        console.error('Error al eliminar la malla del usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}