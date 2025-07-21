import joi from 'joi';

export const rendimientoAsignaturaQueryValidation = joi.object({
    asignatura: joi.string()
            .min(3)
            .max(50)
            .strict()
            .required()
            .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
            .messages({
                'string.empty': 'El nombre no puede estar vacío',
                'string.base': 'El nombre debe ser una cadena de texto',
                'string.min': 'El nombre debe tener al menos 3 caracteres',
                'string.max': 'El nombre no puede tener más de 50 caracteres',
                'string.pattern.base': 'El nombre solo puede contener letras y espacios',
                'any.required': 'El campo asignatura es obligatorio',
            }),
    docente: joi.string()
        .min(15)
        .max(50)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .strict()
        .required()
        .messages({
            'string.empty': 'El campo docente no puede estar vacío',
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El campo docente debe tener al menos 15 caracteres',
            'string.max': 'El campo docente no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo docente solo puede contener letras y espacios',
            'any.required': 'El campo docente es obligatorio',
        }),
    seccion: joi.number()
        .min(1)
        .max(4)
        .integer()
        .required()
        .strict()
        .messages({
            'number.empty': 'El campo seccion no puede estar vacío',
            'number.base': 'El campo seccion debe ser un número',
            'number.min': 'El campo seccion debe ser al menos 1',
            'number.max': 'El campo seccion no puede ser mayor a 4',
            'number.integer': 'El campo seccion debe ser un número entero',
            'any.required': 'El campo seccion es obligatorio',
        }),
    semestre: joi.number()
            .min(1)
            .max(10)
            .integer()
            .required()
            .strict()
            .messages({
                'number.base': 'El semestre debe ser un número',
                'number.min': 'El semestre debe ser al menos 1',
                'number.max': 'La carrera solo contempla hasta 10 semestres',
                'number.integer': 'El semestre debe ser un número entero',
                'any.required': 'El campo semestre es obligatorio',
            }),
    año: joi.string()
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
            'string.pattern.base': 'El campo año debe ser un año válido de 4 dígitos',
            'any.invalid': `El campo año debe estar entre ${new Date().getFullYear() - 25} y ${new Date().getFullYear()}`,
            'any.required': 'El campo año es obligatorio',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar todos los campos requeridos: asignatura, docente y año',
    });

export const rendimientoAsignaturaBodyValidation = joi.object({
    asignatura: joi.string()
            .min(3)
            .max(50)
            .trim()
            .strict()
            .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
            .messages({
                'string.base': 'El nombre debe ser una cadena de texto',
                'string.min': 'El nombre debe tener al menos 3 caracteres',
                'string.max': 'El nombre no puede tener más de 50 caracteres',
                'string.pattern.base': 'El nombre solo puede contener letras y espacios',
            }),
    docente: joi.string()
        .min(15)
        .max(50)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .strict()
        .trim()
        .messages({
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El campo docente debe tener al menos 15 caracteres',
            'string.max': 'El campo docente no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo docente solo puede contener letras y espacios',
        }),
    seccion: joi.number()
        .min(1)
        .max(4)
        .integer()
        .strict()
        .messages({
            'number.empty': 'El campo seccion no puede estar vacío',
            'number.base': 'El campo seccion debe ser un número',
            'number.min': 'El campo seccion debe ser al menos 1',
            'number.max': 'El campo seccion no puede ser mayor a 4',
            'number.integer': 'El campo seccion debe ser un número entero',
        }),
    semestre: joi.number()
            .min(1)
            .max(10)
            .integer()
            .strict()
            .messages({
                'number.base': 'El semestre debe ser un número',
                'number.min': 'El semestre debe ser al menos 1',
                'number.max': 'La carrera solo contempla hasta 10 semestres',
                'number.integer': 'El semestre debe ser un número entero',
            }),
    año: joi.string()
        .pattern(/^\d{4}$/)
        .custom((value, helpers) => {
            const year = parseInt(value, 10);
            const currentYear = new Date().getFullYear();
            if (year < currentYear - 25 || year > currentYear) {
                return helpers.error('any.invalid');
            }
            return value;
        }, 'Año dentro de rango')
        .strict()
        .trim()
        .messages({

            'string.pattern.base': 'El campo año debe ser un año válido de 4 dígitos',
            'any.invalid': `El campo año debe estar entre ${new Date().getFullYear() - 25} y ${new Date().getFullYear()}`,
        }),
})
    .or(
        'asignatura',
        'docente',
        'seccion',
        'semestre',
        'año',
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: asignatura, docente, seccion, semestre o año',
    });

