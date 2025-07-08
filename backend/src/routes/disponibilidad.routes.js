import express from 'express';
import { subirDisponibilidad, verDisponibilidad, eliminarDisponibilidad } from '../controllers/disponibilidad.controller.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Ruta para subir/actualizar disponibilidad del profesor
router.post('/', 
    authorizationMiddleware,
    subirDisponibilidad
);

// Ruta para obtener disponibilidad
router.get('/', 
    authorizationMiddleware,
    verDisponibilidad
);

// Ruta para eliminar disponibilidad de un profesor
router.delete('/:profesorId', 
    authorizationMiddleware,
    eliminarDisponibilidad
);

export default router;