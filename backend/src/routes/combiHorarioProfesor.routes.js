import express from 'express';
import { 
    generarHorario, 
    obtenerSalas, 
    validarDisponibilidad, 
    generarHorarioConValidacion,
    obtenerEstadisticasHorarios,
    obtenerTiposBloquesController
} from '../controllers/combiHorarioProfesor.controller.js';
import { 
    generarHorarioValidation, 
    profesorIdValidation 
} from '../validations/combiHorarioProfesor.validation.js';
// import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Middleware para validar el cuerpo de la petición
const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Error de validación",
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

// Middleware para validar parámetros
const validateParams = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
        return res.status(400).json({
            message: "Error de validación de parámetros",
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

// Ruta para generar horario básico
router.post('/horario/generar', 
    // authorizationMiddleware,
    validateBody(generarHorarioValidation),
    generarHorario
);

// Ruta para generar horario con validación previa
router.post('/horario/generar-validado', 
    // authorizationMiddleware,
    validateBody(generarHorarioValidation),
    generarHorarioConValidacion
);

// Ruta para obtener salas disponibles
router.get('/horario/salas', 
    // authorizationMiddleware,
    obtenerSalas
);

// Ruta para obtener tipos de bloques disponibles
router.get('/horario/tipos-bloques', 
    // authorizationMiddleware,
    obtenerTiposBloquesController
);

// Ruta para validar disponibilidad de un profesor
router.get('/horario/validar/:profesorId', 
    // authorizationMiddleware,
    validateParams(profesorIdValidation),
    validarDisponibilidad
);

// Ruta para obtener estadísticas de horarios de un profesor
router.get('/horario/estadisticas/:profesorId', 
    // authorizationMiddleware,
    validateParams(profesorIdValidation),
    obtenerEstadisticasHorarios
);

export default router;
