import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const HORARIO_FILE = path.resolve(__dirname, '../output/horario_extraido.json');
const OUTPUT_FILE = path.resolve(__dirname, '../output/profesores_sin_rut.json');

// Lista de RUTs ficticios comunes para profesores (formato realista)
const RUTS_FICTICIOS = [
    '12345678-9', '23456789-0', '34567890-1', '45678901-2', '56789012-3',
    '67890123-4', '78901234-5', '89012345-6', '90123456-7', '01234567-8',
    '11234567-9', '22345678-0', '33456789-1', '44567890-2', '55678901-3',
    '66789012-4', '77890123-5', '88901234-6', '99012345-7', '10123456-8'
];

// Función para normalizar nombres (quitar comas, espacios extra, etc.)
function normalizarNombre(nombre) {
    return nombre
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Expresión regular para validar RUTs chilenos
const RUT_REGEX = /^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/;

// Función para validar formato de RUT
function validarRut(rut) {
    return RUT_REGEX.test(rut);
}

// Función para normalizar RUT (eliminar puntos y guiones para cálculos)
function normalizarRut(rut) {
    return rut.replace(/\./g, '').replace(/-/g, '');
}

// Función para formatear RUT con puntos y guión
function formatearRut(rutSinFormato) {
    const rut = rutSinFormato.slice(0, -1);
    const dv = rutSinFormato.slice(-1);
    return rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

// Función para formatear nombre correctamente
function formatearNombre(nombre) {
    return nombre
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join(' ');
}

// Función para generar email del profesor
function generarEmail(nombreCompleto) {
    const nombres = nombreCompleto.toLowerCase().split(' ');
    let primerNombre = nombres[0];
    let apellido = nombres[nombres.length - 1];

    // Si el apellido es muy corto, usar el penúltimo
    if (apellido.length <= 2 && nombres.length > 2) {
        apellido = nombres[nombres.length - 2];
    }

    // Limpiar caracteres especiales
    primerNombre = primerNombre.replace(/[^a-z]/g, '');
    apellido = apellido.replace(/[^a-z]/g, '');

    return `${primerNombre}.${apellido}@ubiobio.cl`;
}

// Función para generar RUT ficticio pero realista
function generarRutFicticio(index) {
    if (index < RUTS_FICTICIOS.length) {
        // Validar RUT ficticio antes de devolverlo
        const rut = RUTS_FICTICIOS[index];
        if (validarRut(rut)) {
            return rut;
        }
    }

    // Generar RUT aleatorio válido
    let rutValido = false;
    let rutGenerado = '';
    
    while (!rutValido) {
        const numero = Math.floor(Math.random() * 90000000) + 10000000;
        const digitos = numero.toString().split('').reverse();
        let suma = 0;
        let multiplicador = 2;

        for (let digito of digitos) {
            suma += parseInt(digito) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = suma % 11;
        const dv = resto === 0 ? '0' : resto === 1 ? 'k' : (11 - resto).toString();
        
        rutGenerado = formatearRut(`${numero}${dv}`);
        rutValido = validarRut(rutGenerado);
    }

    return rutGenerado;
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
                const nombreNormalizado = normalizarNombre(item.docente);
                const nombreFormateado = formatearNombre(nombreNormalizado);
                nombresUnicos.add(nombreFormateado);
            }
        });

        //console.log(`📋 Se encontraron ${nombresUnicos.size} profesores únicos`);
        return Array.from(nombresUnicos).sort();

    } catch (error) {
        console.error('❌ Error al leer el archivo de horario:', error.message);
        throw error; // Lanzar error en lugar de process.exit cuando se importa
    }
}

// Función principal simplificada
async function generarProfesoresSimple() {
    //console.log('🚀 Generando profesores con RUTs ficticios...\n');

    try {
        // Extraer nombres únicos
        const nombres = extraerNombresUnicos();

        const profesores = [];

        // Procesar cada profesor
        nombres.forEach((nombreCompleto, index) => {
            //console.log(`📝 Procesando ${index + 1}/${nombres.length}: ${nombreCompleto}`);

            const profesor = {
                nombreCompleto: nombreCompleto,
                email: generarEmail(nombreCompleto),
                rut: generarRutFicticio(index),
                password: 'profesor123', // Password por defecto
                role: 'profesor'
            };

            profesores.push(profesor);
        });

        // Guardar resultado
        //console.log('\n💾 Guardando resultado...');

        const resultado = {
            metadata: {
                fechaGeneracion: new Date().toISOString(),
                totalProfesores: profesores.length,
                descripcion: 'Profesores extraídos del horario con RUTs ficticios generados',
                nota: 'Los RUTs son ficticios y deben ser reemplazados por los reales'
            },
            profesores: profesores
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultado, null, 2), 'utf8');

        // Solo mostrar mensaje cuando se ejecuta directamente
        if (import.meta.url === `file://${process.argv[1]}`) {
            console.log(`\n✅ ¡Proceso completado!`);
            console.log(`📁 Archivo generado: ${OUTPUT_FILE}`);
            console.log(`👥 Total de profesores: ${profesores.length}`);

            // Mostrar algunos ejemplos
            console.log('\n📋 Primeros 5 profesores generados:');
            profesores.slice(0, 5).forEach((prof, index) => {
                console.log(`${index + 1}. ${prof.nombreCompleto}`);
                console.log(`   RUT: ${prof.rut}`);
                console.log(`   Email: ${prof.email}\n`);
            });
        }

        return resultado; // Devolver el resultado para uso programático

    } catch (error) {
        console.error('\n❌ Error en el proceso:', error.message);
        throw error; // Lanzar error en lugar de process.exit cuando se importa
    }
}

// Ejecutar script directamente solo si se ejecuta como script principal
if (import.meta.url === `file://${process.argv[1]}`) {
    //console.log('🔄 Iniciando script...');

    generarProfesoresSimple()
        .then(() => {
            //console.log('\n🎉 Script ejecutado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error fatal:', error.message);
            console.error('Stack:', error.stack);
            process.exit(1);
        });
}

export {
    generarProfesoresSimple,
    extraerNombresUnicos,
    normalizarNombre,
    formatearNombre,
    generarEmail,
    generarRutFicticio,
    validarRut,
    normalizarRut,
    formatearRut
};
