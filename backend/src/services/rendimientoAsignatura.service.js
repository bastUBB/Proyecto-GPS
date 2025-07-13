import rendimientoAsignatura from '../models/rendimientoAsignatura.model.js';
import Asignatura from '../models/asignaturas.model.js';

export async function createRendimientoAsignaturaService(dataRendimiento) {
    try {
        const { asignatura, docente } = dataRendimiento;

        const existAsignatura = await Asignatura.find({ _id: { $in: asignatura } });

        if (!existAsignatura || existAsignatura.length === 0) return [null, 'La asingatura que desea asociar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });
        
        if (!existDocente) return [null, 'El docente que desea asociar no existe'];

        const newRendimiento = new rendimientoAsignatura(dataRendimiento);

        if (!newRendimiento) return [null, 'Error al crear el rendimiento de la asignatura'];

        const rendimientoSaved = await newRendimiento.save();

        return [rendimientoSaved, null];
    } catch (error) {
        console.error('Error al crear el rendimiento de la asignatura:', error);
        return [null, 'Error interno del servidor'];
    }
}

export async function getRendimientoAsignaturaService(query) {
    try {
        const { asignatura, docente, añoRegistro } = query;

        const existAsignatura = await Asignatura.find({ _id: { $in: asignatura } });

        if (!existAsignatura || existAsignatura.length === 0) return [null, 'No existe la asignatura que desea consultar'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea consultar no existe'];

        const rendimiento = await rendimientoAsignatura.find({ asignatura, docente, añoRegistro });

        if (!rendimiento || rendimiento.length === 0) return [null, 'No se encontraron rendimientos con los datos proporcionados'];

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
        const { asignatura, docente, añoRegistro } = query;

        const existAsignatura = await Asignatura.find({ _id: { $in: asignatura } });

        if (!existAsignatura || existAsignatura.length === 0) return [null, 'La asignatura que desea consultar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea consultar no existe'];

        const { asignatura: nuevaAsignatura, docente: nuevoDocente } = body;

        const existNuevaAsignatura = await Asignatura.find({ _id: { $in: nuevaAsignatura } });

        if (!existNuevaAsignatura || existNuevaAsignatura.length === 0) return [null, 'La nueva asignatura que desea actualizar no existe'];

        const existNuevoDocente = await User.findOne({ nombreCompleto: nuevoDocente, rol: "docente" });

        if (!existNuevoDocente) return [null, 'El nuevo docente que desea actualizar no existe'];

        const rendimientoUpdated = await rendimientoAsignatura.findOneAndUpdate(
            { asignatura, docente, añoRegistro },
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
        const { asignatura, docente, añoRegistro } = query;

        const existAsignatura = await Asignatura.find({ _id: { $in: asignatura } });

        if (!existAsignatura || existAsignatura.length === 0) return [null, 'La asignatura que desea eliminar no existe'];

        const existDocente = await User.findOne({ nombreCompleto: docente, rol: "docente" });

        if (!existDocente) return [null, 'El docente que desea eliminar no existe'];

        const rendimientoDeleted = await rendimientoAsignatura.findOneAndDelete({ asignatura, docente, añoRegistro });

        if (!rendimientoDeleted) return [null, 'No se encontró el rendimiento de la asignatura para eliminar'];

        return [rendimientoDeleted, null];
    } catch (error) {
        console.error('Error al eliminar el rendimiento de la asignatura:', error);
        return [null, 'Error interno del servidor'];
    }
}