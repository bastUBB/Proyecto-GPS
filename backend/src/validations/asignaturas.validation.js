import joi from 'joi';

export const asignaturaQueryValidation = joi.object({
    codigo: joi.string()
        .strict()
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

export const asignaturaBodyValidation = joi.object({
    nombre: joi.string()
        .min(3)
        .max(50)
        .trim()
        .strict()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .messages({
            'string.empty': 'El nombre no puede estar vacío',
            'string.base': 'El nombre debe ser una cadena de texto',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 50 caracteres',
            'string.pattern.base': 'El nombre solo puede contener letras y espacios',
        }),
    codigo: joi.string()
        .length(6)
        .trim()
        .strict()
        .pattern(/^(?!00)\d{2}(?!0{4})\d{4}$/)
        .messages({
            'string.base': 'El código debe ser una cadena de texto',
            'string.empty': 'El código no puede estar vacío',
            'string.length': 'El código debe tener exactamente 6 caracteres',
            'string.pattern.base': 'El código debe ser un dígito válido de 6 caracteres',
        }),
    creditos: joi.number()
        .min(1)
        .max(10)
        .integer()
        .messages({
            'number.base': 'Los créditos deben ser un número',
            'number.min': 'Los créditos deben ser al menos 1',
            'number.max': 'Los créditos no pueden ser más de 10',
            'number.integer': 'Los créditos deben ser un número entero',
        }),
    prerrequisitos: joi.array()
        .items(
            joi.string()
                .min(6)
                .max(50)
                .strict()
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
            'array.max': 'Debe tener como máximo 3 prerrequisitos',
            'array.min': 'Debe tener al menos 0 prerrequisitos'
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
    ambito: joi.string()
        .valid('Ámbito Competencias Genéricas', 'Ámbito Ciencias Básicas y de la Ingeniería', 'Ámbito Ingeniería Aplicada')
        .trim()
        .strict()
        .messages({
            'string.empty': 'El ámbito no puede estar vacío',
            'string.base': 'El ámbito debe ser una cadena de texto',
            'any.only': 'El ámbito debe ser uno de los siguientes: Ámbito Competencias Genéricas, Ámbito Ciencias Básicas y de la Ingeniería o Ámbito Ingeniería Aplicada',
        }),
    area: joi.string()
        .valid('Área Form. Integral Profesional', 'Área Ciencias Básicas', 'Área Ciencias de la Ingeniería', 
            'Área Ingeniería de Software y Base de Datos', 'Área de Sistemas Computacionales', 'Área de Gestión Informática',
            'Una de las áreas anteriores')
        .trim()
        .strict()
        .messages({
            'string.empty': 'El área no puede estar vacío',
            'string.base': 'El área debe ser una cadena de texto',
            'any.only': 'El área debe ser uno de los siguientes: Área Form. Integral Profesional, Área Ciencias Básicas, Área Ciencias de la Ingeniería, Área Ingeniería de Software y Base de Datos, Área de Sistemas Computacionales, Área de Gestión Informática o Una de las áreas anteriores',
        }),
})
    .or(
        'nombre',
        'codigo',
        'creditos',
        'prerrequisitos',
        'semestre', 
        'ambito'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales',
        'object.missing': 'Debe proporcionar al menos uno de los campos: nombre, código, créditos, prerrequisitos, semestre o ámbito',
    });