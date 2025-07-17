// backend/routes/excelRoutes.js
import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
// import { extractSubjects } from '../utils/excelParser.js'; // Importa tu función de extracción
// backend/utils/excelParser.js

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
    
    console.log('Extracción completada');
    const firstFour = subjects.slice(0, 4);
    const lastFour = subjects.slice(-4);
    console.log(JSON.stringify({ firstFour, lastFour }, null, 2));
    return subjects;
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/procesar-excel', upload.single('excelFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo Excel' });
        }

        // Procesar el archivo en memoria
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extraer datos usando tu función
        const subjects = extractSubjects(excelData);

        res.json({
            success: true,
            data: subjects,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error('Error procesando Excel:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
});

export default router;