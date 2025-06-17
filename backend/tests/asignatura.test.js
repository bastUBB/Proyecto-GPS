import { describe, it, expect } from 'vitest';
import Asignatura from '../src/models/asignaturas.model.js';
import {connectDbTest} from '../src/config/dbTest.js';

/*
TESTS
1. inserción válida
2. falta de parámetro código
3. falta de parámetro créditos
5. error de sintaxis en nombre
6. error de sintaxis de código
7. error de sintaxis de créditos
8. error de contenido en prerequisitos
*/

// Conexión a MongoDB
connectDbTest();

describe('Tests al modelo Asignatura', () => {
  //.1
  it('debería guardar una asignatura válida', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT101',
      creditos: 4,
      prerequisitos: []
    });

    const saved = await test_asignatura.save();
    expect(saved.nombre).toBe('Matemáticas Avanzadas');
    expect(saved.codigo).toBe('MAT101');
    expect(saved.creditos).toBe(4);
    expect(saved.prerequisitos).toEqual([]);
  });
  //.2
  it('debería fallar al guardar sin código', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      creditos: 4,
      prerequisitos: []
    });

    await expect(test_asignatura.save()).rejects.toThrow();
  });
  //.3
  it('debería fallar al guardar sin créditos', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT101',
      prerequisitos: []
    });

    await expect(test_asignatura.save()).rejects.toThrow();
  });
  //.5
  it('debería fallar al guardar con nombre inválido', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas! Avanzadas',
      codigo: 'MAT103',
      creditos: 4,
      prerequisitos: []
    });

    await expect(test_asignatura.save()).rejects.toThrow();
  });
  //.6
  // TODO: Falta de expresión regular testear el código
  // it('debería fallar al guardar con código inválido', async () => {
  //   const test_asignatura = new Asignatura({
  //     nombre: 'Matemáticas Avanzadas',
  //     codigo: 'M@T101',
  //     creditos: 4,
  //     prerequisitos: []
  //   });

  //   await expect(test_asignatura.save()).rejects.toThrow();
  // });
  //.7
  it('debería fallar al guardar con créditos inválidos', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT101',
      creditos: 11, // fuera del rango permitido
      prerequisitos: []
    });

    await expect(test_asignatura.save()).rejects.toThrow();
  });
  //.8
  it('debería fallar al guardar con prerequisitos inválidos', async () => {
    const test_asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT101',
      creditos: 4,
      prerequisitos: ['invalid_id'] // ID no válido
    });

    await expect(test_asignatura.save()).rejects.toThrow();
  });
});
