import { Router } from "express";
import { 
    createAsignatura, 
    getAsignatura, 
    getAllAsignaturas, 
    updateAsignatura, 
    deleteAsignatura 
} from '../controllers/asignaturas.controller.js';

//TODO: Implementar sistema de autorización

const router = Router();

router
    .get('/detail', getAsignatura)
    .get('/', getAllAsignaturas)
    .post('/', createAsignatura)
    .patch('/detail', updateAsignatura)
    .delete('/detail', deleteAsignatura)

export default router;