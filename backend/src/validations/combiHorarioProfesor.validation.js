import Joi from 'Joi';

export const generarHorarioValidation = Joi.object({
    profesorId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del profesor no puede estar vacío',
            'string.base': 'El ID del profesor debe ser una cadena de texto',
            'string.pattern.base': 'El ID del profesor debe ser un ObjectId válido',
            'any.required': 'El ID del profesor es obligatorio',
        }),
    bloques: Joi.array()
        .items(
            Joi.object({
                tipo: Joi.string()
                    .valid('1h20min', '2h10min', '2h50min')
                    .required()
                    .messages({
                        'string.empty': 'El tipo de bloque no puede estar vacío',
                        'string.base': 'El tipo de bloque debe ser una cadena de texto',
                        'any.only': 'El tipo de bloque debe ser: 1h20min, 2h10min o 2h50min',
                        'any.required': 'El tipo de bloque es obligatorio',
                    }),
                cantidad: Joi.number()
                    .integer()
                    .min(1)
                    .max(10)
                    .required()
                    .messages({
                        'number.base': 'La cantidad debe ser un número',
                        'number.integer': 'La cantidad debe ser un número entero',
                        'number.min': 'La cantidad debe ser al menos 1',
                        'number.max': 'La cantidad no puede ser más de 10',
                        'any.required': 'La cantidad es obligatoria',
                    }),
            })
        )
        .min(1)
        .max(5)
        .required()
        .messages({
            'array.base': 'Los bloques deben ser un arreglo',
            'array.min': 'Debe especificar al menos 1 tipo de bloque',
            'array.max': 'No puede especificar más de 5 tipos de bloque',
            'any.required': 'Los bloques son obligatorios',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar los campos: profesorId y bloques',
    });

export const profesorIdValidation = Joi.object({
    profesorId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del profesor no puede estar vacío',
            'string.base': 'El ID del profesor debe ser una cadena de texto',
            'string.pattern.base': 'El ID del profesor debe ser un ObjectId válido',
            'any.required': 'El ID del profesor es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en los parámetros',
        'object.missing': 'Debe proporcionar el campo: profesorId',
    });
