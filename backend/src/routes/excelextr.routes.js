// backend/routes/excelRoutes.js
import express from 'express';
import multer from 'multer';
import { processExcelFile, getStoredHorarios, processRendimientoFile } from '../controllers/excelProcessor.controller.js';

const router = express.Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    },
    fileFilter: (req, file, cb) => {
        // Validar tipos de archivo Excel
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)'));
        }
    }
});

// Ruta para procesar archivo Excel de horarios
router.post('/procesar-excel', upload.single('excelFile'), processExcelFile);

// Ruta para procesar archivo Excel de rendimiento
router.post('/procesar-rendimiento', upload.single('excelFile'), processRendimientoFile);

// Ruta para obtener horarios almacenados
router.get('/horarios', getStoredHorarios);

export default router;