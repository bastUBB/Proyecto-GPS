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

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/asignaturas", asignaturaRoutes)
    .use("/bloques", bloquesRoutes)
    .use("/users", userRoutes)
    .use("/evaluacionDocente", evaluacionDocenteRoutes)
    .use("/historial", historialRoutes)
    .use("/horariosExcell", horariosExcellRoutes)
    .use("/rendimientoAsignatura", rendimientoAsignaturaRoutes);
    
export default router;