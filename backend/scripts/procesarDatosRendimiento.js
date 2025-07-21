import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

// Obtener __dirname para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para procesar datos de rendimiento académico desde archivos Excel
 * Extrae información de asignaturas y las organiza en formato JSON
 */

const buscarArchivosExcel = (directorio) => {
    const archivos = fs.readdirSync(directorio);
    return archivos.filter(archivo =>
        archivo.endsWith('.xlsx') || archivo.endsWith('.xls')
    );
};

const procesarDatosRendimiento = (nombreArchivoExcel = null) => {
    //console.log('📊 Iniciando procesamiento de datos de rendimiento desde Excel...');

    try {
        let archivoPath;

        if (nombreArchivoExcel) {
            // Usar archivo específico
            archivoPath = path.join(__dirname, nombreArchivoExcel);
            if (!fs.existsSync(archivoPath)) {
                throw new Error(`Archivo no encontrado: ${nombreArchivoExcel}`);
            }
        } else {
            // Buscar archivos Excel en la carpeta scripts
            const archivosExcel = buscarArchivosExcel(__dirname);
            if (archivosExcel.length === 0) {
                throw new Error('No se encontraron archivos Excel (.xlsx/.xls) en la carpeta scripts');
            }

            // Tomar el primer archivo Excel encontrado
            archivoPath = path.join(__dirname, archivosExcel[0]);
            //console.log(`📁 Archivo Excel encontrado: ${archivosExcel[0]}`);
        }

        // Leer archivo Excel
        //console.log('📖 Leyendo archivo Excel...');
        const workbook = XLSX.readFile(archivoPath);

        // Obtener la primera hoja
        const nombreHoja = workbook.SheetNames[0];
        const hoja = workbook.Sheets[nombreHoja];

        //console.log(`� Procesando hoja: ${nombreHoja}`);

        // Convertir a JSON (mantiene las celdas vacías como undefined)
        const datosRaw = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' });

        if (datosRaw.length === 0) {
            throw new Error('El archivo Excel está vacío');
        }

        // La primera fila son los headers
        const headers = datosRaw[0];
        //console.log('📋 Headers encontrados:', headers);

        const datosCompletos = [];
        const asignaturasExcluidas = [];

        // Procesar cada fila de datos (saltando la primera que son headers)
        for (let i = 1; i < datosRaw.length; i++) {
            const fila = datosRaw[i];

            if (fila.length >= 7) { // Verificar que tenga suficientes campos
                const registro = {
                    año: String(fila[0] || '').trim(),
                    semestre: String(fila[1] || '').trim(),
                    codigoSeccion: String(fila[2] || '').trim(),
                    nombreAsignatura: String(fila[3] || '').trim(),
                    inscritosSinActa: parseInt(fila[4]) || 0,
                    numeroAprobadas: parseInt(fila[5]) || 0,
                    porcentajeAprobacion: String(fila[6] || '0%').trim(),
                    numeroReprobadas: parseInt(fila[7]) || 0,
                    porcentajeReprobacion: String(fila[8] || '0%').trim(),
                    numeroNCR: parseInt(fila[9]) || 0,
                    porcentajeNCR: String(fila[10] || '0%').trim()
                };

                // Normalizar porcentaje de aprobación
                if (!registro.porcentajeAprobacion || registro.porcentajeAprobacion.trim() === '') {
                    registro.porcentajeAprobacion = '0%';
                }

                // Si el porcentaje es un número decimal (ej: 0.85), convertirlo a porcentaje
                if (!registro.porcentajeAprobacion.includes('%')) {
                    const numero = parseFloat(registro.porcentajeAprobacion);
                    if (!isNaN(numero)) {
                        if (numero <= 1) {
                            // Es decimal (0.85 = 85%)
                            registro.porcentajeAprobacion = `${(numero * 100).toFixed(1)}%`;
                        } else {
                            // Es número entero (85 = 85%)
                            registro.porcentajeAprobacion = `${numero}%`;
                        }
                    }
                }

                // Extraer solo el código (sin la sección)
                const codigoAsignatura = registro.codigoSeccion.split('-')[0];

                // Verificar si es asignatura a excluir (códigos 34* o 35* excepto comunicación oral e inglés)
                const esCodigoExcluir = codigoAsignatura.startsWith('34') || codigoAsignatura.startsWith('35');
                const esComunicacionOral = registro.nombreAsignatura.toLowerCase().includes('comunicación oral') ||
                    registro.nombreAsignatura.toLowerCase().includes('comunicacion oral');
                const esIngles = registro.nombreAsignatura.toLowerCase().includes('inglés') ||
                    registro.nombreAsignatura.toLowerCase().includes('ingles') ||
                    registro.nombreAsignatura.toLowerCase().includes('english');

                // Solo excluir si tiene código 34*/35* Y NO es comunicación oral NI inglés
                const esAsignaturaExcluir = esCodigoExcluir && !esComunicacionOral && !esIngles;

                if (esAsignaturaExcluir) {
                    asignaturasExcluidas.push(registro);
                } else {
                    datosCompletos.push(registro);
                }
            }
        }

        //console.log(`✅ Procesadas ${datosCompletos.length} asignaturas principales`);
        //console.log(`🚫 Excluidas ${asignaturasExcluidas.length} asignaturas (códigos 34*/35* excepto comunicación oral e inglés)`);

        // Ordenar datos por año, semestre y código
        datosCompletos.sort((a, b) => {
            if (a.año !== b.año) return b.año.localeCompare(a.año); // Más reciente primero
            if (a.semestre !== b.semestre) return a.semestre.localeCompare(b.semestre);
            return a.codigoSeccion.localeCompare(b.codigoSeccion);
        });

        asignaturasExcluidas.sort((a, b) => {
            if (a.año !== b.año) return b.año.localeCompare(a.año);
            if (a.semestre !== b.semestre) return a.semestre.localeCompare(b.semestre);
            return a.codigoSeccion.localeCompare(b.codigoSeccion);
        });

        // Crear estadísticas
        const estadisticas = {
            totalRegistros: datosCompletos.length + asignaturasExcluidas.length,
            registrosPrincipales: datosCompletos.length,
            registrosExcluidos: asignaturasExcluidas.length,
            años: [...new Set(datosCompletos.map(r => r.año))].sort().reverse(),
            semestres: [...new Set(datosCompletos.map(r => r.semestre))].sort(),
            fechaProcesamiento: new Date().toISOString()
        };

        // Agrupar por año para mejor organización
        const datosPorAño = {};
        datosCompletos.forEach(registro => {
            if (!datosPorAño[registro.año]) {
                datosPorAño[registro.año] = {
                    semestreI: [],
                    semestreII: []
                };
            }

            if (registro.semestre.includes('I') && !registro.semestre.includes('II')) {
                datosPorAño[registro.año].semestreI.push(registro);
            } else if (registro.semestre.includes('II')) {
                datosPorAño[registro.año].semestreII.push(registro);
            }
        });

        // Crear objeto final
        const resultado = {
            metadatos: {
                descripcion: 'Datos de rendimiento académico - Ingeniería Civil en Informática',
                fuente: 'Archivo Excel - Tasas de Aprobación, Reprobación y NCR',
                archivoOrigen: path.basename(archivoPath),
                fechaProcesamiento: new Date().toISOString(),
                estadisticas: estadisticas
            },
            datos: {
                completos: datosCompletos,
                porAño: datosPorAño,
                excluidos: asignaturasExcluidas
            }
        };

        // Crear directorio output si no existe
        const outputDir = path.join(__dirname, '..', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Crear objeto simplificado con solo los datos principales
        const resultadoSimplificado = {
            metadatos: resultado.metadatos,
            datos: datosCompletos.map(r => ({
                año: r.año,
                semestre: r.semestre,
                codigoSeccion: r.codigoSeccion,
                nombreAsignatura: r.nombreAsignatura,
                porcentajeAprobacion: r.porcentajeAprobacion,
                inscritos: r.inscritosSinActa,
                aprobados: r.numeroAprobadas
            }))
        };

        // Guardar archivo de datos de rendimiento
        const archivoSalida = path.join(outputDir, 'datos_rendimiento.json');
        fs.writeFileSync(archivoSalida, JSON.stringify(resultadoSimplificado, null, 2));
        //console.log(`💾 Archivo guardado: ${archivoSalida}`);

        // Mostrar resumen
        //console.log('\n📊 RESUMEN DEL PROCESAMIENTO:');
        //console.log(`📅 Años procesados: ${estadisticas.años.join(', ')}`);
        //console.log(`📚 Total asignaturas principales: ${estadisticas.registrosPrincipales}`);
        //console.log(`🚫 Total asignaturas excluidas: ${estadisticas.registrosExcluidos}`);
        //console.log(`📊 Registros por año:`);

        estadisticas.años.forEach(año => {
            const registrosAño = datosCompletos.filter(r => r.año === año);
            const semestreI = registrosAño.filter(r => r.semestre.includes('I') && !r.semestre.includes('II'));
            const semestreII = registrosAño.filter(r => r.semestre.includes('II'));
            //console.log(`   ${año}: ${registrosAño.length} total (Sem I: ${semestreI.length}, Sem II: ${semestreII.length})`);
        });

        // Mostrar ejemplos de asignaturas excluidas
        if (asignaturasExcluidas.length > 0) {
            //console.log('\n🚫 EJEMPLOS DE ASIGNATURAS EXCLUIDAS:');
            const ejemplos = asignaturasExcluidas.slice(0, 10);
            ejemplos.forEach(asig => {
                //console.log(`   ${asig.codigoSeccion}: ${asig.nombreAsignatura}`);
            });
            if (asignaturasExcluidas.length > 10) {
                //console.log(`   ... y ${asignaturasExcluidas.length - 10} más`);
            }
        }

        // Mostrar asignaturas con menor % de aprobación
        //console.log('\n📉 ASIGNATURAS CON MENOR % DE APROBACIÓN (2024):');
        const asignaturas2024 = datosCompletos.filter(r => r.año === '2024');
        const menorAprobacion = asignaturas2024
            .map(r => ({
                ...r,
                porcentajeNumerico: parseFloat(r.porcentajeAprobacion.replace('%', '')) || 0
            }))
            .sort((a, b) => a.porcentajeNumerico - b.porcentajeNumerico)
            .slice(0, 10);

        menorAprobacion.forEach(asig => {
            //console.log(`   ${asig.codigoSeccion}: ${asig.nombreAsignatura} - ${asig.porcentajeAprobacion}`);
        });

        return {
            archivo: path.basename(archivoSalida),
            rutaCompleta: archivoSalida,
            estadisticas: estadisticas
        };

    } catch (error) {
        console.error('❌ Error procesando los datos:', error.message);
        console.error('Stack:', error.stack);
        return null;
    }
};

// Ejecutar el script
//console.log('🚀 Iniciando procesamiento de datos de rendimiento académico desde Excel...');

// Permitir especificar archivo como argumento de línea de comandos
const archivoEspecificado = process.argv[2];
const resultado = procesarDatosRendimiento(archivoEspecificado);

if (resultado) {
    //console.log('\n✅ ¡PROCESAMIENTO COMPLETADO!');
    //console.log(`📁 Archivo generado: ${resultado.archivo}`);
    //console.log(`📂 Ruta completa: ${resultado.rutaCompleta}`);
    //console.log(`📊 Total registros procesados: ${resultado.estadisticas.totalRegistros}`);
} else {
    //console.log('❌ Error en el procesamiento');
}
