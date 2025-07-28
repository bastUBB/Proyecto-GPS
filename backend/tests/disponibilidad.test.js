import Disponibilidad from "../src/models/disponibilidad.model";
import { describe, it, expect } from 'vitest';
import { connectDbTest } from '../src/config/dbTest.js';
import { bloqueSchema, disponibilidadBodyValidation, disponibilidadQueryValidation  } from '../src/validations/disponibilidad.validation';

/*
║═══════════════════════════════════════════════════ CASOS DE PRUEBA ═══════════════════════════════════════════════════║

╔════════════════════════════════╗
║           bloqueSchema         ║
╚════════════════════════════════╝

1. ingreso válido del bloque

2. ingreso inválido del bloque {dia}: no es del tipo string && todos los demás campos válidos
3. ingreso inválido del bloque {dia}: no es una palabra válida && todos los demás campos válidos
4. ingreso inválido del bloque  {dia}: es vacío && todos los demás campos válidos

5. ingreso inválido del bloque {horaInicio}: no es del tipo string && todos los demás campos válidos
6. ingreso inválido del bloque {horaInicio}: no cumple con la expresión regular && todos los demás campos válidos
7. ingreso inválido del bloque {horaInicio}: es vacío && todos los demás campos válidos

8. ingreso inválido del bloque {horaFin}: no es del tipo string && todos los demás campos válidos
9. ingreso inválido del bloque {horaFin}: no cumple con la expresión regular && todos los demás campos válidos
10. ingreso inválido del bloque {horaFin}: es vacío && todos los demás campos válidos

╔════════════════════════════════╗
║             BODY               ║
╚════════════════════════════════╝

11. ingreso válido del body

12. ingreso inválido del body {bloques}: no es un array && todos los demás campos válidos
13. ingreso inválido del body {bloques}: está vacío && todos los demás campos válidos
14. ingreso inválido del body {bloques}: no cumple con el esquema de bloque && todos los demás campos válidos

╔════════════════════════════════╗
║             Query              ║
╚════════════════════════════════╝

15. ingreso válido del query

16. ingreso inválido del query {profesorId}: no es del tipo string && todos los demás campos válidos
17. ingreso inválido del query {profesorId}: no cumple con la expresión regular && todos los demás campos válidos
18. ingreso inválido del query {profesorId}: es vacío && todos los demás campos válidos

║═══════════════════════════════════════════════════════════════════════════════════════════════════════════║
*/

connectDbTest();

describe('Disponibilidad Validations', () => {
    it('1. ingreso válido del bloque', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: "08:00",
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeUndefined();
    });
    it('2. ingreso inválido del bloque {dia}: no es del tipo string && todos los demás campos válidos', () => {
        const bloque = {
            dia: 123,
            horaInicio: "08:00",
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.message).toBe("El día debe no puede estar vacío y debe ser una cadena de texto válida (Lunes a Domingo)");
    });
    it('3. ingreso inválido del bloque {dia}: no es una palabra válida && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Funday",
            horaInicio: "08:00",
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("El día debe no puede estar vacío y debe ser una cadena de texto válida (Lunes a Domingo)");
    });
    it('4. ingreso inválido del bloque {dia}: es vacío && todos los demás campos válidos', () => {
        const bloque = {
            dia: "",
            horaInicio: "08:00",
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("El día debe no puede estar vacío y debe ser una cadena de texto válida (Lunes a Domingo)");
    });
    it('5. ingreso inválido del bloque {horaInicio}: no es del tipo string && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: 123,
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de inicio debe ser una cadena de texto");
    });
    it('6. ingreso inválido del bloque {horaInicio}: no cumple con la expresión regular && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: "25:00",
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de inicio debe tener formato HH:MM");
    });
    it('7. ingreso inválido del bloque {horaInicio}: es vacío && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: "",
            horaFin: "10:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de inicio no puede estar vacía");
    });
    it('8. ingreso inválido del bloque {horaFin}: no es del tipo string && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: "08:00",
            horaFin: 123
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de fin debe ser una cadena de texto");
    });
    it('9. ingreso inválido del bloque {horaFin}: no cumple con la expresión regular && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: "08:00",
            horaFin: "25:00"
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de fin debe tener formato HH:MM");
    });
    it('10. ingreso inválido del bloque {horaFin}: es vacío && todos los demás campos válidos', () => {
        const bloque = {
            dia: "Lunes",
            horaInicio: "08:00",
            horaFin: ""
        };
        const { error } = bloqueSchema.validate(bloque);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de fin no puede estar vacía");
    });
});

describe('Disponibilidad Body Validation', () => {
    it('11. ingreso válido del body', () => {
        const body = {
            bloques: [
                {
                    dia: "Lunes",
                    horaInicio: "08:00",
                    horaFin: "10:00"
                }
            ]
        };
        const { error } = disponibilidadBodyValidation.validate(body);
        expect(error).toBeUndefined();
    });
    it('12. ingreso inválido del body {bloques}: no es un array && todos los demás campos válidos', () => {
        const body = {
            bloques: "no es un array"
        };
        const { error } = disponibilidadBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("Los bloques de disponibilidad deben ser un array");
    });
    it('13. ingreso inválido del body {bloques}: está vacío && todos los demás campos válidos', () => {
        const body = {
            bloques: []
        };
        const { error } = disponibilidadBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("Debe haber al menos un bloque de disponibilidad");
    });
    it('14. ingreso inválido del body {bloques}: no cumple con el esquema de bloque && todos los demás campos válidos', () => {
        const body = {
            bloques: [
                {
                    dia: "Lunes",
                    horaInicio: "08:00"
                }
            ]
        };
        const { error } = disponibilidadBodyValidation.validate(body);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("La hora de fin es obligatoria");
    });
});

describe('Disponibilidad Query Validation', () => {
    it('15. ingreso válido del query', () => {
        const query = {
            profesorId: "60c72b2f9b1e8b001c8e4d3a"
        };
        const { error } = disponibilidadQueryValidation.validate(query);
        expect(error).toBeUndefined();
    });
    it('16. ingreso inválido del query {profesorId}: no es del tipo string && todos los demás campos válidos', () => {
        const query = {
            profesorId: 12345
        };
        const { error } = disponibilidadQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("El ID del profesor debe ser una cadena de texto ObjectId válida");
    });
    it('17. ingreso inválido del query {profesorId}: no cumple con la expresión regular && todos los demás campos válidos', () => {
        const query = {
            profesorId: "invalidObjectId"
        };
        const { error } = disponibilidadQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("El ID del profesor debe ser un ObjectId válido");
    });
    it('18. ingreso inválido del query {profesorId}: es vacío && todos los demás campos válidos', () => {
        const query = {
            profesorId: ""
        };
        const { error } = disponibilidadQueryValidation.validate(query);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("El ID del profesor no puede estar vacío");
    });
});