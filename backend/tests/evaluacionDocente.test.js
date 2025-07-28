import evaluacionDocente from "../src/models/evaluacionDocente.model.js";
import { describe, it, expect } from 'vitest';
import { connectDbTest } from '../src/config/dbTest.js';
import { evaluacionDocenteQueryValidation, evaluacionDocenteBodyValidation, createEvaluacionAlumnoValidation } from '../src/validations/evaluacionDocente.validation.js';

/*
║═══════════════════════════════════════════════════ CASOS DE PRUEBA ═══════════════════════════════════════════════════║

╔════════════════════════════════╗
║             QUERY              ║
╚════════════════════════════════╝

1. ingreso válido del query

2. ingreso inválido del query {_id}: no es del tipo string && todos los demás campos válidos    
3. ingreso inválido del query {_id}: no cumple con la expresión regular && todos los demás campos válidos

4. ingreso inválido del query {docente}: no es del tipo string && todos los demás campos válidos
5. ingreso inválido del query {docente}: no cumple con la expresión regular && todos los demás campos válidos
6. ingreso inválido del query {docente}: tiene 4 caracteres && todos los demás campos válidos
7. ingreso inválido del query {docente}: tiene 101 caracteres && todos los demás campos válidos

8. ingreso inválido del query {alumno}: no es de tipo string && todos los demás campos válidos
9. ingreso inválido del query {alumno}: no cumple con la expresión regular && todos los demás campos válidos
10. ingreso inválido del query {alumno}: tiene 4 caracteres && todos los demás campos válidos
11. ingreso inválido del query {alumno}: tiene 101 caracteres && todos los demás campos válidos

12. ingreso inválido del query {asignatura}: no es de tipo string && todos los demás campos válidos
13. ingreso inválido del query {asignatura}: no cumple con la expresión regular && todos los demás campos válidos
14. ingreso inválido del query {asignatura}: tiene 2 caracteres && todos los demás campos válidos
15. ingreso inválido del query {asignatura}: tiene 101 caracteres && todos los demás campos válidos

16. ingreso inválido del query {fecha}: no es de tipo string && todos los demás campos válidos
17. ingreso inválido del query {fecha}: no cumple con la expresión regular && todos los demás campos válidos
18. ingreso inválido del query {fecha}: es una fecha futura && todos los demás campos válidos
19. ingreso inválido del query {fecha}: es una fecha pasada && todos los demás campos

╔════════════════════════════════╗
║             BODY               ║
╚════════════════════════════════╝

20. ingreso válido del body

21. ingreso inválido del body {docente}: no es de tipo string && todos los demás campos válidos
22. ingreso inválido del body {docente}: no cumple con la expresión regular && todos los demás campos válidos
23. ingreso inválido del body {docente}: tiene 13 caracteres && todos los demás campos válidos
24. ingreso inválido del body {docente}: tiene 51 caracteres && todos los demás campos válidos

25. ingreso inválido del body {alumno}: no es de tipo string && todos los demás campos válidos
26. ingreso inválido del body {alumno}: no cumple con la expresión regular && todos los demás campos válidos
27. ingreso inválido del body {alumno}: tiene 4 caracteres && todos los demás campos válidos
28. ingreso inválido del body {alumno}: tiene 101 caracteres && todos los demás campos válidos

29. ingreso inválido del body {asignatura}: no es de tipo string && todos los demás campos válidos
30. ingreso inválido del body {asignatura}: no cumple con la expresión regular && todos los demás campos válidos
31. ingreso inválido del body {asignatura}: tiene 2 caracteres && todos los demás campos válidos
32. ingreso inválido del body {asignatura}: tiene 101 caracteres && todos los demás campos válidos

33. ingreso inválido del body {visibilidad}: no es de tipo string && todos los demás campos válidos
34. ingreso inválido del body {visibilidad}: no es una palabra válida && todos los demás campos válidos

35. ingreso inválido del body {fecha}: no es de tipo string && todos los demás campos válidos
36. ingreso inválido del body {fecha}: no cumple con la expresión regular && todos los demás campos válidos
37. ingreso inválido del body {fecha}: es una fecha futura && todos los demás campos
38. ingreso inválido del body {fecha}: es una fecha pasada && todos los demás campos válidos

39. ingreso inválido del body {texto}: no es de tipo string && todos los demás campos válidos
40. ingreso inválido del body {texto}: tiene 0 caracteres && todos los demás campos válidos
41. ingreso inválido del body {texto}: tiene 201 caracteres && todos los demás campos válidos

42. ingreso inválido del body {calificacion}: no es de tipo number && todos los demás campos válidos
43. ingreso inválido del body {calificacion}: no es un número entero && todos los demás campos válidos
44. ingreso inválido del body {calificacion}: es un número negativo && todos los demás campos válidos
45. ingreso inválido del body {calificacion}: es 8 && todos los demás campos válidos

46. ingreso inválido del body {estado}: no es de tipo string && todos los demás campos válidos
47. ingreso inválido del body {estado}: no es una palabra válida && todos los demás campos válidos

48. ingreso inválido del body {faltan campos}: uso de modelo vacío
49. ingreso inválido del body {campo extra}: ingreso de campo no permitido && todos los

╔════════════════════════════════╗
║         crearEvaluación        ║
╚════════════════════════════════╝

36. ingreso válido de crearEvaluacion

37. ingreso inválido de crearEvaluacion {docente}: no es de tipo string && todos los demás campos válidos
38. ingreso inválido de crearEvaluacion {docente}: no cumple con la expresión regular && todos los demás campos válidos
39. ingreso inválido de crearEvaluacion {docente}: tiene 4 caracteres && todos los demás campos válidos
40. ingreso inválido de crearEvaluacion {docente}: tiene 101 caracteres && todos los demás campos válidos

41. ingreso inválido de crearEvaluacion {alumno}: no es de tipo string && todos los demás campos válidos
42. ingreso inválido de crearEvaluacion {alumno}: no cumple con la expresión regular && todos los demás campos válidos
43. ingreso inválido de crearEvaluacion {alumno}: tiene 2 caracteres && todos los demás campos válidos
44. ingreso inválido de crearEvaluacion {alumno}: tiene 101 caracteres && todos los demás campos válidos

45. ingreso inválido de crearEvaluacion {asignatura}: no es de tipo string && todos los demás campos válidos
46. ingreso inválido de crearEvaluacion {asignatura}: no cumple con la expresión regular && todos los demás campos válidos
47. ingreso inválido de crearEvaluacion {asignatura}: tiene 9 caracteres && todos los demás campos válidos
48. ingreso inválido de crearEvaluacion {asignatura}: tiene 101 caracteres && todos los demás campos válidos

49. ingreso inválido de crearEvaluacion {texto}: no es de tipo string && todos los demás campos válidos
50. ingreso inválido de crearEvaluacion {texto}: tiene 0 caracteres && todos los demás campos válidos
51. ingreso inválido de crearEvaluacion {texto}: tiene 201 caracteres && todos los demás campos válidos

52. ingreso inválido de crearEvaluacion {calificacion}: no es de tipo number && todos los demás campos válidos
53. ingreso inválido de crearEvaluacion {calificacion}: no es un número entero && todos los demás campos válidos
54. ingreso inválido de crearEvaluacion {calificacion}: es un número negativo && todos los demás campos válidos
55. ingreso inválido de crearEvaluacion {calificacion}: es 8 && todos los demás campos válidos

56. ingreso inválido de crearEvaluacion {visibilidad}: no es de tipo string && todos los demás campos válidos
57. ingreso inválido de crearEvaluacion {visibilidad}: no es una palabra válida && todos los demás campos válidos


╔════════════════════════════════╗
║              Modelo            ║
╚════════════════════════════════╝

58. ingreso válido del modelo

59. ingreso inválido del modelo {docente}: no es de tipo string && todos los demás campos válidos
60. ingreso inválido del modelo {docente}: campo vacío && todos los demás campos válidos
61. ingreso inválido del modelo {docente}: no existe campo && todos los demás campos válidos

62. ingreso inválido del modelo {alumno}: no es de tipo string && todos los demás campos válidos
63. ingreso inválido del modelo {alumno}: campo vacío && todos los demás campos válidos
64. ingreso inválido del modelo {alumno}: no existe campo && todos los demás campos válidos

65. ingreso inválido del modelo {asignatura}: no es de tipo string && todos los demás campos válidos
66. ingreso inválido del modelo {asignatura}: campo vacío && todos los demás campos válidos
67. ingreso inválido del modelo {asignatura}: no existe campo && todos los demás campos válidos

68. ingreso inválido del modelo {visibilidad}: no es de tipo string && todos los demás campos válidos
69. ingreso inválido del modelo {visibilidad}: campo vacío && todos los demás campos válidos
70. ingreso inválido del modelo {visibilidad}: no existe campo && todos los demás campos válidos

71. ingreso inválido del modelo {fecha}: no es de tipo Date && todos los demás campos válidos
72. ingreso inválido del modelo {fecha}: campo vacío && todos los demás campos válidos
73. ingreso inválido del modelo {fecha}: no existe campo && todos los demás campos válidos

74. ingreso inválido del modelo {texto}: no es de tipo string && todos los demás campos válidos
75. ingreso inválido del modelo {texto}: campo vacío && todos los demás campos válidos  
76. ingreso inválido del modelo {texto}: no existe campo && todos los demás campos válidos

78. ingreso inválido del modelo {calificacion}: no es de tipo number && todos los demás campos válidos
79. ingreso inválido del modelo {calificacion}: campo vacío && todos los demás campos válidos
80. ingreso inválido del modelo {calificacion}: no existe campo && todos los demás campos válidos

81. ingreso inválido del modelo {estado}: no es de tipo string && todos los demás campos válidos
82. ingreso inválido del modelo {estado}: campo vacío && todos los demás campos válidos
83. ingreso inválido del modelo {estado}: no existe campo && todos los demás campos válidos
84. ingreso inválido del modelo {estado}: no es una palabra válida && todos los demás campos válidos

85. ingreso inválido del modelo {faltan campos}: uso de modelo vacío
86. ingreso inválido del modelo {campo extra}: ingreso de campo no permitido && todos los demás campos válidos


║═══════════════════════════════════════════════════════════════════════════════════════════════════════════║
*/

connectDbTest();

describe('Tests evaluacionDocenteQueryValidation', () => {
    it('1. Debe validar correctamente un query válido', () => {
        const query = { _id: '6886907c870426f14deeaaed' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeUndefined();
    });
    it('2. Debe retornar un error si el campo _id no es del tipo string', () => {
        const query = { _id: 123456 };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El ID debe ser una cadena de texto');
    });
    it('3. Debe retornar un error si el campo _id no cumple con la expresión regular', () => {
        const query = { _id: '12345' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El ID debe ser un ObjectId válido de MongoDB');
    });
    it('4. Debe retornar un error si el campo docente no es del tipo string', () => {
        const query = { docente: 123456 };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente debe ser una cadena de texto');
    });
    it('5. Debe retornar un error si el campo docente no cumple con la expresión regular', () => {
        const query = { docente: 'docente123' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente solo puede contener letras, espacios y puntos');
    });
    it('6. Debe retornar un error si el campo docente tiene 4 caracteres', () => {
        const query = { docente: 'abcd' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente debe tener al menos 5 caracteres');
    });
    it('7. Debe retornar un error si el campo docente tiene 101 caracteres', () => {
        const query = { docente: 'a'.repeat(101) };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente no puede tener más de 100 caracteres');
    });
    it('8. Debe retornar un error si el campo alumno no es de tipo string', () => {
        const query = { alumno: 123456 };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno debe ser una cadena de texto');
    });
    it('9. Debe retornar un error si el campo alumno no cumple con la expresión regular', () => {
        const query = { alumno: 'alumno123' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno solo puede contener letras, espacios y puntos');
    });
    it('10. Debe retornar un error si el campo alumno tiene 4 caracteres', () => {
        const query = { alumno: 'abcd' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno debe tener al menos 5 caracteres');
    });
    it('11. Debe retornar un error si el campo alumno tiene 101 caracteres', () => {
        const query = { alumno: 'a'.repeat(101) };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno no puede tener más de 100 caracteres');
    });
    it('12. Debe retornar un error si el campo asignatura no es de tipo string', () => {
        const query = { asignatura: 123456 };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura debe ser una cadena de texto');
    });
    it('13. Debe retornar un error si el campo asignatura no cumple con la expresión regular', () => {
        const query = { asignatura: 'asignatura123' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura solo puede contener letras, espacios y puntos');
    });
    it('14. Debe retornar un error si el campo asignatura tiene 2 caracteres', () => {
        const query = { asignatura: 'ab' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura debe tener al menos 3 caracteres');
    });
    it('15. Debe retornar un error si el campo asignatura tiene 101 caracteres', () => {
        const query = { asignatura: 'a'.repeat(101) };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura no puede tener más de 100 caracteres');
    });
    it('16. Debe retornar un error si el campo fecha no es de tipo string', () => {
        const query = { fecha: 123456 };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La fecha debe ser una cadena de texto');
    });
    it('17. Debe retornar un error si el campo fecha no cumple con la expresión regular', () => {
        const query = { fecha: '2023-13-01' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La fecha debe tener el formato DD-MM-AAAA');
    });
    it('18. Debe retornar un error si el campo fecha es una fecha futura', () => {
        const query = { fecha: '2024-01-01' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La fecha debe tener el formato DD-MM-AAAA');
    });
    it('19. Debe retornar un error si el campo fecha es una fecha pasada', () => {
        const query = { fecha: '2020-01-01' };
        const { error } = evaluacionDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La fecha debe tener el formato DD-MM-AAAA');
    });
});

describe('Tests evaluacionDocenteBodyValidation', () => {
    it('20. Debe validar correctamente un body válido', () => {
        const body = {
            docente: 'Juan Pérez',
            alumno: 'Ana García',
            asignatura: 'Cálculo Integral',
            visibilidad: 'publica',
            fecha: '01-01-2024',
            texto: 'Excelente docente, muy claro en sus explicaciones.',
            calificacion: 9,
            estado: 'aprobada'
        };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
    });
    it('21. Debe retornar un error si el campo docente no es de tipo string', () => {
        const body = { docente: 123456 };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente debe ser una cadena de texto');
    });
    it('22. Debe retornar un error si el campo docente no cumple con la expresión regular', () => {
        const body = { docente: 'Juan Carlos Parra$$ Marquez' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente solo puede contener letras y espacios');
    });
    it('23. Debe retornar un error si el campo docente tiene 13 caracteres', () => {
        const body = { docente: 'Juan Pérez' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente debe tener al menos 15 caracteres');
    });
    it('24. Debe retornar un error si el campo docente tiene 51 caracteres', () => {
        const body = { docente: 'a'.repeat(51) };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo docente no puede tener más de 50 caracteres');
    });
    it('25. Debe retornar un error si el campo alumno no es de tipo string', () => {
        const body = { alumno: 123456 };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno debe ser una cadena de texto');
    });
    it('26. Debe retornar un error si el campo alumno no cumple con la expresión regular', () => {
        const body = { alumno: 'alumno123' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno solo puede contener letras, espacios y puntos');
    });
    it('27. Debe retornar un error si el campo alumno tiene 4 caracteres', () => {
        const body = { alumno: 'abcd' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno debe tener al menos 5 caracteres');
    });
    it('28. Debe retornar un error si el campo alumno tiene 101 caracteres', () => {
        const body = { alumno: 'a'.repeat(101) };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo alumno no puede tener más de 100 caracteres');
    });
    it('29. Debe retornar un error si el campo asignatura no es de tipo string', () => {
        const body = { asignatura: 123456 };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura debe ser una cadena de texto');
    });
    it('30. Debe retornar un error si el campo asignatura no cumple con la expresión regular', () => {
        const body = { asignatura: 'asignatura123' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura solo puede contener letras, espacios y puntos');
    });
    it('31. Debe retornar un error si el campo asignatura tiene 2 caracteres', () => {
        const body = { asignatura: 'ab' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura debe tener al menos 3 caracteres');
    });
    it('32. Debe retornar un error si el campo asignatura tiene 101 caracteres', () => {
        const body = { asignatura: 'a'.repeat(101) };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo asignatura no puede tener más de 100 caracteres');
    });
    it('33. Debe retornar un error si el campo visibilidad no es de tipo string', () => {
        const body = { visibilidad: 123456 };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo visibilidad debe ser una cadena de texto y ser "Anónima" o "Pública"');
    });
    it('34. Debe retornar un error si el campo visibilidad no es una palabra válida', () => {
        const body = { visibilidad: 'privada' };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo visibilidad debe ser una cadena de texto y ser "Anónima" o "Pública"');
    });
    it('35. Debe retornar un error si el campo fecha no es de tipo string', () => {
        const body = { fecha: 123456 };
        const { error } = evaluacionDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El campo fecha debe ser una cadena de texto');
    });
});