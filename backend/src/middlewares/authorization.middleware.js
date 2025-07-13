import User from "../models/user.model.js";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function isAdmin(req, res) {
    try {

        const userFound = await User.findOne({ email: req.user.email });

        if (!userFound) return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");

        const rolUser = userFound.rol;

        if (rolUser !== "administrador") return handleErrorClient(res, 403,
            "Error al acceder al recurso", "Se requiere un rol de Administrador para realizar esta acción.");
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function isJefeDepartamento(req, res) {
    try {
        const userFound = await User.findOne({ email: req.user.email });

        if (!userFound) return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");

        const rolUser = userFound.rol;

        if (rolUser !== "jefeDepartamento") return handleErrorClient(res, 403,
            "Error al acceder al recurso", "Se requiere un rol de Jefe de Departamento para realizar esta acción.");
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

async function checkRole(req, res, rolesToCheck) {
    try {
        const userFound = await User.findOne({ email: req.user.email });

        if (!userFound) return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");

        const rolUser = userFound.rol;

        if (!rolesToCheck.includes(rolUser)) {
            return handleErrorClient(res, 403,
                "Error al acceder al recurso", `Se requiere uno de los siguientes roles: ${rolesToCheck.join(", ")}`);
        }
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export function authorizeRoles(...roles) {
    return (req, res, next) => {
        checkRole(req, res, next, roles);
    };
}