import fs from 'fs';
import path from 'path';
import rendimientoAsignatura from '../models/rendimientoAsignatura.model.js';
import Asignatura from '../models/asignaturas.model.js';
import User from '../models/user.model.js';

const datosRendimiento = path.resolve('output/datos_rendimiento.json');
const datosRendimientoRaw = fs.readFileSync(datosRendimiento);
const datosRendimientoParsed = JSON.parse(datosRendimientoRaw);

const horarioPath = path.resolve('output/horario_manual.json');
const horarioRaw = fs.readFileSync(horarioPath);
const horario = JSON.parse(horarioRaw);

export async function buscarRendimiento(docente, asignatura, seccion, semestre, año) {
    try {

        asignatura = asignatura.toUpperCase();

        const partesNombre = docente.trim().split(/\s+/);

        const nombre = partesNombre.slice(0, -2).join(' ').toUpperCase();

        const apellido1 = partesNombre.length > 1 ? partesNombre[partesNombre.length - 2].toUpperCase() : '';

        const apellido2 = partesNombre.length > 0 ? partesNombre[partesNombre.length - 1].toUpperCase() : '';

        const docenteFormateado = `${apellido1} ${apellido2}, ${nombre}`;

        const horarioAsignatura = horario.find((h) =>
            h.asignatura === asignatura &&
            h.seccion === seccion &&
            h.docente === docenteFormateado
        );

        if (!horarioAsignatura) return [null, 'No se encontró la asignatura en el horario de ofertas para el docente especificado'];
        
        const codigoSeccion = `${horarioAsignatura.asignaturaCodigo}-${seccion}`;

        const rendimiento = datosRendimientoParsed.find((r) =>
            r.codigoSeccion === codigoSeccion &&
            r.año === String(año) &&
            r.semestre === parseInt(semestre)
        );

        if (!rendimiento) return [null, 'No se encontró rendimiento asociado para la asignatura'];
        
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

        if (!existAsignatura) return [null, 'La asignatura que desea crear no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "profesor" });

        if (!existDocente) return [null, 'El docente que desea crear no existe'];

        //asignar datos de rendimiento
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

export async function getRendimientoAsignaturaService(query) {
    try {
        const { asignatura, docente, seccion, semestre, año } = query;

        const existAsignatura = await Asignatura.findOne({ nombre: asignatura });

        if (!existAsignatura) return [null, 'La asignatura que desea consultar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "profesor" });

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

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "profesor" });

        if (!existDocente) return [null, 'El docente que desea actualizar no existe'];

        const { asignatura: nuevaAsignatura, docente: nuevoDocente, seccion: nuevaSeccion, 
            semestre: nuevoSemestre, año: nuevoAño } = body;

        const nuevaAsignaturaExist = await Asignatura.findOne({ nombre: nuevaAsignatura });

        if (!nuevaAsignaturaExist) return [null, 'La nueva asignatura no existe'];

        const nuevoDocenteExist = await User.findOne({ nombreCompleto: nuevoDocente, rol: "profesor" });

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

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "profesor" });

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