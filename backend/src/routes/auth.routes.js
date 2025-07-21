import express from 'express';
import cors from 'cors';
import { test, registerUser, loginUser, getProfile } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser);
router.get('/profile', authenticateJWT, (req, res) => {
    res.json(req.user);
});

router.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Sesión cerrada' });
});

export default router;