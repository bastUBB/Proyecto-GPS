import joi from 'joi';

export const mallaUserQueryValidation = joi.object({
    rutUser: joi.string()
        .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
        .messages({
            "string.empty": "El rut del usuario no puede estar vacío.",
            "string.base": "El rut del usuario debe ser de tipo string.",
            "string.min": "El rut del usuario debe tener como mínimo 9 caracteres.",
            "string.max": "El rut del usuario debe tener como máximo 12 caracteres.",
            "string.pattern.base": "Formato rut del usuario inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar al menos uno de los campos: name, rut, email o role',
    });

export const mallaUserBodyValidation = joi.object({
    rutUser: joi.string()
        .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
        .trim()
        .messages({
            "string.empty": "El rut del usuario no puede estar vacío.",
            "string.base": "El rut del usuario debe ser de tipo string.",
            "string.min": "El rut del usuario debe tener como mínimo 9 caracteres.",
            "string.max": "El rut del usuario debe tener como máximo 12 caracteres.",
            "string.pattern.base": "Formato rut del usuario inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
        }),
    asignaturasCursadas: joi.array()
        .items(
            joi.string()
                .min(6)
                .max(50)
                .strict()
                .trim()
                .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
                .messages({
                    'string.empty': 'El nombre de la asignatura no puede estar vacío',
                    'string.base': 'El nombre de la asignatura debe ser una cadena de texto',
                    'string.min': 'El nombre de la asignatura debe tener al menos 3 caracteres',
                    'string.max': 'El nombre de la asignatura no puede tener más de 50 caracteres',
                    'string.pattern.base': 'El nombre de la asignatura solo puede contener letras y espacios',
                }),
        )
        .min(1)
        .max(55)
        .messages({
            'array.base': 'Las asignaturas cursadas deben ser un arreglo',
            'array.min': 'Debe haber al menos una asignatura cursada',
            'array.max': 'No puede haber más de 55 asignaturas cursadas',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: rutUser, asignaturasCursadas',
    });


