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

        // Convertir asignaturas cursadas a minúsculas para comparación insensible a mayúsculas
        const cursadasSet = new Set(asignaturasCursadas.map(asig => asig.toLowerCase()));

        // Crear conjunto de nombres ofertados en minúsculas desde el horario
        const nombresOfertados = new Set(horario.map(h => h.nombre?.toLowerCase()));

        // Filtrar asignaturas disponibles
        const disponibles = malla.filter(asig => {
            // No incluir si ya está cursada
            if (cursadasSet.has(asig.nombre?.toLowerCase())) {
                return false;
            }
            
            // No incluir si no está ofertada en el horario
            if (!nombresOfertados.has(asig.nombre?.toLowerCase())) {
                return false;
            }
            
            // Verificar que todos los prerrequisitos estén cursados
            return asig.prerrequisitos.every(pr => cursadasSet.has(pr?.toLowerCase()));
        });

        // Si no hay asignaturas disponibles, retornar arrays vacíos
        if (disponibles.length === 0) {
            return [[], []];
        }

        // Algoritmo mejorado: priorizar por semestre y luego por créditos
        // Ordenar por semestre ascendente (prioridad a semestres bajos), luego por créditos descendente, y finalmente por nombre
        const asignaturasOrdenadas = disponibles.sort((a, b) => {
            // Primero por semestre (ascendente - semestres menores tienen prioridad)
            if (a.semestre !== b.semestre) {
                return a.semestre - b.semestre;
            }
            // Si están en el mismo semestre, priorizar por más créditos
            if (a.creditos !== b.creditos) {
                return b.creditos - a.creditos;
            }
            // Si tienen los mismos créditos, ordenar alfabéticamente por nombre
            return a.nombre.localeCompare(b.nombre);
        });
        
        let mejorCombinacion = [];
        let sumaCreditos = 0;
        
        // Algoritmo greedy mejorado: tomar asignaturas priorizando semestres bajos
        for (const asig of asignaturasOrdenadas) {
            if (sumaCreditos + asig.creditos <= 36) {
                mejorCombinacion.push(asig);
                sumaCreditos += asig.creditos;
                
                // Si alcanzamos al menos 24 créditos, podemos parar o continuar con cuidado
                if (sumaCreditos >= 24) {
                    // Solo continuar si podemos agregar asignaturas pequeñas del mismo semestre o siguientes
                    continue;
                }
            }
        }

        // Si no alcanzamos 24 créditos, intentar con algoritmo alternativo
        if (sumaCreditos < 24) {
            mejorCombinacion = [];
            sumaCreditos = 0;
            
            // Segundo intento: solo por créditos descendente si el primer método no funcionó
            const asignaturasPorCreditos = disponibles.sort((a, b) => b.creditos - a.creditos);
            
            for (const asig of asignaturasPorCreditos) {
                if (sumaCreditos + asig.creditos <= 36) {
                    mejorCombinacion.push(asig);
                    sumaCreditos += asig.creditos;
                    
                    if (sumaCreditos >= 24) {
                        break;
                    }
                }
            }
        }

        // Ordenar las asignaturas inscribibles alfabéticamente
        const asignaturasInscribibles = mejorCombinacion
            .map(asig => asig.nombre)
            .sort((a, b) => a.localeCompare(b));

        // Para las no inscribibles: incluir TODAS las asignaturas que no están en inscribibles
        // (tanto las disponibles no seleccionadas como las no disponibles)
        const nombresInscribibles = new Set(asignaturasInscribibles.map(nombre => nombre.toLowerCase()));
        const nombresCursadas = new Set(asignaturasCursadas.map(nombre => nombre.toLowerCase()));
        
        const asignaturasNoInscribibles = malla
            .filter(asig => {
                // No incluir si está en inscribibles
                if (nombresInscribibles.has(asig.nombre?.toLowerCase())) return false;
                // No incluir si ya está cursada
                if (nombresCursadas.has(asig.nombre?.toLowerCase())) return false;
                return true;
            })
            .map(asig => asig.nombre)
            .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente

        return [asignaturasInscribibles, asignaturasNoInscribibles];

    } catch (error) {
        console.error('Error al asignar asignaturas inscribibles:', error);
        return [[], []];
    }
}

export async function createMallaUserService(dataMallaUser) {
    try {
        const { rutUser, asignaturasCursadas } = dataMallaUser;

        const userExist = await User.findOne({ rut: rutUser });

        if (!userExist) return [null, 'El usuario no existe'];

        // Búsqueda insensible a mayúsculas para los nombres de asignaturas
        const asignaturasValidas = await Asignatura.find({ 
            nombre: { 
                $in: asignaturasCursadas.map(nombre => new RegExp(`^${nombre}$`, 'i'))
            } 
        });

        if (asignaturasValidas.length !== asignaturasCursadas.length) return [null, 'Algunas asignaturas cursadas no son válidas'];

        const existingMallaUser = await mallaUser.findOne({ rutUser });

        if (existingMallaUser) return [null, 'El usuario ya tiene una malla creada'];

        const [asignaturasInscribibles, asignaturasNoInscribibles] = await asignarAsignaturas(asignaturasCursadas);

        // Verificar que la función devolvió arrays válidos
        if (!Array.isArray(asignaturasInscribibles) || !Array.isArray(asignaturasNoInscribibles)) {
            return [null, 'Error al asignar asignaturas'];
        }

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
        
        // Búsqueda insensible a mayúsculas para las asignaturas
        const asignaturasValidas = await Asignatura.find({ 
            codigo: { 
                $in: nuevasAsignaturasCursadas.map(codigo => new RegExp(`^${codigo}$`, 'i'))
            } 
        });

        if (asignaturasValidas.length !== nuevasAsignaturasCursadas.length) return [null, 'Algunas asignaturas cursadas no son válidas'];

        const mallaUserExist = await mallaUser.findOne({ rutUser: nuevoRutUser, asignaturasCursadas: nuevasAsignaturasCursadas });

        if (mallaUserExist) return [null, 'La malla del usuario ya existe con las asignaturas cursadas proporcionadas'];

        const [asignaturasInscribibles, asignaturasNoInscribibles] = await asignarAsignaturas(nuevasAsignaturasCursadas);

        // Verificar que la función devolvió arrays válidos
        if (!Array.isArray(asignaturasInscribibles) || !Array.isArray(asignaturasNoInscribibles)) {
            return [null, 'Error al asignar asignaturas'];
        }

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