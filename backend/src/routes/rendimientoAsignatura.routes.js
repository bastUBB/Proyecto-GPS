import { Router } from 'express';
import {
createRendimientoAsignatura,
getRendimientoAsignatura,
getAllRendimientosAsignatura,
updateRendimientoAsignatura,
deleteRendimientoAsignatura
} from '../controllers/rendimientoAsignatura.controller.js';
import  { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router
    .get('/detail', authorizeRoles("admin", "director de departamento"), getRendimientoAsignatura)
    .get('/', authorizeRoles("admin", "director de departamento"), getAllRendimientosAsignatura)
    .post('/', authorizeRoles("admin"), createRendimientoAsignatura)
    .patch('/detail', authorizeRoles("admin"), updateRendimientoAsignatura)
    .delete('/detail', authorizeRoles("admin"), deleteRendimientoAsignatura);

export default router;
