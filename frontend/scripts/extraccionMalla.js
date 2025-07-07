import puppeteer from 'puppeteer';
import fs from 'fs';

const url = 'https://ubiobio.cl/admision/Todas_las_Carreras/17/Ingenieria_Civil_en_Informatica_Concepcion/';

async function extraerMalla() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const resultado = await page.evaluate(() => {
        const resultado = [];
        
        // Encontrar la tabla por su clase única
        const tabla = document.querySelector('.sumalla table');
        if (!tabla) return resultado;

        // Obtener todas las filas de la tabla
        const filas = tabla.querySelectorAll('tr');
        
        // Primera fila contiene los años (ignoramos)
        // Segunda y tercera fila contienen los semestres
        for (let i = 1; i < filas.length; i++) {
            const celdas = filas[i].querySelectorAll('td');
            
            for (const celda of celdas) {
                const tablaInterna = celda.querySelector('table');
                if (!tablaInterna) continue;
                
                // Extraer nombre del semestre
                const semestreHeader = tablaInterna.querySelector('tr:first-child th');
                if (!semestreHeader) continue;
                
                const semestre = semestreHeader.textContent.trim();
                const asignaturas = [];
                
                // Extraer asignaturas
                const items = tablaInterna.querySelectorAll('ul li');
                items.forEach(item => {
                    asignaturas.push(item.textContent.trim());
                });
                
                if (asignaturas.length > 0) {
                    resultado.push({ semestre, asignaturas });
                }
            }
        }
        
        return resultado;
    });

    console.log(JSON.stringify(resultado, null, 2));
    fs.writeFileSync('malla_informatica_ubb.json', JSON.stringify(resultado, null, 2));
    console.log('✅ Malla guardada correctamente con', resultado.length, 'semestres');
    await browser.close();
}

extraerMalla();