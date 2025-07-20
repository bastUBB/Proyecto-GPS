import { Router } from "express";
import {
    createMallaUser,
    getMallaUser,
    updateMallaUser,
    deleteMallaUser
} from '../controllers/mallaUser.controller.js';
import  { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);


router
    .get('/detail', authorizeRoles("administrador", "admin", "alumno"), getMallaUser)
    .post('/', authorizeRoles("administrador", "admin", "alumno"), createMallaUser)
    .patch('/detail', authorizeRoles("administrador", "admin", "alumno"), updateMallaUser)
    .delete('/detail', authorizeRoles("administrador", "admin", "alumno"), deleteMallaUser);

export default router;