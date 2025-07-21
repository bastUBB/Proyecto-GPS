import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// Configuración para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const HORARIO_FILE = path.resolve(__dirname, '../output/horario_extraido.json');
const OUTPUT_FILE = path.resolve(__dirname, '../output/profesores_extraidos.json');
const SEARCH_URL = 'https://www.nombrerutyfirma.com/';
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requests para evitar rate limiting

// Función para normalizar nombres (quitar comas, espacios extra, etc.)
function normalizarNombre(nombre) {
    return nombre
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// Función para generar email del profesor
function generarEmail(nombreCompleto) {
    const nombres = nombreCompleto.toLowerCase().split(' ');
    const primerNombre = nombres[0];
    const apellido = nombres[nombres.length - 1] || nombres[1] || primerNombre;
    return `${primerNombre}.${apellido}@ubiobio.cl`;
}

// Función para buscar RUT en la página web
async function buscarRUT(nombreCompleto) {
    try {
        //console.log(`🔍 Buscando RUT para: ${nombreCompleto}`);

        // Preparar el nombre para la búsqueda
        const nombreBusqueda = normalizarNombre(nombreCompleto);

        // Hacer request a la página
        const response = await axios.get(SEARCH_URL, {
            params: {
                q: nombreBusqueda
            },
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Parsear HTML
        const $ = cheerio.load(response.data);

        // Buscar resultados (esto puede variar según la estructura de la página)
        let rutEncontrado = null;

        // Buscar en diferentes elementos donde podría estar el RUT
        $('td, div, span').each((index, element) => {
            const texto = $(element).text();

            // Buscar patrón de RUT (formato: 12345678-9)
            const rutMatch = texto.match(/\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK]/);

            if (rutMatch && !rutEncontrado) {
                // Verificar si el nombre está cerca del RUT encontrado
                const contexto = $(element).parent().text() || $(element).closest('tr').text();
                const nombreEnContexto = normalizarNombre(contexto);

                // Verificar coincidencia de nombres
                const palabrasNombre = nombreBusqueda.split(' ');
                const coincidencias = palabrasNombre.filter(palabra =>
                    palabra.length > 2 && nombreEnContexto.includes(palabra)
                ).length;

                if (coincidencias >= 2) { // Al menos 2 palabras coinciden
                    rutEncontrado = rutMatch[0].replace(/\./g, ''); // Limpiar formato
                    //console.log(`✅ RUT encontrado: ${rutEncontrado} para ${nombreCompleto}`);
                }
            }
        });

        if (!rutEncontrado) {
            //console.log(`❌ No se encontró RUT para: ${nombreCompleto}`);
            // Generar RUT ficticio para mantener consistencia
            const rutFicticio = `${Math.floor(Math.random() * 99999999)}-${Math.floor(Math.random() * 10)}`;
            //console.log(`🔄 Generando RUT ficticio: ${rutFicticio}`);
            return rutFicticio;
        }

        return rutEncontrado;

    } catch (error) {
        console.error(`❌ Error al buscar RUT para ${nombreCompleto}:`, error.message);

        // En caso de error, generar RUT ficticio
        const rutFicticio = `${Math.floor(Math.random() * 99999999)}-${Math.floor(Math.random() * 10)}`;
        //console.log(`🔄 Generando RUT ficticio por error: ${rutFicticio}`);
        return rutFicticio;
    }
}

// Función para extraer nombres únicos del archivo horario
function extraerNombresUnicos() {
    try {
        //console.log('📖 Leyendo archivo de horario...');

        const data = fs.readFileSync(HORARIO_FILE, 'utf8');
        const horarios = JSON.parse(data);

        const nombresUnicos = new Set();

        horarios.forEach(item => {
            if (item.docente && item.docente.trim()) {
                nombresUnicos.add(item.docente.trim());
            }
        });

        //console.log(`📋 Se encontraron ${nombresUnicos.size} profesores únicos`);
        return Array.from(nombresUnicos);

    } catch (error) {
        console.error('❌ Error al leer el archivo de horario:', error.message);
        process.exit(1);
    }
}

// Función principal
async function generarProfesores() {
    //console.log('🚀 Iniciando extracción de RUTs de profesores...\n');

    try {
        // Extraer nombres únicos
        const nombres = extraerNombresUnicos();

        const profesores = [];

        // Procesar cada profesor
        for (let i = 0; i < nombres.length; i++) {
            const nombreCompleto = nombres[i];

            //console.log(`\n📝 Procesando ${i + 1}/${nombres.length}: ${nombreCompleto}`);

            // Buscar RUT
            const rut = await buscarRUT(nombreCompleto);

            // Crear objeto profesor
            const profesor = {
                nombreCompleto: nombreCompleto,
                email: generarEmail(nombreCompleto),
                rut: rut,
                password: 'profesor123', // Password por defecto
                role: 'profesor'
            };

            profesores.push(profesor);

            // Delay entre requests para evitar rate limiting
            if (i < nombres.length - 1) {
                //console.log(`⏱️  Esperando ${DELAY_BETWEEN_REQUESTS / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }
        }

        // Guardar resultado
        //console.log('\n💾 Guardando resultado...');

        const resultado = {
            metadata: {
                fechaGeneracion: new Date().toISOString(),
                totalProfesores: profesores.length,
                descripcion: 'Profesores extraídos del horario con RUTs obtenidos de nombrerutyfirma.com'
            },
            profesores: profesores
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultado, null, 2), 'utf8');

        //console.log(`\n✅ ¡Proceso completado!`);
        //console.log(`📁 Archivo generado: ${OUTPUT_FILE}`);
        //console.log(`👥 Total de profesores: ${profesores.length}`);

        // Mostrar algunos ejemplos
        //console.log('\n📋 Primeros 3 profesores generados:');
        profesores.slice(0, 3).forEach((prof, index) => {
            //console.log(`${index + 1}. ${prof.nombreCompleto} - ${prof.rut} - ${prof.email}`);
        });

        //console.log('\n📋 Para usar en initialSetup.js, copia el contenido del array "profesores" del archivo generado.');

    } catch (error) {
        console.error('\n❌ Error en el proceso principal:', error.message);
        process.exit(1);
    }
}

// Función para mostrar ayuda
function mostrarAyuda() {
    console.log(`
🔧 Script de Extracción de RUTs de Profesores

📖 Descripción:
   Este script lee los nombres de profesores del archivo horario_extraido.json,
   busca sus RUTs en nombrerutyfirma.com y genera un archivo JSON con formato
   de usuario profesor para usar en initialSetup.js

📁 Archivos:
   • Input:  ${HORARIO_FILE}
   • Output: ${OUTPUT_FILE}

🚀 Uso:
   node extraccionRuts.js

⚠️  Notas:
   • Se incluye delay entre requests para evitar rate limiting
   • Si no se encuentra RUT, se genera uno ficticio
   • El email se genera automáticamente basado en el nombre

    `);
}

// Verificar argumentos de línea de comandos
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    mostrarAyuda();
    process.exit(0);
}

// Ejecutar script
if (import.meta.url === `file://${process.argv[1]}`) {
    generarProfesores()
        .then(() => {
            //console.log('\n🎉 Script ejecutado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error fatal:', error.message);
            process.exit(1);
        });
}

export {
    generarProfesores,
    extraerNombresUnicos,
    buscarRUT,
    normalizarNombre,
    generarEmail
};
