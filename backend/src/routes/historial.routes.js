import { Router } from "express";
import{
    createHistorial,
    getHistorial,
    getAllHistorial,
    updateHistorial,
    deleteHistorial
} from '../controllers/historial.controller.js';

const router = Router();

router
    .get('/detail', getHistorial)
    .get('/', getAllHistorial)
    .post('/', createHistorial)
    .patch('/detail', updateHistorial)
    .delete('/detail', deleteHistorial);

export default router;