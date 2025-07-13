"use strict";
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import asignaturaRoutes from "./asignaturas.routes.js";
import bloquesRoutes from "./bloques.routes.js";
import userRoutes from "./user.routes.js"  
import evaluacionDocenteRoutes from "./evaluacionDocente.routes.js";
import historialRoutes from "./historial.routes.js";
import horariosExcellRoutes from "./horariosExcell.routes.js";
import rendimientoAsignaturaRoutes from "./rendimientoAsignatura.routes.js";
import excelRouter from './excelextr.routes.js'; // Asegúrate de que la ruta sea correcta
import disponibilidadRoutes from "./disponibilidad.routes.js";
import combiHorarioProfesorRoutes from "./combiHorarioProfesor.routes.js";
import combinacionHorariosRoutes from "./combinacionHorarios.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/asignaturas", asignaturaRoutes)
    .use("/bloques", bloquesRoutes)
    .use("/users", userRoutes)
    .use("/evaluacionDocente", evaluacionDocenteRoutes)
    .use("/historial", historialRoutes)
    .use("/horariosExcell", horariosExcellRoutes)
    .use("/rendimientoAsignatura", rendimientoAsignaturaRoutes)
    .use("/excel", excelRouter)
    .use("/disponibilidad", disponibilidadRoutes)
    .use("/combi", combiHorarioProfesorRoutes)
    .use("/combinaciones", combinacionHorariosRoutes);
    
export default router;