import mongoose from "mongoose";
import dotenv from 'dotenv';
import { createInitialUsers } from '../config/initialSetup.js';

dotenv.config();

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await createInitialUsers();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

