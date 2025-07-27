import { Router } from "express";

import {
    createAsignaturasDocente,
    getAllAsignaturasDocente,
} from '../controllers/asignaturasDocente.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router
    .post('/', authorizeRoles('admin'), createAsignaturasDocente)
    .get('/', getAllAsignaturasDocente);

export default router;