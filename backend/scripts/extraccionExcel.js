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
        if (!row || row.length < 6) continue; // Aumentamos la validación para incluir las nuevas columnas

        const codigo = row[0]?.toString().trim() || '';
        const seccion = parseInt(row[1]) || null;
        const cupos = parseInt(row[2]) || 0;
        const inscritos = parseInt(row[3]) || 0;
        const nombreAsignaturaDocente = row[4]?.toString().trim() || '';
        const [nombreAsignatura, docente] = nombreAsignaturaDocente.split('-').map(s => s.trim());
        
        const bloques = [];
        for (let j = 5; j < row.length; j++) {
            const cell = row[j]?.toString().trim();
            if (!cell) continue;

            // Regex mejorada para extraer también la sala
            const regex = /^(TEO|PRA|LAB): ([A-Z]{2,3}) (\d{2}:\d{2}) (\d{2}:\d{2})\s+(.+)$/;
            const match = cell.match(regex);

            if (match) {
                const [, tipo, dia, horaInicio, horaFin, sala] = match;
                bloques.push({ 
                    tipo, 
                    dia, 
                    horaInicio, 
                    horaFin, 
                    sala: sala.trim() 
                });
            }
        }

        // Lista de asignaturas de la malla curricular oficial
        const mallaOficial = [
            "Álgebra y Trigonometría", "Introducción a la Ingeniería", "Comunicación Oral y Escrita",
            "Introducción a la Programación", "Formación Integral I", "Cálculo Diferencial",
            "Química General", "Programación Orientada a Objetos", "Estructuras Discretas para Cs. de la Computación",
            "Formación Integral II", "Formación Integral III", "Cálculo Integral", "Álgebra Lineal",
            "Física Newtoniana", "Estructura de Datos", "Inglés I", "Administración General",
            "Cálculo en Varias Variables", "Ecuaciones Diferenciales", "Electro-magnetismo",
            "Modelamiento de Procesos e Información", "Inglés II", "Formación Integral IV",
            "Ondas, Óptica y Física Moderna", "Sistemas Digitales", "Fundamentos de las Ciencias de la Computación",
            "Teoría de Sistemas", "Inglés III", "Gestión Contable", "Estadística y Probabilidades",
            "Economía", "Análisis y Diseño de Algoritmos", "Base de Datos", "Inglés IV",
            "Práctica Profesional 1", "Investigación de Operaciones", "Arquitectura de Computadores",
            "Administración y Programación de Base de Datos", "Sistemas de Información", "Gestión Estratégica",
            "Formación Integral V", "Gestión Presupuestaria y Financiera", "Legislación", "Sistemas Operativos",
            "Inteligencia Artificial", "Ingeniería de Software", "Formulación y Evaluación de Proyectos",
            "Práctica Profesional 2", "Anteproyecto de Título", "Comunicación de Datos y Redes",
            "Electivo Profesional 1", "Electivo Profesional 2", "Electivo Profesional 3",
            "Gestión de Proyectos de Software", "Gestión de Recursos Humanos", "Proyecto de Título",
            "Seguridad Informática", "Electivo Profesional 4", "Electivo Profesional 5", "Electivo Profesional 6"
        ];

        // Función para normalizar nombres de asignaturas para comparación
        const normalizarNombre = (nombre) => {
            return nombre.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos
                .replace(/[^\w\s]/g, " ") // Reemplazar caracteres especiales con espacios
                .replace(/\s+/g, " ") // Múltiples espacios a uno solo
                .trim();
        };

        // Verificar si la asignatura está en la malla curricular
        const nombreNormalizado = normalizarNombre(nombreAsignatura || '');
        const esAsignaturaMalla = mallaOficial.some(asignaturaMalla => {
            const mallaNormalizada = normalizarNombre(asignaturaMalla);
            return nombreNormalizado.includes(mallaNormalizada) || mallaNormalizada.includes(nombreNormalizado);
        });

        // Solo agregar si está en la malla curricular
        if (esAsignaturaMalla) {
            subjects.push({
                asignaturaCodigo: codigo,
                seccion,
                cupos,
                inscritos,
                disponibles: cupos - inscritos, // Calculamos los cupos disponibles
                asignatura: nombreAsignatura || '',
                docente: docente || '',
                bloques
            });
        }
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
        //console.log('✅ Extracción completada');
        //console.log(`📊 Total de asignaturas extraídas: ${extractedSubjects.length}`);
        
        // Guardar como JSON
        fs.writeFileSync('output.json', JSON.stringify(extractedSubjects, null, 2), 'utf8');
        //console.log('💾 Datos guardados en output.json');
    } catch (error) {
        console.error('❌ Error en la extracción:', error);
    }
}
