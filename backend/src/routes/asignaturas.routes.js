import { Router } from "express";
import { 
    createAsignatura, 
    getAsignatura, 
    getAllAsignaturas, 
    updateAsignatura, 
    deleteAsignatura 
} from '../controllers/asignaturas.controller.js';
import { authorizeRoles } from "../middlewares/authorization.middleware.js";


//TODO: Implementar sistema de autorización

const router = Router();

router
    .get('/detail', authorizeRoles("administrador", "director de departamento", "alumno", "docente"), getAsignatura) 
    .get('/', authorizeRoles("administrador", "director de departamento", "alumno", "docente"), getAllAsignaturas) 
    .post('/', authorizeRoles("administrador, director de departamento"), createAsignatura) 
    .patch('/detail', authorizeRoles("administrador, director de departamento"), updateAsignatura) 
    .delete('/detail', authorizeRoles("administrador, director de departamento"), deleteAsignatura) 

export default router;