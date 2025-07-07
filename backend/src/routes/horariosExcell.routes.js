import { Router } from "express";
import { 
    createHorarioExcell, 
    getHorarioExcell, 
    getAllHorariosExcell, 
    updateHorarioExcell, 
    deleteHorarioExcell 
} from '../controllers/horariosExcell.controller.js';

const router = Router();

router
    .get('/detail', getHorarioExcell)
    .get('/', getAllHorariosExcell)
    .post('/', createHorarioExcell)
    .patch('/detail', updateHorarioExcell)
    .delete('/detail', deleteHorarioExcell)

export default router;