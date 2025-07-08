import{
createHorarioExcellService,
getHorarioExcellService,
getAllHorariosExcellService,
updateHorarioExcellService,
deleteHorarioExcellService
} from '../services/horariosExcell.service.js';
import { horarioExcellQueryValidation, horarioExcellBodyValidation } from '../validations/horariosExcell.validation.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";  

export async function createHorarioExcell(req, res) {
    try {
        const horarioExcell = req.body;

        const { value, error } = horarioExcellBodyValidation.validate(horarioExcell);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newHorarioExcell, errorNewHorarioExcell] = await createHorarioExcellService(value);

        if (errorNewHorarioExcell) return handleErrorClient(res, 400, "Error creando el horario", errorNewHorarioExcell);

        handleSuccess(res, 201, "Horario creado con éxito", newHorarioExcell);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getHorarioExcell(req, res) {
    try {
        const horarioExcellQuery = req.query;

        const { errorQuery } = horarioExcellQueryValidation.validate(horarioExcellQuery);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación", errorQuery.message);

        const [horarioExcell, errorHorarioExcell] = await getHorarioExcellService(horarioExcellQuery);

        if (errorHorarioExcell) return handleErrorClient(res, 404, "Horario no encontrado", errorHorarioExcell);

        handleSuccess(res, 200, "Horario encontrado", horarioExcell);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllHorariosExcell(req, res) {
    try {
        const [horariosExcell, errorHorariosExcell] = await getAllHorariosExcellService();

        if (errorHorariosExcell) return handleErrorClient(res, 404, "No hay horarios registrados", errorHorariosExcell);

        handleSuccess(res, 200, "Horarios encontrados", horariosExcell);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateHorarioExcell(req, res) {
    try {

        const { errorQuery } = horarioExcellQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const { value, errorBody } = horarioExcellBodyValidation.validate(req.body);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación en el cuerpo", errorBody.message);

        const [updatedHorarioExcell, errorUpdatedHorarioExcell] = await updateHorarioExcellService(req.query, value);

        if (errorUpdatedHorarioExcell) return handleErrorClient(res, 404, "Horario no encontrado", errorUpdatedHorarioExcell);

        handleSuccess(res, 200, "Horario actualizado con éxito", updatedHorarioExcell);

    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteHorarioExcell(req, res) {
    try {
        const { errorQuery } = horarioExcellQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const [deletedHorarioExcell, errorDeletedHorarioExcell] = await deleteHorarioExcellService(req.query);

        if (errorDeletedHorarioExcell) return handleErrorClient(res, 404, "Horario no encontrado", errorDeletedHorarioExcell);

        handleSuccess(res, 200, "Horario eliminado con éxito", deletedHorarioExcell);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}