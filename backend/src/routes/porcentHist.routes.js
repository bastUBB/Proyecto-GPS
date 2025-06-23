import express from 'express';
import { subirPorcentajeAprob } from '../controllers/porcentHist.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/porcentajes', authenticateJwt, subirPorcentajeAprob);

export default router;