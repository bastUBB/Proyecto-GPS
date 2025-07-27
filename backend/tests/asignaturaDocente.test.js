import AsignaturaDocente from '../src/models/asignaturasDocente.model.js';
import { describe, it, expect } from 'vitest';
import { connectDbTest } from '../src/config/dbTest.js';
import { asignaturasDocenteQueryValidation, asignaturasDocenteBodyValidation } from '../src/validations/asignaturasDocente.validation.js';

/*
║═══════════════════════════════════════════════════ CASOS DE PRUEBA ═══════════════════════════════════════════════════║

╔════════════════════════════════╗
║             QUERY              ║
╚════════════════════════════════╝

1. ingreso válido del query

2. ingreso inválido del query {profesor}: no cumple con la expresion regular
3. ingreso inválido del query {profesor}: tiene 14 caracteres
4. ingreso inválido del query {profesor}: tiene 51 caracteres
5. ingreso inválido del query {profesor}: no es de tipo string
6. ingreso inválido del query {profesor}: es vacío

7. ingreso inválido del query {falta campo}: uso de query vacío
8. ingreso inválido del query {campo extra}: ingreso de campo no permitido && profesor válido

╔════════════════════════════════╗
║             BODY               ║
╚════════════════════════════════╝

9. ingreso válido del body

10. ingreso inválido del body {profesor}: no cumple con la expresion regular
11. ingreso inválido del body {profesor}: tiene 14 caracteres
12. ingreso inválido del body {profesor}: tiene 51 caracteres
13. ingreso inválido del body {profesor}: no es de tipo string
14. ingreso inválido del body {profesor}: es vacío

15. ingreso inválido del body {falta campos}: uso de body vacío
16. ingreso inválido del body {campo extra}: ingreso de campo no permitido && todos los demás campos válidos

╔════════════════════════════════╗
║             MODELO             ║
╚════════════════════════════════╝

17. ingreso válido del modelo

18. ingreso inválido del modelo {profesor}: campo vacío && todos los demás campos válidos
19. ingreso inválido del modelo {profesor}: no es del tipo string && todos los demás campos válidos
20. ingreso inválido del modelo {profesor}: no existe campo && todos los demás campos válidos

21. ingreso inválido del modelo {asignaturas}: no es un array del tipo string && todos los demás campos válidos
22. ingreso inválido del modelo {asignaturas}: tiene un elemento vacío && todos los demás campos válidos
23. ingreso inválido del modelo {asignaturas}: tiene un elemento no string && todos los demás campos válidos

24. ingreso inválido del modelo {faltan campos}: uso de modelo vacío
25. ingreso inválido del modelo {campo extra}: ingreso de campo no permitido && todos los demás campos válidos
26. ingreso inválido del modelo {faltan campos y campo extra}: falta de campo e ingreso de campo no permitido && todos los demás campos válidos


║═══════════════════════════════════════════════════════════════════════════════════════════════════════════║
*/

connectDbTest();

describe('Tests asignaturaDocenteQueryValidation', () => {
    it('1. ingreso válido del query', () => {
        const query = { profesor: 'Juan Carlos Parra Marquez' };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeUndefined();
    });
    it('2. ingreso inválido del query {profesor}: no cumple con la expresion regular', () => {
        const query = { profesor: 'Juan Ca%rlos Parra Marquez' };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo solo puede contener letras y espacios.');
    });
    it('3. ingreso inválido del query {profesor}: tiene 14 caracteres', () => {
        const query = { profesor: 'J'.repeat(14) };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo debe tener como mínimo 15 caracteres.');
    });
    it('4. ingreso inválido del query {profesor}: tiene 51 caracteres', () => {
        const query = { profesor: 'J'.repeat(51) };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo debe tener como máximo 50 caracteres.');
    });
    it('5. ingreso inválido del query {profesor}: no es de tipo string', () => {
        const query = { profesor: 12345678901234 };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo debe ser de tipo string.');
    });
    it('6. ingreso inválido del query {profesor}: es vacío', () => {
        const query = { profesor: '' };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo no puede estar vacío.');
    });
    it('7. ingreso inválido del query {falta campo}: uso de query vacío', () => {
        const { error } = asignaturasDocenteQueryValidation.validate({});
        expect(error).toBeDefined();
        expect(error.message).toBe('Debe proporcionar el campo profesor.');
    });
    it('8. ingreso inválido del query {campo extra}: ingreso de campo no permitido && profesor válido', () => {
        const query = { profesor: 'Juan Carlos Parra Marquez', extraField: 'extra' };
        const { error } = asignaturasDocenteQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.message).toBe('No se permiten propiedades adicionales');
    });
});

describe('Tests asignaturaDocenteBodyValidation', () => {
    it('9. ingreso válido del body', () => {
        const body = { profesor: 'Juan Carlos Parra Marquez' };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeUndefined();
    });
    it('10. ingreso inválido del body {profesor}: no cumple con la expresion regular', () => {
        const body = { profesor: 'Juan Ca%rlos Parra Marquez' };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo solo puede contener letras y espacios.');
    });
    it('11. ingreso inválido del body {profesor}: tiene 14 caracteres', () => {
        const body = { profesor: 'J'.repeat(14) };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo debe tener como mínimo 15 caracteres.');
    });
    it('12. ingreso inválido del body {profesor}: tiene 51 caracteres', () => {
        const body = { profesor: 'J'.repeat(51) };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo debe tener como máximo 50 caracteres.');
    });
    it('13. ingreso inválido del body {profesor}: no es de tipo string', () => {
        const body = { profesor: 12345678901234 };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo debe ser de tipo string.');
    });
    it('14. ingreso inválido del body {profesor}: es vacío', () => {
        const body = { profesor: '' };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('El nombre completo no puede estar vacío.');
    });
    it('15. ingreso inválido del body {falta campos}: uso de body vacío', () => {
        const { error } = asignaturasDocenteBodyValidation.validate({});
        expect(error).toBeDefined();
        expect(error.message).toBe('Debe proporcionar el campo profesor.');
    });
    it('16. ingreso inválido del body {campo extra}: ingreso de campo no permitido && todos los demás campos válidos', () => {
        const body = { profesor: 'Juan Carlos Parra Marquez', extraField: 'extra' };
        const { error } = asignaturasDocenteBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.message).toBe('No se permiten propiedades adicionales');
    });
});

describe('Tests asignaturaDocenteModel', () => {
    it('17. ingreso válido del modelo', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: 'Juan Carlos Parra Marquez',
            asignaturas: ['Química General', 'Cálculo I']
        });
        const error = asignaturaDocente.validateSync();
        expect(error).toBeUndefined();
    });
    it('18. ingreso inválido del modelo {docente}: campo vacío && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: '', 
            asignaturas: ['Química General', 'Cálculo I']
        });
        await expect(asignaturaDocente.save()).rejects.toThrow('asignaturasDocente validation failed: docente: Path `docente` is required.');
    });
    it('19. ingreso inválido del modelo {docente}: no es del tipo string && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: 12345678901234, 
            asignaturas: ['Química General', 'Cálculo I']
        });
        await expect(asignaturaDocente.save()).rejects.toThrow('asignaturasDocente validation failed: docente: Cast to string failed for value "12345678901234" (type number) at path "docente"');
    });
    it('20. ingreso inválido del modelo {docente}: no existe campo && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            asignaturas: ['Química General', 'Cálculo I']
        });
        await expect(asignaturaDocente.save()).rejects.toThrow('asignaturasDocente validation failed: docente: Path `docente` is required.');
    });
    it('21. ingreso inválido del modelo {asignaturas}: no es un array del tipo string && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: 'Juan Carlos Parra Marquez', 
            asignaturas: 1234567890
        });
        await expect(asignaturaDocente.save()).rejects.toThrowError(/asignaturasDocente validation failed:/);
    });
    it('22  . ingreso inválido del modelo {asignaturas}: tiene un elemento vacío && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: 'Juan Carlos Parra Marquez', 
            asignaturas: ['']
        });
        await expect(asignaturaDocente.save()).rejects.toThrowError(/asignaturasDocente validation failed:/);
    });
    it('23. ingreso inválido del modelo {asignaturas}: tiene un elemento no string && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: 'Juan Carlos Parra Marquez', 
            asignaturas: [123456]
        });
        await expect(asignaturaDocente.save()).rejects.toThrowError(/asignaturasDocente validation failed:/);
    });
    it('24. ingreso inválido del modelo {faltan campos}: uso de modelo vacío', async () => {
        const asignaturaDocente = new AsignaturaDocente({});
        await expect(asignaturaDocente.save()).rejects.toThrow('asignaturasDocente validation failed: docente: Path `docente` is required.');
    });
    it('25. ingreso inválido del modelo {campo extra}: ingreso de campo no permitido && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            docente: 'Juan Carlos Parra Marquez',
            asignaturas: ['Química General', 'Cálculo I'],
            extraField: 'extra'
        });
        const savedAsignaturaDocente = await asignaturaDocente.save();
        expect(savedAsignaturaDocente.extraField).toBeUndefined();
    });
    it('26. ingreso inválido del modelo {faltan campos y campo extra}: falta de campo e ingreso de campo no permitido && todos los demás campos válidos', async () => {
        const asignaturaDocente = new AsignaturaDocente({
            asignaturas: ['Química General', 'Cálculo I'],
            extraField: 'extra'
        });
        await expect(asignaturaDocente.save()).rejects.toThrowError(/asignaturasDocente validation failed:/);
    });
});