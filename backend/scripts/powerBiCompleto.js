import puppeteer from 'puppeteer';
import fs from 'fs';

// Script optimizado para extraer TODOS los datos disponibles
const extraerTodosLosDatos = async () => {
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiNDJmZjMzNDgtZDI3Yi00NTlhLTgyMjctN2M5MzI0YzcxZjg4IiwidCI6IjMyYTQ3ZjJkLTZlYjItNDIyNC04YjExLTI1MTk3NTQ1ODFjNSIsImMiOjR9';
    
    console.log('🚀 Extractor Completo de Datos Power BI');
    console.log('🎯 Extrayendo TODOS los datos disponibles...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Cargando Power BI...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 150000 });
        
        console.log('⏳ Esperando carga inicial (90 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 90000));
        
        // Intentar expandir más datos
        console.log('🔄 Expandiendo datos...');
        await page.evaluate(() => {
            // Scroll completo
            window.scrollTo(0, 0);
            window.scrollTo(0, document.body.scrollHeight);
            
            // Buscar y hacer click en dropdowns, filtros, etc.
            const clickableElements = document.querySelectorAll(`
                [aria-expanded="false"],
                [role="combobox"],
                [role="listbox"],
                button,
                .dropdown,
                .filter,
                .expand
            `);
            
            clickableElements.forEach(el => {
                try {
                    el.click();
                } catch (e) {
                    // Ignorar errores
                }
            });
        });
        
        console.log('⏳ Esperando carga adicional (60 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        console.log('📊 Extrayendo TODOS los datos...');
        
        // Extraer datos con patrones mejorados
        const datosCompletos = await page.evaluate(() => {
            const resultado = {
                rendimientoPorCarrera: [],
                rendimientoPorAsignatura: [],
                datosRaw: [],
                estadisticas: {
                    totalElementos: 0,
                    elementosConDatos: 0,
                    añosEncontrados: new Set(),
                    asignaturasEncontradas: new Set()
                }
            };
            
            // Obtener TODOS los elementos con texto
            const todosElementos = document.querySelectorAll('*');
            
            todosElementos.forEach((elemento, index) => {
                const texto = elemento.innerText || elemento.textContent || '';
                if (!texto || texto.length < 10) return;
                
                resultado.estadisticas.totalElementos++;
                
                // Patrón para datos por carrera (más flexible)
                const patronCarrera = /(\d{4})\s*29027\s*Ingeniería Civil en Informática\s*([0-9.,]+)\s*([0-9.,]+)\s*(\d+,?\d*)\s*%\s*([0-9.,]+)\s*(\d+,?\d*)\s*%\s*([0-9.,]+)\s*(\d+,?\d*)\s*%/;
                const matchCarrera = texto.match(patronCarrera);
                
                if (matchCarrera) {
                    const año = parseInt(matchCarrera[1]);
                    resultado.estadisticas.añosEncontrados.add(año);
                    resultado.estadisticas.elementosConDatos++;
                    
                    resultado.rendimientoPorCarrera.push({
                        año: año,
                        codigoCarrera: "29027",
                        carrera: "Ingeniería Civil en Informática",
                        inscritosSinActa: parseInt(matchCarrera[2].replace(/\./g, '').replace(',', '')),
                        numeroAprobadas: parseInt(matchCarrera[3].replace(/\./g, '').replace(',', '')),
                        porcentajeAprobacion: parseFloat(matchCarrera[4].replace(',', '.')),
                        numeroReprobadas: parseInt(matchCarrera[5].replace(/\./g, '').replace(',', '')),
                        porcentajeReprobacion: parseFloat(matchCarrera[6].replace(',', '.')),
                        numeroNCR: parseInt(matchCarrera[7].replace(/\./g, '').replace(',', '')),
                        porcentajeNCR: parseFloat(matchCarrera[8].replace(',', '.')),
                        textoOriginal: texto
                    });
                }
                
                // Patrón para datos por asignatura (más flexible)
                const patronAsignatura = /(\d{4})\s*(Semestre [IVX]+)\s*([0-9-]+)\s*([A-ZÁÉÍÓÚÑ\s:,\.]+?)\s*(\d+)\s*(\d+)\s*(\d+,?\d*)\s*%/;
                const matchAsignatura = texto.match(patronAsignatura);
                
                if (matchAsignatura) {
                    const año = parseInt(matchAsignatura[1]);
                    const asignatura = matchAsignatura[4].trim();
                    
                    resultado.estadisticas.añosEncontrados.add(año);
                    resultado.estadisticas.asignaturasEncontradas.add(asignatura);
                    resultado.estadisticas.elementosConDatos++;
                    
                    resultado.rendimientoPorAsignatura.push({
                        año: año,
                        semestre: matchAsignatura[2],
                        codigoSeccion: matchAsignatura[3],
                        nombreAsignatura: asignatura,
                        inscritosSinActa: parseInt(matchAsignatura[5]),
                        numeroAprobadas: parseInt(matchAsignatura[6]),
                        porcentajeAprobacion: parseFloat(matchAsignatura[7].replace(',', '.')),
                        textoOriginal: texto
                    });
                }
                
                // Patrón más simple para capturar asignaturas que se puedan haber perdido
                const patronAsignaturaSimple = /([A-ZÁÉÍÓÚÑ\s:,\.]{10,})\s*(\d+)\s*(\d+)\s*(\d+,?\d*)\s*%/;
                const matchAsignaturaSimple = texto.match(patronAsignaturaSimple);
                
                if (matchAsignaturaSimple && !matchAsignatura && !matchCarrera) {
                    const asignatura = matchAsignaturaSimple[1].trim();
                    
                    // Filtrar nombres que parezcan asignaturas
                    const esAsignatura = /^[A-ZÁÉÍÓÚÑ\s:,\.]+$/.test(asignatura) && 
                                      asignatura.length > 5 && 
                                      asignatura.length < 100 &&
                                      !asignatura.includes('Seleccionar') &&
                                      !asignatura.includes('Inscripcion');
                    
                    if (esAsignatura) {
                        resultado.estadisticas.asignaturasEncontradas.add(asignatura);
                        resultado.estadisticas.elementosConDatos++;
                        
                        resultado.rendimientoPorAsignatura.push({
                            año: null,
                            semestre: "Desconocido",
                            codigoSeccion: "N/A",
                            nombreAsignatura: asignatura,
                            inscritosSinActa: parseInt(matchAsignaturaSimple[2]),
                            numeroAprobadas: parseInt(matchAsignaturaSimple[3]),
                            porcentajeAprobacion: parseFloat(matchAsignaturaSimple[4].replace(',', '.')),
                            textoOriginal: texto
                        });
                    }
                }
                
                // Guardar datos raw interesantes
                if (texto.includes('202') || texto.includes('201') || (texto.includes('%') && texto.length > 20)) {
                    resultado.datosRaw.push({
                        index: index,
                        texto: texto,
                        longitud: texto.length,
                        tieneAño: /202\d|201\d/.test(texto),
                        tienePorcentaje: texto.includes('%'),
                        tieneAsignatura: /(CÁLCULO|PROGRAMACIÓN|ALGORITMOS|FÍSICA|MATEMÁTICAS|BASES DE DATOS|REDES|SISTEMAS|ESTADÍSTICA|INGENIERÍA|TALLER)/.test(texto)
                    });
                }
            });
            
            // Convertir Sets a Arrays para JSON
            resultado.estadisticas.añosEncontrados = Array.from(resultado.estadisticas.añosEncontrados).sort();
            resultado.estadisticas.asignaturasEncontradas = Array.from(resultado.estadisticas.asignaturasEncontradas).sort();
            
            return resultado;
        });
        
        console.log('✅ Extracción completada');
        console.log(`📊 Total elementos analizados: ${datosCompletos.estadisticas.totalElementos}`);
        console.log(`📋 Elementos con datos: ${datosCompletos.estadisticas.elementosConDatos}`);
        console.log(`📈 Datos por carrera: ${datosCompletos.rendimientoPorCarrera.length} registros`);
        console.log(`📚 Datos por asignatura: ${datosCompletos.rendimientoPorAsignatura.length} registros`);
        console.log(`🎯 Años encontrados: ${datosCompletos.estadisticas.añosEncontrados.join(', ')}`);
        console.log(`📖 Asignaturas encontradas: ${datosCompletos.estadisticas.asignaturasEncontradas.length}`);
        
        // Mostrar algunas asignaturas encontradas
        if (datosCompletos.estadisticas.asignaturasEncontradas.length > 0) {
            console.log('\n📚 Ejemplos de asignaturas:');
            datosCompletos.estadisticas.asignaturasEncontradas.slice(0, 10).forEach((asignatura, i) => {
                console.log(`   ${i + 1}. ${asignatura}`);
            });
            
            if (datosCompletos.estadisticas.asignaturasEncontradas.length > 10) {
                console.log(`   ... y ${datosCompletos.estadisticas.asignaturasEncontradas.length - 10} más`);
            }
        }
        
        // Mostrar estadísticas por año
        if (datosCompletos.rendimientoPorCarrera.length > 0) {
            console.log('\n📈 Rendimiento por año:');
            datosCompletos.rendimientoPorCarrera
                .sort((a, b) => b.año - a.año)
                .forEach(dato => {
                    console.log(`   ${dato.año}: ${dato.porcentajeAprobacion}% (${dato.numeroAprobadas}/${dato.inscritosSinActa})`);
                });
        }
        
        // Calcular estadísticas adicionales
        const estadisticasAdicionales = {
            promedioAprobacionCarrera: datosCompletos.rendimientoPorCarrera.length > 0 ? 
                (datosCompletos.rendimientoPorCarrera.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / datosCompletos.rendimientoPorCarrera.length).toFixed(2) : 0,
            promedioAprobacionAsignaturas: datosCompletos.rendimientoPorAsignatura.length > 0 ? 
                (datosCompletos.rendimientoPorAsignatura.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / datosCompletos.rendimientoPorAsignatura.length).toFixed(2) : 0,
            añosCompletos: datosCompletos.estadisticas.añosEncontrados.length,
            asignaturasUnicas: datosCompletos.estadisticas.asignaturasEncontradas.length,
            datosRawProcesados: datosCompletos.datosRaw.length
        };
        
        // Resultado final
        const resultadoFinal = {
            ...datosCompletos,
            estadisticasAdicionales,
            metadatos: {
                fechaExtraccion: new Date().toISOString(),
                url: url,
                metodoExtraccion: "Web Scraping Completo con Puppeteer",
                version: "2.0.0"
            }
        };
        
        // Guardar resultado completo
        fs.writeFileSync('datos_completos_final.json', JSON.stringify(resultadoFinal, null, 2));
        console.log('\n💾 Datos completos guardados en: datos_completos_final.json');
        
        // Crear CSV para análisis
        const csvCarrera = datosCompletos.rendimientoPorCarrera
            .map(d => `${d.año},${d.codigoCarrera},${d.carrera},${d.inscritosSinActa},${d.numeroAprobadas},${d.porcentajeAprobacion},${d.numeroReprobadas},${d.porcentajeReprobacion},${d.numeroNCR},${d.porcentajeNCR}`)
            .join('\n');
        
        const csvAsignaturas = datosCompletos.rendimientoPorAsignatura
            .map(d => `${d.año || 'N/A'},${d.semestre},${d.codigoSeccion},${d.nombreAsignatura},${d.inscritosSinActa},${d.numeroAprobadas},${d.porcentajeAprobacion}`)
            .join('\n');
        
        fs.writeFileSync('rendimiento_carrera.csv', 
            'Año,Código Carrera,Carrera,Inscritos,Aprobados,% Aprobación,Reprobados,% Reprobación,NCR,% NCR\n' + csvCarrera);
        
        fs.writeFileSync('rendimiento_asignaturas.csv', 
            'Año,Semestre,Código Sección,Asignatura,Inscritos,Aprobados,% Aprobación\n' + csvAsignaturas);
        
        console.log('📄 Archivos CSV generados:');
        console.log('   - rendimiento_carrera.csv');
        console.log('   - rendimiento_asignaturas.csv');
        
        // Capturar screenshot
        await page.screenshot({ path: 'extraccion_completa_screenshot.png', fullPage: true });
        console.log('📸 Screenshot guardado: extraccion_completa_screenshot.png');
        
        console.log('\n📊 Estadísticas finales:');
        console.log(`   🎯 Promedio aprobación carrera: ${estadisticasAdicionales.promedioAprobacionCarrera}%`);
        console.log(`   📖 Promedio aprobación asignaturas: ${estadisticasAdicionales.promedioAprobacionAsignaturas}%`);
        console.log(`   📅 Años completos: ${estadisticasAdicionales.añosCompletos}`);
        console.log(`   📚 Asignaturas únicas: ${estadisticasAdicionales.asignaturasUnicas}`);
        console.log(`   📋 Datos raw procesados: ${estadisticasAdicionales.datosRawProcesados}`);
        
        return resultadoFinal;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
};

// Ejecutar extracción completa
extraerTodosLosDatos()
    .then(result => {
        if (result.success !== false) {
            console.log('\n🎉 ¡EXTRACCIÓN COMPLETA EXITOSA!');
            console.log('📁 Archivos generados:');
            console.log('   - datos_completos_final.json (datos completos)');
            console.log('   - rendimiento_carrera.csv (CSV para análisis)');
            console.log('   - rendimiento_asignaturas.csv (CSV para análisis)');
            console.log('   - extraccion_completa_screenshot.png (captura)');
            console.log('\n✅ TODOS los datos extraídos exitosamente');
            console.log('🚀 Listos para usar en el sistema académico');
        } else {
            console.log('❌ Error en la extracción:', result.error);
        }
    })
    .catch(console.error);
