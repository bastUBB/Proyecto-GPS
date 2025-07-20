import { Router } from "express";
import { 
    createEvaluacionDocente, 
    getEvaluacionDocente, 
    getAllEvaluacionesDocente, 
    updateEvaluacionDocente, 
    deleteEvaluacionDocente
} from '../controllers/evaluacionDocente.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJWT);

router
    .get('/detail', authorizeRoles('docente', 'profesor', 'admin'), getEvaluacionDocente)
    .get('/', authorizeRoles('admin'), getAllEvaluacionesDocente)
    .post('/', authorizeRoles('alumno'), createEvaluacionDocente)
    .patch('/detail', authorizeRoles('alumno', 'admin'), updateEvaluacionDocente)
    .delete('/detail', authorizeRoles('admin'), deleteEvaluacionDocente);

export default router;