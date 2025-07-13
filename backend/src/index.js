import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { initialSetup } from './config/initialSetup.js';
import indexRoutes from './routes/index.routes.js';
import '../scripts/inscripcionReminder.js';

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || ['http://localhost:5173'];
const BACKEND_URL = process.env.BACKEND_URL ||`http://localhost:${PORT}`; 
const url = new URL(BACKEND_URL);
const HOST = url.hostname;
const PORT = url.port || 5500; // Usa el puerto de BACKEND_URL o el predeterminado

app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL // Permite conexiones solo desde el frontend
  })
);

// Initial setup to create default users
initialSetup()
    .then(() => console.log('Initial setup completed'))
    .catch(err => console.error('Error during initial setup:', err));

app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({ extended: false })); 

app.use("/api", indexRoutes); // Rutas de la API

app.listen(PORT, HOST, () => {
  connectDB(); // Conecta a la base de datos
  console.log(`Backend corriendo en: ${BACKEND_URL}`);
});