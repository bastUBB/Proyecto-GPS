import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import pkg from 'xlsx'; // importar como paquete completo por compatibilidad CJS

const { readFile, utils } = pkg;

// Soporte para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo Excel
const excelPath = path.join(__dirname, '..', 'public', 'excel_horario_20250705201501.xlsx');

// Leer el archivo
const workbook = readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = utils.sheet_to_json(worksheet, { header: 1 });

// Función de extracción
export function extractSubjects(data) {
    const subjects = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 6) continue;

        const codigo = row[0]?.toString().trim() || '';
        const seccion = parseInt(row[1]) || null;
        const nombreAsignaturaDocente = row[4]?.toString().trim() || '';
        const [nombreAsignatura, docente] = nombreAsignaturaDocente.split('-').map(s => s.trim());

        const bloques = [];
        for (let j = 5; j < row.length; j++) {
            const cell = row[j]?.toString().trim();
            if (!cell) continue;

            const regex = /^(TEO|PRA|LAB): ([A-Z]{2,3}) (\d{2}:\d{2}) (\d{2}:\d{2})/;
            const match = cell.match(regex);

            if (match) {
                const [, tipo, dia, horaInicio, horaFin] = match;
                bloques.push({ tipo, dia, horaInicio, horaFin });
            }
        }

        subjects.push({
            asignaturaCodigo: codigo,
            seccion,
            asignatura: nombreAsignatura || '',
            docente: docente || '',
            bloques
        });
    }

    return subjects;
}

// Ejecutar extracción
// const extractedSubjects = extractSubjects(excelData);
// console.log(JSON.stringify(extractedSubjects, null, 2));

// Guardar como JSON
// fs.writeFileSync('output.json', JSON.stringify(extractedSubjects, null, 2), 'utf8');
// console.log('✅ Datos guardados en output.json');
