import { Router } from "express";
import {
createBloque,
getBloque,
getAllBloques,
updateBloque,
deleteBloque,
getBloqueId,
getBloqueById
} from '../controllers/bloques.controller.js'

const router = Router();

router
    .get('/detail', getBloque)
    .get('/', getAllBloques)
    .post('/', createBloque)
    .patch('/detail', updateBloque)
    .delete('/detail', deleteBloque)
    .get('/rid/detail', getBloqueId) //return id -> para obtener el id del bloque
    .get('/eid/detail', getBloqueById); // enter id -> para obtener el bloque por id

export default router;