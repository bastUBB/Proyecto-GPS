import puppeteer from 'puppeteer';
import fs from 'fs';

// Script explorador para encontrar TODOS los datos disponibles
const explorarDatosPowerBI = async () => {
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiNDJmZjMzNDgtZDI3Yi00NTlhLTgyMjctN2M5MzI0YzcxZjg4IiwidCI6IjMyYTQ3ZjJkLTZlYjItNDIyNC04YjExLTI1MTk3NTQ1ODFjNSIsImMiOjR9';
    
    console.log('🔍 Explorador Completo de Datos Power BI');
    console.log('🎯 Buscando TODOS los datos disponibles...');
    
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
        
        // Explorar la estructura completa
        console.log('🔍 Explorando estructura completa de la página...');
        const exploracion = await page.evaluate(() => {
            const resultados = {
                elementosConRole: [],
                elementosConTexto: [],
                tablas: [],
                divs: [],
                elementos: []
            };
            
            // Buscar todos los elementos con role
            const roles = ['row', 'cell', 'columnheader', 'rowheader', 'grid', 'table', 'listbox', 'option'];
            roles.forEach(role => {
                const elementos = document.querySelectorAll(`[role="${role}"]`);
                elementos.forEach((el, index) => {
                    const texto = el.innerText || el.textContent || '';
                    if (texto && texto.trim().length > 0) {
                        resultados.elementosConRole.push({
                            role: role,
                            index: index,
                            texto: texto.substring(0, 200),
                            textoCompleto: texto
                        });
                    }
                });
            });
            
            // Buscar elementos que contengan años o porcentajes
            const todosElementos = document.querySelectorAll('*');
            todosElementos.forEach((el, index) => {
                const texto = el.innerText || el.textContent || '';
                if (texto && (
                    texto.includes('202') || 
                    texto.includes('201') || 
                    texto.includes('%') ||
                    texto.includes('Ingeniería') ||
                    texto.includes('Semestre') ||
                    texto.includes('CÁLCULO') ||
                    texto.includes('PROGRAMACIÓN')
                )) {
                    if (texto.length > 10 && texto.length < 1000) {
                        resultados.elementosConTexto.push({
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            texto: texto.substring(0, 300),
                            textoCompleto: texto
                        });
                    }
                }
            });
            
            // Buscar tablas específicamente
            const tablas = document.querySelectorAll('table, [role="table"], [role="grid"]');
            tablas.forEach((tabla, index) => {
                const texto = tabla.innerText || tabla.textContent || '';
                if (texto && texto.length > 50) {
                    resultados.tablas.push({
                        index: index,
                        tagName: tabla.tagName,
                        role: tabla.getAttribute('role'),
                        texto: texto.substring(0, 500),
                        textoCompleto: texto
                    });
                }
            });
            
            // Buscar divs con mucho contenido
            const divs = document.querySelectorAll('div');
            divs.forEach((div, index) => {
                const texto = div.innerText || div.textContent || '';
                if (texto && texto.length > 100 && (
                    texto.includes('202') || 
                    texto.includes('201') || 
                    texto.includes('%') ||
                    texto.includes('Semestre')
                )) {
                    resultados.divs.push({
                        index: index,
                        className: div.className,
                        texto: texto.substring(0, 400),
                        textoCompleto: texto
                    });
                }
            });
            
            return resultados;
        });
        
        console.log('📊 Resultados de exploración:');
        console.log(`   🎯 Elementos con role: ${exploracion.elementosConRole.length}`);
        console.log(`   📝 Elementos con texto relevante: ${exploracion.elementosConTexto.length}`);
        console.log(`   📋 Tablas encontradas: ${exploracion.tablas.length}`);
        console.log(`   📦 Divs con contenido: ${exploracion.divs.length}`);
        
        // Guardar exploración completa
        fs.writeFileSync('exploracion_powerbi.json', JSON.stringify(exploracion, null, 2));
        console.log('💾 Exploración guardada en: exploracion_powerbi.json');
        
        // Analizar los datos encontrados
        console.log('\n🔍 Analizando datos encontrados...');
        
        // Procesar todos los textos para encontrar patrones
        const todosTextos = [
            ...exploracion.elementosConRole.map(e => e.textoCompleto),
            ...exploracion.elementosConTexto.map(e => e.textoCompleto),
            ...exploracion.tablas.map(t => t.textoCompleto),
            ...exploracion.divs.map(d => d.textoCompleto)
        ];
        
        const datosExtraidos = {
            rendimientoPorCarrera: [],
            rendimientoPorAsignatura: [],
            datosRaw: [],
            patronesEncontrados: []
        };
        
        // Patrones más flexibles
        const patronesABuscar = [
            // Datos por carrera
            /(\d{4})\s*29027\s*Ingeniería Civil en Informática\s*([0-9.,]+)\s*([0-9.,]+)\s*(\d+,?\d*)\s*%/g,
            // Datos por asignatura
            /(\d{4})\s*(Semestre [IVX]+)\s*([0-9-]+)\s*([A-ZÁÉÍÓÚÑ\s:,\.]+?)\s*(\d+)\s*(\d+)\s*(\d+,?\d*)\s*%/g,
            // Patrón general para asignaturas
            /(CÁLCULO|PROGRAMACIÓN|ALGORITMOS|FÍSICA|MATEMÁTICAS|BASES DE DATOS|REDES|SISTEMAS|ESTADÍSTICA|INGENIERÍA|TALLER)[^%]+(\d+,?\d*)\s*%/g
        ];
        
        todosTextos.forEach((texto, index) => {
            if (!texto) return;
            
            // Buscar con todos los patrones
            patronesABuscar.forEach((patron, pIndex) => {
                const matches = [...texto.matchAll(patron)];
                matches.forEach(match => {
                    datosExtraidos.patronesEncontrados.push({
                        patronIndex: pIndex,
                        textoIndex: index,
                        match: match[0],
                        grupos: match.slice(1)
                    });
                });
            });
            
            // Guardar textos que contengan datos académicos
            if (texto.includes('202') || texto.includes('201') || texto.includes('%')) {
                if (texto.length > 20 && texto.length < 2000) {
                    datosExtraidos.datosRaw.push({
                        index: index,
                        texto: texto,
                        longitud: texto.length,
                        tieneAño: /202\d|201\d/.test(texto),
                        tienePorcentaje: texto.includes('%'),
                        tieneAsignatura: /(CÁLCULO|PROGRAMACIÓN|ALGORITMOS|FÍSICA|MATEMÁTICAS|BASES DE DATOS|REDES|SISTEMAS|ESTADÍSTICA|INGENIERÍA|TALLER)/.test(texto)
                    });
                }
            }
        });
        
        console.log(`📊 Patrones encontrados: ${datosExtraidos.patronesEncontrados.length}`);
        console.log(`📋 Datos raw encontrados: ${datosExtraidos.datosRaw.length}`);
        
        // Mostrar algunos ejemplos
        if (datosExtraidos.patronesEncontrados.length > 0) {
            console.log('\n🎯 Ejemplos de patrones encontrados:');
            datosExtraidos.patronesEncontrados.slice(0, 5).forEach((patron, i) => {
                console.log(`   ${i + 1}. ${patron.match}`);
            });
        }
        
        if (datosExtraidos.datosRaw.length > 0) {
            console.log('\n📋 Ejemplos de datos raw:');
            datosExtraidos.datosRaw
                .filter(d => d.tieneAño && d.tienePorcentaje)
                .slice(0, 3)
                .forEach((dato, i) => {
                    console.log(`   ${i + 1}. ${dato.texto.substring(0, 150)}...`);
                });
        }
        
        // Guardar análisis completo
        fs.writeFileSync('analisis_completo.json', JSON.stringify(datosExtraidos, null, 2));
        console.log('💾 Análisis completo guardado en: analisis_completo.json');
        
        // Capturar screenshot
        await page.screenshot({ path: 'exploracion_screenshot.png', fullPage: true });
        console.log('📸 Screenshot de exploración guardado: exploracion_screenshot.png');
        
        console.log('\n✅ Exploración completada');
        console.log('🎯 Revisa los archivos generados para encontrar más datos');
        
        return datosExtraidos;
        
    } catch (error) {
        console.error('❌ Error en exploración:', error);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
};

// Ejecutar exploración
explorarDatosPowerBI()
    .then(result => {
        if (result.success !== false) {
            console.log('\n🎉 ¡EXPLORACIÓN COMPLETADA!');
            console.log('📁 Archivos generados:');
            console.log('   - exploracion_powerbi.json (estructura completa)');
            console.log('   - analisis_completo.json (análisis de datos)');
            console.log('   - exploracion_screenshot.png (captura)');
        } else {
            console.log('❌ Error:', result.error);
        }
    })
    .catch(console.error);
