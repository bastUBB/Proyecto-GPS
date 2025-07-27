import { Router } from "express";
import {
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getFilterUsers,
    buscarProfesor,
    getAllProfesores
} from '../controllers/user.controller.js';

const router = Router();

router
    .get('/detail', getUser)
    .get('/detail/nombre', buscarProfesor)
    .get('/profesores', getAllProfesores)
    .get('/', getAllUsers)
    .post('/', createUser)
    .patch('/detail', updateUser)
    .delete('/detail', deleteUser)
    .get('/filter', getFilterUsers);

export default router;