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
        const { nombreCompleto, rut, email, password, role } = req.body;
        
        const { error } = registerValidation.validate(req.body);
        if (error) {
            return res.json({
                error: error.details[0].message
            });
        }
        
        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            nombreCompleto,
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
        console.log("Login attempt with email:", email);
        console.log("Login attempt with password:", password);
        const { error } = loginValidation.validate(req.body);
        console.log(error);
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

        // Preparar datos del usuario para el frontend
        const userResponse = {
            _id: user._id,
            nombreCompleto: user.nombreCompleto, // Usar el campo correcto del modelo
            email: user.email,
            rut: user.rut,
            role: user.role
        };

        // Enviar token como cookie HttpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            path: '/'
        });

        // Responder con datos del usuario Y el token (para localStorage)
        res.json({ 
            message: 'Login exitoso', 
            user: userResponse,
            token: token // Agregar el token para que el frontend lo pueda guardar
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
}

export const getProfile = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({ error: 'Token inválido' });
                }
                
                // Buscar el usuario completo en la base de datos
                const user = await User.findById(decoded.id).select('-password');
                if (!user) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }
                
                res.json(user);
            }); 
        } else {
            res.status(401).json({ error: 'No hay token' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}
