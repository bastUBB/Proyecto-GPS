import express from 'express';
import cors from 'cors';
import { test, registerUser, loginUser, getProfile } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser);
router.get('/profile', getProfile);

export default router;