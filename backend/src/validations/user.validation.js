import Joi from "Joi";

const domainEmailValidator = (value, helper) => {
    const domainRegex = /@gmail\.cl$/;

    if (!domainRegex.test(value)) return helper.message("El correo electrónico debe finalizar en @gmail.cl");

    return value;
};

export const userQueryValidation = Joi.object({
    rut: Joi.string()
        .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
        .messages({
            "string.empty": "El rut no puede estar vacío.",
            "string.base": "El rut debe ser de tipo string.",
            "string.min": "El rut debe tener como mínimo 9 caracteres.",
            "string.max": "El rut debe tener como máximo 12 caracteres.",
            "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
        }),
})
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en la consulta',
        'object.missing': 'Debe proporcionar al menos uno de los campos: name, rut, email o role',
    });

export const userBodyValidation = Joi.object({
    nombreCompleto: Joi.string()
        .min(15)
        .max(50)
        .trim()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            "string.empty": "El nombre completo no puede estar vacío.",
            "string.base": "El nombre completo debe ser de tipo string.",
            "string.min": "El nombre completo debe tener como mínimo 15 caracteres.",
            "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
            "string.pattern.base":
                "El nombre completo solo puede contener letras y espacios.",
        }),
    rut: Joi.string()
        .min(9)
        .max(12)
        .trim()
        .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
        .messages({
            "string.empty": "El rut no puede estar vacío.",
            "string.base": "El rut debe ser de tipo string.",
            "string.min": "El rut debe tener como mínimo 9 caracteres.",
            "string.max": "El rut debe tener como máximo 12 caracteres.",
            "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
        }),
    email: Joi.string()
        .min(15)
        .max(35)
        .email()
        .trim()
        .custom(domainEmailValidator, 'Validación de dominio de correo electrónico')
        .messages({
            "string.empty": "El correo electrónico no puede estar vacío.",
            "string.base": "El correo electrónico debe ser de tipo string.",
            "string.min": "El correo electrónico debe tener como mínimo 15 caracteres.",
            "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
            "string.email": "El correo electrónico debe ser válido.",
            "any.custom": "El correo electrónico debe finalizar en @gmail.cl.",
        }),
    password: Joi.string()
        .min(8)
        .max(26)
        .pattern(/^[a-zA-Z0-9]+$/)
        .messages({
            "string.empty": "La contraseña no puede estar vacía.",
            "string.base": "La contraseña debe ser de tipo string.",
            "string.min": "La contraseña debe tener como mínimo 8 caracteres.",
            "string.max": "La contraseña debe tener como máximo 26 caracteres.",
            "string.pattern.base":
                "La contraseña solo puede contener letras y números.",
        }),
    role: Joi.string()
        .min(5)
        .max(10)
        .trim()
        .valid("Administrador", "Alumno", "Docente", "Director de departamento")
        .lowercase()
        .messages({
            "string.empty": "El rol no puede estar vacío.",
            "string.base": "El rol debe ser de tipo string.",
            "string.min": "El rol debe tener como mínimo 5 caracteres.",
            "string.max": "El rol debe tener como máximo 10 caracteres.",
            "any.only": "El rol debe ser uno de los siguientes: admin, user.",
        }),
})
    .or(
        'nombreCompleto',
        'rut',
        'email',
        'password',
        'role'
    )
    .unknown(false)
    .messages({
        'object.unknown': 'No se permiten propiedades adicionales en el cuerpo de la solicitud',
        'object.missing': 'Debe proporcionar al menos uno de los campos: nombreCompleto, rut, email, password o role',
    });