import joi from 'joi';
import mongoose from 'mongoose';

export const rendimientoAsignaturaQueryValidation = joi.object({
    asignatura: joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
        return value;
    }, 'ObjectId validation')
        .required()
        .messages({
            'any.invalid': 'El campo asignatura debe ser un ID de MongoDB válido',
            'any.required': 'El campo asignatura es obligatorio',
        }),
    docente: joi.string()
        .min(15)
        .max(50)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .required()
        .messages({
            'string.empty': 'El campo docente no puede estar vacío',
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El campo docente debe tener al menos 15 caracteres',
            'string.max': 'El campo docente no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo docente solo puede contener letras y espacios',
            'any.required': 'El campo docente es obligatorio',
        }),
    añoRegistro: joi.string()
        .pattern(/^\d{4}$/)
        .custom((value, helpers) => {
            const year = parseInt(value, 10);
            const currentYear = new Date().getFullYear();
            if (year < currentYear - 25 || year > currentYear) {
                return helpers.error('any.invalid');
            }
            return value;
        }, 'Año dentro de rango')
        .required()
        .messages({
            'string.pattern.base': 'El campo añoRegistro debe ser un año válido de 4 dígitos',
            'any.invalid': `El campo añoRegistro debe estar entre ${new Date().getFullYear() - 25} y ${new Date().getFullYear()}`,
            'any.required': 'El campo añoRegistro es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar todos los campos requeridos: asignatura, docente y añoRegistro',
    });

export const rendimientoAsignaturaBodyValidation = joi.object({
    asignatura: joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
        return value;
    }, 'ObjectId validation')
        .trim()
        .messages({
            'any.invalid': 'El campo asignatura debe ser un ID de MongoDB válido',
            'any.required': 'El campo asignatura es obligatorio',
        }),
    docente: joi.string()
        .min(15)
        .max(50)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .trim()
        .messages({
            'string.empty': 'El campo docente no puede estar vacío',
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El campo docente debe tener al menos 15 caracteres',
            'string.max': 'El campo docente no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo docente solo puede contener letras y espacios',
            'any.required': 'El campo docente es obligatorio',
        }),
    procentajeAprob: joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'El campo porcentajeAprob debe ser un número',
            'number.min': 'El campo porcentajeAprob debe ser al menos 0',
            'number.max': 'El campo porcentajeAprob no puede ser mayor a 100',
            'any.required': 'El campo porcentajeAprob es obligatorio',
        }),
    porcentajeDesaprob: joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'El campo porcentajeDesaprob debe ser un número',
            'number.min': 'El campo porcentajeDesaprob debe ser al menos 0',
            'number.max': 'El campo porcentajeDesaprob no puede ser mayor a 100',
            'any.required': 'El campo porcentajeDesaprob es obligatorio',
        }),
    porcentajeNCR: joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'El campo porcentajeNCR debe ser un número',
            'number.min': 'El campo porcentajeNCR debe ser al menos 0',
            'number.max': 'El campo porcentajeNCR no puede ser mayor a 100',
            'any.required': 'El campo porcentajeNCR es obligatorio',
        }),
    añoRegistro: joi.string()
        .pattern(/^\d{4}$/)
        .custom((value, helpers) => {
            const year = parseInt(value, 10);
            const currentYear = new Date().getFullYear();
            if (year < currentYear - 25 || year > currentYear) {
                return helpers.error('any.invalid');
            }
            return value;
        }, 'Año dentro de rango')
        .trim()
        .messages({
            'string.pattern.base': 'El campo añoRegistro debe ser un año válido de 4 dígitos',
            'any.invalid': `El campo añoRegistro debe estar entre ${new Date().getFullYear() - 25} y ${new Date().getFullYear()}`,
            'any.required': 'El campo añoRegistro es obligatorio',
        }),
    totalInscritos: joi.number()
        .min(0)
        .messages({
            'number.base': 'El campo totalInscritos debe ser un número',
            'number.min': 'El campo totalInscritos debe ser al menos 0',
            'any.required': 'El campo totalInscritos es obligatorio',
        }),
})
    .or(
        'asignatura',
        'docente',
        'procentajeAprob',
        'porcentajeDesaprob',
        'porcentajeNCR',
        'añoRegistro',
        'totalInscritos'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: asignatura, docente, porcentajeAprob, porcentajeDesaprob, porcentajeNCR, añoRegistro o totalInscritos',
    });

