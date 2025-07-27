import { Router } from "express";
import{
    crearInscripcion,
    crearRecomendacionInscripcion,
    getInscripcion,
    deleteInscripcion,
    updateInscripcion
} from '../controllers/inscripcion.controller.js';
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router
    .get('/detail', authorizeRoles("admin", "alumno"), getInscripcion)
    .post('/', authorizeRoles("admin", "alumno"), crearInscripcion)
    .post('/detail', authorizeRoles("admin", "alumno"), crearRecomendacionInscripcion)
    .delete('/detail', authorizeRoles("admin", "alumno"), deleteInscripcion)
    .patch('/detail', authorizeRoles("admin", "alumno"), updateInscripcion);

export default router;