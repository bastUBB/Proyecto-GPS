import { Router } from "express";
import { 
    createAsignatura, 
    getAsignatura, 
    getAllAsignaturas, 
    updateAsignatura, 
    deleteAsignatura 
} from '../controllers/asignaturas.controller.js';
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

//TODO: Implementar sistema de autorización

const router = Router();

// Aplicar autenticación JWT a todas las rutas
router.use(authenticateJWT);

router
    .get('/detail', authorizeRoles("administrador", "admin", "director", "alumno", "profesor"), getAsignatura) 
    .get('/', authorizeRoles("administrador", "admin", "director", "alumno", "profesor"), getAllAsignaturas) 
    .post('/', authorizeRoles("administrador", "admin", "director"), createAsignatura) 
    .put('/:id', authorizeRoles("administrador", "admin", "director"), updateAsignatura) 
    .delete('/:id', authorizeRoles("administrador", "admin", "director"), deleteAsignatura) 

export default router;