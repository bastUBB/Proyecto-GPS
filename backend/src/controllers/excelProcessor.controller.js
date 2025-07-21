// backend/src/controllers/excelProcessor.controller.js
import { processExcelFromBuffer } from '../../scripts/extraccionExcel.js';
import { execSync } from 'child_process';
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

        //console.log('🔄 Procesando archivo Excel:', req.file.originalname);
        
        // Procesar el archivo usando SOLO la función del script
        const subjects = processExcelFromBuffer(req.file.buffer);
        
        //console.log('✅ Extracción completada');
        //console.log(`📊 Total de asignaturas extraídas: ${subjects.length}`);
        //console.log('📄 JSON generado por el script:');
        //console.log(JSON.stringify(subjects, null, 2));

        // Generar archivo .json físico
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = req.file.originalname.replace(/\.[^/.]+$/, ""); // Quitar extensión
        const jsonFileName = `horario_extraido.json`;
        const jsonFilePath = path.join(__dirname, '..', '..', 'output', jsonFileName);
        
        // Crear directorio output si no existe
        const outputDir = path.dirname(jsonFilePath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Guardar archivo JSON
        fs.writeFileSync(jsonFilePath, JSON.stringify(subjects, null, 2), 'utf8');
        //console.log(`💾 Archivo JSON guardado en: ${jsonFilePath}`);

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

// Función para procesar archivos Excel de rendimiento académico
export const processRendimientoFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No se proporcionó archivo Excel de rendimiento' 
            });
        }

        //console.log('📊 Procesando archivo de rendimiento:', req.file.originalname);
        
        // Guardar archivo temporalmente
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tempFileName = `temp_rendimiento_${timestamp}.xlsx`;
        const tempFilePath = path.join(__dirname, '..', '..', 'scripts', tempFileName);
        
        // Escribir buffer a archivo temporal
        fs.writeFileSync(tempFilePath, req.file.buffer);
        
        try {
            // Ejecutar script de procesamiento de rendimiento
            const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
            const command = `cd "${scriptsDir}" && node procesarDatosRendimiento.js "${tempFileName}"`;
            
            //console.log('🔄 Ejecutando script de procesamiento...');
            const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
            //console.log('✅ Script ejecutado:', output);
            
            // Buscar archivo JSON generado
            const outputDir = path.join(__dirname, '..', '..', 'output');
            const jsonFilePath = path.join(outputDir, 'datos_rendimiento.json');
            
            // Verificar que el archivo existe
            if (!fs.existsSync(jsonFilePath)) {
                throw new Error('No se generó el archivo datos_rendimiento.json');
            }
            
            // Leer archivo JSON generado
            const jsonContent = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            
            //console.log(`📄 Archivo JSON leído: datos_rendimiento.json`);
            //console.log(`📊 Total de registros: ${jsonContent.datos?.length || 0}`);
            
            // Respuesta
            return res.status(200).json({
                success: true,
                message: 'Archivo de rendimiento procesado exitosamente',
                fileName: req.file.originalname,
                totalSubjects: jsonContent.datos?.length || 0,
                data: jsonContent.datos || [],
                extractedAt: new Date().toISOString(),
                statistics: jsonContent.metadatos?.estadisticas || {},
                jsonFile: {
                    name: 'datos_rendimiento.json',
                    path: jsonFilePath,
                    size: jsonContent.datos?.length || 0
                }
            });
            
        } finally {
            // Limpiar archivo temporal
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                //console.log('🧹 Archivo temporal eliminado');
            }
        }

    } catch (error) {
        console.error('❌ Error procesando archivo de rendimiento:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor al procesar el archivo de rendimiento',
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
