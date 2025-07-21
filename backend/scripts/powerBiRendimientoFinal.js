import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';

// Función para esperar entrada del usuario
const esperarTecla = (mensaje) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`${mensaje}\nPresiona ENTER para continuar...`, () => {
            rl.close();
            resolve();
        });
    });
};

// Función para verificar si hemos llegado al año 2020
const verificarAño2020 = async (page) => {
    return await page.evaluate(() => {
        const texto = document.body.innerText || document.body.textContent || '';
        return texto.includes('2020');
    });
};

// Script final para extraer y procesar datos ordenados de rendimiento
const procesarDatosRendimiento = async () => {
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiNDJmZjMzNDgtZDI3Yi00NTlhLTgyMjctN2M5MzI0YzcxZjg4IiwidCI6IjMyYTQ3ZjJkLTZlYjItNDIyNC04YjExLTI1MTk3NTQ1ODFjNSIsImMiOjR9';
    
    //console.log('🎯 Procesamiento Final - Datos Ordenados de Rendimiento');
    //console.log('📊 Extrayendo datos específicos del cajón "Rendimiento por Asignatura"');
    //console.log('⏸️  El script se pausará después de cargar la página');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null
    });
    
    const page = await browser.newPage();
    
    try {
        //console.log('🌐 Cargando Power BI...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
        
        //console.log('⏳ Esperando carga inicial (30 segundos)...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        //console.log('✅ Página cargada completamente');
        //console.log('📋 Revisa la página y posiciónate donde necesites');
        //console.log('🎯 Cuando estés listo para comenzar la extracción...');
        
        // PAUSA - Esperar input del usuario
        await esperarTecla('🔄 La extracción comenzará y hará scroll hasta encontrar el año 2020');
        
        //console.log('� Iniciando extracción automática...');
        //console.log('📊 Buscando datos hasta llegar al año 2020...');
        
        let encontrado2020 = false;
        let intentos = 0;
        const maxIntentos = 50; // Máximo 50 scrolls
        
        const datosEncontrados = [];
        
        while (!encontrado2020 && intentos < maxIntentos) {
            intentos++;
            //console.log(`🔄 Intento ${intentos}/${maxIntentos} - Extrayendo datos visibles...`);
            
            // Extraer datos de la vista actual
            const datosActuales = await page.evaluate(() => {
                const resultado = [];
                const filas = document.querySelectorAll('[role="row"]');
                
                filas.forEach((fila) => {
                    const texto = fila.innerText || fila.textContent || '';
                    
                    // Buscar patrones de años en el texto
                    const patronAño = /(\d{4})/g;
                    const añosEncontrados = texto.match(patronAño);
                    
                    if (añosEncontrados) {
                        añosEncontrados.forEach(año => {
                            const añoNum = parseInt(año);
                            if (añoNum >= 2020 && añoNum <= 2025) {
                                resultado.push({
                                    año: añoNum,
                                    texto: texto.trim(),
                                    timestamp: new Date().toISOString()
                                });
                            }
                        });
                    }
                    
                    // También buscar datos con patrones específicos de rendimiento
                    const patronRendimiento = /(\d{4})\s*(Semestre [IVX]+)\s*([0-9-]+)\s*([A-ZÁÉÍÓÚÑ\s:,\.]+?)\s*(\d+)\s*(\d+)\s*(\d+,?\d*)\s*%/;
                    const matchRendimiento = texto.match(patronRendimiento);
                    
                    if (matchRendimiento) {
                        const año = parseInt(matchRendimiento[1]);
                        resultado.push({
                            año: año,
                            semestre: matchRendimiento[2],
                            codigoSeccion: matchRendimiento[3],
                            nombreAsignatura: matchRendimiento[4].trim(),
                            inscritosSinActa: parseInt(matchRendimiento[5]),
                            numeroAprobadas: parseInt(matchRendimiento[6]),
                            porcentajeAprobacion: parseFloat(matchRendimiento[7].replace(',', '.')),
                            textoCompleto: texto.trim(),
                            esRendimiento: true
                        });
                    }
                });
                
                return resultado;
            });
            
            // Agregar datos encontrados
            datosEncontrados.push(...datosActuales);
            
            // Verificar si encontramos el año 2020
            const tiene2020 = datosActuales.some(dato => dato.año === 2020);
            if (tiene2020) {
                encontrado2020 = true;
                //console.log('🎉 ¡Año 2020 encontrado! Extracción completada.');
                break;
            }
            
            // Mostrar años encontrados en este intento
            const añosUnicos = [...new Set(datosActuales.map(d => d.año))].sort((a, b) => b - a);
            if (añosUnicos.length > 0) {
                //console.log(`   📅 Años encontrados: ${añosUnicos.join(', ')}`);
            }
            
            // Hacer scroll hacia abajo
            //console.log('📜 Haciendo scroll hacia abajo...');
            await page.evaluate(() => {
                window.scrollBy(0, 500);
                
                // También intentar hacer click en elementos que puedan expandir más datos
                const botonesExpander = document.querySelectorAll('[aria-expanded="false"]');
                botonesExpander.forEach((boton, index) => {
                    if (index < 3) { // Solo los primeros 3 para no saturar
                        try {
                            boton.click();
                        } catch (e) {
                            // Ignorar errores de click
                        }
                    }
                });
            });
            
            // Esperar un poco para que carguen nuevos datos
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        if (!encontrado2020) {
            //console.log('⚠️  No se encontró el año 2020 después de 50 intentos');
            //console.log('📊 Continuando con los datos extraídos hasta ahora...');
        }
        
        //console.log('✅ Extracción completada');
        //console.log(`📊 Total de registros encontrados: ${datosEncontrados.length}`);
        
        // Procesar y organizar datos finales
        const años = [...new Set(datosEncontrados.map(d => d.año))].sort((a, b) => b - a);
        //console.log(`📅 Años extraídos: ${años.join(', ')}`);
        
        // Separar datos de rendimiento de datos generales
        const datosRendimiento = datosEncontrados.filter(d => d.esRendimiento);
        const datosGenerales = datosEncontrados.filter(d => !d.esRendimiento);
        
        //console.log(`📚 Datos de rendimiento: ${datosRendimiento.length}`);
        //console.log(`� Datos generales: ${datosGenerales.length}`);
        
        // Continuar con el procesamiento anterior pero solo con los datos encontrados...
        
        // Extraer y procesar los datos finales
        const datosOrdenados = await page.evaluate((todosLosDatos) => {
            const resultado = {
                rendimientoPorCarrera: [],
                rendimientoPorAsignatura: [],
                resumen: {
                    fechaExtraccion: new Date().toISOString(),
                    carrera: "Ingeniería Civil en Informática",
                    fuente: "Power BI - Rendimiento por Asignatura",
                    añoMinimoEncontrado: 2020,
                    datosExtraidos: todosLosDatos.length
                }
            };
            
            // Procesar todos los datos encontrados durante el scroll
            todosLosDatos.forEach(dato => {
                if (dato.esRendimiento) {
                    resultado.rendimientoPorAsignatura.push({
                        año: dato.año,
                        semestre: dato.semestre,
                        codigoSeccion: dato.codigoSeccion,
                        nombreAsignatura: dato.nombreAsignatura,
                        inscritosSinActa: dato.inscritosSinActa,
                        numeroAprobadas: dato.numeroAprobadas,
                        porcentajeAprobacion: dato.porcentajeAprobacion,
                        textoOriginal: dato.textoCompleto
                    });
                }
            });
            
            // También buscar en el DOM actual por si hay más datos
            const filas = document.querySelectorAll('[role="row"]');
            filas.forEach((fila) => {
                const texto = fila.innerText || fila.textContent || '';
                
                // Procesar datos de rendimiento por carrera (datos anuales)
                const patronCarrera = /(\d{4})\s*29027\s*Ingeniería Civil en Informática\s*([0-9.,]+)\s*([0-9.,]+)\s*(\d+,?\d*)\s*%\s*([0-9.,]+)\s*(\d+,?\d*)\s*%\s*([0-9.,]+)\s*(\d+,?\d*)\s*%/;
                const matchCarrera = texto.match(patronCarrera);
                
                if (matchCarrera) {
                    const año = parseInt(matchCarrera[1]);
                    if (año >= 2020) { // Solo datos desde 2020
                        resultado.rendimientoPorCarrera.push({
                            año: año,
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
                }
                
                // Procesar datos de rendimiento por asignatura
                const patronAsignatura = /(\d{4})\s*(Semestre [IVX]+)\s*([0-9-]+)\s*([A-ZÁÉÍÓÚÑ\s:,\.]+?)\s*(\d+)\s*(\d+)\s*(\d+,?\d*)\s*%/;
                const matchAsignatura = texto.match(patronAsignatura);
                
                if (matchAsignatura) {
                    const año = parseInt(matchAsignatura[1]);
                    if (año >= 2020) { // Solo datos desde 2020
                        resultado.rendimientoPorAsignatura.push({
                            año: año,
                            semestre: matchAsignatura[2],
                            codigoSeccion: matchAsignatura[3],
                            nombreAsignatura: matchAsignatura[4].trim(),
                            inscritosSinActa: parseInt(matchAsignatura[5]),
                            numeroAprobadas: parseInt(matchAsignatura[6]),
                            porcentajeAprobacion: parseFloat(matchAsignatura[7].replace(',', '.')),
                            textoOriginal: texto
                        });
                    }
                }
            });
            
            return resultado;
        }, datosEncontrados);
        
        //console.log('✅ Procesamiento completado');
        //console.log(`📊 Datos por carrera: ${datosOrdenados.rendimientoPorCarrera.length} registros`);
        //console.log(`📚 Datos por asignatura: ${datosOrdenados.rendimientoPorAsignatura.length} registros`);
        
        // Verificar rango de años extraídos
        const añosCarrera = [...new Set(datosOrdenados.rendimientoPorCarrera.map(d => d.año))].sort();
        const añosAsignatura = [...new Set(datosOrdenados.rendimientoPorAsignatura.map(d => d.año))].sort();
        
        //console.log(`📅 Años en datos de carrera: ${añosCarrera.join(', ')}`);
        //console.log(`📅 Años en datos de asignatura: ${añosAsignatura.join(', ')}`);
        
        // Verificar si llegamos hasta 2020
        const tieneAño2020Carrera = añosCarrera.includes(2020);
        const tieneAño2020Asignatura = añosAsignatura.includes(2020);
        
        //console.log(`🎯 ¿Datos de carrera hasta 2020? ${tieneAño2020Carrera ? '✅ SÍ' : '❌ NO'}`);
        //console.log(`🎯 ¿Datos de asignatura hasta 2020? ${tieneAño2020Asignatura ? '✅ SÍ' : '❌ NO'}`);
        
        // Mostrar resumen de datos por carrera
        if (datosOrdenados.rendimientoPorCarrera.length > 0) {
            //console.log('\n📈 Rendimiento por Carrera (2020+):');
            datosOrdenados.rendimientoPorCarrera
                .sort((a, b) => b.año - a.año)
                .forEach(dato => {
                    //console.log(`   ${dato.año}: ${dato.porcentajeAprobacion}% aprobación (${dato.numeroAprobadas})`);
                });
        }
        
        // Mostrar resumen de asignaturas recientes
        if (datosOrdenados.rendimientoPorAsignatura.length > 0) {
            //console.log('\n📚 Asignaturas encontradas (años recientes):');
            const asignaturasRecientes = datosOrdenados.rendimientoPorAsignatura
                .filter(a => a.año >= 2022)
                .map(a => a.nombreAsignatura);
            const asignaturasUnicas = [...new Set(asignaturasRecientes)];
            
            asignaturasUnicas.slice(0, 10).forEach((asignatura, i) => {
                //console.log(`   ${i + 1}. ${asignatura}`);
            });
            
            if (asignaturasUnicas.length > 10) {
                //console.log(`   ... y ${asignaturasUnicas.length - 10} más`);
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
        
        // Guardar resultado con timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('T')[0];
        const nombreArchivo = `rendimiento_hasta_2020_${timestamp}.json`;
        
        fs.writeFileSync(nombreArchivo, JSON.stringify(resultadoFinal, null, 2));
        //console.log(`💾 Datos guardados en: ${nombreArchivo}`);
        
        // Crear resumen ejecutivo con información de la extracción
        const resumenEjecutivo = {
            titulo: "Resumen Ejecutivo - Rendimiento Ingeniería Civil en Informática (2020+)",
            fechaExtraccion: new Date().toISOString(),
            configuracion: {
                añoObjetivo: 2020,
                añoMinimoEncontrado: Math.min(...añosCarrera, ...añosAsignatura),
                intentosRealizados: encontrado2020 ? 'Completado exitosamente' : `${intentos} intentos realizados`,
                llegóA2020: encontrado2020
            },
            resumen: {
                rendimientoPorCarrera: {
                    registros: datosOrdenados.rendimientoPorCarrera.length,
                    añosDisponibles: añosCarrera,
                    promedioAprobacion: datosOrdenados.rendimientoPorCarrera.length > 0 ? 
                        (datosOrdenados.rendimientoPorCarrera.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / datosOrdenados.rendimientoPorCarrera.length).toFixed(2) + "%" : "0%"
                },
                rendimientoPorAsignatura: {
                    registros: datosOrdenados.rendimientoPorAsignatura.length,
                    asignaturasUnicas: [...new Set(datosOrdenados.rendimientoPorAsignatura.map(d => d.nombreAsignatura))].length,
                    añosDisponibles: añosAsignatura,
                    promedioAprobacion: datosOrdenados.rendimientoPorAsignatura.length > 0 ? 
                        (datosOrdenados.rendimientoPorAsignatura.reduce((sum, d) => sum + d.porcentajeAprobacion, 0) / datosOrdenados.rendimientoPorAsignatura.length).toFixed(2) + "%" : "0%"
                }
            }
        };
        
        fs.writeFileSync('resumen_ejecutivo_2020.json', JSON.stringify(resumenEjecutivo, null, 2));
        //console.log('📋 Resumen ejecutivo guardado en: resumen_ejecutivo_2020.json');
        
        // Capturar screenshot
        await page.screenshot({ path: 'rendimiento_2020_final.png', fullPage: true });
        //console.log('📸 Screenshot guardado: rendimiento_2020_final.png');
        
        //console.log('\n📊 Estadísticas finales:');
        //console.log(`   🎯 Objetivo: Extraer datos hasta año 2020`);
        //console.log(`   ✅ ¿Objetivo cumplido? ${encontrado2020 ? 'SÍ' : 'PARCIALMENTE'}`);
        //console.log(`   📈 Rendimiento por carrera: ${añosCarrera.length} años (${añosCarrera.join(', ')})`);
        //console.log(`   📚 Rendimiento por asignatura: ${[...new Set(datosOrdenados.rendimientoPorAsignatura.map(d => d.nombreAsignatura))].length} asignaturas únicas`);
        //console.log(`   🔄 Intentos de scroll realizados: ${intentos}`);
        //console.log(`   � Rango de años extraído: ${Math.min(...añosCarrera, ...añosAsignatura)} - ${Math.max(...añosCarrera, ...añosAsignatura)}`);
        
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
            //console.log('\n🎉 ¡EXTRACCIÓN COMPLETADA!');
            //console.log('📁 Archivos generados:');
            //console.log(`   - ${nombreArchivo ? nombreArchivo : 'rendimiento_hasta_2020_[fecha].json'} (datos completos)`);
            //console.log('   - resumen_ejecutivo_2020.json (resumen ejecutivo)');
            //console.log('   - rendimiento_2020_final.png (captura de pantalla)');
            //console.log('\n✅ Datos extraídos hasta el año 2020');
            //console.log(`🎯 ${encontrado2020 ? 'Objetivo cumplido exitosamente' : 'Extracción parcial realizada'}`);
            //console.log('📊 Listos para usar en el sistema académico');
        } else {
            //console.log('❌ Error en el procesamiento:', result.error);
        }
    })
    .catch(console.error);
