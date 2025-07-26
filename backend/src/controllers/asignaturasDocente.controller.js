import {
    crearAsignaturasDocenteService,
    getAllAsignaturasDocenteService
} from '../services/asignaturasDocente.service.js';
import {
    asignaturasDocenteQueryValidation,
    asignaturasDocenteBodyValidation
} from '../validations/asignaturasDocente.validation.js';
import { handleErrorClient, handleErrorServer, handleSuccess } from '../handlers/responseHandlers.js';

export async function createAsignaturasDocente(req, res) {
    try {
        const { error } = asignaturasDocenteBodyValidation.validate(req.body);
        if (error) {
            return handleErrorClient(res, 400, "Error de validación", error.message);
        }

        const [nuevoRegistro, errorRegistro] = await crearAsignaturasDocenteService(req.body);
        if (errorRegistro) {
            return handleErrorClient(res, 400, "Error al crear asignaturas del docente", errorRegistro);
        }

        handleSuccess(res, 201, "Asignaturas del docente creadas exitosamente", nuevoRegistro);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllAsignaturasDocente(req, res) {
    try {
        const [registros, error] = await getAllAsignaturasDocenteService();
        if (error) {
            return handleErrorServer(res, 500, error);
        }
        handleSuccess(res, 200, "Asignaturas del docente obtenidas exitosamente", registros);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}