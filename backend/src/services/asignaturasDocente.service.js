import asignaturasDocente from "../models/asignaturasDocente.model.js";
import User from "../models/user.model.js";
import rendimientoAsignatura from "../models/rendimientoAsignatura.model.js";

export async function buscarAsignaturasDocente(docente) {
    try {
        const rendimientos = await rendimientoAsignatura.find({ docente: docente });

        if (!rendimientos || rendimientos.length === 0) return [[], "No existen rendimientos para el docente"];

        const nombresAsignaturas = [...new Set(rendimientos.map(r => r.asignatura))];

        return [nombresAsignaturas, null];

    } catch (error) {
        console.error('Error al buscar asignaturas del docente:', error);
        return [null, 'Error al buscar asignaturas del docente'];
    }
}

export async function crearAsignaturasDocenteService(asignaturasDocenteData) {
    try {
        const { profesor } = asignaturasDocenteData;

        const docenteExist = await User.findOne({ nombreCompleto: profesor, role: "profesor" });

        if (!docenteExist) return [null, 'El profesor no existe'];

        const [asignaturas, error] = await buscarAsignaturasDocente(docenteExist.nombreCompleto);

        if (error) return [null, error];

        const nuevoRegistro = await asignaturasDocente.create({
            docente: docenteExist.nombreCompleto, // Cambiar 'profesor' por 'docente'
            asignaturas: asignaturas
        });

        if (!nuevoRegistro) return [null, 'Error al crear el registro de asignaturas del docente'];

        return [nuevoRegistro, null];
    } catch (error) {
        console.error('Error al crear el registro de asignaturas del docente:', error);
        return [null, 'Error al crear el registro de asignaturas del docente'];
    }
}

export async function crearAsignaturasDocentes() {
    try {
        const profesoresExistentes = await User.find({ role: "profesor" });

        if (!profesoresExistentes || profesoresExistentes.length === 0) return [null, 'No existen profesores para crear asignaturas docentes'];

        const asignaturasDocentesPromises = profesoresExistentes.map(async (profesor) => {
            try {
                const [asignaturas, error] = await buscarAsignaturasDocente(profesor.nombreCompleto);

                if (error) {
                    console.log(`Error buscando asignaturas para ${profesor.nombreCompleto}: ${error}`);
                    return { success: false, error: error, profesor: profesor.nombreCompleto };
                }

                if (asignaturas.length === 0) {
                    console.log(`No se encontraron asignaturas para ${profesor.nombreCompleto}`);
                    return { success: false, error: 'No hay asignaturas', profesor: profesor.nombreCompleto };
                }

                const resultado = await asignaturasDocente.create({
                    docente: profesor.nombreCompleto,
                    asignaturas: asignaturas
                });

                return { success: true, data: resultado, profesor: profesor.nombreCompleto };
            } catch (createError) {
                console.error(`Error creando registro para ${profesor.nombreCompleto}:`, createError);
                return { success: false, error: createError.message, profesor: profesor.nombreCompleto };
            }
        });

        const resultados = await Promise.all(asignaturasDocentesPromises);
        const errores = resultados.filter(r => !r.success);
        const exitos = resultados.filter(r => r.success).map(r => r.data);

        console.log(`\n=== RESUMEN ASIGNATURAS-DOCENTES ===`);
        console.log(`Total procesados: ${resultados.length}`);
        console.log(`Exitosos: ${exitos.length}`);
        console.log(`Con errores: ${errores.length}`);

        if (errores.length > 0) {
            console.log('\nPrimeros 5 errores:');
            errores.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. ${error.profesor}: ${error.error}`);
            });
        }

        return [
            {
                registrosCreados: exitos,
                totalCreados: exitos.length,
                totalErrores: errores.length,
                errores: errores
            }, 
            null
        ];

    } catch (error) {
        console.error('Error al crear múltiples registros de asignaturas del docente:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getAllAsignaturasDocenteService() {
    try {
        const registros = await asignaturasDocente.find({});
        return [registros, null];
    } catch (error) {
        console.error('Error al obtener asignaturas del docente:', error);
        return [null, 'Error al obtener asignaturas del docente'];
    }
}
