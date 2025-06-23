import express from 'express';
import { subirDisponibilidad, verDisponibilidad } from '../controllers/disponibilidad.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/disponibilidad', authenticateJwt, subirDisponibilidad);
// GET /api/disponibilidad?profesorId=ID_DEL_PROFESOR
router.get('/disponibilidad', authenticateJwt, verDisponibilidad);

export default router;