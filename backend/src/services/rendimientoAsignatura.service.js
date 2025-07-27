import fs from 'fs';
import path from 'path';
import rendimientoAsignatura from '../models/rendimientoAsignatura.model.js';   
import Asignatura from '../models/asignaturas.model.js';
import User from '../models/user.model.js';

const datosRendimiento = path.resolve('output/datos_rendimiento.json');
const datosRendimientoRaw = fs.readFileSync(datosRendimiento);
const datosRendimientoParsed = JSON.parse(datosRendimientoRaw).datos;

const horarioPath = path.resolve('output/horario_extraido.json');
const horarioRaw = fs.readFileSync(horarioPath);
const horario = JSON.parse(horarioRaw);

export async function buscarRendimiento(docente, asignatura, seccion, semestre, año) {
    try {
        asignatura = asignatura.toUpperCase();

        const partesNombre = docente.trim().split(/\s+/);

        const nombre = partesNombre.slice(0, -2).join(' ').toUpperCase();

        const apellido1 = partesNombre.length > 1 ? partesNombre[partesNombre.length - 2].toUpperCase() : '';

        const apellido2 = partesNombre.length > 0 ? partesNombre[partesNombre.length - 1].toUpperCase() : '';

        const docenteFormateado = `${apellido1} ${apellido2} ,${nombre}`;

        const horarioAsignatura = horario.find((h) => {
            return h.asignatura === asignatura &&
                h.seccion === seccion &&
                h.docente === docenteFormateado;
        });

        console.log('Horario Asignatura encontrada:', horarioAsignatura);

        if (!horarioAsignatura) return [null, 'No se encontró la asignatura en el horario de ofertas para el docente especificado'];

        const codigoSeccion = `${horarioAsignatura.asignaturaCodigo}-${seccion}`;

        const rendimiento = datosRendimientoParsed.find((r) => {
            return r.codigoSeccion === codigoSeccion &&
                r.año === año &&
                r.semestre === semestre;
        });

        if (!rendimiento) {
            console.log('Primeros 3 elementos de datosRendimientoParsed:', datosRendimientoParsed.slice(0, 3));
            return [null, 'No se encontró rendimiento asociado para la asignatura'];
        }

        return [{
            porcentajeAprob: rendimiento.porcentajeAprobacion,
            totalInscritos: rendimiento.inscritos,
        }, null];

    } catch (error) {
        console.error('Error al asignar porcentajes:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function createRendimientoAsignaturaService(dataRendimiento) {
    try {

        const { asignatura, docente, seccion, semestre, año } = dataRendimiento;

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, `La asignatura "${asignatura}" que desea crear no existe`];

        const existDocente = await User.findOne({ nombreCompleto: docente, role: "profesor" });

        if (!existDocente) return [null, 'El docente que desea crear no existe'];

        const [rendimientoData, error] = await buscarRendimiento(docente, asignatura, seccion, semestre, año);

        if (error) return [null, error];

        const rendimientoAsignaturaData = {
            asignatura: asignatura,
            docente: docente,
            seccion: seccion,
            semestre: semestre,
            porcentajeAprob: rendimientoData.porcentajeAprob,
            año: año,
            totalInscritos: rendimientoData.totalInscritos,
        };

        const rendimientoSaved = await rendimientoAsignatura.create(rendimientoAsignaturaData);

        if (!rendimientoSaved) return [null, 'Error al guardar el rendimiento de la asignatura'];

        return [rendimientoSaved, null];
    } catch (error) {
        console.error('Error al crear el rendimiento de la asignatura:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function crearTodosLosRendimientosExistentes() {
    try {
        console.log('Iniciando creación masiva de rendimientos...');
        
        const rendimientosCreados = [];
        const errores = [];
        
        function convertirNombreDocente(docenteHorario) {
            // Formato horario: "SUAREZ MUÑOZ ,DAYAN RICARDO"
            // Formato esperado: "Suarez Muñoz Dayan Ricardo"
            
            const partes = docenteHorario.split(',');
            if (partes.length !== 2) return docenteHorario;
            
            const apellidos = partes[0].trim();
            const nombres = partes[1].trim();
            
            function capitalizar(palabra) {
                return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
            }
            
            const apellidosFormateados = apellidos.split(' ').map(capitalizar).join(' ');
            const nombresFormateados = nombres.split(' ').map(capitalizar).join(' ');
            
            return `${apellidosFormateados} ${nombresFormateados}`;
        }

        // Iterar sobre cada item del horario
        for (const horarioItem of horario) {
            try {
                const { asignaturaCodigo, seccion, asignatura, docente } = horarioItem;
                
                if (!asignaturaCodigo || !seccion || !asignatura || !docente) {
                    console.log(`Datos incompletos en horario: ${JSON.stringify(horarioItem)}`);
                    continue;
                }

                const docenteConvertido = convertirNombreDocente(docente);
                
                const asignaturaEncontrada = await Asignatura.findOne({ codigo: asignaturaCodigo });
                if (!asignaturaEncontrada) {
                    console.log(`No se encontró asignatura con código: ${asignaturaCodigo}`);
                    continue;
                }

                const docenteEncontrado = await User.findOne({ 
                    nombreCompleto: docenteConvertido, 
                    role: "profesor" 
                });
                if (!docenteEncontrado) {
                    console.log(`No se encontró docente: ${docenteConvertido}`);
                    continue;
                }
                
                const codigoSeccionBuscado = `${asignaturaCodigo}-${seccion}`;
                
                const rendimientosCoincidentes = datosRendimientoParsed.filter(r => 
                    r.codigoSeccion === codigoSeccionBuscado
                );

                if (rendimientosCoincidentes.length === 0) {
                    console.log(`No se encontraron rendimientos para código: ${codigoSeccionBuscado}`);
                    continue;
                }

                for (const rendimientoData of rendimientosCoincidentes) {
                    try {
                        const rendimientoExistente = await rendimientoAsignatura.findOne({
                            asignatura: asignaturaEncontrada.nombre,
                            docente: docenteConvertido,
                            seccion: seccion,
                            semestre: parseInt(rendimientoData.semestre),
                            año: rendimientoData.año.toString()
                        });

                        if (rendimientoExistente) {
                            console.log(`Ya existe rendimiento para: ${asignaturaEncontrada.nombre} - ${docenteConvertido} - ${rendimientoData.semestre}/${rendimientoData.año}`);
                            continue;
                        }

                        const rendimientoAsignaturaData = {
                            asignatura: asignaturaEncontrada.nombre,
                            docente: docenteConvertido,
                            seccion: seccion,
                            semestre: parseInt(rendimientoData.semestre),
                            porcentajeAprob: rendimientoData.porcentajeAprobacion,
                            año: rendimientoData.año.toString(),
                            totalInscritos: rendimientoData.inscritos,
                        };
                            
                        console.log(`Intentando crear rendimiento para: ${asignaturaEncontrada.nombre} - ${docenteConvertido} - Sec:${seccion} - ${rendimientoData.semestre}/${rendimientoData.año}`);

                        const rendimientoSaved = await rendimientoAsignatura.create(rendimientoAsignaturaData);
                        
                        if (!rendimientoSaved) {
                            console.log(`Error al guardar rendimiento para: ${asignaturaEncontrada.nombre} - ${docenteConvertido}`);
                            errores.push({
                                datos: rendimientoAsignaturaData,
                                error: 'Error al guardar en la base de datos'
                            });
                        } else {
                            console.log(`✓ Rendimiento creado exitosamente para: ${asignaturaEncontrada.nombre} - ${docenteConvertido} - ${rendimientoData.semestre}/${rendimientoData.año}`);
                            rendimientosCreados.push(rendimientoSaved);
                        }

                    } catch (rendimientoError) {
                        console.error(`Error procesando rendimiento individual:`, rendimientoError);
                        errores.push({
                            datos: { asignatura: asignaturaEncontrada?.nombre, docenteConvertido, seccion, año: rendimientoData.año, semestre: rendimientoData.semestre },
                            error: rendimientoError.message
                        });
                    }
                }

            } catch (itemError) {
                console.error(`Error procesando item del horario:`, itemError);
                errores.push({
                    datos: horarioItem,
                    error: itemError.message
                });
            }
        }

        console.log(`\n=== RESUMEN ===`);
        console.log(`Total de rendimientos creados: ${rendimientosCreados.length}`);
        console.log(`Total de errores: ${errores.length}`);
        
        if (errores.length > 0) {
            console.log('\nPrimeros 5 errores:');
            errores.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. ${error.error} - Datos: ${JSON.stringify(error.datos)}`);
            });
        }

        return [
            {
                rendimientosCreados: rendimientosCreados,
                totalCreados: rendimientosCreados.length,
                totalErrores: errores.length,
                errores: errores
            }, 
            null
        ];

    } catch (error) {
        console.error('Error al crear todos los rendimientos existentes:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getRendimientoAsignaturaService(query) {
    try {
        const { asignatura, docente, seccion, semestre, año } = query;

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea consultar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rolee: "profesor" });

        if (!existDocente) return [null, 'El docente que desea consultar no existe'];

        const rendimiento = await rendimientoAsignatura.findOne({
            asignatura: asignatura,
            docente: docente,
            seccion: seccion,
            semestre: semestre,
            año: año
        });

        if (!rendimiento) return [null, 'No se encontró el rendimiento de la asignatura'];

        return [rendimiento, null];
    } catch (error) {
        console.error('Error al obtener el rendimiento de la asignatura:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllRendimientosAsignaturaService() {
    try {
        const rendimientos = await rendimientoAsignatura.find();

        if (!rendimientos || rendimientos.length === 0) return [null, 'No se encontraron rendimientos de asignaturas'];

        return [rendimientos, null];
    } catch (error) {
        console.error('Error al obtener todos los rendimientos de asignaturas:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function updateRendimientoAsignaturaService(query, body) {
    try {
        const { asignatura, docente, seccion, semestre, año } = query;

        const asignaturaExist = await Asignatura.findOne({ nombre: asignatura });

        if (!asignaturaExist) return [null, 'La asignatura que desea actualizar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, role: "profesor" });

        if (!existDocente) return [null, 'El docente que desea actualizar no existe'];

        const { asignatura: nuevaAsignatura, docente: nuevoDocente, seccion: nuevaSeccion,
            semestre: nuevoSemestre, año: nuevoAño } = body;

        const nuevaAsignaturaExist = await Asignatura.findOne({ nombre: nuevaAsignatura });

        if (!nuevaAsignaturaExist) return [null, 'La nueva asignatura no existe'];

        const nuevoDocenteExist = await User.findOne({ nombreCompleto: nuevoDocente, role: "profesor" });

        if (!nuevoDocenteExist) return [null, 'El nuevo docente no existe'];


        const buscarAsignaturaDatosBody = await rendimientoAsignatura.findOne({
            asignatura: nuevaAsignatura,
            docente: nuevoDocente,
            seccion: nuevaSeccion,
            semestre: nuevoSemestre,
            año: nuevoAño
        });

        if (buscarAsignaturaDatosBody) return [null, 'Ya existe un rendimiento con los datos proporcionados'];

        const rendimientoUpdated = await rendimientoAsignatura.findOneAndUpdate(
            { asignatura, docente, seccion, semestre, año },
            body,
            { new: true }
        );

        if (!rendimientoUpdated) return [null, 'No se encontró el rendimiento de la asignatura para actualizar'];

        return [rendimientoUpdated, null];
    } catch (error) {
        console.error('Error al actualizar el rendimiento de la asignatura:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function deleteRendimientoAsignaturaService(query) {
    try {
        const { asignatura, docente, seccion, semestre, año } = query;

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea eliminar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, role: "profesor" });

        if (!existDocente) return [null, 'El docente que desea eliminar no existe'];

        const rendimientoDeleted = await rendimientoAsignatura.findOneAndDelete({
            asignatura: asignatura,
            docente: docente,
            seccion: seccion,
            semestre: semestre,
            año: año
        });

        if (!rendimientoDeleted) return [null, 'No se encontró el rendimiento de la asignatura para eliminar'];

        return [rendimientoDeleted, null];
    } catch (error) {
        console.error('Error al eliminar el rendimiento de la asignatura:', error);
        return [null, 'Error interno del servidor'];
    }
}

