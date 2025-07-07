import { Router } from "express";
import { 
    createEvaluacionDocente, 
    getEvaluacionDocente, 
    getAllEvaluacionesDocente, 
    updateEvaluacionDocente, 
    deleteEvaluacionDocente 
} from '../controllers/evaluacionDocente.controller.js';

const router = Router();

router
    .get('/detail', getEvaluacionDocente)
    .get('/', getAllEvaluacionesDocente)
    .post('/', createEvaluacionDocente)
    .patch('/detail', updateEvaluacionDocente)
    .delete('/detail', deleteEvaluacionDocente)

export default router;