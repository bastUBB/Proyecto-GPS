import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import { createInitialUsers } from './config/initialSetup.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);

// Initial setup to create default users
createInitialUsers()
    .then(() => console.log('Initial users setup completed'))
    .catch(err => console.error('Error during initial setup:', err));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/products", productRoutes);
app.use("/", authRoutes);

app.listen(8000, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});