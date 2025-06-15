import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000'; 
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`; 

app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL // Permite conexiones solo desde el frontend
  })
);
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({ extended: false })); 

app.use("/api/products", productRoutes); 
app.use("/", authRoutes); // Rutas de autenticación en la raíz

app.listen(PORT, () => {
  connectDB(); // Conecta a la base de datos
  console.log(`Backend corriendo en: ${BACKEND_URL}`);
});