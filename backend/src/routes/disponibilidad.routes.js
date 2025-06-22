import express from 'express';
import { subirDisponibilidad, verDisponibilidad } from '../controllers/disponibilidad.controller.js';

const router = express.Router();

router.post('/disponibilidad', subirDisponibilidad);
router.get('/disponibilidad', verDisponibilidad);

export default router;