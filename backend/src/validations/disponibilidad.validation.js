import Joi from 'Joi';

export const disponibilidadQueryValidation = Joi.object({
    profesor: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del profesor no puede estar vacío',
            'string.base': 'El ID del profesor debe ser una cadena de texto',
            'string.pattern.base': 'El ID del profesor debe ser un ObjectId válido',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar el campo: profesor',
    });

export const disponibilidadBodyValidation = Joi.object({
    profesor: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.empty': 'El ID del profesor no puede estar vacío',
            'string.base': 'El ID del profesor debe ser una cadena de texto',
            'string.pattern.base': 'El ID del profesor debe ser un ObjectId válido',
            'any.required': 'El ID del profesor es obligatorio',
        }),
    bloques: Joi.array()
        .items(
            Joi.object({
                dia: Joi.string()
                    .valid('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
                    .required()
                    .messages({
                        'string.empty': 'El día no puede estar vacío',
                        'string.base': 'El día debe ser una cadena de texto',
                        'any.only': 'El día debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado',
                        'any.required': 'El día es obligatorio',
                    }),
                horaInicio: Joi.string()
                    .pattern(/^(0[7-9]|1\d|2[0-3]):[0-5]\d$/)
                    .required()
                    .messages({
                        'string.empty': 'La hora de inicio no puede estar vacía',
                        'string.base': 'La hora de inicio debe ser una cadena de texto',
                        'string.pattern.base': 'La hora de inicio debe tener el formato HH:MM (24 horas) y estar entre las 07:00 y 23:59',
                        'any.required': 'La hora de inicio es obligatoria',
                    }),
                horaFin: Joi.string()
                    .pattern(/^(0[7-9]|1\d|2[0-3]):[0-5]\d$/)
                    .required()
                    .messages({
                        'string.empty': 'La hora de fin no puede estar vacía',
                        'string.base': 'La hora de fin debe ser una cadena de texto',
                        'string.pattern.base': 'La hora de fin debe tener el formato HH:MM (24 horas) y estar entre las 07:00 y 23:59',
                        'any.required': 'La hora de fin es obligatoria',
                    }),
            })
        )
        .min(0)
        .max(30)
        .messages({
            'array.base': 'Los bloques deben ser un arreglo',
            'array.min': 'Debe tener al menos 0 bloques',
            'array.max': 'No puede tener más de 30 bloques',
        }),
})
    .or(
        'profesor',
        'bloques'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: profesor o bloques',
    });

export const disponibilidadIdValidation = Joi.object({
    objectId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID de la disponibilidad no puede estar vacío',
            'string.base': 'El ID de la disponibilidad debe ser una cadena de texto',
            'string.pattern.base': 'El ID de la disponibilidad debe ser un ObjectId válido',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar el campo: objectId',
    });
