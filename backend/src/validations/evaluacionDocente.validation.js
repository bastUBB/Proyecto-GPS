import joi from 'joi';

export const evaluacionDocenteQueryValidation = joi.object({
    _id: joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'El ID debe ser un ObjectId válido de MongoDB',
        }),
    docente: joi.string()
        .min(5)
        .max(100)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .messages({
            'string.empty': 'El campo docente no puede estar vacío',
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El campo docente debe tener al menos 5 caracteres',
            'string.max': 'El campo docente no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo docente solo puede contener letras, espacios y puntos',
        }),
    alumno: joi.string()
        .min(5)
        .max(100)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .messages({
            'string.empty': 'El campo alumno no puede estar vacío',
            'string.base': 'El campo alumno debe ser una cadena de texto',
            'string.min': 'El campo alumno debe tener al menos 5 caracteres',
            'string.max': 'El campo alumno no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo alumno solo puede contener letras, espacios y puntos',
        }),
    asignatura: joi.string()
        .min(3)
        .max(100)
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .messages({
            'string.empty': 'El campo asignatura no puede estar vacío',
            'string.base': 'El campo asignatura debe ser una cadena de texto',
            'string.min': 'El campo asignatura debe tener al menos 3 caracteres',
            'string.max': 'El campo asignatura no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo asignatura solo puede contener letras, espacios y puntos',
        }),
    fecha: joi.string()
        .pattern(/^((0[1-9]|1[0-9]|2[0-8])-(0[1-9]|1[0-2])|(29)-(02)-(19|20)([02468][048]|[13579][26])|(29)-(02)-(19|20)\d{2}|(30)-(0[13-9]|1[0-2])|(31)-(0[13578]|1[02]))-(19|20)\d{2}$/)
        .custom((value, helpers) => {
            const [day, month, year] = value.split('-').map(Number);
            const inputDate = new Date(year, month - 1, day);
            const minDate = new Date(2024, 0, 1);

            if (inputDate < minDate) {
                return helpers.error('date.min', { limit: '01-01-2024' });
            }
            return value;
        })
        .messages({
            'date.base': 'La fecha debe ser una fecha válida',
            'date.min': 'La fecha debe ser posterior al 01-01-2024',
        }),
})
    .or('_id', 'docente', 'alumno', 'asignatura')
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar al menos un campo para la consulta (_id, docente, alumno o asignatura)',
    });

export const evaluacionDocenteBodyValidation = joi.object({
    docente: joi.string()
        .min(15)
        .max(50)
        .trim()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
        .messages({
            'string.empty': 'El campo docente no puede estar vacío',
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El campo docente debe tener al menos 3 caracteres',
            'string.max': 'El campo docente no puede tener más de 50 caracteres',
            'string.pattern.base': 'El campo docente solo puede contener letras y espacios',
            'any.required': 'El campo docente es obligatorio',
        }),
    alumno: joi.string()
        .min(5)
        .max(100)
        .trim()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .messages({
            'string.empty': 'El campo alumno no puede estar vacío',
            'string.base': 'El campo alumno debe ser una cadena de texto',
            'string.min': 'El campo alumno debe tener al menos 5 caracteres',
            'string.max': 'El campo alumno no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo alumno solo puede contener letras, espacios y puntos',
            'any.required': 'El campo alumno es obligatorio',
        }),
    asignatura: joi.string()
        .min(3)
        .max(100)
        .trim()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .messages({
            'string.empty': 'El campo asignatura no puede estar vacío',
            'string.base': 'El campo asignatura debe ser una cadena de texto',
            'string.min': 'El campo asignatura debe tener al menos 3 caracteres',
            'string.max': 'El campo asignatura no puede tener más de 100 caracteres',
            'string.pattern.base': 'El campo asignatura solo puede contener letras, espacios y puntos',
            'any.required': 'El campo asignatura es obligatorio',
        }),
    visibilidad: joi.string()
        .valid('Anónima', 'Pública')
        .trim()
        .lowercase()
        .messages({
            'string.empty': 'El campo visibilidad no puede estar vacío',
            'string.base': 'El campo visibilidad debe ser una cadena de texto',
            'any.only': 'El campo visibilidad debe ser "Anonima" o "Publica"',
            'any.required': 'El campo visibilidad es obligatorio',
        }),
    fecha: joi.string()
        .trim()
        .pattern(/^((0[1-9]|1[0-9]|2[0-8])-(0[1-9]|1[0-2])|(29)-(02)-(19|20)([02468][048]|[13579][26])|(29)-(02)-(19|20)\d{2}|(30)-(0[13-9]|1[0-2])|(31)-(0[13578]|1[02]))-(19|20)\d{2}$/)
        .custom((value, helpers) => {
            const [day, month, year] = value.split('-').map(Number);
            const inputDate = new Date(year, month - 1, day);
            const minDate = new Date(2024, 0, 1);

            if (inputDate < minDate) {
                return helpers.error('date.min', { limit: '01-01-2024' });
            }
            return value;
        })
        .messages({
            'date.base': 'La fecha debe ser una fecha válida',
            'date.min': 'La fecha debe ser posterior al 01-01-2024',
            'any.required': 'El campo fecha es obligatorio',
        }),
    texto: joi.string()
        .min(10)
        .max(200)
        .trim()
        .messages({
            'string.empty': 'El campo texto no puede estar vacío',
            'string.base': 'El campo texto debe ser una cadena de texto',
            'string.min': 'El campo texto debe tener al menos 10 caracteres',
            'string.max': 'El campo texto no puede tener más de 200 caracteres',
            'any.required': 'El campo texto es obligatorio',
        }),
    calificacion: joi.number()
        .min(1)
        .max(7)
        .messages({
            'number.base': 'La calificación debe ser un número',
            'number.min': 'La calificación debe ser al menos 1',
            'number.max': 'La calificación no puede ser más de 7',
        }),
    estado: joi.string()
        .valid('pendiente', 'aprobada', 'rechazada')
        .messages({
            'string.base': 'El estado debe ser una cadena de texto',
            'any.only': 'El estado debe ser "pendiente", "aprobada" o "rechazada"',
        }),
})
    .or('docente', 'alumno', 'asignatura', 'visibilidad', 'fecha', 'texto', 'calificacion', 'estado')
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: docente, alumno, asignatura, visibilidad, fecha, texto, calificacion o estado',
    });

export const createEvaluacionAlumnoValidation = joi.object({
    docente: joi.string()
        .min(5)
        .max(100)
        .trim()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .required()
        .messages({
            'string.empty': 'Debe seleccionar un docente',
            'string.base': 'El campo docente debe ser una cadena de texto',
            'string.min': 'El nombre del docente debe tener al menos 5 caracteres',
            'string.max': 'El nombre del docente no puede tener más de 100 caracteres',
            'string.pattern.base': 'El nombre del docente solo puede contener letras, espacios y puntos',
            'any.required': 'Debe seleccionar un docente',
        }),
    asignatura: joi.string()
        .min(3)
        .max(100)
        .trim()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.]+$/)
        .required()
        .messages({
            'string.empty': 'Debe seleccionar una asignatura',
            'string.base': 'El campo asignatura debe ser una cadena de texto',
            'string.min': 'El nombre de la asignatura debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la asignatura no puede tener más de 100 caracteres',
            'string.pattern.base': 'El nombre de la asignatura solo puede contener letras, espacios y puntos',
            'any.required': 'Debe seleccionar una asignatura',
        }),
    texto: joi.string()
        .min(10)
        .max(500)
        .trim()
        .required()
        .messages({
            'string.empty': 'Debe escribir un comentario sobre el docente',
            'string.base': 'El comentario debe ser una cadena de texto',
            'string.min': 'El comentario debe tener al menos 10 caracteres',
            'string.max': 'El comentario no puede tener más de 500 caracteres',
            'any.required': 'Debe escribir un comentario sobre el docente',
        }),
    calificacion: joi.number()
        .min(1)
        .max(7)
        .integer()
        .required()
        .messages({
            'number.base': 'La calificación debe ser un número',
            'number.min': 'La calificación debe ser al menos 1',
            'number.max': 'La calificación no puede ser más de 7',
            'number.integer': 'La calificación debe ser un número entero',
            'any.required': 'Debe asignar una calificación',
        }),
    visibilidad: joi.string()
        .valid('Anónima', 'Pública', 'anónima', 'pública')
        .default('Anónima')
        .messages({
            'any.only': 'La visibilidad debe ser "Anónima" o "Pública"',
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten campos adicionales',
    });
