import Joi from 'Joi';

export const horarioExcellQueryValidation = Joi.object({
    codigoAsignatura: Joi.string()
        .length(6)
        .pattern(/^(?!00)\d{2}(?!0{4})\d{4}$/)
        .required()
        .messages({
            'string.empty': 'El código no puede estar vacío',
            'string.base': 'El código debe ser una cadena de texto',
            'string.min': 'El código debe tener al menos 6 caracteres',
            'string.max': 'El código no puede tener más de 6 caracteres',
            'string.pattern.base': 'El código debe ser un número válido de 6 dígitos',
        }),
    seccion: Joi.number()
        .valid(1, 2, 3)
        .required()
        .messages({
            'number.base': 'El campo seccion debe ser un número',
            'any.only': 'El campo seccion debe ser 1, 2 o 3',
            'any.required': 'El campo seccion es obligatorio',
        }),
    docente: Joi.string()
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
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar al menos uno de los campos: asignatura, bloques, seccion o docente',
    });

export const horarioExcellBodyValidation = Joi.object({
    codigoAsignatura: Joi.string()
        .length(6)
        .trim()
        .pattern(/^(?!00)\d{2}(?!0{4})\d{4}$/)
        .messages({
            'string.base': 'El código debe ser una cadena de texto',
            'string.empty': 'El código no puede estar vacío',
            'string.min': 'El código debe tener al menos 6 caracteres',
            'string.max': 'El código no puede tener más de 6 caracteres',
            'string.pattern.base': 'El código debe ser un dígito válido de 6 caracteres',
            'any.required': 'El código es obligatorio',
        }),
    bloques: Joi.array()
        .items(Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
            return value;
        }).messages({
            'any.invalid': 'Cada ID del campo bloques debe ser un ObjectId válido de MongoDB',
            'string.base': 'Cada ID del campo bloques debe ser una cadena de texto',
            'string.empty': 'Cada ID del campo bloques no puede estar vacío',
            'any.required': 'Cada ID del campo bloques es obligatorio',
        }))
        .min(1)
        .messages({
            'array.base': 'El campo bloques debe ser una lista de IDs',
            'array.min': 'Debe haber al menos un bloques',
            'any.required': 'El campo bloques es obligatorio',
        }),
    seccion: Joi.number()
        .valid(1, 2, 3)
        .messages({
            'number.base': 'El campo seccion debe ser un número',
            'any.only': 'El campo seccion debe ser 1, 2 o 3',
            'any.required': 'El campo seccion es obligatorio',
        }),
    docente: Joi.string()
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
})
    .or(
        'codigoAsignatura',
        'bloques',
        'seccion',
        'docente'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: codigoAsignatura, bloques, seccion o docente',
    });
