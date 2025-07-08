import { describe, it, expect } from 'vitest';
import Asignatura from '../src/models/asignaturas.model.js';
import {connectDbTest} from '../src/config/dbTest.js';
import { asignaturaQueryValidation, asignaturaBodyValidation } from '../src/validations/asignaturas.validation.js';

/*
TESTS
------------------------------ QUERY
1. ingreso válido del query
2. ingreso inválido del query: Error en la expresión regular
3. ingreso inválido del query: codigo no tiene 6 caracteres (5 caracteres)
4. ingreso inválido del query: Tipo de dato incorrecto
5. ingreso inválido del query: ingreso de campo no permitido (nombre)

------------------------------ BODY
6. ingreso válido del body
7. ingreso inválido del body: nombre no cumple con la expresión regular && todos los demás campos válidos
8. ingreso inválido del body: nombre tiene 2 caracteres && todos los demás campos válidos
9. ingreso inválido del body: nombre vacío && todos los demás campos válidos
10. ingreso inválido del body: nombre no es de tipo string && todos los demás campos válidos
11. ingreso inválido del body: codigo no cumple con la expresión regular && todos los demás campos válidos
12. ingreso inválido del body: codigo tiene 5 caracteres && todos los demás campos válidos
13. ingreso inválido del body: codigo no es de tipo string && todos los demás campos válidos
14. ingreso inválido del body: codigo vacío && todos los demás campos válidos
15. ingreso inválido del body: creditos no es de tipo number && todos los demás campos válidos
16. ingreso inválido del body: creditos es 11 && todos los demás campos válidos
17. ingreso inválido del body: creditos es un numero flotante && todos los demás campos válidos
18. ingreso inválido del body: creditos es un numero negativo && todos los demás campos válidos
19. ingreso inválido del body: prerrequisitos no es un array && todos los demás campos válidos
20: ingreso inválido del body: prerrequisitos contiene elementos que no cumplen con la expresión regular && todos los demás campos válidos
21. ingreso inválido del body: prerrequisitos contiene elementos que no son de tipo string && todos los demás campos válidos
22. ingreso inválido del body: prerrequisitos contiene un elemento con 5 caracteres && todos los demás campos válidos
23. ingreso inválido del body: prerrequisitos contiene cuatro elementos && todos los demás campos válidos
24. ingreso inválido del body: semestre no cumple con la expresión regular && todos los demás campos válidos
25. ingreso inválido del body: semestre no es de tipo string && todos los demás campos válidos

----------------------------- MODELO
*/

// Conexión a MongoDB
connectDbTest();

// Tests Query
describe('Test asignaturaQueryValidation', () => {
  it('1. Debe validar correctamente un query válido', () => {
    const query = { codigo: '340465' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeUndefined();
  });

  it('2. Debe fallar con un código que no cumple la expresión regular', () => {
    const query = { codigo: '12345A' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe ser un número válido de 6 dígitos');
  });

  it('3. Debe fallar si el código no tiene 6 caracteres', () => {
    const query = { codigo: '34046' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe tener exactamente 6 caracteres');
  });

  it('4. Debe fallar si el tipo de dato del código es incorrecto', () => {
    const query = { codigo: 340465 };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe ser una cadena de texto');
  });

  it('5. Debe fallar si se ingresa un campo no permitido (nombre)', () => {
    const query = { codigo: '340465', nombre: 'Cálculo Diferencial' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('No se permiten propiedades adicionales');
  });
}
);
  
// Tests Body
describe('Test asignaturaBodyValidation', () => {
  it('6. Debe validar correctamente un body válido', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['Materia Uno', 'Materia Dos'],
      semestre: 'III'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeUndefined();
  });

  it('7. Debe fallar si el nombre no cumple con la expresión regular', () => {
    const body = {
      nombre: 'Cálculo123',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['Materia Uno', 'Materia Dos'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre solo puede contener letras y espacios');
  });

  it('8. Debe fallar si el nombre tiene 2 caracteres', () => {
    const body = {
      nombre: 'Cá',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['Materia Uno', 'Materia Dos'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre debe tener al menos 3 caracteres');
  });

  it('9. Debe fallar si el nombre está vacío', () => {
    const body = {
      nombre: '',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['Materia Uno', 'Materia Dos'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre no puede estar vacío');
  });

  it('10. Debe fallar si el nombre no es de tipo string', () => {
    const body = {
      nombre: 12345,
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['Materia Uno'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre debe ser una cadena de texto');
  });
  it('11. Debe fallar si el código no cumple con la expresión regular', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '34046A',
      creditos: 5,
      prerrequisitos: ['Materia Dos'],
      semestre: 'V'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe ser un dígito válido de 6 caracteres');
  });
  it('12. Debe fallar si el código tiene 5 caracteres', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '34046',
      creditos: 9,
      prerrequisitos: ['Materia Tres'],
      semestre: 'II'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe tener exactamente 6 caracteres');
  });
  it('13. Debe fallar si el código no es de tipo string', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: 340465,
      creditos: 5,
      prerrequisitos: ['Materia Cuatro'],
      semestre: 'IV'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe ser una cadena de texto');
  });
  it('14. Debe fallar si el código está vacío', () => {
    const body = { //TODO: AQUI QUEDE
      nombre: 'Cálculo Diferencial',
      codigo: '',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código no puede estar vacío');
  });
  it('15. Debe fallar si los créditos no son de tipo number', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 'cinco',
      prerrequisitos: ['340464'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser un número');
  });
  it('16. Debe fallar si los créditos son 11', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 11,
      prerrequisitos: ['340464'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos no pueden ser más de 10');
  });
  it('17. Debe fallar si los créditos son un número flotante', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5.5,
      prerrequisitos: ['340464'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser un número entero');
  });
  it('18. Debe fallar si los créditos son un número negativo', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: -5,
      prerrequisitos: ['340464'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser al menos 1');
  });
  it('19. Debe fallar si los prerrequisitos no son un array', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: '340464',
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los prerrequisitos deben ser un arreglo');
  });
  it('20. Debe fallar si los prerrequisitos contienen elementos que no cumplen con la expresión regular', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', 'Matemáticas123'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre solo puede contener letras y espacios');
  });
  it('21. Debe fallar si los prerrequisitos contienen elementos que no son de tipo string', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', 12345],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre debe ser una cadena de texto');
  });
  it('22. Debe fallar si los prerrequisitos contienen un elemento con 5 caracteres', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['34046'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre debe tener al menos 3 caracteres');
  });
  it('23. Debe fallar si los prerrequisitos contienen cuatro elementos', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', '340465', '340466', '340467'],
      semestre: 'I'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('No puede tener más de 3 prerrequisitos');
  });
  it('24. Debe fallar si el semestre no cumple con la expresión regular', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 'IVX'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El semestre debe ser un número romano válido (I, II, III, IV, V, VI, VII, VIII, IX, X)');
  });
  it('25. Debe fallar si el semestre no es de tipo string', () => {
    const body = {
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El semestre debe ser una cadena de texto');
  });
}
);
