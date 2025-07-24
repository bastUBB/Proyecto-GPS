import joi from "joi";

export const inscripcionQueryValidation = joi.object({
    profesor: joi.string()
        .min(15)
        .max(50)
        .required()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .strict()
        .messages({
            'string.empty': 'El campo profesor no puede estar vacío',
            'string.base': 'El campo profesor debe ser una cadena de texto',
            'string.min': 'El campo profesor debe tener al menos 15 caracteres',
            'string.max': 'El campo profesor no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo profesor solo puede contener letras y espacios',
            'any.required': 'El campo profesor es obligatorio',
        }),
    asignatura: joi.string()
        .min(3)
        .max(50)
        .required()
        .strict()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .messages({
            'string.empty': 'El nombre no puede estar vacío',
            'string.base': 'El nombre debe ser una cadena de texto',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 50 caracteres',
            'string.pattern.base': 'El nombre solo puede contener letras y espacios',
            'any.required': 'El nombre es obligatorio',
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
            'any.required': 'El campo seccion es obligatorio',
        }),
    semestre: joi.number()
        .min(1)
        .max(10)
        .integer()
        .strict()
        .required()
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
        .strict()
        .required()
        .messages({

            'string.pattern.base': 'El campo año debe ser un año válido de 4 dígitos',
            'any.invalid': `El campo año debe estar entre ${new Date().getFullYear() - 25} y ${new Date().getFullYear()}`,
            'any.required': 'El campo año es obligatorio',
            'string.empty': 'El campo año no puede estar vacío',
            'string.base': 'El campo año debe ser una cadena de texto',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar al menos uno de los campos: profesor, asignatura, seccion, semestre o año',
    });

export const inscripcionBodyValidation = joi.object({
    profesor: joi.string()
        .min(15)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .strict()
        .trim()
        .messages({
            'string.base': 'El campo profesor debe ser una cadena de texto',
            'string.min': 'El campo profesor debe tener al menos 15 caracteres',
            'string.max': 'El campo profesor no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo profesor solo puede contener letras y espacios',
            'any.required': 'El campo profesor es obligatorio',
        }),
    rutAlumnos: joi.array()
        .items(
            joi.string()
                .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
                .strict()
                .trim()
                .messages({
                    'string.base': 'El RUT del alumno debe ser una cadena de texto',
                    'string.pattern.base': 'Formato RUT del alumno inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x',
                })
        )
        .min(1)
        .max(30)
        .messages({
            'array.base': 'Los RUT de los alumnos deben ser un arreglo',
            'array.max': 'Los RUT de los alumnos no pueden ser más de 30',
            'array.min': 'Debe haber al menos un RUT de alumno',
        }),
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
    seccion: joi.number()
        .min(1)
        .max(4)
        .integer()
        .strict()
        .messages({
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
        'profesor',
        'rutAlumnos',
        'asignatura',
        'seccion',
        'semestre',
        'año'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: profesor, rutAlumnos, asignatura, seccion, semestre o año',
    });
