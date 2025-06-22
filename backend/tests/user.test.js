import { describe, it, expect} from 'vitest';
import Asignatura from '../src/models/asignatura.js';

describe('Modelo Asignatura', () => {
  it('debería guardar una asignatura válida', async () => {
    const asignatura = new Asignatura({
      nombre: 'Matemáticas Avanzadas',
      codigo: 'MAT401',
      creditos: 6,
      descripcion: 'Curso avanzado de cálculo y álgebra lineal.',
      profesor: 'Dr. Pérez',
      semestre: '2025-1',
      prerequisitos: ['MAT101', 'MAT201']
    });

    const saved = await asignatura.save();
    expect(saved._id).toBeDefined();
    expect(saved.nombre).toBe('Matemáticas Avanzadas');
  });
});

//hacer tablas con json con foreach