import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx'; // Importar xlsx correctamente

const { readFile, utils } = xlsx;

// Soporte para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función de extracción mejorada
export function extractSubjects(data) {
    const subjects = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 6) continue;

        const codigo = row[0]?.toString().trim() || '';
        const seccion = parseInt(row[1]) || null;
        const nombreAsignaturaDocente = row[4]?.toString().trim() || '';
        const [nombreAsignatura, docente] = nombreAsignaturaDocente.split('-').map(s => s.trim());

        // // Solo primera letra en mayúscula, resto en minúscula, respetando tildes
        // if (nombreAsignatura) {
        //     nombreAsignatura = nombreAsignatura.charAt(0).toUpperCase() + nombreAsignatura.slice(1).toLowerCase();
        // }

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

// Función para procesar archivo Excel desde buffer
export function processExcelFromBuffer(buffer) {
    try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        return extractSubjects(excelData);
    } catch (error) {
        console.error('Error procesando Excel:', error);
        throw error;
    }
}

// Función para procesar archivo Excel desde path
export function processExcelFromPath(filePath) {
    try {
        const workbook = readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = utils.sheet_to_json(worksheet, { header: 1 });
        
        return extractSubjects(excelData);
    } catch (error) {
        console.error('Error procesando Excel:', error);
        throw error;
    }
}

// Ejecutar extracción si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    // Ruta al archivo Excel
    // const excelPath = path.join(__dirname, '..', 'public', 'excel_horario_20250705201501.xlsx');
    
    try {
        const extractedSubjects = processExcelFromPath(excelPath);
        console.log('✅ Extracción completada');
        console.log(`📊 Total de asignaturas extraídas: ${extractedSubjects.length}`);
        
        // Guardar como JSON
        fs.writeFileSync('output.json', JSON.stringify(extractedSubjects, null, 2), 'utf8');
        console.log('💾 Datos guardados en output.json');
    } catch (error) {
        console.error('❌ Error en la extracción:', error);
    }
}
