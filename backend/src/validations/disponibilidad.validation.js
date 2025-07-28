import Joi from "joi";

// Validación para los bloques de disponibilidad
export const bloqueSchema = Joi.object({
    dia: Joi.string()
        .valid("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")
        .required()
        .messages({
            "string.empty": "El día no puede estar vacío",
            "any.required": "El día es obligatorio",
            "any.only": "El día debe no puede estar vacío y debe ser una cadena de texto válida (Lunes a Domingo)"
        }),
    horaInicio: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            "string.base": "La hora de inicio debe ser una cadena de texto",
            "string.empty": "La hora de inicio no puede estar vacía",
            "any.required": "La hora de inicio es obligatoria",
            "string.pattern.base": "La hora de inicio debe tener formato HH:MM"
        }),
    horaFin: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            "string.base": "La hora de fin debe ser una cadena de texto",
            "string.empty": "La hora de fin no puede estar vacía",
            "any.required": "La hora de fin es obligatoria",
            "string.pattern.base": "La hora de fin debe tener formato HH:MM"
        })
});

// Validación para el cuerpo de la petición (crear/actualizar disponibilidad)
export const disponibilidadBodyValidation = Joi.object({
    bloques: Joi.array()
        .items(bloqueSchema)
        .min(1)
        .required()
        .messages({
            "array.base": "Los bloques de disponibilidad deben ser un array",
            "array.empty": "Los bloques de disponibilidad no pueden estar vacíos",
            "any.required": "Los bloques de disponibilidad son obligatorios",
            "array.min": "Debe haber al menos un bloque de disponibilidad"
        })
});

// Validación para query parameters (obtener disponibilidad)
export const disponibilidadQueryValidation = Joi.object({
    profesorId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            "string.base": "El ID del profesor debe ser una cadena de texto ObjectId válida",
            "string.empty": "El ID del profesor no puede estar vacío",
            "string.pattern.base": "El ID del profesor debe ser un ObjectId válido"
        })
});