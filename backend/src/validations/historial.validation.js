import Joi from 'Joi';

export const historialQueryValidation = Joi.object({
    alumno: Joi.string()
        .min(15)
        .max(50)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .required()
        .messages({
            'string.empty': 'El campo alumno no puede estar vacío',
            'string.base': 'El campo alumno debe ser una cadena de texto',
            'string.min': 'El campo alumno debe tener al menos 3 caracteres',
            'string.max': 'El campo alumno no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo alumno solo puede contener letras y espacios',
            'any.required': 'El campo alumno es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar todos los campos: alumno',
    });

export const historialBodyValidation = Joi.object({
    alumno: Joi.string()
        .min(15)
        .max(50)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .trim()
        .messages({
            'string.empty': 'El campo alumno no puede estar vacío',
            'string.base': 'El campo alumno debe ser una cadena de texto',
            'string.min': 'El campo alumno debe tener al menos 15 caracteres',
            'string.max': 'El campo alumno no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo alumno solo puede contener letras y espacios',
            'any.required': 'El campo alumno es obligatorio',
        }),

    asignaturasCursadas: Joi.array()
        .items(
            Joi.object({
                asignatura: Joi.string()
                    .min(3)
                    .max(50)
                    .trim()
                    .messages({
                        'string.empty': 'El campo asignatura no puede estar vacío',
                        'string.base': 'El campo asignatura debe ser una cadena de texto',
                        'string.min': 'El campo asignatura debe tener al menos 3 caracteres',
                        'string.max': 'El campo asignatura no puede tener más de 100 caracteres',
                        'any.required': 'El campo asignatura es obligatorio',
                    }),
                notaFinal: Joi.number()
                    .min(1)
                    .max(7)
                    .messages({
                        'number.base': 'El campo notaFinal debe ser numérico',
                        'number.min': 'La nota mínima permitida es 1',
                        'number.max': 'La nota máxima permitida es 7',
                        'any.required': 'El campo notaFinal es obligatorio',
                    }),
            })
        )
        .messages({
            'array.base': 'El campo asignaturasCursadas debe ser un arreglo',
            'array.includes': 'Cada asignatura cursada debe tener asignatura y notaFinal',
            'any.required': 'El campo asignaturasCursadas es obligatorio',
        }),
})
    .or(
        'alumno',
        'asignaturasCursadas'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: alumno o asignaturasCursadas',
    });