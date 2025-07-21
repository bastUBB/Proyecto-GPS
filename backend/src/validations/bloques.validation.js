import joi from 'joi';

export const bloqueQueryValidation = joi.object({
    horaInicio: joi.string()
        .required()
        .strict()
        .custom((value, helpers) => {
            if (!/^\d{2}:\d{2}$/.test(value)) return helpers.error('string.pattern.base');
            const [h, m] = value.split(':').map(Number);
            if (isNaN(h) || isNaN(m) || h < 0 || h > 22 || m < 0 || m > 59) {
                return helpers.error('string.pattern.base');
            }
            if (h < 7) return helpers.error('string.min', { limit: '07:00' });
            if (h > 22) return helpers.error('string.max', { limit: '22:00' });
            return value;
        })
        .messages({
            'string.empty': 'La hora de inicio no puede estar vacía',
            'any.required': 'La hora de inicio es obligatoria',
            'string.base': 'La hora de inicio debe ser una cadena de texto',
            'string.min': 'La hora de inicio debe ser al menos las {#limit}',
            'string.max': 'La hora de inicio no puede ser más tarde de las {#limit}',
            'string.pattern.base': 'La hora de inicio debe tener el formato HH:MM (24 horas)',
        }),
    horaFin: joi.string()
        .required()
        .strict()
        .custom((value, helpers) => {
            if (!/^\d{2}:\d{2}$/.test(value)) {
                return helpers.error('string.pattern.base');
            }
            const [h, m] = value.split(':').map(Number);
            if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return helpers.error('string.pattern.base');
            if (h < 7) return helpers.error('string.min', { limit: '07:00' });
            if (h > 23) return helpers.error('string.max', { limit: '23:00' });
            return value;
        })
        .messages({
            'string.empty': 'La hora de fin no puede estar vacía',
            'any.required': 'La hora de fin es obligatoria',
            'string.base': 'La hora de fin debe ser una cadena de texto',
            'string.min': 'La hora de fin debe ser al menos las {#limit}',
            'string.max': 'La hora de fin no puede ser más tarde de las {#limit}',
            'string.pattern.base': 'La hora de fin debe tener el formato HH:MM (24 horas)',
        }),
    dia: joi.any()
        .required()
        .custom((value, helpers) => {
            if (typeof value !== 'string') return helpers.error('string.base');
            const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            if (value.trim() === '') return helpers.error('string.empty');
            if (!diasValidos.includes(value)) return helpers.error('any.only', { valids: diasValidos });
            return value;
        })
        .messages({
            'string.base': 'El día debe ser una cadena de texto',
            'any.only': 'El día debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado',
            'any.required': 'El día es obligatorio',
            'string.empty': 'El día no puede estar vacío',
        }),
    tipo: joi.string()
        .valid('TEO', 'PRA', 'LAB')
        .required()
        .strict()
        .messages({
            'string.empty': 'El tipo no puede estar vacío',
            'string.base': 'El tipo debe ser una cadena de texto',
            'any.required': 'El tipo es obligatorio',
            'any.only': 'El tipo debe ser uno de los siguientes: TEO, PRA o LAB',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar al menos uno de los campos: horaInicio, horaFin, dia y tipo',
    });

export const bloqueBodyValidation = joi.object({
    horaInicio: joi.string()
        .pattern(/^(0[7-9]|1\d|2[0-3]):[0-5]\d$/)
        .strict()
        .messages({
            'string.empty': 'La hora de inicio no puede estar vacía',
            'string.base': 'La hora de inicio debe ser una cadena de texto',
            'string.min': 'La hora de inicio debe ser al menos las 07:00',
            'string.max': 'La hora de inicio no puede ser más tarde de las 23:00',
            'any.required': 'La hora de inicio es obligatoria',
            'string.pattern.base': 'La hora de inicio debe tener el formato HH:MM (24 horas)',
        }),
    horaFin: joi.string()
        .pattern(/^(0[7-9]|1\d|2[0-3]):[0-5]\d$/)
        .strict()
        .messages({
            'string.empty': 'La hora de fin no puede estar vacía',
            'string.base': 'La hora de fin debe ser una cadena de texto',
            'string.min': 'La hora de fin debe ser al menos las 07:00',
            'string.max': 'La hora de fin no puede ser más tarde de las 23:00',
            'any.required': 'La hora de fin es obligatoria',
            'string.pattern.base': 'La hora de fin debe tener el formato HH:MM (24 horas)',
        }),
    dia: joi.string()
        .valid('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
        .strict()
        .messages({
            'string.empty': 'El día no puede estar vacío',
            'string.base': 'El día debe ser una cadena de texto',
            'any.only': 'El día debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado',
            'any.required': 'El día es obligatorio',
        }),
    tipo: joi.string()
        .valid('TEO', 'PRA', 'LAB')
        .strict()
        .messages({
            'string.empty': 'El tipo no puede estar vacío',
            'string.base': 'El tipo debe ser una cadena de texto',
            'any.only': 'El tipo debe ser uno de los siguientes: TEO, PRA o LAB',
            'any.required': 'El tipo es obligatorio',
        }),
})
    .or(
        'horaInicio',
        'horaFin',
        'dia',
        'tipo'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: horaInicio, horaFin, dia o tipo',
    });

export const bloqueIdValidation = joi.object({
    objectId: joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .strict()
        .messages({
            'string.empty': 'El ID del bloque no puede estar vacío',
            'string.base': 'El ID del bloque debe ser una cadena de texto',
            'string.pattern.base': 'El ID del bloque debe ser un ObjectId válido',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar el campo: objectId',
    });


