import { hashPassword, comparePassword } from '../helpers/bcrypt.helper.js';
import { registerValidation } from '../validations/auth.validation.js';
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

// endpoint login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                error: 'Usuario no encontrado'
            });
        }
        const match = await comparePassword(password, user.password);
        // Si la contraseña coincide, generar un token JWT
        if (match) {
            jwt.sign({
                email: user.email,
                id: user._id,
                role: user.role
            }, process.env.JWT_SECRET, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(user)
            })
        }
        if (!match) {
            return res.json({
                error: 'Contraseña incorrecta'
            });
        }
    } catch (error) {
        console.log(error);
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