import { Router } from "express";
import {
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
} from '../controllers/user.controller.js';

const router = Router();

router
    .get('/detail', getUser)
    .get('/', getAllUsers)
    .post('/', createUser)
    .patch('/detail', updateUser)
    .delete('/detail', deleteUser);

export default router;