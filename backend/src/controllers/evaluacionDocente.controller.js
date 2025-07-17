import{
createEvaluacionDocenteService,
getEvaluacionDocenteService,
getAllEvaluacionesDocenteService,
getEvaluacionesByDocenteService,
updateEvaluacionDocenteService,
updateEvaluacionByIdService,
deleteEvaluacionDocenteService,
createEvaluacionByAlumnoService,
getDocentesListService,
getAsignaturasListService,
deleteEvaluacionByIdService
} from '../services/evaluacionDocente.service.js';
import { evaluacionDocenteQueryValidation, evaluacionDocenteBodyValidation, createEvaluacionAlumnoValidation } from '../validations/evaluacionDocente.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function createEvaluacionDocente(req, res) {
    try {
        const evaluacionDocente = req.body;

        const { value, error } = evaluacionDocenteBodyValidation.validate(evaluacionDocente);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newEvaluacionDocente, errorNewEvaluacionDocente] = await createEvaluacionDocenteService(value);

        if (errorNewEvaluacionDocente) return handleErrorClient(res, 400, "Error registrando la evaluación docente", errorNewEvaluacionDocente);

        handleSuccess(res, 201, "Evaluación docente registrada con éxito", newEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getEvaluacionDocente(req, res) {
    try {
        const evaluacionDocenteQuery = req.query;

        const { errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [evaluacionDocente, errorEvaluacionDocente] = await getEvaluacionDocenteService(evaluacionDocenteQuery);

        if (errorEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente encontrada", evaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllEvaluacionesDocente(req, res) {
    try {
        const [evaluacionesDocente, errorEvaluacionesDocente] = await getAllEvaluacionesDocenteService();

        if (errorEvaluacionesDocente) return handleErrorClient(res, 404, "No hay evaluaciones docentes registradas", errorEvaluacionesDocente);

        handleSuccess(res, 200, "Evaluaciones docentes encontradas", evaluacionesDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateEvaluacionDocente(req, res) {
    try {
        const evaluacionDocenteQuery = req.query;

        const { errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const { value, errorBody } = evaluacionDocenteBodyValidation.validate(req.body);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación en el cuerpo", errorBody.message);

        const [updatedEvaluacionDocente, errorUpdatedEvaluacionDocente] = await updateEvaluacionDocenteService(evaluacionDocenteQuery, value);

        if (errorUpdatedEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorUpdatedEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente actualizada con éxito", updatedEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteEvaluacionDocente(req, res) {
    try {
        const evaluacionDocenteQuery = req.query;

        const { errorQuery } = evaluacionDocenteQueryValidation.validate(evaluacionDocenteQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [deletedEvaluacionDocente, errorDeletedEvaluacionDocente] = await deleteEvaluacionDocenteService(evaluacionDocenteQuery);

        if (errorDeletedEvaluacionDocente) return handleErrorClient(res, 404, "Evaluación docente no encontrada", errorDeletedEvaluacionDocente);

        handleSuccess(res, 200, "Evaluación docente eliminada con éxito", deletedEvaluacionDocente);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function createEvaluacionByAlumno(req, res) {
    try {
        console.log('📝 Datos recibidos:', req.body);
        console.log('👤 Usuario autenticado:', req.user);
        
        const evaluacionData = req.body;
        const alumnoId = req.user._id; // Obtener del JWT
        const alumnoNombre = req.user.nombreCompleto;

        // Validar los datos de entrada
        console.log('🔍 Validando datos:', evaluacionData);
        const { value, error } = createEvaluacionAlumnoValidation.validate(evaluacionData);
        
        if (error) {
            console.log('❌ Error de validación:', error.message);
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }

        console.log('✅ Validación exitosa:', value);

        // Agregar información del alumno autenticado
        value.alumno = alumnoNombre;

        console.log('🚀 Enviando al servicio:', value);
        const [newEvaluacion, errorEvaluacion] = await createEvaluacionByAlumnoService(value, alumnoId);

        if (errorEvaluacion) {
            console.log('❌ Error del servicio:', errorEvaluacion);
            return handleErrorClient(res, 400, "Error creando evaluación", errorEvaluacion);
        }

        console.log('✅ Evaluación creada exitosamente:', newEvaluacion);
        handleSuccess(res, 201, "Evaluación creada exitosamente", newEvaluacion);
    } catch (error) {
        console.log('💥 Error inesperado:', error);
        handleErrorServer(res, 500, error.message);
    }
}

export async function getEvaluacionesByDocente(req, res) {
    try {
        const docenteNombre = req.user.nombreCompleto; // Obtener del JWT

        const [evaluaciones, error] = await getEvaluacionesByDocenteService(docenteNombre);

        if (error) return handleErrorClient(res, 404, "No se encontraron evaluaciones", error);

        handleSuccess(res, 200, "Evaluaciones encontradas", evaluaciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getDocentesList(req, res) {
    try {
        const [docentes, error] = await getDocentesListService();

        if (error) return handleErrorClient(res, 404, "No se encontraron docentes", error);

        handleSuccess(res, 200, "Docentes encontrados", docentes);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAsignaturasList(req, res) {
    try {
        const [asignaturas, error] = await getAsignaturasListService();

        if (error) return handleErrorClient(res, 404, "No se encontraron asignaturas", error);

        handleSuccess(res, 200, "Asignaturas encontradas", asignaturas);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// Función para que administradores obtengan todas las evaluaciones
export async function getAllEvaluacionesForAdmin(req, res) {
    try {
        console.log('👨‍💼 Administrador solicitando todas las evaluaciones');
        
        const [evaluaciones, errorEvaluaciones] = await getAllEvaluacionesDocenteService();

        if (errorEvaluaciones) {
            console.log('❌ Error al obtener evaluaciones:', errorEvaluaciones);
            return handleErrorClient(res, 404, "Error al obtener evaluaciones", errorEvaluaciones);
        }

        console.log('✅ Evaluaciones obtenidas exitosamente:', evaluaciones.length);
        handleSuccess(res, 200, "Evaluaciones obtenidas exitosamente", evaluaciones);
    } catch (error) {
        console.log('💥 Error inesperado:', error);
        handleErrorServer(res, 500, error.message);
    }
}

// Función para que administradores eliminen evaluaciones
export async function deleteEvaluacionByAdmin(req, res) {
    try {
        const { id } = req.params;
        console.log('🗑️ Administrador eliminando evaluación ID:', id);
        
        const [evaluacionEliminada, errorEliminacion] = await deleteEvaluacionByIdService(id);

        if (errorEliminacion) {
            console.log('❌ Error al eliminar evaluación:', errorEliminacion);
            return handleErrorClient(res, 400, "Error al eliminar evaluación", errorEliminacion);
        }

        console.log('✅ Evaluación eliminada exitosamente');
        handleSuccess(res, 200, "Evaluación eliminada exitosamente", evaluacionEliminada);
    } catch (error) {
        console.log('💥 Error inesperado:', error);
        handleErrorServer(res, 500, error.message);
    }
}

// Función para aprobar una evaluación (solo administradores)
export async function aprobarEvaluacion(req, res) {
    try {
        const { id } = req.params;
        console.log('✅ Administrador aprobando evaluación ID:', id);
        
        const [evaluacionAprobada, errorAprobacion] = await updateEvaluacionByIdService(id, { estado: 'aprobada' });

        if (errorAprobacion) {
            console.log('❌ Error al aprobar evaluación:', errorAprobacion);
            return handleErrorClient(res, 400, "Error al aprobar evaluación", errorAprobacion);
        }

        console.log('✅ Evaluación aprobada exitosamente');
        handleSuccess(res, 200, "Evaluación aprobada exitosamente", evaluacionAprobada);
    } catch (error) {
        console.log('💥 Error inesperado:', error);
        handleErrorServer(res, 500, error.message);
    }
}

// Función para rechazar una evaluación (solo administradores)
export async function rechazarEvaluacion(req, res) {
    try {
        const { id } = req.params;
        console.log('❌ Administrador rechazando evaluación ID:', id);
        
        const [evaluacionRechazada, errorRechazo] = await updateEvaluacionByIdService(id, { estado: 'rechazada' });

        if (errorRechazo) {
            console.log('❌ Error al rechazar evaluación:', errorRechazo);
            return handleErrorClient(res, 400, "Error al rechazar evaluación", errorRechazo);
        }

        console.log('✅ Evaluación rechazada exitosamente');
        handleSuccess(res, 200, "Evaluación rechazada exitosamente", evaluacionRechazada);
    } catch (error) {
        console.log('💥 Error inesperado:', error);
        handleErrorServer(res, 500, error.message);
    }
}