import Joi from 'Joi';

export const asignaturaQueryValidation = Joi.object({
    codigo: Joi.string()
        .length(6)
        .pattern(/^(?!00)\d{2}(?!0{4})\d{4}$/)
        .required()
        .messages({
            'string.empty': 'El código no puede estar vacío',
            'string.base': 'El código debe ser una cadena de texto',
            'string.length': 'El código debe tener exactamente 6 caracteres',
            'string.pattern.base': 'El código debe ser un número válido de 6 dígitos',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales',
        'object.missing': 'Debe proporcionar el campo código',
    });

export const asignaturaBodyValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .messages({
            'string.empty': 'El nombre no puede estar vacío',
            'string.base': 'El nombre debe ser una cadena de texto',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 50 caracteres',
            'string.pattern.base': 'El nombre solo puede contener letras y espacios',
        }),
    codigo: Joi.string()
        .length(6)
        .trim()
        .pattern(/^(?!00)\d{2}(?!0{4})\d{4}$/)
        .messages({
            'string.base': 'El código debe ser una cadena de texto',
            'string.empty': 'El código no puede estar vacío',
            'string.length': 'El código debe tener exactamente 6 caracteres',
            'string.pattern.base': 'El código debe ser un dígito válido de 6 caracteres',
        }),
    creditos: Joi.number()
        .min(1)
        .max(10)
        .integer()
        .messages({
            'number.base': 'Los créditos deben ser un número',
            'number.min': 'Los créditos deben ser al menos 1',
            'number.max': 'Los créditos no pueden ser más de 10',
            'number.integer': 'Los créditos deben ser un número entero',
        }),
    prerrequisitos: Joi.array()
        .items(
            Joi.string()
                .min(6)
                .max(50)
                .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
                .messages({
                    'string.empty': 'El nombre no puede estar vacío',
                    'string.base': 'El nombre debe ser una cadena de texto',
                    'string.min': 'El nombre debe tener al menos 3 caracteres',
                    'string.max': 'El nombre no puede tener más de 50 caracteres',
                    'string.pattern.base': 'El nombre solo puede contener letras y espacios',
                }),
        )
        .min(0)
        .max(3)
        .messages({
            'array.base': 'Los prerrequisitos deben ser un arreglo',
            'array.min': 'Debe tener al menos 0 prerrequisitos'
        }),
    semestre: Joi.string()
        .pattern(/^(I{1,3}|IV|V|VI{0,3}|IX|X)$/)
        .trim()
        .uppercase()
        .messages({
            'string.empty': 'El semestre no puede estar vacío',
            'string.base': 'El semestre debe ser una cadena de texto',
            'string.pattern.base': 'El semestre debe ser un número romano válido (I, II, III, IV, V, VI, VII, VIII, IX, X)',
        }),
})
    .or(
        'nombre',
        'codigo',
        'creditos',
        'prerrequisitos',
        'semestre'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales',
        'object.missing': 'Debe proporcionar al menos uno de los campos: nombre, código, créditos, prerrequisitos o semestre',
    });