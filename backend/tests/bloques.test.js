import { describe, it, expect } from 'vitest';
import Bloques from '../src/models/bloques.model.js';
import { connectDbTest } from '../src/config/dbTest.js';
import { bloqueQueryValidation, bloqueBodyValidation } from '../src/validations/bloques.validation.js';

/*
TESTS
------------------------------ QUERY
1. ingreso válido del query
2. ingreso inválido del query: horaInicio no es de tipo string && todos los demás campos válidos
3. ingreso inválido del query: horaInicio no cumple con formato de expresion regular && todos los demás campos válidos
4. ingreso inválido del query: horaInicio no cumple con rango de horas de la ER && todos los demás campos válidos
5. ingreso inválido del query: horaInicio vacío && todos los demás campos válidos
6. ingreso inválido del query: no existe campo horaInicio && todos los demás campos válidos

7. ingreso inválido del query: horaFin no es de tipo string && todos los demás campos válidos
8. ingreso inválido del query: horaFin no cumple con formato de expresion regular && todos los demás campos válidos
9. ingreso inválido del query: horaFin no cumple con rango de horas de la ER && todos los demás campos válidos
10. ingreso inválido del query: horaFin vacío && todos los demás campos válidos
11. ingreso inválido del query: no existe campo horaFin && todos los demás campos válidos

12. ingreso inválido del query: dia no es de tipo string && todos los demás campos válidos
13. ingreso inválido del query: dia no cumple con los valores permitidos && todos los demás campos válidos
14. ingreso inválido del query: dia vacío && todos los demás campos válidos
15. ingreso inválido del query: no existe campo dia && todos los demás campos válidos

*/

// Conexión a MongoDB
connectDbTest();

//Test Query
describe('Tests bloqueQueryValidation', () => {
    it('1. Debe validar correctamente un query válido', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '10:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        expect(() => bloqueQueryValidation.validate(query)).not.toThrow();
    });
    it('2. Debe fallar con una horaInicio que no es del tipo string', () => {
        const query = {
            horaInicio: 800,
            horaFin: '10:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de inicio debe ser una cadena de texto');
    });
    it('3. Debe fallar con una horaInicio que no cumple con el formato de expresión regular', () => {
        const query = {
            horaInicio: '8:00',
            horaFin: '10:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de inicio debe tener el formato HH:MM (24 horas)');
    });
    it('4. Debe fallar con una horaInicio que no cumple con el rango de horas de la ER', () => {
        const query = {
            horaInicio: '06:00',
            horaFin: '10:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de inicio debe ser al menos las 07:00');
    });
    it('5. Debe fallar con una horaInicio vacía', () => {
        const query = {
            horaInicio: '',
            horaFin: '10:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de inicio no puede estar vacía');
    });
    it('6. Debe fallar con una horaInicio que no existe', () => {
        const query = {
            horaFin: '10:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de inicio es obligatoria');
    });
    it('7. Debe fallar con una horaFin que no es del tipo string', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: 1000,
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de fin debe ser una cadena de texto');
    });
    it('8. Debe fallar con una horaFin que no cumple con el formato de expresión regular', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '10:0',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de fin debe tener el formato HH:MM (24 horas)');
    });
    it('9. Debe fallar con una horaFin que no cumple con el rango de horas de la ER', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '24:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de fin no puede ser más tarde de las 23:00');
    });
    it('10. Debe fallar con una horaFin vacía', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de fin no puede estar vacía');
    });
    it('11. Debe fallar con una horaFin que no existe', () => {
        const query = {
            horaInicio: '08:00',
            dia: 'Lunes',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('La hora de fin es obligatoria');
    });
    it('12. Debe fallar con un dia que no es del tipo string', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '10:00',
            dia: 1,
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El día debe ser una cadena de texto');
    });
    it('13. Debe fallar con un dia que no cumple con los valores permitidos', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '10:00',
            dia: 'Domingo',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El día debe ser uno de los siguientes: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado');
    });
    it('14. Debe fallar con un dia vacío', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '10:00',
            dia: '',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El día no puede estar vacío');
    });
    it('15. Debe fallar con un dia que no existe', () => {
        const query = {
            horaInicio: '08:00',
            horaFin: '10:00',
            tipo: 'TEO'
        };
        const { error } = bloqueQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El día es obligatorio');
    });

});