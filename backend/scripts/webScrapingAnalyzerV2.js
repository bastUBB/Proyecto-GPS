import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

// Script mejorado para analizar web scraping
const analyzeWebScraping = async () => {
    // Probamos primero con la URL directa de Power BI
    const powerBiUrl = 'https://app.powerbi.com/view?r=eyJrIjoiNDJmZjMzNDgtZDI3Yi00NTlhLTgyMjctN2M5MzI0YzcxZjg4IiwidCI6IjMyYTQ3ZjJkLTZlYjItNDIyNC04YjExLTI1MTk3NTQ1ODFjNSIsImMiOjR9';
    const originalUrl = 'https://dgai.ubiobio.cl/modelos-de-gestion/indicadores-de-rendimiento-de-pregrado-diurno/';
    
    console.log('🔍 Analizando posibilidades de web scraping...');
    console.log('🎯 Probando AMBAS URLs para determinar la mejor estrategia:');
    console.log(`📍 URL Original: ${originalUrl}`);
    console.log(`⚡ URL Power BI: ${powerBiUrl}`);
    
    // Empezamos con Power BI que sabemos que funciona
    const url = powerBiUrl;
    
    const results = {
        powerBiUrl: powerBiUrl,
        originalUrl: originalUrl,
        currentUrl: url,
        timestamp: new Date().toISOString(),
        analysis: {
            basicHttpRequest: null,
            powerBiDetection: null,
            javascriptContent: null,
            puppeteerAnalysis: null,
            scrapingStrategy: null,
            recommendations: [],
            powerBiSpecificAnalysis: null
        }
    };
    
    try {
        // 1. Análisis básico con HTTP request
        console.log('\n📡 1. Análisis básico con HTTP request...');
        
        try {
            const response = await axios.get(url, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            results.analysis.basicHttpRequest = {
                status: response.status,
                contentType: response.headers['content-type'],
                contentLength: response.headers['content-length'],
                server: response.headers.server,
                success: true,
                htmlSize: response.data.length
            };
            
            console.log(`✅ HTTP Request exitoso: ${response.status}`);
            console.log(`📄 Content-Type: ${response.headers['content-type']}`);
            console.log(`📏 Tamaño HTML: ${response.data.length} caracteres`);
            
            // Análisis del contenido HTML
            const $ = cheerio.load(response.data);
            
            // Detectar Power BI
            const powerBiElements = {
                iframes: $('iframe').length,
                powerBiScripts: $('script[src*="powerbi"]').length,
                powerBiDivs: $('div[class*="powerbi"], div[id*="powerbi"]').length,
                embedTokens: response.data.includes('embedToken') || response.data.includes('accessToken'),
                reportId: response.data.includes('reportId'),
                powerBiUrls: (response.data.match(/https:\/\/app\.powerbi\.com/g) || []).length
            };
            
            results.analysis.powerBiDetection = powerBiElements;
            
            console.log(`🔍 Power BI Elements:`);
            console.log(`   - iframes: ${powerBiElements.iframes}`);
            console.log(`   - Scripts de Power BI: ${powerBiElements.powerBiScripts}`);
            console.log(`   - Divs de Power BI: ${powerBiElements.powerBiDivs}`);
            console.log(`   - URLs de Power BI: ${powerBiElements.powerBiUrls}`);
            
            // Detectar contenido JavaScript
            const jsContent = {
                totalScripts: $('script').length,
                inlineScripts: $('script:not([src])').length,
                externalScripts: $('script[src]').length,
                hasReactVue: response.data.includes('React') || response.data.includes('Vue') || response.data.includes('Angular'),
                hasJQuery: response.data.includes('jquery') || response.data.includes('jQuery'),
                hasAjax: response.data.includes('ajax') || response.data.includes('XMLHttpRequest') || response.data.includes('fetch(')
            };
            
            results.analysis.javascriptContent = jsContent;
            
            console.log(`⚡ Contenido JavaScript:`);
            console.log(`   - Total scripts: ${jsContent.totalScripts}`);
            console.log(`   - jQuery: ${jsContent.hasJQuery}`);
            console.log(`   - AJAX: ${jsContent.hasAjax}`);
            
            // Análisis de contenido estructurado
            const contentAnalysis = {
                tables: $('table').length,
                forms: $('form').length,
                lists: $('ul, ol').length,
                divs: $('div').length,
                hasDataAttributes: $('[data-*]').length,
                hasIdAttributes: $('[id]').length,
                hasClassAttributes: $('[class]').length
            };
            
            console.log(`📊 Estructura del contenido:`);
            console.log(`   - Tablas: ${contentAnalysis.tables}`);
            console.log(`   - Formularios: ${contentAnalysis.forms}`);
            console.log(`   - Listas: ${contentAnalysis.lists}`);
            console.log(`   - Divs: ${contentAnalysis.divs}`);
            
            results.analysis.contentAnalysis = contentAnalysis;
            
            // Buscar indicadores específicos
            const indicators = {
                hasCharts: response.data.includes('chart') || response.data.includes('graph'),
                hasDataTables: response.data.includes('datatable') || response.data.includes('datatables'),
                hasBootstrap: response.data.includes('bootstrap'),
                hasWordPress: response.data.includes('wp-') || response.data.includes('wordpress'),
                hasIndicadores: response.data.includes('indicador') || response.data.includes('rendimiento')
            };
            
            console.log(`🎯 Indicadores específicos:`);
            console.log(`   - Tiene charts: ${indicators.hasCharts}`);
            console.log(`   - Tiene DataTables: ${indicators.hasDataTables}`);
            console.log(`   - Usa Bootstrap: ${indicators.hasBootstrap}`);
            console.log(`   - Es WordPress: ${indicators.hasWordPress}`);
            console.log(`   - Menciona indicadores: ${indicators.hasIndicadores}`);
            
            results.analysis.indicators = indicators;
            
            // Guardar HTML para análisis posterior
            fs.writeFileSync('webpage_analysis.html', response.data);
            console.log('📁 HTML guardado en: webpage_analysis.html');
            
        } catch (error) {
            results.analysis.basicHttpRequest = {
                success: false,
                error: error.message,
                code: error.code
            };
            console.log(`❌ Error en HTTP request: ${error.message}`);
        }
        
        // 2. Análisis con Puppeteer (navegador real)
        console.log('\n🤖 2. Análisis con Puppeteer (navegador real)...');
        
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            
            // Configurar user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Interceptar requests
            const requests = [];
            const responses = [];
            
            page.on('request', request => {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                    resourceType: request.resourceType()
                });
            });
            
            page.on('response', response => {
                responses.push({
                    url: response.url(),
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
            });
            
            // Navegar a la página
            console.log('🌐 Navegando a la página...');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            
            // Esperar a que se cargue contenido dinámico
            console.log('⏳ Esperando contenido dinámico...');
            await page.waitForTimeout ? await page.waitForTimeout(5000) : await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Buscar elementos específicos
            const pageAnalysis = await page.evaluate(() => {
                return {
                    title: document.title,
                    url: window.location.href,
                    iframes: document.querySelectorAll('iframe').length,
                    powerBiElements: document.querySelectorAll('[class*="powerbi"], [id*="powerbi"]').length,
                    tables: document.querySelectorAll('table').length,
                    forms: document.querySelectorAll('form').length,
                    buttons: document.querySelectorAll('button').length,
                    hasCharts: document.querySelectorAll('canvas, svg').length,
                    powerBiUrls: document.documentElement.outerHTML.includes('app.powerbi.com'),
                    hasDataTables: document.querySelectorAll('[class*="datatable"], [id*="datatable"]').length,
                    hasGrids: document.querySelectorAll('[class*="grid"], [id*="grid"]').length,
                    bodyText: document.body.innerText.substring(0, 500)
                };
            });
            
            console.log(`📊 Análisis de la página cargada:`);
            console.log(`   - Título: ${pageAnalysis.title}`);
            console.log(`   - URL final: ${pageAnalysis.url}`);
            console.log(`   - iframes: ${pageAnalysis.iframes}`);
            console.log(`   - Tablas: ${pageAnalysis.tables}`);
            console.log(`   - Charts/SVG: ${pageAnalysis.hasCharts}`);
            
            // Buscar iframes específicos
            const iframes = await page.evaluate(() => {
                const iframes = Array.from(document.querySelectorAll('iframe'));
                return iframes.map(iframe => ({
                    src: iframe.src,
                    id: iframe.id,
                    className: iframe.className,
                    title: iframe.title
                }));
            });
            
            console.log(`🖼️  iframes encontrados: ${iframes.length}`);
            
            // Capturar screenshot
            await page.screenshot({ path: 'webpage_screenshot.png', fullPage: true });
            console.log('📸 Screenshot guardado: webpage_screenshot.png');
            
            // Filtrar requests relevantes
            const relevantRequests = requests.filter(req => 
                req.url.includes('powerbi') || 
                req.url.includes('api') || 
                req.url.includes('data') ||
                req.resourceType === 'xhr' ||
                req.resourceType === 'fetch'
            );
            
            console.log(`📡 Requests relevantes: ${relevantRequests.length}`);
            
            results.analysis.puppeteerAnalysis = {
                pageAnalysis,
                iframes,
                relevantRequests,
                totalRequests: requests.length,
                totalResponses: responses.length
            };
            
        } catch (error) {
            console.log(`❌ Error en Puppeteer: ${error.message}`);
            results.analysis.puppeteerAnalysis = {
                success: false,
                error: error.message
            };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
        
        // 2.5. Análisis específico para Power BI
        console.log('\n⚡ 2.5. Análisis específico para Power BI...');
        
        if (url.includes('app.powerbi.com')) {
            let browser;
            try {
                browser = await puppeteer.launch({
                    headless: false, // Mostrar navegador para ver lo que pasa
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
                });
                
                const page = await browser.newPage();
                
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                
                // Interceptar requests específicos de Power BI
                const powerBiRequests = [];
                const powerBiResponses = [];
                
                page.on('request', request => {
                    if (request.url().includes('query') || 
                        request.url().includes('data') ||
                        request.url().includes('api') ||
                        request.url().includes('wabi-') ||
                        request.url().includes('powerbi')) {
                        powerBiRequests.push({
                            url: request.url(),
                            method: request.method(),
                            headers: request.headers(),
                            postData: request.postData()
                        });
                    }
                });
                
                page.on('response', response => {
                    if (response.url().includes('query') || 
                        response.url().includes('data') ||
                        response.url().includes('api') ||
                        response.url().includes('wabi-') ||
                        response.url().includes('powerbi')) {
                        powerBiResponses.push({
                            url: response.url(),
                            status: response.status(),
                            headers: response.headers(),
                            contentType: response.headers()['content-type']
                        });
                    }
                });
                
                console.log('🚀 Navegando a Power BI...');
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
                
                console.log('⏳ Esperando a que Power BI cargue completamente...');
                await page.waitForTimeout(15000); // Esperar 15 segundos
                
                // Buscar elementos específicos de Power BI
                const powerBiAnalysis = await page.evaluate(() => {
                    const analysis = {
                        title: document.title,
                        currentUrl: window.location.href,
                        hasReportContainer: !!document.querySelector('[data-automation-id="reportContainer"]'),
                        hasVisualContainer: !!document.querySelector('[class*="visual"]'),
                        hasDataTables: document.querySelectorAll('table').length,
                        hasCanvasElements: document.querySelectorAll('canvas').length,
                        hasSvgElements: document.querySelectorAll('svg').length,
                        hasGridElements: document.querySelectorAll('[role="grid"]').length,
                        hasRowElements: document.querySelectorAll('[role="row"]').length,
                        hasCellElements: document.querySelectorAll('[role="cell"], [role="gridcell"]').length,
                        totalElements: document.querySelectorAll('*').length,
                        bodyText: document.body.innerText.substring(0, 1000)
                    };
                    
                    // Buscar texto específico de nuestros datos
                    const specificContent = {
                        hasIngenieriaInformatica: document.body.innerText.includes('Ingeniería Civil en Informática'),
                        hasEconomia: document.body.innerText.includes('ECONOMIA'),
                        hasEcuacionesDiferenciales: document.body.innerText.includes('ECUACIONES DIFERENCIALES'),
                        hasPercentages: document.body.innerText.match(/\d+(?:\.\d+)?%/g) || [],
                        hasYears: document.body.innerText.match(/202[1-4]/g) || []
                    };
                    
                    analysis.specificContent = specificContent;
                    
                    return analysis;
                });
                
                console.log('📊 Power BI Analysis Results:');
                console.log(`   - Report Container: ${powerBiAnalysis.hasReportContainer}`);
                console.log(`   - Tablas: ${powerBiAnalysis.hasDataTables}`);
                console.log(`   - Elementos Grid: ${powerBiAnalysis.hasGridElements}`);
                console.log(`   - Elementos Row: ${powerBiAnalysis.hasRowElements}`);
                console.log(`   - Elementos Cell: ${powerBiAnalysis.hasCellElements}`);
                console.log(`   - Canvas: ${powerBiAnalysis.hasCanvasElements}`);
                console.log(`   - SVG: ${powerBiAnalysis.hasSvgElements}`);
                console.log(`   - Ingeniería Civil en Informática: ${powerBiAnalysis.specificContent.hasIngenieriaInformatica}`);
                console.log(`   - Años encontrados: ${powerBiAnalysis.specificContent.hasYears.length}`);
                console.log(`   - Porcentajes encontrados: ${powerBiAnalysis.specificContent.hasPercentages.length}`);
                
                // Intentar extraer datos específicos
                console.log('🔍 Intentando extraer datos específicos...');
                
                const extractedData = await page.evaluate(() => {
                    const data = [];
                    
                    // Buscar en todas las tablas
                    const tables = document.querySelectorAll('table');
                    tables.forEach((table, index) => {
                        const rows = table.querySelectorAll('tr');
                        const tableData = [];
                        
                        rows.forEach(row => {
                            const cells = row.querySelectorAll('td, th');
                            const rowData = [];
                            cells.forEach(cell => {
                                rowData.push(cell.textContent.trim());
                            });
                            if (rowData.length > 0) {
                                tableData.push(rowData);
                            }
                        });
                        
                        if (tableData.length > 0) {
                            data.push({
                                tableIndex: index,
                                data: tableData
                            });
                        }
                    });
                    
                    // Buscar en elementos con rol de celda
                    const gridCells = document.querySelectorAll('[role="gridcell"]');
                    const cellData = [];
                    gridCells.forEach(cell => {
                        const text = cell.textContent.trim();
                        if (text) {
                            cellData.push({
                                text: text,
                                className: cell.className,
                                innerHTML: cell.innerHTML
                            });
                        }
                    });
                    
                    return {
                        tables: data,
                        gridCells: cellData.slice(0, 50) // Limitar a 50 elementos
                    };
                });
                
                console.log(`📈 Datos extraídos:`);
                console.log(`   - Tablas encontradas: ${extractedData.tables.length}`);
                console.log(`   - Celdas de grid: ${extractedData.gridCells.length}`);
                
                // Capturar screenshot
                await page.screenshot({ path: 'powerbi_screenshot.png', fullPage: true });
                console.log('📸 Screenshot de Power BI guardado: powerbi_screenshot.png');
                
                // Guardar HTML del Power BI
                const powerBiHtml = await page.content();
                fs.writeFileSync('powerbi_content.html', powerBiHtml);
                console.log('📁 HTML de Power BI guardado: powerbi_content.html');
                
                results.analysis.powerBiSpecificAnalysis = {
                    success: true,
                    powerBiAnalysis,
                    extractedData,
                    powerBiRequests: powerBiRequests.slice(0, 10), // Limitar requests
                    powerBiResponses: powerBiResponses.slice(0, 10)
                };
                
                console.log(`📡 Requests interceptados: ${powerBiRequests.length}`);
                console.log(`📨 Responses interceptados: ${powerBiResponses.length}`);
                
                // Mostrar algunos requests importantes
                powerBiRequests.slice(0, 5).forEach((req, i) => {
                    console.log(`   ${i+1}. ${req.method} ${req.url.substring(0, 100)}...`);
                });
                
            } catch (error) {
                console.log(`❌ Error en análisis específico de Power BI: ${error.message}`);
                results.analysis.powerBiSpecificAnalysis = {
                    success: false,
                    error: error.message
                };
            } finally {
                if (browser) {
                    await browser.close();
                }
            }
        }
        
        // 3. Determinar estrategia de scraping
        console.log('\n🎯 3. Determinando estrategia de scraping...');
        
        const strategy = determineScrapingStrategy(results.analysis);
        results.analysis.scrapingStrategy = strategy;
        
        console.log(`📋 Estrategia recomendada: ${strategy.primary}`);
        console.log(`🔧 Herramientas necesarias: ${strategy.tools.join(', ')}`);
        console.log(`⚠️  Dificultad: ${strategy.difficulty}`);
        console.log(`✅ Factibilidad: ${strategy.feasibility}`);
        
        strategy.steps.forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
        });
        
        // 4. Recomendaciones
        console.log('\n💡 4. Recomendaciones:');
        
        const recommendations = generateRecommendations(results.analysis);
        results.analysis.recommendations = recommendations;
        
        recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
        
        // 5. Generar código de ejemplo
        console.log('\n🔧 5. Generando código de ejemplo...');
        
        const exampleCode = generateExampleCode(strategy);
        results.analysis.exampleCode = exampleCode;
        
        console.log('📝 Código de ejemplo generado');
        
    } catch (error) {
        console.error('❌ Error general:', error);
        results.analysis.error = error.message;
    }
    
    // Guardar resultados
    fs.writeFileSync('webscraping_analysis.json', JSON.stringify(results, null, 2));
    console.log('\n📁 Análisis completo guardado en: webscraping_analysis.json');
    
    return results;
};

// Función para determinar estrategia de scraping
const determineScrapingStrategy = (analysis) => {
    const strategy = {
        primary: 'unknown',
        tools: [],
        difficulty: 'unknown',
        steps: [],
        feasibility: 'unknown',
        powerBiSpecific: false
    };
    
    // Priorizar análisis específico de Power BI
    if (analysis.powerBiSpecificAnalysis && analysis.powerBiSpecificAnalysis.success) {
        strategy.primary = 'Power BI Direct Access';
        strategy.powerBiSpecific = true;
        strategy.tools = ['Puppeteer', 'Cheerio', 'Power BI API Interceptor'];
        strategy.difficulty = 'Media-Alta';
        strategy.feasibility = 'Posible - Datos accesibles';
        strategy.steps = [
            'Usar Puppeteer con headless: false para debugging',
            'Navegar directamente a la URL de Power BI',
            'Esperar 15+ segundos para carga completa',
            'Buscar elementos con role="gridcell" y role="row"',
            'Extraer datos de tablas HTML generadas',
            'Interceptar requests de API para datos en tiempo real',
            'Implementar parsing específico para estructura de Power BI'
        ];
        
        const pbAnalysis = analysis.powerBiSpecificAnalysis.powerBiAnalysis;
        if (pbAnalysis.hasCellElements > 0) {
            strategy.steps.push(`Enfocar en ${pbAnalysis.hasCellElements} elementos de celda encontrados`);
        }
        if (pbAnalysis.hasDataTables > 0) {
            strategy.steps.push(`Procesar ${pbAnalysis.hasDataTables} tablas disponibles`);
        }
        if (pbAnalysis.specificContent.hasIngenieriaInformatica) {
            strategy.steps.push('Filtrar específicamente por "Ingeniería Civil en Informática"');
        }
        
        return strategy;
    }
    
    // Analizar si es Power BI (fallback)
    if (analysis.powerBiDetection && (
        analysis.powerBiDetection.powerBiUrls > 0 ||
        analysis.powerBiDetection.iframes > 0 ||
        analysis.powerBiDetection.embedTokens
    )) {
        strategy.primary = 'Power BI Embedded';
        strategy.tools = ['Puppeteer', 'Selenium', 'Power BI API'];
        strategy.difficulty = 'Alta';
        strategy.feasibility = 'Complejo pero posible';
        strategy.steps = [
            'Usar Puppeteer para cargar la página completamente',
            'Esperar a que se cargue el iframe de Power BI',
            'Interceptar requests de la API de Power BI',
            'Extraer datos del DOM del iframe',
            'Usar Power BI REST API si es posible'
        ];
    } else if (analysis.indicators && analysis.indicators.hasWordPress) {
        strategy.primary = 'WordPress Site';
        strategy.tools = ['Axios', 'Cheerio', 'WordPress API'];
        strategy.difficulty = 'Baja-Media';
        strategy.feasibility = 'Fácil';
        strategy.steps = [
            'Verificar si hay WordPress REST API disponible',
            'Realizar requests HTTP directos',
            'Parsear HTML con Cheerio',
            'Extraer datos de posts o páginas específicas'
        ];
    } else if (analysis.javascriptContent && analysis.javascriptContent.totalScripts > 5) {
        strategy.primary = 'JavaScript Heavy';
        strategy.tools = ['Puppeteer', 'Selenium'];
        strategy.difficulty = 'Media';
        strategy.feasibility = 'Posible';
        strategy.steps = [
            'Usar navegador headless (Puppeteer)',
            'Esperar a que se ejecute JavaScript',
            'Extraer datos del DOM renderizado',
            'Interceptar llamadas AJAX si es necesario'
        ];
    } else if (analysis.basicHttpRequest && analysis.basicHttpRequest.success) {
        strategy.primary = 'Static HTML';
        strategy.tools = ['Axios', 'Cheerio'];
        strategy.difficulty = 'Baja';
        strategy.feasibility = 'Fácil';
        strategy.steps = [
            'Realizar request HTTP directo',
            'Parsear HTML con Cheerio',
            'Extraer datos de tablas o elementos específicos'
        ];
    }
    
    return strategy;
};

// Función para generar recomendaciones
const generateRecommendations = (analysis) => {
    const recommendations = [];
    
    // Recomendaciones específicas para Power BI
    if (analysis.powerBiSpecificAnalysis && analysis.powerBiSpecificAnalysis.success) {
        recommendations.push('🎯 PODER BI DETECTADO: Usar acceso directo a la URL de Power BI');
        recommendations.push('⏰ Implementar espera de 15+ segundos para carga completa');
        recommendations.push('🔍 Buscar elementos con role="gridcell" y role="row"');
        recommendations.push('📊 Extraer datos de tablas HTML generadas por Power BI');
        recommendations.push('🚀 Usar Puppeteer con headless: false para debugging inicial');
        
        const pbAnalysis = analysis.powerBiSpecificAnalysis.powerBiAnalysis;
        if (pbAnalysis.specificContent.hasIngenieriaInformatica) {
            recommendations.push('✅ Datos de Ingeniería Civil en Informática confirmados');
        }
        if (pbAnalysis.specificContent.hasYears.length > 0) {
            recommendations.push(`📅 Años disponibles: ${pbAnalysis.specificContent.hasYears.join(', ')}`);
        }
        if (pbAnalysis.hasCellElements > 0) {
            recommendations.push(`📋 ${pbAnalysis.hasCellElements} elementos de celda disponibles para extraer`);
        }
    }
    
    if (analysis.powerBiDetection && analysis.powerBiDetection.powerBiUrls > 0) {
        recommendations.push('Considerar usar Power BI REST API en lugar de scraping');
        recommendations.push('Revisar si hay endpoints públicos de la API');
    }
    
    if (analysis.javascriptContent && analysis.javascriptContent.hasAjax) {
        recommendations.push('Interceptar llamadas AJAX para obtener datos directamente');
        recommendations.push('Usar DevTools para identificar endpoints de API');
    }
    
    if (analysis.puppeteerAnalysis && analysis.puppeteerAnalysis.iframes && analysis.puppeteerAnalysis.iframes.length > 0) {
        recommendations.push('Analizar cada iframe por separado');
        recommendations.push('Verificar políticas de CORS para iframes');
    }
    
    if (analysis.indicators && analysis.indicators.hasWordPress) {
        recommendations.push('Explorar WordPress REST API endpoints');
        recommendations.push('Verificar /wp-json/wp/v2/ para contenido estructurado');
    }
    
    recommendations.push('Implementar retry logic para requests fallidos');
    recommendations.push('Usar headers realistas para evitar detección');
    recommendations.push('Implementar delays entre requests');
    recommendations.push('Considerar usar proxies si es necesario');
    recommendations.push('Respetar robots.txt y términos de servicio');
    
    return recommendations;
};

// Función para generar código de ejemplo
const generateExampleCode = (strategy) => {
    let code = '';
    
    if (strategy.primary === 'Power BI Direct Access') {
        code = `
// Ejemplo de scraping específico para Power BI
import puppeteer from 'puppeteer';
import fs from 'fs';

const scrapePowerBI = async () => {
    const browser = await puppeteer.launch({ 
        headless: false, // Cambiar a true en producción
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    try {
        console.log('Navegando a Power BI...');
        await page.goto('https://app.powerbi.com/view?r=eyJrIjoiNDJmZjMzNDgtZDI3Yi00NTlhLTgyMjctN2M5MzI0YzcxZjg4IiwidCI6IjMyYTQ3ZjJkLTZlYjItNDIyNC04YjExLTI1MTk3NTQ1ODFjNSIsImMiOjR9', 
            { waitUntil: 'networkidle2', timeout: 90000 });
        
        console.log('Esperando carga completa...');
        await page.waitForTimeout(15000);
        
        // Extraer datos específicos de Ingeniería Civil en Informática
        const data = await page.evaluate(() => {
            const results = [];
            
            // Buscar todas las celdas de grid
            const gridCells = document.querySelectorAll('[role="gridcell"]');
            
            gridCells.forEach(cell => {
                const text = cell.textContent.trim();
                if (text.includes('Ingeniería Civil en Informática') || 
                    text.includes('ECONOMIA') || 
                    text.includes('ECUACIONES DIFERENCIALES') ||
                    text.match(/\\d+(?:\\.\\d+)?%/)) {
                    results.push({
                        text: text,
                        context: cell.parentElement ? cell.parentElement.textContent.trim() : ''
                    });
                }
            });
            
            // Buscar también en tablas tradicionales
            const tables = document.querySelectorAll('table');
            tables.forEach((table, index) => {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.trim();
                    if (text.includes('Ingeniería Civil en Informática')) {
                        const cells = row.querySelectorAll('td, th');
                        const rowData = Array.from(cells).map(cell => cell.textContent.trim());
                        results.push({
                            type: 'table',
                            tableIndex: index,
                            data: rowData
                        });
                    }
                });
            });
            
            return results;
        });
        
        // Guardar datos extraídos
        fs.writeFileSync('powerbi_scraped_data.json', JSON.stringify(data, null, 2));
        console.log(\`Datos extraídos: \${data.length} elementos\`);
        
        return data;
        
    } finally {
        await browser.close();
    }
};

// Ejecutar scraping
scrapePowerBI().then(data => {
    console.log('Scraping completado:', data.length, 'elementos');
}).catch(console.error);
`;
    } else if (strategy.primary === 'Static HTML') {
        code = `
// Ejemplo de scraping para contenido estático
import axios from 'axios';
import * as cheerio from 'cheerio';

const scrapePage = async () => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Extraer datos específicos
        const data = [];
        $('table tr').each((i, el) => {
            const row = [];
            $(el).find('td').each((j, cell) => {
                row.push($(cell).text().trim());
            });
            if (row.length > 0) data.push(row);
        });
        
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};
`;
    } else if (strategy.primary === 'JavaScript Heavy') {
        code = `
// Ejemplo de scraping para contenido dinámico
import puppeteer from 'puppeteer';

const scrapePage = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Esperar a que se cargue el contenido
        await page.waitForSelector('table', { timeout: 30000 });
        
        // Extraer datos
        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tr'));
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.map(cell => cell.textContent.trim());
            });
        });
        
        return data;
    } finally {
        await browser.close();
    }
};
`;
    }
    
    return code;
};

// Ejecutar análisis
console.log('🚀 Iniciando análisis de web scraping...');
analyzeWebScraping().catch(console.error);
