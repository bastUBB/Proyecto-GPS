// backend/src/controllers/excelProcessor.controller.js
import { processExcelFromBuffer } from '../../scripts/extraccionExcel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Soporte para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processExcelFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No se proporcionó archivo Excel' 
            });
        }

        console.log('🔄 Procesando archivo Excel:', req.file.originalname);
        
        // Procesar el archivo usando SOLO la función del script
        const subjects = processExcelFromBuffer(req.file.buffer);
        
        console.log('✅ Extracción completada');
        console.log(`📊 Total de asignaturas extraídas: ${subjects.length}`);
        console.log('📄 JSON generado por el script:');
        console.log(JSON.stringify(subjects, null, 2));

        // Generar archivo .json físico
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = req.file.originalname.replace(/\.[^/.]+$/, ""); // Quitar extensión
        const jsonFileName = `${originalName}_extraido_${timestamp}.json`;
        const jsonFilePath = path.join(__dirname, '..', '..', 'output', jsonFileName);
        
        // Crear directorio output si no existe
        const outputDir = path.dirname(jsonFilePath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Guardar archivo JSON
        fs.writeFileSync(jsonFilePath, JSON.stringify(subjects, null, 2), 'utf8');
        console.log(`💾 Archivo JSON guardado en: ${jsonFilePath}`);

        // Respuesta sin base de datos
        return res.status(200).json({
            success: true,
            message: 'Archivo procesado exitosamente - JSON generado',
            fileName: req.file.originalname,
            totalSubjects: subjects.length,
            data: subjects,
            extractedAt: new Date().toISOString(),
            jsonFile: {
                name: jsonFileName,
                path: jsonFilePath,
                size: subjects.length
            }
        });

    } catch (error) {
        console.error('❌ Error procesando Excel:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al procesar el archivo',
            details: error.message 
        });
    }
};

// Función desactivada - sin conexión a BD
export const getStoredHorarios = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Función desactivada - sin conexión a base de datos',
        data: [],
        total: 0
    });
};
