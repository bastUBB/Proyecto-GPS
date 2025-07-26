import { Router } from "express";
import{
    crearInscripcion,
    crearRecomendacionInscripcion
} from '../controllers/inscripcion.controller.js';
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router 
    .post('/', authorizeRoles("administrador", "admin", "alumno"), crearInscripcion)
    .post('/detail', authorizeRoles("administrador", "admin", "alumno"), crearRecomendacionInscripcion);

export default router;