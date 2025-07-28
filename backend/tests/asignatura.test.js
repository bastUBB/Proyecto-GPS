import Asignatura from '../src/models/asignaturas.model.js';
import { describe, it, expect } from 'vitest';
import { connectDbTest } from '../src/config/dbTest.js';
import { asignaturaQueryValidation, asignaturaBodyValidation } from '../src/validations/asignaturas.validation.js';

/*
║═══════════════════════════════════════════════════ CASOS DE PRUEBA ═══════════════════════════════════════════════════║

╔════════════════════════════════╗
║             QUERY              ║
╚════════════════════════════════╝

1. ingreso válido del query

2. ingreso inválido del query {codigo}: no cumple con la expresion regular
3. ingreso inválido del query {codigo}: más de 6 caracteres
4. ingreso inválido del query {codigo}: no es de tipo string
5. ingreso inválido del query {campo extra}: ingreso de campo no permitido && codigo válido 

╔════════════════════════════════╗
║             BODY               ║
╚════════════════════════════════╝

6. ingreso válido del body

7. ingreso inválido del body {nombre}: no cumple con la expresión regular && todos los demás campos válidos
8. ingreso inválido del body {nombre}: tiene 2 caracteres && todos los demás campos válidos
9. ingreso inválido del body {nombre}: tiene 51 caracteres && todos los demás campos válidos
10. ingreso inválido del body {nombre}: no es de tipo string && todos los demás campos válidos 

11. ingreso inválido del body {codigo}: no cumple con la expresión regular && todos los demás campos válidos
12. ingreso inválido del body {codigo}: tiene 5 caracteres && todos los demás campos válidos
13. ingreso inválido del body {codigo}: no es de tipo string && todos los demás campos válidos 

14. ingreso inválido del body {creditos}: no es de tipo number && todos los demás campos válidos
15. ingreso inválido del body {creditos}: es 0 && todos los demás campos válidos
16. ingreso inválido del body {creditos}: es 11 && todos los demás campos válidos
17. ingreso inválido del body {creditos}: es un numero flotante && todos los demás campos válidos
18. ingreso inválido del body {creditos}: es un numero negativo && todos los demás campos válidos 

19. ingreso inválido del body {prerrequisitos}: no es un array && todos los demás campos válidos
20: ingreso inválido del body {prerrequisitos}: contiene elementos que no cumplen con la expresión regular && todos los demás campos válidos
21. ingreso inválido del body {prerrequisitos}: contiene elementos que no son de tipo string && todos los demás campos válidos
22. ingreso inválido del body {prerrequisitos}: contiene un elemento vacío && todos los demás campos válidos
23. ingreso inválido del body {prerrequisitos}: contiene un elemento con 51 caracteres && todos los demás campos válidos
24. ingreso inválido del body {prerrequisitos}: contiene cuatro elementos && todos los demás campos válidos 

25. ingreso inválido del body {semestre}: no es de tipo numero && todos los demás campos válidos
26. ingreso inválido del body {semestre}: es 0 && todos los demás campos válidos
27. ingreso inválido del body {semestre}: es 11 && todos los demás campos válidos
28. ingreso inválido del body {semestre}: es un numero flotante && todos los demás campos válidos
29. ingreso inválido del body {semestre}: es un numero negativo && todos los demás campos válidos 

30. ingreso inválido del body {ambito}: no es de tipo string && todos los demás campos válidos
31. ingreso inválido del body {ambito}: no es una palabra de las válidas && todos los demás campos válidos 

32. ingreso inválido del body {area}: no es de tipo string && todos los demás campos válidos
33. ingreso inválido del body {area}: no es una palabra de las válidas && todos los demás campos válidos 

34. ingreso inválido del body {falta campos}: uso de body vacío
35. ingreso inválido del body {campo extra}: ingreso de campo no permitido && todos los demás campos válidos

╔════════════════════════════════╗
║             MODELO             ║
╚════════════════════════════════╝

36. ingreso válido del modelo: creación de una asignatura

37. ingreso inválido del modelo {nombre}: campo vacío && todos los demás campos válidos
38. ingreso inválido del modelo {nombre}: no es de tipo string && todos los demás campos válidos
39. ingreso inválido del modelo {nombre}: no existe campo && todos los demás campos válidos

40. ingreso inválido del modelo {codigo}: campo vacío && todos los demás campos válidos
41. ingreso inválido del modelo {codigo}: no es de tipo string && todos los demás campos válidos
42. ingreso inválido del modelo {codigo}: no existe campo && todos los demás campos válidos

43. ingreso inválido del modelo {creditos}: campo vacío && todos los demás campos válidos
44. ingreso inválido del modelo {creditos}: no es de tipo number && todos los demás campos válidos
45. ingreso inválido del modelo {creditos}: no existe campo && todos los demás campos válidos

46. ingreso inválido del modelo {prerrequisitos}: no es un array del tipo string && todos los demás campos válidos

47. ingreso inválido del modelo {semestre}: campo vacío && todos los demás campos válidos
48. ingreso inválido del modelo {semestre}: no es de tipo numero && todos los demás campos válidos
49. ingreso inválido del modelo {semestre}: no existe campo && todos los demás campos válidos

50. ingreso inválido del modelo {ambito}: campo vacío && todos los demás campos válidos
51. ingreso inválido del modelo {ambito}: no es de tipo string && todos los demás campos válidos
52. ingreso inválido del modelo {ambito}: no existe campo && todos los demás campos válidos

53. ingreso inválido del modelo {area}: campo vacío && todos los demás campos válidos
54. ingreso inválido del modelo {area}: no es de tipo string && todos los demás campos válidos
55. ingreso inválido del modelo {area}: no existe campo && todos los demás campos válidos

56. ingreso inválido del modelo {falta campos}: uso de modelo vacío
57. ingreso inválido del modelo {campo extra}: ingreso de campo no permitido && todos los demás campos válidos
58. ingreso inválido del modelo {faltan campos y campo extra}: falta de campo e ingreso de campo no permitido && todos los demás campos válidos

║═══════════════════════════════════════════════════════════════════════════════════════════════════════════║
*/

connectDbTest();

// Tests Query
describe('Testss asignaturaQueryValidation', () => {
  it('1. Debe validar correctamente un query válido', () => {
    const query = { codigo: '340465' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeUndefined();
  });

  it('2. {codigo} Debe fallar si no cumple con la expresión regular', () => {
    const query = { codigo: '34046A' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe una cadena de texto válida de 6 dígitos');
  });

  it('3. {codigo} Debe fallar si tiene más de 6 caracteres', () => {
    const query = { codigo: '3404657' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe tener exactamente 6 caracteres');
  });

  it('4. {codigo} Debe fallar si no es de tipo string', () => {
    const query = { codigo: 340465 };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe ser una cadena de texto');
  });

  it('5. {codigo} Debe fallar si se incluye un campo extra en el query', () => {
    const query = { codigo: '340465', extraField: 'extraValue' };
    const { error } = asignaturaQueryValidation.validate(query);
    expect(error).toBeDefined();
    expect(error.message).toBe('No se permiten propiedades adicionales');
  });
}
);

// Tests Body
describe('Testss asignaturaBodyValidation', () => {
  it('6. Debe validar correctamente un body válido', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeUndefined();
  });

  it('7. {nombre} Debe fallar si no cumple con la expresión regular', () => {
    const body = {
      nombre: 'Matemáticas123',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre solo puede contener letras y espacios');
  });

  it('8. {nombre} Debe fallar si tiene menos de 3 caracteres', () => {
    const body = {
      nombre: 'Ma',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre debe tener al menos 3 caracteres');
  });

  it('9. {nombre} Debe fallar si tiene más de 50 caracteres', () => {
    const body = {
      nombre: 'M'.repeat(51),
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre no puede tener más de 50 caracteres');
  });

  it('10. {nombre} Debe fallar si no es de tipo string', () => {
    const body = {
      nombre: 123,
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El nombre debe ser una cadena de texto');
  });
  it('11. {codigo} Debe fallar si no cumple con la expresión regular', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '34046A',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe una cadena de texto válida de 6 dígitos');
  });
  it('12. {codigo} Debe fallar si tiene menos de 6 caracteres', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '34046',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe tener exactamente 6 caracteres');
  });
  it('13. {codigo} Debe fallar si no es de tipo string', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: 340465,
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El código debe ser una cadena de texto');
  });
  it('14. {creditos} Debe fallar si no son de tipo number', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 'cinco',
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser un número');
  });
  it('15. {creditos} Debe fallar si son 0', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 0,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser al menos 1');
  });
  it('16. {creditos} Debe fallar si son más de 10', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 11,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos no pueden ser más de 10');
  });
  it('17. {creditos} Debe fallar si son un número flotante', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5.5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser un número entero');
  });
  it('18. {creditos} Debe fallar si son un número negativo', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: -5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los créditos deben ser al menos 1');
  });
  it('19. {prerrequisitos} Debe fallar si no son un array', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: '340464',
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Los prerrequisitos deben ser un arreglo');
  });
  it('20. {prerrequisitos} Debe fallar si contienen elementos que no cumplen con la expresión regular', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', 'invalid@prerequisite'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El prerrequisito solo puede contener letras, números, espacios, comas y guiones');
  });
  it('21. {prerrequisitos} Debe fallar si contienen elementos que no son de tipo string', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', 123],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El prerrequisito debe ser una cadena de texto');
  });
  it('22. {prerrequisitos} Debe fallar si contienen un elemento vacío', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', ''],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El prerrequisito debe tener al menos 1 caracter');
  });
  it('23. {prerrequisitos} Debe fallar si contienen un elemento con más de 50 caracteres', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', 'a'.repeat(51)],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El prerrequisito no puede tener más de 50 caracteres');
  });
  it('24. {prerrequisitos} Debe fallar si contienen más de 3 elementos', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', '340465', '340466', '340467'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Debe tener como máximo 3 prerrequisitos');
  });
  it('25. {semestre} Debe fallar si no es de tipo number', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 'uno',
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El semestre debe ser un número');
  });
  it('26. {semestre} Debe fallar si es 0', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 0,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El semestre debe ser al menos 1');
  });
  it('27. {semestre} Debe fallar si es más de 10', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 11,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('La carrera solo contempla hasta 10 semestres');
  });
  it('28. {semestre} Debe fallar si es un número flotante', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1.5,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El semestre debe ser un número entero');
  });
  it('29. {semestre} Debe fallar si es un número negativo', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: -1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El semestre debe ser al menos 1');
  });
  it('30. {ambito} Debe fallar si no es de tipo string', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 123,
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El ámbito debe ser una cadena de texto y una de las siguientes palabras: Ámbito Competencias Genéricas, Ámbito Ciencias Básicas y de la Ingeniería o Ámbito Ingeniería Aplicada');
  });
  it('31. {ambito} Debe fallar si no es una palabra de las válidas', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Invalido',
      area: 'Área Ciencias Básicas'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El ámbito debe ser una cadena de texto y una de las siguientes palabras: Ámbito Competencias Genéricas, Ámbito Ciencias Básicas y de la Ingeniería o Ámbito Ingeniería Aplicada');
  });
  it('32. {area} Debe fallar si no es de tipo string', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 123
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El área debe ser una cadena de texto y una de las siguientes palabras: Área Form. Integral Profesional, Área Ciencias Básicas, Área Ciencias de la Ingeniería, Área Ingeniería de Software y Base de Datos, Área de Sistemas Computacionales, Área de Gestión Informática o Una de las áreas anteriores');
  });
  it('33. {area} Debe fallar si no es una palabra de las válidas', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Invalida'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('El área debe ser una cadena de texto y una de las siguientes palabras: Área Form. Integral Profesional, Área Ciencias Básicas, Área Ciencias de la Ingeniería, Área Ingeniería de Software y Base de Datos, Área de Sistemas Computacionales, Área de Gestión Informática o Una de las áreas anteriores');
  });
  it('34. {sin campos} Debe fallar si el body está vacío', () => {
    const body = {};
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('Debe proporcionar al menos uno de los campos: nombre, código, créditos, prerrequisitos, semestre, ámbito o área');
  });
  it('35. {campo extra} Debe fallar si se incluye un campo extra en el body', () => {
    const body = {
      nombre: 'Matemáticas',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['Química General'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas',
      extraField: 'extraValue'
    };
    const { error } = asignaturaBodyValidation.validate(body);
    expect(error).toBeDefined();
    expect(error.message).toBe('No se permiten propiedades adicionales');
  });
});

describe('Tests asignatura model', () => {
  it('36. Debe crear un modelo de asignatura correctamente', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464', 'Química General'],
      semestre: 3,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    const savedAsignatura = await asignatura.save();
    expect(savedAsignatura._id).toBeDefined();
    expect(savedAsignatura.nombre).toBe('Cálculo Diferencial');
    expect(savedAsignatura.codigo).toBe('340465');
    expect(savedAsignatura.creditos).toBe(5);
    expect(savedAsignatura.prerrequisitos).toEqual(['340464', 'Química General']);
    expect(savedAsignatura.semestre).toBe(3);
    expect(savedAsignatura.ambito).toBe('Ámbito Competencias Genéricas');
    expect(savedAsignatura.area).toBe('Área Ciencias Básicas');
  });
  it('37. {nombre} Debe fallar si el campo nombre está vacío', async () => {
    const asignatura = new Asignatura({
      nombre: '',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('38. {nombre} Debe fallar si el campo nombre no es de tipo string', async () => {
    const asignatura = new Asignatura({
      nombre: 123,
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('39. {nombre} Debe fallar si el campo nombre no existe', async () => {
    const asignatura = new Asignatura({
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('40. {codigo} Debe fallar si el campo codigo no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('41. {codigo} Debe fallar si el campo codigo no es de tipo string', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: 340465,
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('42. {codigo} Debe fallar si el campo codigo está vacío', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('43. {creditos} Debe fallar si el campo creditos no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('44. {creditos} Debe fallar si el campo creditos no es de tipo number', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 'cinco',
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('45. {creditos} Debe fallar si el campo creditos está vacío', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: '',
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('46. {prerrequisitos} Debe fallar si el campo prerrequisitos no es un array del tipo string', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: [123],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('47. {semestre} Debe fallar si el campo semestre no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('48. {semestre} Debe fallar si el campo semestre no es de tipo number', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 'uno',
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('49. {semestre} Debe fallar si el campo semestre está vacío', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: '',
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('50. {ambito} Debe fallar si el campo ambito no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('51. {ambito} Debe fallar si el campo ambito no es de tipo string', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 123,
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('52. {ambito} Debe fallar si el campo ambito no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      area: 'Área Ciencias Básicas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('53. {area} Debe fallar si el campo area no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('54. {area} Debe fallar si el campo area no es de tipo string', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 123
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('55. {area} Debe fallar si el campo area no existe', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('56. {sin campos} Debe fallar si el modelo está vacío', async () => {
    const asignatura = new Asignatura({});
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
  it('57. {campo extra} Debe fallar si se incluye un campo extra en el modelo', async () => {
    const asignatura = new Asignatura({
      nombre: 'Cálculo Diferencial',
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas',
      extraField: 'extraValue'
    });
    const savedAsignatura = await asignatura.save();
    expect(savedAsignatura._id).toBeDefined();
    expect(savedAsignatura.nombre).toBe('Cálculo Diferencial');
    expect(savedAsignatura.codigo).toBe('340465');
    expect(savedAsignatura.creditos).toBe(5);
    expect(savedAsignatura.prerrequisitos).toEqual(['340464']);
    expect(savedAsignatura.semestre).toBe(1);
    expect(savedAsignatura.ambito).toBe('Ámbito Competencias Genéricas');
    expect(savedAsignatura.area).toBe('Área Ciencias Básicas');
    expect(savedAsignatura.extraField).toBeUndefined(); // El campo extra no debe guardarse
  });
  it('58. {faltan campos y campo extra} Debe fallar si faltan campos y se incluye un campo extra', async () => {
    const asignatura = new Asignatura({
      codigo: '340465',
      creditos: 5,
      prerrequisitos: ['340464'],
      semestre: 1,
      ambito: 'Ámbito Competencias Genéricas',
      area: 'Área Ciencias Básicas',
      extraField: 'extraValue'
    });
    await expect(asignatura.save()).rejects.toThrow('Asignatura validation failed');
  });
});