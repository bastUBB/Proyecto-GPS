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

// router.use(authenticateJWT);

router
    .get('/detail', authorizeRoles('docente', 'profesor', 'admin', 'director'), getEvaluacionDocente)
    .get('/', getAllEvaluacionesDocente)
    .post('/', authorizeRoles('alumno'), createEvaluacionDocente)
    .patch('/detail', authorizeRoles('alumno', 'admin', 'director'), updateEvaluacionDocente)
    .delete('/detail', authorizeRoles('admin', 'director'), deleteEvaluacionDocente);

export default router;