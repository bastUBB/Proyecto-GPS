import Joi from 'joi';

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@ubiobio.cl") && !value.endsWith("@alumnos.ubiobio.cl") ) {
    return helper.message(
      "El correo electrónico debe terminar en @ubiobio.cl o @alumnos.ubiobio.cl"
    );
  }
  return value;
};

export const registerValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
            'string.base': 'El nombre debe ser una cadena de texto',
            'string.empty': 'El nombre no puede estar vacío',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 30 caracteres',
            'any.required': 'El nombre es obligatorio',
            'string.pattern.base': 'El nombre solo puede contener letras y espacios',
        }),
    rut: Joi.string()
        .min(9)
        .max(12)
        .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
        .required()
        .messages({
            'string.base': 'El RUT debe ser una cadena de texto',
            'string.empty': 'El RUT no puede estar vacío',
            'string.min': 'El RUT debe tener al menos 9 caracteres',
            'string.max': 'El RUT no puede tener más de 12 caracteres',
            'any.required': 'El RUT es obligatorio',
            'string.pattern.base': 'El RUT no es válido',
        }),
    email: Joi.string()
        .min(15)
        .max(50)
        .email()
        .required()
        .messages({
            'string.base': 'El correo electrónico debe ser una cadena de texto',
            'string.empty': 'El correo electrónico no puede estar vacío',
            'string.min': 'El correo electrónico debe tener al menos 15 caracteres',
            'string.max': 'El correo electrónico no puede tener más de 50 caracteres',
            'any.required': 'El correo electrónico es obligatorio',
            'string.email': 'El correo electrónico no es válido',
        })
        .custom(domainEmailValidator, 'Domain Email Validator'),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^[a-zA-Z0-9]+$/)
        .required()
        .messages({
            'string.base': 'La contraseña debe ser una cadena de texto',
            'string.empty': 'La contraseña no puede estar vacía',
            'string.min': 'La contraseña debe tener al menos 8 caracteres',
            'string.max': 'La contraseña no puede tener más de 30 caracteres',
            'any.required': 'La contraseña es obligatoria',
            'string.pattern.base': 'La contraseña solo puede contener letras y números',
        }),
})
    .unknown(true)


export const loginValidation = Joi.object({
    email: Joi.string()
        .min(15)
        .max(50)
        .email()
        .required()
        .messages({
            'string.base': 'El correo electrónico debe ser una cadena de texto',
            'string.empty': 'El correo electrónico no puede estar vacío',
            'string.min': 'El correo electrónico debe tener al menos 15 caracteres',
            'string.max': 'El correo electrónico no puede tener más de 50 caracteres',
            'any.required': 'El correo electrónico es obligatorio',
            'string.email': 'El correo electrónico no es válido',
        })
        .custom(domainEmailValidator, 'Domain Email Validator'),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^[a-zA-Z0-9]+$/)
        .required()
        .messages({
            'string.base': 'La contraseña debe ser una cadena de texto',
            'string.empty': 'La contraseña no puede estar vacía',
            'string.min': 'La contraseña debe tener al menos 8 caracteres',
            'string.max': 'La contraseña no puede tener más de 30 caracteres',
            'any.required': 'La contraseña es obligatoria',
            'string.pattern.base': 'La contraseña solo puede contener letras y números',
        }),
})
    .unknown(true);