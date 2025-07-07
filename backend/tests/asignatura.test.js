import { describe, it, expect } from 'vitest';
import Asignatura from '../src/models/asignaturas.model.js';
import {connectDbTest} from '../src/config/dbTest.js';
import { asignaturaQueryValidation, asignaturaBodyValidation } from '../src/validations/asignaturas.validation.js';
import { createAsignaturaService } from '../src/services/asignaturas.service.js';
import { createAsignatura } from '../src/controllers/asignaturas.controller.js';

// hacer pruebas con json

/*
TESTS
1. inserción válida al modelo Asignatura
2. inserción válida query
3. inserción válida body
4. inserción inválida query por falta de parámetro 'codigo'
5. inserción inválida body por falta de parámetro 'nombre'
6. inserción inválida body por falta de parámetro 'codigo'
7. inserción inválida body por falta de parámetro 'creditos'
8. insercion inválida query por código no válido
9. inserción inválida body por código no válido
10. inserción inválida body por nombre no válido
11. inserción inválida body por créditos no válidos

*/

// Conexión a MongoDB
connectDbTest();

describe('Asignatura Model Tests', () => {
  // 1.
  it('debería guardar una asignatura válida', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT101',
      creditos: 4,
      prerrequisitos: []
    });

    const saved = await test_asignatura.save();
    expect(saved.nombre).toBe('Matemáticas Avanzadas');
    expect(saved.codigo).toBe('MAT101');
    expect(saved.creditos).toBe(4);
    expect(saved.prerrequisitos).toEqual([]);
  });
});
