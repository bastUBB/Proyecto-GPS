import { Router } from "express";
import { 
    createEvaluacionDocente, 
    getEvaluacionDocente, 
    getAllEvaluacionesDocente, 
    updateEvaluacionDocente, 
    deleteEvaluacionDocente,
    createEvaluacionByAlumno,
    getEvaluacionesByDocente,
    getDocentesList,
    getAsignaturasList,
    getAllEvaluacionesForAdmin,
    deleteEvaluacionByAdmin,
    aprobarEvaluacion,
    rechazarEvaluacion
} from '../controllers/evaluacionDocente.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router
    .get('/detail', getEvaluacionDocente)
    .get('/', getAllEvaluacionesDocente)
    .post('/', createEvaluacionDocente)
    .patch('/detail', updateEvaluacionDocente)
    .delete('/detail', deleteEvaluacionDocente)
    
    // Nuevas rutas para alumnos y profesores
    .post('/alumno', authenticateJWT, authorizeRoles('alumno'), createEvaluacionByAlumno)
    .get('/profesor/mis-evaluaciones', authenticateJWT, authorizeRoles('profesor'), getEvaluacionesByDocente)
    .get('/docentes', authenticateJWT, authorizeRoles('alumno', 'admin'), getDocentesList)
    .get('/asignaturas', authenticateJWT, authorizeRoles('alumno', 'admin'), getAsignaturasList)
    
    // Rutas para administradores
    .get('/admin/todas', authenticateJWT, authorizeRoles('admin'), getAllEvaluacionesForAdmin)
    .delete('/admin/:id', authenticateJWT, authorizeRoles('admin'), deleteEvaluacionByAdmin)
    .put('/aprobar/:id', authenticateJWT, authorizeRoles('admin'), aprobarEvaluacion)
    .put('/rechazar/:id', authenticateJWT, authorizeRoles('admin'), rechazarEvaluacion)

export default router;