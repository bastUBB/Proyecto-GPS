import joi from 'joi';

export const historialQueryValidation = joi.object({
    alumno: joi.string()
        .min(3)
        .max(100)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .required()
        .messages({
            'string.empty': 'El campo alumno no puede estar vacío',
            'string.base': 'El campo alumno debe ser una cadena de texto',
            'string.min': 'El campo alumno debe tener al menos 3 caracteres',
            'string.max': 'El campo alumno no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo alumno solo puede contener letras y espacios',
            'any.required': 'El campo alumno es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar todos los campos: alumno',
    });

export const historialBodyValidation = joi.object({
    alumno: joi.string()
        .min(3)
        .max(100)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .trim()
        .required()
        .messages({
            'string.empty': 'El campo alumno no puede estar vacío',
            'string.base': 'El campo alumno debe ser una cadena de texto',
            'string.min': 'El campo alumno debe tener al menos 3 caracteres',
            'string.max': 'El campo alumno no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo alumno solo puede contener letras y espacios',
            'any.required': 'El campo alumno es obligatorio',
        }),

    asignaturasCursadas: joi.array()
        .items(
            joi.object({
                asignatura: joi.string()
                    .min(3)
                    .max(100)
                    .trim()
                    .required()
                    .messages({
                        'string.empty': 'El campo asignatura no puede estar vacío',
                        'string.base': 'El campo asignatura debe ser una cadena de texto',
                        'string.min': 'El campo asignatura debe tener al menos 3 caracteres',
                        'string.max': 'El campo asignatura no puede tener más de 100 caracteres',
                        'any.required': 'El campo asignatura es obligatorio',
                    }),
                notaFinal: joi.number()
                    .min(1)
                    .max(7)
                    .required()
                    .messages({
                        'number.base': 'El campo notaFinal debe ser numérico',
                        'number.min': 'La nota mínima permitida es 1',
                        'number.max': 'La nota máxima permitida es 7',
                        'any.required': 'El campo notaFinal es obligatorio',
                    }),
                semestre: joi.number()
                    .valid(1, 2)
                    .required()
                    .messages({
                        'number.base': 'El campo semestre debe ser numérico',
                        'any.only': 'El semestre debe ser 1 o 2',
                        'any.required': 'El campo semestre es obligatorio',
                    }),
                estado: joi.string()
                    .valid('cursada', 'inscribible')
                    .default('cursada')
                    .messages({
                        'string.base': 'El campo estado debe ser una cadena de texto',
                        'any.only': 'El estado debe ser "cursada" o "inscribible"',
                    }),
                notasParciales: joi.array()
                    .items(
                        joi.object({
                            evaluacion: joi.string()
                                .min(1)
                                .max(50)
                                .required()
                                .messages({
                                    'string.empty': 'El nombre de la evaluación no puede estar vacío',
                                    'string.base': 'El nombre de la evaluación debe ser una cadena de texto',
                                    'string.min': 'El nombre de la evaluación debe tener al menos 1 caracter',
                                    'string.max': 'El nombre de la evaluación no puede tener más de 50 caracteres',
                                    'any.required': 'El nombre de la evaluación es obligatorio',
                                }),
                            nota: joi.number()
                                .min(1.0)
                                .max(7.0)
                                .required()
                                .messages({
                                    'number.base': 'La nota debe ser numérica',
                                    'number.min': 'La nota mínima permitida es 1.0',
                                    'number.max': 'La nota máxima permitida es 7.0',
                                    'any.required': 'La nota es obligatoria',
                                }),
                            ponderacion: joi.number()
                                .min(0)
                                .max(100)
                                .required()
                                .messages({
                                    'number.base': 'La ponderación debe ser numérica',
                                    'number.min': 'La ponderación mínima es 0%',
                                    'number.max': 'La ponderación máxima es 100%',
                                    'any.required': 'La ponderación es obligatoria',
                                }),
                        }).required()
                    )
                    .default([])
                    .messages({
                        'array.base': 'Las notas parciales deben ser un arreglo',
                    }),
            }).required()
        )
        .required()
        .messages({
            'array.base': 'El campo asignaturasCursadas debe ser un arreglo',
            'array.includes': 'Cada asignatura cursada debe tener asignatura, notaFinal, semestre y estado',
            'any.required': 'El campo asignaturasCursadas es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
    });