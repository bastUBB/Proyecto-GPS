import Joi from 'Joi';

export const combinacionHorariosValidation = Joi.object({
    alumnoId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del alumno no puede estar vacío',
            'string.base': 'El ID del alumno debe ser una cadena de texto',
            'string.pattern.base': 'El ID del alumno debe ser un ObjectId válido',
            'any.required': 'El ID del alumno es obligatorio',
        }),
    semestre: Joi.string()
        .valid('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18')
        .required()
        .messages({
            'string.empty': 'El semestre no puede estar vacío',
            'string.base': 'El semestre debe ser una cadena de texto',
            'any.only': 'El semestre debe ser un valor válido del 1 al 18',
            'any.required': 'El semestre es obligatorio',
        }),
    maxCombinaciones: Joi.number()
        .integer()
        .min(1)
        .max(20)
        .default(5)
        .messages({
            'number.base': 'El máximo de combinaciones debe ser un número',
            'number.integer': 'El máximo de combinaciones debe ser un número entero',
            'number.min': 'El máximo de combinaciones debe ser al menos 1',
            'number.max': 'El máximo de combinaciones no puede ser más de 20',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar los campos: alumnoId y semestre',
    });

export const combinacionHorariosAvanzadaValidation = Joi.object({
    alumnoId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del alumno no puede estar vacío',
            'string.base': 'El ID del alumno debe ser una cadena de texto',
            'string.pattern.base': 'El ID del alumno debe ser un ObjectId válido',
            'any.required': 'El ID del alumno es obligatorio',
        }),
    semestre: Joi.string()
        .valid('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18')
        .required()
        .messages({
            'string.empty': 'El semestre no puede estar vacío',
            'string.base': 'El semestre debe ser una cadena de texto',
            'any.only': 'El semestre debe ser un valor válido del 1 al 18',
            'any.required': 'El semestre es obligatorio',
        }),
    maxCombinaciones: Joi.number()
        .integer()
        .min(1)
        .max(20)
        .default(10)
        .messages({
            'number.base': 'El máximo de combinaciones debe ser un número',
            'number.integer': 'El máximo de combinaciones debe ser un número entero',
            'number.min': 'El máximo de combinaciones debe ser al menos 1',
            'number.max': 'El máximo de combinaciones no puede ser más de 20',
        }),
    creditosMinimos: Joi.number()
        .integer()
        .min(12)
        .max(48)
        .default(24)
        .messages({
            'number.base': 'Los créditos mínimos deben ser un número',
            'number.integer': 'Los créditos mínimos deben ser un número entero',
            'number.min': 'Los créditos mínimos deben ser al menos 12',
            'number.max': 'Los créditos mínimos no pueden ser más de 48',
        }),
    creditosMaximos: Joi.number()
        .integer()
        .min(Joi.ref('creditosMinimos'))
        .max(50)
        .default(36)
        .messages({
            'number.base': 'Los créditos máximos deben ser un número',
            'number.integer': 'Los créditos máximos deben ser un número entero',
            'number.min': 'Los créditos máximos deben ser mayores o iguales a los mínimos',
            'number.max': 'Los créditos máximos no pueden ser más de 50',
        }),
    priorizarRendimiento: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'Priorizar rendimiento debe ser un valor booleano',
        }),
    excluirAsignaturas: Joi.array()
        .items(
            Joi.string()
                .pattern(/^(?!00)\d{2}(?!0{4})\d{4}$/)
                .messages({
                    'string.pattern.base': 'El código de asignatura debe tener el formato correcto (6 dígitos)',
                })
        )
        .max(10)
        .default([])
        .messages({
            'array.base': 'Las asignaturas a excluir deben ser un arreglo',
            'array.max': 'No se pueden excluir más de 10 asignaturas',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar los campos: alumnoId y semestre',
    });

export const alumnoIdValidation = Joi.object({
    alumnoId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del alumno no puede estar vacío',
            'string.base': 'El ID del alumno debe ser una cadena de texto',
            'string.pattern.base': 'El ID del alumno debe ser un ObjectId válido',
            'any.required': 'El ID del alumno es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en los parámetros',
        'object.missing': 'Debe proporcionar el campo: alumnoId',
    });

export const estadisticasValidation = Joi.object({
    alumnoId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'El ID del alumno no puede estar vacío',
            'string.base': 'El ID del alumno debe ser una cadena de texto',
            'string.pattern.base': 'El ID del alumno debe ser un ObjectId válido',
            'any.required': 'El ID del alumno es obligatorio',
        }),
    semestre: Joi.string()
        .valid('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18')
        .required()
        .messages({
            'string.empty': 'El semestre no puede estar vacío',
            'string.base': 'El semestre debe ser una cadena de texto',
            'any.only': 'El semestre debe ser un valor válido (1-18)',
            'any.required': 'El semestre es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en los parámetros',
        'object.missing': 'Debe proporcionar los campos: alumnoId y semestre',
    });
