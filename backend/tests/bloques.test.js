// import { describe, it, expect } from 'vitest';
// import Bloques from '../src/models/bloques.models.js';
// import {connectDbTest} from '../src/config/dbTest.js';

// /*
// TESTS
// 1. inserción válida
// 2. falta de parametro horaInicio
// 3. falta de parametro horaFin
// 4. falta de parametro dia
// 5. error de sintaxis en horaInicio
// 6. error de sintaxis en horaFin
// 7. error de sintaxis en dia
// 8. error de contenido en horaInicio
// 9. error de contenido en horaFin
// 10. error de contenido en dia
// */

// // Conexión a MongoDB
// connectDbTest();

// describe('Test al modelo Bloques', () => {
//     //.1
//     it('debería guardar un bloque válido', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             horaFin: '10:00',
//             dia: 'Lunes'
//         });

//         const saved = await test_bloque.save();
//         expect(saved.horaInicio).toBe('08:00');
//         expect(saved.horaFin).toBe('10:00');
//         expect(saved.dia).toBe('Lunes');
//     });
//     //.2
//     it('debería fallar al guardar sin horaInicio', async () => {
//         const test_bloque = new Bloques({
//             horaFin: '10:00',
//             dia: 'Lunes'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.3
//     it('debería fallar al guardar sin horaFin', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             dia: 'Lunes'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.4
//     it('debería fallar al guardar sin dia', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             horaFin: '10:00'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.5
//     it('debería fallar al guardar con horaInicio inválida', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:60',
//             horaFin: '10:00',
//             dia: 'Lunes'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.6
//     it('debería fallar al guardar con horaFin inválida', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             horaFin: '10:60',
//             dia: 'Lunes'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.7
//     it('debería fallar al guardar con dia inválido', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             horaFin: '10:00',
//             dia: 'Domingo'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.8
//     it('debería fallar al guardar un tipo de dato incorrecto en horaInicio', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: 4000, 
//             horaFin: '10:00',
//             dia: 'Lunes'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.9
//     it('debería fallar al guardar un tipo de dato incorrecto en horaFin', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             horaFin: 1000, 
//             dia: 'Lunes'
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
//     //.10
//     it('debería fallar al guardar un tipo de dato incorrecto en dia', async () => {
//         const test_bloque = new Bloques({
//             horaInicio: '08:00',
//             horaFin: '10:00',
//             dia: 1 
//         });

//         await expect(test_bloque.save()).rejects.toThrow();
//     });
// });