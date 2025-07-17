import puppeteer from 'puppeteer';
import fs from 'fs';

// Script final para extraer y procesar datos ordenados de rendimiento
const procesarDatosRendimiento = async () => {
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiNDJmZjMzNDgtZDI3Yi00NTlhLTgyMjctN2M5MzI0YzcxZjg4IiwidCI6IjMyYTQ3ZjJkLTZlYjItNDIyNC04YjExLTI1MTk3NTQ1ODFjNSIsImMiOjR9';
    
    console.log('🎯 Procesamiento Final - Datos Ordenados de Rendimiento');
    console.log('📊 Extrayendo datos específicos del cajón "Rendimiento por Asignatura"');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Cargando Power BI...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
        
        console.log('⏳ Esperando carga inicial (60 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        // Intentar hacer scroll y clicks para cargar más datos
        console.log('🔄 Interactuando con la página para cargar más datos...');
        await page.evaluate(() => {
            // Hacer scroll hacia abajo para cargar más contenido
            window.scrollTo(0, document.body.scrollHeight);
            
            // Buscar y hacer click en elementos que puedan expandir datos
            const expandButtons = document.querySelectorAll('[aria-expanded="false"]');
            expandButtons.forEach(button => {
                try {
                    button.click();
                } catch (e) {
                    console.log('No se pudo hacer click en:', e);
                }
            });
            
            // Buscar dropdowns o filtros
            const dropdowns = document.querySelectorAll('[role="combobox"], [role="listbox"]');
            dropdowns.forEach(dropdown => {
                try {
                    dropdown.click();
                } catch (e) {
                    console.log('No se pudo abrir dropdown:', e);
                }
            });
        });
        
        console.log('⏳ Esperando carga adicional (120 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 120000));
        
        console.log('📊 Procesando datos...');
        
        // Extraer y procesar los datos
        const datosOrdenados = await page.evaluate(() => {
            const resultado = {
                rendimientoPorCarrera: [],
                rendimientoPorAsignatura: [],
                resumen: {
                    fechaExtraccion: new Date().toISOString(),
                    carrera: "Ingeniería Civil en Informática",
                    fuente: "Power BI - Rendimiento por Asignatura"
                }
            };
            
            // Obtener todas las filas
            const filas = document.querySelectorAll('[role="row"]');
            console.log(`Encontradas ${filas.length} filas para procesar`);
            
            filas.forEach((fila, index) => {
                const texto = fila.innerText || fila.textContent || '';
                
                // Procesar datos de rendimiento por carrera (datos anuales)
                const patronCarrera = /Seleccionar fila\s*(\d{4})\s*29027\s*Ingeniería Civil en Informática\s*([0-9.,]+)\s*([0-9.,]+)\s*(\d+,?\d*)\s*%\s*([0-9.,]+)\s*(\d+,?\d*)\s*%\s*([0-9.,]+)\s*(\d+,?\d*)\s*%/;
                const matchCarrera = texto.match(patronCarrera);
                
                if (matchCarrera) {
                    resultado.rendimientoPorCarrera.push({
                        año: parseInt(matchCarrera[1]),
                        codigoCarrera: "29027",
                        carrera: "Ingeniería Civil en Informática",
                        inscritosSinActa: matchCarrera[2].replace(/\./g, '').replace(',', '.'),
                        numeroAprobadas: matchCarrera[3].replace(/\./g, '').replace(',', '.'),
                        porcentajeAprobacion: parseFloat(matchCarrera[4].replace(',', '.')),
                        numeroReprobadas: matchCarrera[5].replace(/\./g, '').replace(',', '.'),
                        porcentajeReprobacion: parseFloat(matchCarrera[6].replace(',', '.')),
                        numeroNCR: matchCarrera[7].replace(/\./g, '').replace(',', '.'),
                        porcentajeNCR: parseFloat(matchCarrera[8].replace(',', '.')),
                        textoOriginal: texto
                    });
                }
                
                // Procesar datos de rendimiento por asignatura - patrón mejorado
                const patronAsignatura = /Seleccionar fila\s*(\d{4})\s*(Semestre [IVX]+)\s*([0-9-]+)\s*([A-ZÁÉÍÓÚÑ\s:,\.]+?)\s*(\d+)\s*(\d+)\s*(\d+,?\d*)\s*%/;
                const matchAsignatura = texto.match(patronAsignatura);
                
                if (matchAsignatura) {
                    resultado.rendimientoPorAsignatura.push({
                        año: parseInt(matchAsignatura[1]),
                        semestre: matchAsignatura[2],
                        codigoSeccion: matchAsignatura[3],
                        nombreAsignatura: matchAsignatura[4].trim(),
                        inscritosSinActa: parseInt(matchAsignatura[5]),
                        numeroAprobadas: parseInt(matchAsignatura[6]),
                        porcentajeAprobacion: parseFloat(matchAsignatura[7].replace(',', '.')),
                        textoOriginal: texto
                    });
                }
                
                // Patrón alternativo para asignaturas con formato diferente
                const patronAsignaturaAlt = /(\d{4})\s*(Semestre [IVX]+)\s*([0-9-]+)\s*([A-ZÁÉÍÓÚÑ\s:,\.]+?)\s+(\d+)\s+(\d+)\s+(\d+,?\d*)\s*%/;
                const matchAsignaturaAlt = texto.match(patronAsignaturaAlt);
                
                if (matchAsignaturaAlt && !matchAsignatura) {
                    resultado.rendimientoPorAsignatura.push({
                        año: parseInt(matchAsignaturaAlt[1]),
                        semestre: matchAsignaturaAlt[2],
                        codigoSeccion: matchAsignaturaAlt[3],
                        nombreAsignatura: matchAsignaturaAlt[4].trim(),
                        inscritosSinActa: parseInt(matchAsignaturaAlt[5]),
                        numeroAprobadas: parseInt(matchAsignaturaAlt[6]),
                        porcentajeAprobacion: parseFloat(matchAsignaturaAlt[7].replace(',', '.')),
                        textoOriginal: texto
                    });
                }
                
                // Buscar también datos que contengan nombres de asignaturas conocidas
                const asignaturasConocidas = [
                    'CÁLCULO', 'PROGRAMACIÓN', 'ALGORITMOS', 'ESTRUCTURAS DE DATOS',
                    'BASES DE DATOS', 'INGENIERÍA DE SOFTWARE', 'REDES', 'SISTEMAS',
                    'MATEMÁTICAS', 'FÍSICA', 'ESTADÍSTICA', 'INTELIGENCIA ARTIFICIAL'
                ];
                
                const tieneAsignatura = asignaturasConocidas.some(asig => 
                    texto.toUpperCase().includes(asig)
                );
                
                if (tieneAsignatura && texto.includes('%') && !matchAsignatura && !matchAsignaturaAlt) {
                    // Guardar texto completo para análisis posterior
                    if (texto.length > 20) {
                        resultado.rendimientoPorAsignatura.push({
                            año: null,
                            semestre: "Desconocido",
                            codigoSeccion: "N/A",
                            nombreAsignatura: "Análisis requerido",
                            inscritosSinActa: 0,
                            numeroAprobadas: 0,
                            porcentajeAprobacion: 0,
                            textoOriginal: texto,
                            requiereAnalisis: true
                        });
                    }
                }
            });
            
            return resultado;
        });
        
        console.log('✅ Procesamiento completado');
        console.log(`📊 Datos por carrera: ${datosOrdenados.rendimientoPorCarrera.length} registros`);
        console.log(`📚 Datos por asignatura: ${datosOrdenados.rendimientoPorAsignatura.length} registros`);
        
        // Mostrar resumen de datos por carrera
        if (datosOrdenados.rendimientoPorCarrera.length > 0) {
            console.log('\n📈 Rendimiento por Carrera:');
            datosOrdenados.rendimientoPorCarrera
                .sort((a, b) => b.año - a.año)
                .forEach(dato => {
                    console.log(`   ${dato.año}: ${dato.porcentajeAprobacion}% aprobación (${dato.numeroAprobadas}/${dato.inscritosSinActa})`);
                });
        }
        
        // Mostrar resumen de asignaturas
        if (datosOrdenados.rendimientoPorAsignatura.length > 0) {
            console.log('\n📚 Asignaturas encontradas:');
            const asignaturasUnicas = [...new Set(datosOrdenados.rendimientoPorAsignatura.map(a => a.nombreAsignatura))];
            asignaturasUnicas.slice(0, 10).forEach((asignatura, i) => {
                console.log(`   ${i + 1}. ${asignatura}`);
            });
            
            if (asignaturasUnicas.length > 10) {
                console.log(`   ... y ${asignaturasUnicas.length - 10} más`);
            }
        }
        
        // Calcular estadísticas adicionales
        const estadisticas = {
            rendimientoPorCarrera: {
                añosDisponibles: [...new Set(datosOrdenados.rendimientoPorCarrera.map(d => d.año))].sort(),
                promedioAprobacion: datosOrdenados.rendimientoPorCarrera.length > 0 ? 
                    (datosOrdenados.rendimientoPorCarrera.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / datosOrdenados.rendimientoPorCarrera.length).toFixed(2) : 0,
                mejorAño: datosOrdenados.rendimientoPorCarrera.length > 0 ? 
                    datosOrdenados.rendimientoPorCarrera.reduce((max, d) => d.porcentajeAprobacion > max.porcentajeAprobacion ? d : max) : null
            },
            rendimientoPorAsignatura: {
                añosDisponibles: [...new Set(datosOrdenados.rendimientoPorAsignatura.map(d => d.año))].sort(),
                totalAsignaturas: [...new Set(datosOrdenados.rendimientoPorAsignatura.map(d => d.nombreAsignatura))].length,
                semestresDisponibles: [...new Set(datosOrdenados.rendimientoPorAsignatura.map(d => d.semestre))].sort(),
                promedioAprobacion: datosOrdenados.rendimientoPorAsignatura.length > 0 ? 
                    (datosOrdenados.rendimientoPorAsignatura.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / datosOrdenados.rendimientoPorAsignatura.length).toFixed(2) : 0
            }
        };
        
        // Resultado final
        const resultadoFinal = {
            ...datosOrdenados,
            estadisticas: estadisticas,
            metadatos: {
                fechaExtraccion: new Date().toISOString(),
                url: url,
                metodoExtraccion: "Web Scraping con Puppeteer",
                version: "1.0.0"
            }
        };
        
        // Guardar resultado
        fs.writeFileSync('rendimiento_ordenado_final.json', JSON.stringify(resultadoFinal, null, 2));
        console.log('\n💾 Datos guardados en: rendimiento_ordenado_final.json');
        
        // Crear resumen ejecutivo
        const resumenEjecutivo = {
            titulo: "Resumen Ejecutivo - Rendimiento Ingeniería Civil en Informática",
            fechaExtraccion: new Date().toISOString(),
            resumen: {
                rendimientoPorCarrera: {
                    registros: datosOrdenados.rendimientoPorCarrera.length,
                    añosDisponibles: estadisticas.rendimientoPorCarrera.añosDisponibles,
                    promedioAprobacion: estadisticas.rendimientoPorCarrera.promedioAprobacion + "%",
                    mejorAño: estadisticas.rendimientoPorCarrera.mejorAño ? {
                        año: estadisticas.rendimientoPorCarrera.mejorAño.año,
                        aprobacion: estadisticas.rendimientoPorCarrera.mejorAño.porcentajeAprobacion + "%"
                    } : null
                },
                rendimientoPorAsignatura: {
                    registros: datosOrdenados.rendimientoPorAsignatura.length,
                    asignaturasUnicas: estadisticas.rendimientoPorAsignatura.totalAsignaturas,
                    añosDisponibles: estadisticas.rendimientoPorAsignatura.añosDisponibles,
                    semestresDisponibles: estadisticas.rendimientoPorAsignatura.semestresDisponibles,
                    promedioAprobacion: estadisticas.rendimientoPorAsignatura.promedioAprobacion + "%"
                }
            }
        };
        
        fs.writeFileSync('resumen_ejecutivo.json', JSON.stringify(resumenEjecutivo, null, 2));
        console.log('📋 Resumen ejecutivo guardado en: resumen_ejecutivo.json');
        
        // Capturar screenshot
        await page.screenshot({ path: 'rendimiento_final_screenshot.png', fullPage: true });
        console.log('📸 Screenshot guardado: rendimiento_final_screenshot.png');
        
        console.log('\n📊 Estadísticas finales:');
        console.log(`   📈 Rendimiento por carrera: ${estadisticas.rendimientoPorCarrera.añosDisponibles.length} años (${estadisticas.rendimientoPorCarrera.añosDisponibles.join(', ')})`);
        console.log(`   📚 Rendimiento por asignatura: ${estadisticas.rendimientoPorAsignatura.totalAsignaturas} asignaturas únicas`);
        console.log(`   🎯 Promedio aprobación carrera: ${estadisticas.rendimientoPorCarrera.promedioAprobacion}%`);
        console.log(`   📖 Promedio aprobación asignaturas: ${estadisticas.rendimientoPorAsignatura.promedioAprobacion}%`);
        
        return resultadoFinal;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
};

// Ejecutar procesamiento
procesarDatosRendimiento()
    .then(result => {
        if (result.success !== false) {
            console.log('\n🎉 ¡EXTRACCIÓN COMPLETADA EXITOSAMENTE!');
            console.log('📁 Archivos generados:');
            console.log('   - rendimiento_ordenado_final.json (datos completos)');
            console.log('   - resumen_ejecutivo.json (resumen)');
            console.log('   - rendimiento_final_screenshot.png (captura)');
            console.log('\n✅ Datos extraídos y ordenados correctamente');
            console.log('🎯 Listos para usar en el sistema académico');
        } else {
            console.log('❌ Error en el procesamiento:', result.error);
        }
    })
    .catch(console.error);
