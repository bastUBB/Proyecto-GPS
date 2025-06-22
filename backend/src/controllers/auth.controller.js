import { hashPassword, comparePassword } from '../helpers/bcrypt.helper.js';
import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const test = (req, res) => {
    res.status(200).json({
        message: 'Hello from the backend!'
    });
}

// endpoint registro
export const registerUser = async (req, res) => {
    try {
        const { name, rut, email, password, role } = req.body;
        
        const { error } = registerValidation.validate(req.body);
        if (error) {
            return res.json({
                error: error.details[0].message
            });
        }
        
        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            rut,
            email,
            password: hashedPassword,
            role
        });

        return res.json(user);
    } catch (error) {
        console.log(error);
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { error } = loginValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                error: 'Usuario no encontrado'
            });
        }
        const match = await comparePassword(password, user.password);

        if (!match) {
            return res.status(400).json({
                error: 'Contraseña incorrecta'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'TU_SECRET_KEY',
            { expiresIn: '1d' }
        );

        // Enviar token como cookie HttpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            path: '/'
        });

        // Responder con datos del usuario (opcional)
        res.json({ message: 'Login exitoso', user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
}

export const getProfile = (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) throw err;
            res.json(user);
        }); 
    } else {
        res.json(null);
    }
}
