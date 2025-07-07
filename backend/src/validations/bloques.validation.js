import joi, { object } from 'joi';

export const bloqueQueryValidation = joi.object({
    horaInicio: joi.string()
        .pattern(/^(0[7-9]|1\d|2[0-3]):[0-5]\d$/)
        .required()
        .messages({
            'string.empty': 'La hora de inicio no puede estar vacía',
            'string.base': 'La hora de inicio debe ser una cadena de texto',
            'string.min': 'La hora de inicio debe ser al menos las 07:00',
            'string.max': 'La hora de inicio no puede ser más tarde de las 23:00',
            'string.pattern.base': 'La hora de inicio debe tener el formato HH:MM (24 horas)',
        }),
    horaFin: joi.string()
        .pattern(/^(0[7-9]|1\d|2[0-3]):[0-5]\d$/)
        .required()
        .messages({
            'string.empty': 'La hora de inicio no puede estar vacía',
            'string.base': 'La hora de inicio debe ser una cadena de texto',
            'string.min': 'La hora de inicio debe ser al menos las 07:00',
            'string.max': 'La hora de inicio no puede ser más tarde de las 23:00',
            'string.pattern.base': 'La hora de inicio debe tener el formato HH:MM (24 horas)',
        }),
    dia: joi.string()
        .valid('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')
        .required()
        .messages({
            'string.empty': 'El día no puede estar vacío',
            'string.base': 'El día debe ser una cadena de texto',
            'any.only': 'El día debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado',
        }),
    tipo: joi.string()
        .valid('TEO', 'PRA', 'LAB')
        .required()
        .messages({
            'string.empty': 'El tipo no puede estar vacío',
            'string.base': 'El tipo debe ser una cadena de texto',
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
        .messages({
            'string.empty': 'El día no puede estar vacío',
            'string.base': 'El día debe ser una cadena de texto',
            'any.only': 'El día debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado',
            'any.required': 'El día es obligatorio',
        }),
    tipo: joi.string()
        .valid('TEO', 'PRA', 'LAB')
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


