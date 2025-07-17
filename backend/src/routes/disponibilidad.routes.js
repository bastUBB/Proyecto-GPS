import express from 'express';
import { subirDisponibilidad, verDisponibilidad, eliminarDisponibilidad } from '../controllers/disponibilidad.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Ruta para subir/actualizar disponibilidad del profesor
router.post('/', 
    authenticateJWT,
    authorizeRoles('profesor'),
    subirDisponibilidad
);

// Ruta para obtener disponibilidad
router.get('/', 
    authenticateJWT,
    authorizeRoles('profesor', 'admin'),
    verDisponibilidad
);

// Ruta para eliminar disponibilidad de un profesor
router.delete('/:profesorId', 
    authenticateJWT,
    authorizeRoles('profesor', 'admin'),
    eliminarDisponibilidad
);

export default router;