import { 
createAsignaturaService, 
getAsignaturaService, 
getAllAsignaturasService,
updateAsignaturaService,
deleteAsignaturaService 
} from "../services/asignaturas.service.js";
import { asignaturaQueryValidation, asignaturaBodyValidation } from "../validations/asignaturas.validation.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

//TODO: Validar que los prerrquisitos existan en la base de datos antes de crear una asignatura

export async function createAsignatura(req, res) {
    try {
        const asignatura = req.body;

        const {value, error} = asignaturaBodyValidation.validate(asignatura);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [newAsignatura, errorNewAsignatura] = await createAsignaturaService(value);

        if (errorNewAsignatura) return handleErrorClient(res, 400, "Error registrando la asignatura", errorNewAsignatura);

        handleSuccess(res, 201, "Asignatura registrada con éxito", newAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAsignatura(req, res) {
    try {
        const { codigo } = req.query;

        const { error } = asignaturaQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [asignatura, errorAsignatura] = await getAsignaturaService({ codigo });

        if (errorAsignatura) return handleErrorClient(res, 404, "Asignatura no encontrada", errorAsignatura);

        handleSuccess(res, 200, "Asignatura encontrada", asignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllAsignaturas(req, res) {
    try {
        const [asignaturas, errorAsignaturas] = await getAllAsignaturasService();

        if (errorAsignaturas) return handleErrorClient(res, 404, "No hay asignaturas registradas", errorAsignaturas);

        handleSuccess(res, 200, "Asignaturas encontradas", asignaturas);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function updateAsignatura(req, res) {
    try {

        const body = req.body;

        const { errorQuery } = asignaturaQueryValidation.validate(req.query);

        if (errorQuery) return handleErrorClient(res, 400, "Error de validación en la consulta", errorQuery.message);

        const { errorBody } = asignaturaBodyValidation.validate(body);

        if (errorBody) return handleErrorClient(res, 400, "Error de validación en el body", errorBody.message);

        const [updatedAsignatura, errorUpdatedAsignatura] = await updateAsignaturaService(req.query, body);

        if (errorUpdatedAsignatura) return handleErrorClient(res, 404, "Asignatura no encontrada", errorUpdatedAsignatura);

        handleSuccess(res, 200, "Asignatura actualizada con éxito", updatedAsignatura);

    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteAsignatura(req, res) {
    try {
        const { codigo } = req.query;

        const { error } = asignaturaQueryValidation.validate(req.query);

        if (error) return handleErrorClient(res, 400, "Error de validación en la consulta", error.message);

        const [deletedAsignatura, errorDeletedAsignatura] = await deleteAsignaturaService({ codigo });

        if (errorDeletedAsignatura) return handleErrorClient(res, 404, "Asignatura no encontrada", errorDeletedAsignatura);

        handleSuccess(res, 200, "Asignatura eliminada con éxito", deletedAsignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAsignaturaIdByName(req, res) {
    try {
        const { nombre } = req.query;

        if (!nombre) return handleErrorClient(res, 400, "Error de validación", "El campo 'nombre' es obligatorio");

        const [asignatura, errorAsignatura] = await getAsignaturaService({ nombre });

        if (errorAsignatura) return handleErrorClient(res, 404, "Asignatura no encontrada", errorAsignatura);

        handleSuccess(res, 200, "Asignatura encontrada", asignatura);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}