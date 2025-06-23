import express from 'express';
import { obtenerCombinacionHorarios } from '../controllers/combiHorarios.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = express.Router();

//GET /api/combi-horarios?profesorId=ID&horasSemana=NUMERO
router.get('/combi-horarios', authenticateJwt, obtenerCombinacionHorarios);

export default router;