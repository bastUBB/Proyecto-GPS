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

        // Determinar el semestre actual del estudiante (el más alto de las materias cursadas)
        const asignaturasCursadasCompletas = malla.filter(asig => 
            cursadasSet.has(asig.nombre?.toLowerCase())
        );
        const semestreActual = asignaturasCursadasCompletas.length > 0 
            ? Math.max(...asignaturasCursadasCompletas.map(asig => asig.semestre))
            : 1;
        
        const maxSemestrePermitido = semestreActual + 2; // Máximo 2 semestres de adelantamiento

        // Función para verificar si es una práctica profesional
        const esPractica = (nombre) => nombre.toLowerCase().includes('práctica profesional');

        // Función para verificar prerrequisitos de prácticas
        const verificarPrerrequisitosEspeciales = (asig) => {
            if (esPractica(asig.nombre)) {
                // Para prácticas: verificar que todas las materias del semestre inmediatamente anterior estén aprobadas
                const semestreAnterior = asig.semestre - 1;
                const materiasDelSemestreAnterior = malla.filter(materia => 
                    materia.semestre === semestreAnterior && 
                    !esPractica(materia.nombre) // No considerar otras prácticas como prerrequisito
                );
                
                // Si no hay materias en el semestre anterior, permitir la práctica
                if (materiasDelSemestreAnterior.length === 0) {
                    return true;
                }
                
                // Verificar que todas las materias del semestre anterior estén cursadas
                const todasAprobadas = materiasDelSemestreAnterior.every(materia => 
                    cursadasSet.has(materia.nombre?.toLowerCase())
                );
                
                //console.log(`Práctica ${asig.nombre} (semestre ${asig.semestre}):`);
                //console.log(`- Materias del semestre ${semestreAnterior}:`, materiasDelSemestreAnterior.map(m => m.nombre));
                //console.log(`- Todas aprobadas: ${todasAprobadas}`);
                
                return todasAprobadas;
            }
            return true; // Para asignaturas normales, no hay restricciones especiales
        };

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
            
            // Verificar límite de semestres (máximo 2 semestres de adelantamiento)
            if (asig.semestre > maxSemestrePermitido) {
                return false;
            }
            
            // Verificar prerrequisitos normales
            const prerequisitosNormales = asig.prerrequisitos.every(pr => 
                cursadasSet.has(pr?.toLowerCase())
            );
            
            if (!prerequisitosNormales) {
                return false;
            }
            
            // Verificar prerrequisitos especiales (para prácticas)
            return verificarPrerrequisitosEspeciales(asig);
        });

        // Si no hay asignaturas disponibles, retornar arrays vacíos
        if (disponibles.length === 0) {
            return [[], []];
        }

        // Mostrar TODAS las asignaturas disponibles como inscribibles
        // Ordenar por semestre ascendente, luego por tipo (normales antes que formaciones), luego por créditos descendente, luego por nombre
        const asignaturasInscribibles = disponibles
            .sort((a, b) => {
                // Primero por semestre (ascendente)
                if (a.semestre !== b.semestre) {
                    return a.semestre - b.semestre;
                }
                
                // Luego priorizar asignaturas normales sobre formaciones integrales
                const aEsFormacion = a.nombre.toLowerCase().includes('formación integral');
                const bEsFormacion = b.nombre.toLowerCase().includes('formación integral');
                
                if (aEsFormacion !== bEsFormacion) {
                    return aEsFormacion ? 1 : -1; // Normales primero
                }
                
                // Luego por créditos descendente
                if (a.creditos !== b.creditos) {
                    return b.creditos - a.creditos;
                }
                
                // Finalmente por nombre alfabético
                return a.nombre.localeCompare(b.nombre);
            })
            .map(asig => asig.nombre);

        //console.log(`Semestre actual del estudiante: ${semestreActual}`);
        //console.log(`Máximo semestre permitido: ${maxSemestrePermitido}`);
        //console.log(`Total asignaturas inscribibles: ${asignaturasInscribibles.length}`);

        // Para las no inscribibles: incluir TODAS las asignaturas que no están en inscribibles
        // (tanto las no disponibles como las que exceden el límite de semestres)
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

        //console.log('Datos recibidos para obtener la malla del usuario:', rutUser);

        const MallaUser = await mallaUser.findOne({ rutUser });

        //console.log('Datos obtenidos de la malla del usuario:', MallaUser);

        if (!MallaUser) return [null, 'Malla del usuario no encontrada'];

        return [MallaUser, null];
    } catch (error) {
        console.error('Error al obtener la malla del usuario:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateMallaUserService(query, body) {
    try {

        const { rutUser } = query;

        //console.log('Datos recibidos para actualizar la malla del usuario (service):', body);

        const userExist = await User.findOne({ rut: rutUser });

        if (!userExist) return [null, 'El usuario no existe'];

        const { rutUser: nuevoRutUser, asignaturasCursadas: nuevasAsignaturasCursadas } = body;

        // Si no hay nuevoRutUser, usar el rutUser de la query
        const targetRutUser = nuevoRutUser || rutUser;

        // Búsqueda insensible a mayúsculas para las asignaturas por nombre
        const asignaturasValidas = await Asignatura.find({ 
            nombre: { 
                $in: nuevasAsignaturasCursadas.map(nombre => new RegExp(`^${nombre}$`, 'i'))
            } 
        });

        if (asignaturasValidas.length !== nuevasAsignaturasCursadas.length) return [null, 'Algunas asignaturas cursadas no son válidas'];

        // Verificar si ya existe la malla del usuario
        const existingMallaUser = await mallaUser.findOne({ rutUser: targetRutUser });

        const [asignaturasInscribibles, asignaturasNoInscribibles] = await asignarAsignaturas(nuevasAsignaturasCursadas);

        // Verificar que la función devolvió arrays válidos
        if (!Array.isArray(asignaturasInscribibles) || !Array.isArray(asignaturasNoInscribibles)) {
            return [null, 'Error al asignar asignaturas'];
        }

        const mallaData = {
            rutUser: targetRutUser,
            asignaturasCursadas: nuevasAsignaturasCursadas,
            asignaturasInscribibles,
            asignaturasNoInscribibles
        };

        let updatedMallaUser;

        if (existingMallaUser) {
            // Actualizar la malla existente
            updatedMallaUser = await mallaUser.findOneAndUpdate(
                { rutUser: targetRutUser },
                mallaData,
                { new: true }
            );
        } else {
            // Crear nueva malla si no existe
            updatedMallaUser = new mallaUser(mallaData);
            await updatedMallaUser.save();
        }

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