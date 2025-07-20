import { Router } from "express";
import {
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getFilterUsers
} from '../controllers/user.controller.js';

const router = Router();

router
    .get('/detail', getUser)
    .get('/', getAllUsers)
    .post('/', createUser)
    .patch('/detail', updateUser)
    .delete('/detail', deleteUser)
    .get('/filter', getFilterUsers);

export default router;