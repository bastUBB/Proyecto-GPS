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
            // Verificar prerrequisitos para Anteproyecto
            if (asig.nombre.toLowerCase().includes('anteproyecto')) {
                // Calcular créditos totales de las asignaturas cursadas
                const asignaturasCursadasCompletas = malla.filter(asigMalla => 
                    cursadasSet.has(asigMalla.nombre?.toLowerCase())
                );
                const creditosTotales = asignaturasCursadasCompletas.reduce((total, asigMalla) => 
                    total + (asigMalla.creditos || 0), 0
                );
                
                const tieneCreditos = creditosTotales >= 240;
                //console.log(`${asig.nombre}: Créditos totales: ${creditosTotales}, Requeridos: 240, Cumple: ${tieneCreditos}`);
                return tieneCreditos;
            }

            // Verificar prerrequisitos para Formaciones Integrales IV y V
            if (asig.nombre.toLowerCase().includes('formación integral iv') || 
                asig.nombre.toLowerCase().includes('formación integral 4')) {
                // Para Formación Integral IV, verificar que estén aprobadas las primeras 3
                const formacionesRequeridas = ['formación integral i', 'formación integral ii', 'formación integral iii'];
                const todasFormacionesAprobadas = formacionesRequeridas.every(formacion => {
                    return Array.from(cursadasSet).some(cursada => 
                        cursada.includes(formacion.replace(/\s+/g, ' ')) || 
                        cursada.includes(formacion.replace(' i', ' 1').replace(' ii', ' 2').replace(' iii', ' 3'))
                    );
                });
                
                //console.log(`${asig.nombre}: Formaciones I, II, III aprobadas: ${todasFormacionesAprobadas}`);
                return todasFormacionesAprobadas;
            }
            
            if (asig.nombre.toLowerCase().includes('formación integral v') || 
                asig.nombre.toLowerCase().includes('formación integral 5')) {
                // Para Formación Integral V, verificar que estén aprobadas las primeras 3
                const formacionesRequeridas = ['formación integral i', 'formación integral ii', 'formación integral iii'];
                const todasFormacionesAprobadas = formacionesRequeridas.every(formacion => {
                    return Array.from(cursadasSet).some(cursada => 
                        cursada.includes(formacion.replace(/\s+/g, ' ')) || 
                        cursada.includes(formacion.replace(' i', ' 1').replace(' ii', ' 2').replace(' iii', ' 3'))
                    );
                });
                
                //console.log(`${asig.nombre}: Formaciones I, II, III aprobadas: ${todasFormacionesAprobadas}`);
                return todasFormacionesAprobadas;
            }

            // Verificar prerrequisitos para prácticas profesionales
            if (esPractica(asig.nombre)) {
                let semestreLimite;
                
                // Determinar el semestre límite según el tipo de práctica
                if (asig.nombre.toLowerCase().includes('práctica profesional 1')) {
                    semestreLimite = 5;
                } else if (asig.nombre.toLowerCase().includes('práctica profesional 2')) {
                    semestreLimite = 7;
                } else {
                    // Para otras prácticas, usar lógica original
                    const semestreAnterior = asig.semestre - 1;
                    const materiasDelSemestreAnterior = malla.filter(materia => 
                        materia.semestre === semestreAnterior && 
                        !esPractica(materia.nombre)
                    );
                    
                    if (materiasDelSemestreAnterior.length === 0) {
                        return true;
                    }
                    
                    return materiasDelSemestreAnterior.every(materia => 
                        cursadasSet.has(materia.nombre?.toLowerCase())
                    );
                }
                
                // Obtener asignaturas de Ingeniería Aplicada desde el horario hasta el semestre límite
                const asignaturasIngenieriaAplicada = horario
                    .filter(h => 
                        h.ambito === 'Ámbito Ingeniería Aplicada' && 
                        h.semestre <= semestreLimite
                    )
                    .map(h => h.nombre?.toLowerCase())
                    .filter(nombre => nombre); // Filtrar nombres válidos
                
                // Buscar estas asignaturas en la malla para validar que existen
                const asignaturasValidasIA = malla
                    .filter(asigMalla => 
                        asignaturasIngenieriaAplicada.includes(asigMalla.nombre?.toLowerCase()) &&
                        asigMalla.semestre <= semestreLimite
                    )
                    .map(asigMalla => asigMalla.nombre?.toLowerCase());
                
                // Verificar que todas las asignaturas de Ingeniería Aplicada estén cursadas
                const todasAprobadas = asignaturasValidasIA.every(nombreAsig => 
                    cursadasSet.has(nombreAsig)
                );
                
                //console.log(`${asig.nombre} (semestre ${asig.semestre}):`);
                //console.log(`- Semestre límite: ${semestreLimite}`);
                //console.log(`- Asignaturas de Ingeniería Aplicada requeridas:`, asignaturasValidasIA);
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