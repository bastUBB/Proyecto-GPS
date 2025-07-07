import { Router } from 'express';
import {
createRendimientoAsignatura,
getRendimientoAsignatura,
getAllRendimientosAsignatura,
updateRendimientoAsignatura,
deleteRendimientoAsignatura
} from '../controllers/rendimientoAsignatura.controller.js';

const router = Router();

router
    .get('/detail', getRendimientoAsignatura)
    .get('/', getAllRendimientosAsignatura)
    .post('/', createRendimientoAsignatura)
    .patch('/detail', updateRendimientoAsignatura)
    .delete('/detail', deleteRendimientoAsignatura);

export default router;
