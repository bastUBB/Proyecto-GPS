import express from 'express';
import { subirDisponibilidad } from '../controllers/disponibilidad.controller.js';

const router = express.Router();

router.post('/disponibilidad', subirDisponibilidad);

export default router;