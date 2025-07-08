import express from 'express';
import { 
    generarCombinaciones, 
    obtenerEstadisticas, 
    generarCombinacionesAvanzadas,
    obtenerHistorialResumido
} from '../controllers/combinacionHorarios.controller.js';
import { 
    combinacionHorariosValidation, 
    combinacionHorariosAvanzadaValidation,
    estadisticasValidation,
    alumnoIdValidation
} from '../validations/combinacionHorarios.validation.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';

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

// Ruta para generar combinaciones básicas de horarios
router.post('/generar', 
    authorizationMiddleware,
    validateBody(combinacionHorariosValidation),
    generarCombinaciones
);

// Ruta para generar combinaciones avanzadas con parámetros personalizados
router.post('/generar-avanzado', 
    authorizationMiddleware,
    validateBody(combinacionHorariosAvanzadaValidation),
    generarCombinacionesAvanzadas
);

// Ruta para obtener estadísticas de asignaturas disponibles
router.get('/estadisticas/:alumnoId/:semestre', 
    authorizationMiddleware,
    validateParams(estadisticasValidation),
    obtenerEstadisticas
);

// Ruta para obtener historial académico resumido
router.get('/historial/:alumnoId', 
    authorizationMiddleware,
    validateParams(alumnoIdValidation),
    obtenerHistorialResumido
);

export default router;
