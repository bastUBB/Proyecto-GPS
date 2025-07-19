import { Router } from "express";
import {
    createMallaUser,
    getMallaUser,
    updateMallaUser,
    deleteMallaUser
} from '../controllers/mallaUser.controller.js';
import { authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .get('/detail', authorizeRoles("administrador", "alumno"), getMallaUser)
    .post('/', authorizeRoles("administrador", "alumno"), createMallaUser)
    .patch('/detail', authorizeRoles("administrador", "alumno"), updateMallaUser)
    .delete('/detail', authorizeRoles("administrador", "alumno"), deleteMallaUser);

export default router;