import joi from "joi";

export const asignaturasDocenteQueryValidation = joi.object({
    profesor: joi.string()
        .min(15)
        .max(50)
        .required()
        .strict()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            "string.empty": "El nombre completo no puede estar vacío.",
            "string.base": "El nombre completo debe ser de tipo string.",
            "string.min": "El nombre completo debe tener como mínimo 15 caracteres.",
            "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
            "string.pattern.base": "El nombre completo solo puede contener letras y espacios.",
            "any.required": "Debe proporcionar el campo profesor.",
        }),
})
    .and('profesor')
    .unknown(false)
    .messages({
        "object.unknown": "No se permiten propiedades adicionales",
        "object.missing": "Debe proporcionar el campo profesor.",
    });

export const asignaturasDocenteBodyValidation = joi.object({
    profesor: joi.string()
        .min(15)
        .max(50)
        .trim()
        .strict()
        .required()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            "string.base": "El nombre completo debe ser de tipo string.",
            "string.min": "El nombre completo debe tener como mínimo 15 caracteres.",
            "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
            "string.pattern.base": "El nombre completo solo puede contener letras y espacios.",
            "any.required": "Debe proporcionar el campo profesor.",
            "string.empty": "El nombre completo no puede estar vacío.",
        }),
})
    .unknown(false)
    .messages({
        "object.unknown": "No se permiten propiedades adicionales",
        "object.missing": "Debe proporcionar el campo profesor.",
    });
