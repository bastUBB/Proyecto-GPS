import { Router } from "express";
import{
    createHistorial,
    getHistorial,
    getAllHistorial,
    updateHistorial,
    deleteHistorial
} from '../controllers/historial.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJWT);

router
    .get('/detail', authorizeRoles("administrador", "admin", "alumno"), getHistorial)
    .get('/', authorizeRoles("administrador", "admin"), getAllHistorial)
    .post('/', authorizeRoles("administrador", "admin", "alumno"), createHistorial)
    .patch('/detail', authorizeRoles("administrador", "admin", "alumno"), updateHistorial)
    .delete('/detail', authorizeRoles("administrador", "admin"), deleteHistorial);

export default router;