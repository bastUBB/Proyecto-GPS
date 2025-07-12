import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';
import https from 'https';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';  // Cambiado a fs/promises para async/await

dotenv.config();

// Configuración de transporte para Gmail con dirección "no responder"
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Plantillas HTML para los correos
const emailTemplates = {
    startup: (date) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>✅ Sistema AsigUBB Iniciado</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f8fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2c5282, #38a169); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .footer { background-color: #edf2f7; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
            .logo { width: 80px; height: 80px; margin: 0 auto 20px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .logo-inner { font-size: 40px; color: #38a169; }
            .card { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4299e1; }
            .btn { display: inline-block; background: linear-gradient(135deg, #2c5282, #4299e1); color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; margin: 15px 0; }
            .stats { display: flex; justify-content: space-around; text-align: center; margin: 25px 0; }
            .stat-item { flex: 1; }
            .stat-value { font-size: 24px; font-weight: 700; color: #2c5282; margin-bottom: 5px; }
            .stat-label { font-size: 14px; color: #718096; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <div class="logo-inner">✓</div>
                </div>
                <h1>✅ Sistema AsigUBB Iniciado</h1>
            </div>
            
            <div class="content">
                <h2 style="color: #2d3748;">¡Sistema en funcionamiento!</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                    El backend de AsigUBB se ha iniciado correctamente y está listo para gestionar los recordatorios de inscripción.
                </p>
                
                <div class="card">
                    <h3 style="margin-top: 0; color: #2b6cb0;">Detalles del sistema</h3>
                    <p><strong>Fecha de inicio:</strong> ${date}</p>
                    <p><strong>Estado:</strong> <span style="color: #38a169; font-weight: 600;">Operativo</span></p>
                    <p><strong>Próxima tarea programada:</strong> Hoy a las 22:00</p>
                </div>
                
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-value">7/4/1</div>
                        <div class="stat-label">Días de recordatorio</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">22:00</div>
                        <div class="stat-label">Hora de envío</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">✓</div>
                        <div class="stat-label">Activo</div>
                    </div>
                </div>
                
                <p style="text-align: center;">
                    <a href="https://www.ubiobio.cl" class="btn">Visitar Universidad</a>
                </p>
            </div>
            
            <div class="footer">
                <p>Este es un mensaje automático. Por favor no responda a este correo.</p>
                <p>© ${new Date().getFullYear()} Sistema AsigUBB - Universidad del Bío-Bío</p>
            </div>
        </div>
    </body>
    </html>
    `,

    reminder: (rem) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Inscripción</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f8fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #d97706, #f59e0b); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .footer { background-color: #edf2f7; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
            .countdown { font-size: 42px; font-weight: 700; text-align: center; margin: 20px 0; color: #d97706; }
            .date-card { background-color: #fffbeb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border: 1px solid #fcd34d; }
            .btn { display: inline-block; background: linear-gradient(135deg, #d97706, #f59e0b); color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; margin: 15px 0; }
            .steps { margin: 25px 0; }
            .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
            .step-number { background-color: #f59e0b; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Recordatorio de Inscripción</h1>
                <p>¡No te quedes fuera de tus asignaturas preferidas!</p>
            </div>
            
            <div class="content">
                <div class="countdown">Faltan ${rem.dias} ${rem.dias === 1 ? 'día' : 'días'}</div>
                
                <div class="date-card">
                    <h3 style="margin-top: 0; color: #b45309;">Fecha de inicio</h3>
                    <p style="font-size: 24px; font-weight: 700; margin: 10px 0; color: #d97706;">
                        ${rem.periodo.inicio.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p style="color: #78350f;">Asegúrate de estar preparado para este día</p>
                </div>
                
                <h3 style="color: #2d3748;">Pasos para inscribirte:</h3>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div>
                            <strong>Revisa tu malla curricular</strong>
                            <p>Verifica qué asignaturas debes inscribir este semestre</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div>
                            <strong>Prepara tu horario</strong>
                            <p>Organiza tus asignaturas evitando cruces de horario</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div>
                            <strong>Revisa los prerrequisitos</strong>
                            <p>Asegúrate de cumplir con los requisitos para cada asignatura</p>
                        </div>
                    </div>
                </div>
                
                <p style="text-align: center;">
                    <a href="https://inscripcion.ubiobio.cl/3nndgprm61he2bnvshn5idi3acfil35f/intranet/index.php" class="btn">Ir al Portal de Inscripción</a>
                </p>
            </div>
            
            <div class="footer">
                <p>Este es un mensaje automático. Por favor no responda a este correo.</p>
                <p>© ${new Date().getFullYear()} Sistema AsigUBB - Universidad del Bío-Bío</p>
            </div>
        </div>
    </body>
    </html>
    `
};

// Versiones de texto plano para compatibilidad
const textTemplates = {
    startup: (date) => `✅ Sistema AsigUBB Iniciado Correctamente

¡Sistema en funcionamiento!

El backend de AsigUBB se ha iniciado correctamente y está listo para gestionar los recordatorios de inscripción.

Detalles del sistema:
- Fecha de inicio: ${date}
- Estado: Operativo
- Próxima tarea programada: Hoy a las 22:00

Días de recordatorio: 7/4/1
Hora de envío: 22:00
Estado: Activo

Visitar Universidad: https://www.ubiobio.cl

---
Este es un mensaje automático. Por favor no responda a este correo.
© ${new Date().getFullYear()} Sistema AsigUBB - Universidad del Bío-Bío`,

    reminder: (rem) => `Recordatorio de Inscripción

¡No te quedes fuera de tus asignaturas preferidas!

Faltan ${rem.dias} ${rem.dias === 1 ? 'día' : 'días'}

Fecha de inicio: ${rem.periodo.inicio.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Asegúrate de estar preparado para este día

Pasos para inscribirte:
1. Revisa tu malla curricular
    Verifica qué asignaturas debes inscribir este semestre
2. Prepara tu horario
    Organiza tus asignaturas evitando cruces de horario
3. Revisa los prerrequisitos
    Asegúrate de cumplir con los requisitos para cada asignatura

Ir al Portal de Inscripción: https://inscripcion.ubiobio.cl/3nndgprm61he2bnvshn5idi3acfil35f/intranet/index.php

---
Este es un mensaje automático. Por favor no responda a este correo.
© ${new Date().getFullYear()} Sistema AsigUBB - Universidad del Bío-Bío`
};

// Configuración de dirección "no responder"
const NO_REPLY_ADDRESS = `"No responder - AsigUBB" <${process.env.GMAIL_USER}>`;

async function getInscripcionDatesWithPuppeteer() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--ignore-certificate-errors', '--no-sandbox']
    });
    const page = await browser.newPage();

    try {
        // Configurar tiempos de espera
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(20000);

        console.log('Navegando a la página...');
        await page.goto('https://www.ubiobio.cl/w/Calendario_Academico/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        console.log('Página cargada. Extrayendo contenido...');

        // Obtener todo el contenido de texto de la página
        const contenido = await page.evaluate(() => {
            return document.body.innerText;
        });

        // Guardar para depuración (fuera del contexto del navegador)
        await fs.writeFile('page-content.txt', contenido);
        console.log('Contenido de la página guardado en page-content.txt');

        // Buscar fechas de inscripción usando expresiones regulares
        const eventos = [];

        // Patrón mejorado para buscar inscripciones
        const regex = /(PRIMER SEMESTRE|SEGUNDO SEMESTRE)[\s\S]*?(inscripc[^:]+):\s*([^\n]+)/gi;

        let match;
        while ((match = regex.exec(contenido)) !== null) {
            eventos.push({
                periodo: match[1].trim(),
                evento: match[2].trim(),
                fecha: match[3].trim()
            });
        }

        // Si no encontramos resultados, intentar un método alternativo
        if (eventos.length === 0) {
            console.log('Usando método alternativo de búsqueda...');
            const lineas = contenido.split('\n');
            let currentPeriod = '';

            for (const linea of lineas) {
                const limpia = linea.trim();

                // Detectar secciones de semestre
                if (limpia.match(/(PRIMER|SEGUNDO) SEMESTRE/i)) {
                    currentPeriod = limpia;
                    continue;
                }

                // Buscar inscripciones
                if (limpia.match(/inscripc/i) && currentPeriod) {
                    const partes = limpia.split(':');
                    if (partes.length > 1) {
                        eventos.push({
                            periodo: currentPeriod,
                            evento: partes[0].trim(),
                            fecha: partes[1].trim()
                        });
                    }
                }
            }
        }

        // console.log(`Fechas de inscripción obtenidas: ${eventos.length} evento(s)`);
        // console.log(eventos);
        return eventos;
    } catch (error) {
        console.error(`❌ Error con Puppeteer: ${error.message}`);
        return [];
    } finally {
        await browser.close();
    }
}

// getInscripcionDatesWithPuppeteer();


async function sendStartupTestEmail(testReminder = false) {
    try {
        if (testReminder) {
            // Crear datos de prueba para un recordatorio
            const testReminderData = {
                dias: 7, // Puedes cambiar a 4 o 1 para probar diferentes mensajes
                periodo: {
                    inicio: new Date(), // Fecha de hoy
                    fin: new Date(new Date().setDate(new Date().getDate() + 14))
                }
            };

            await transporter.sendMail({
                from: NO_REPLY_ADDRESS,
                to: 'nicolas.gomez2101@alumnos.ubiobio.cl',
                subject: `⏰ PRUEBA: Recordatorio de Inscripción (${testReminderData.dias} días)`,
                text: textTemplates.reminder(testReminderData),
                html: emailTemplates.reminder(testReminderData)
            });
            console.log('✅ Correo de prueba (recordatorio) enviado.');
        } else {
            const currentDate = new Date().toLocaleString('es-CL');
            await transporter.sendMail({
                from: NO_REPLY_ADDRESS,
                to: 'nicolas.gomez2101@alumnos.ubiobio.cl',
                cc: ['claudia.sobino2101@alumnos.ubiobio.cl', 'bastian.rodrigez2101@alumnos.ubiobio.cl', 'felipe.guerra@alumnos.ubiobio.cl'],
                subject: '✅ Sistema AsigUBB Iniciado Correctamente',
                text: textTemplates.startup(currentDate),
                html: emailTemplates.startup(currentDate)
            });
            console.log('✅ Correo de prueba (inicio) enviado al iniciar el backend.');
        }
    } catch (error) {
        console.error('❌ Error al enviar correo de prueba:', error.message);
    }
}

// Enviar correo de prueba al inicio (normal)
// sendStartupTestEmail();

// Para probar específicamente el recordatorio, puedes llamar:
// sendStartupTestEmail(true);

// Función para obtener fechas de inscripción
// async function getInscripcionDates() {
//     try {
//         const url = 'https://www.ubiobio.cl/w/Calendario_Academico/';

//         // Create custom agent with additional options
//         const agent = new https.Agent({
//             rejectUnauthorized: false,
//             secureProtocol: 'TLSv1_2_method', // Force TLS 1.2
//             ciphers: 'ALL', // Allow all ciphers
//         });

//         const response = await axios.get(url, {
//             httpsAgent: agent,
//             timeout: 10000, // Add timeout
//             headers: {
//                 'User-Agent': 'Mozilla/5.0', // Mimic browser
//                 'Accept': 'text/html'
//             }
//         });
//         const { data: html } = await axios.get(url);
//         const $ = cheerio.load(html);

//         const regex = /Período Inscripción de Asignaturas[^:]*:\s*([0-9]{2}-[0-9]{2}-[0-9]{4})\s*(?:al|y)\s*([0-9]{2}-[0-9]{2}-[0-9]{4})/g;
//         const text = $('body').text();
//         const matches = [...text.matchAll(regex)];

//         console.log(`Fechas encontradas: ${matches.length}`);

//         return matches.map(m => ({
//             inicio: new Date(m[1].split('-').reverse().join('-')),
//             fin: new Date(m[2].split('-').reverse().join('-'))
//         }));
//     } catch (error) {
//         console.error('❌ Error al obtener fechas de inscripción:', error.message);
//         return [];
//     }
// }

// Función para verificar recordatorios
function checkReminder(dates) {
    const hoy = new Date();
    return dates.flatMap(periodo => {
        return [7, 4, 1].filter(dias => {
            const target = new Date(periodo.inicio);
            target.setDate(target.getDate() - dias);
            return target.toDateString() === hoy.toDateString();
        }).map(dias => ({ dias, periodo }));
    });
}

// Función para enviar recordatorios con diseño mejorado
async function sendReminder(reminders, alumnos) {
    for (const rem of reminders) {
        const subject = `⏰ Recordatorio: Inscripción comienza en ${rem.dias} ${rem.dias === 1 ? 'día' : 'días'}`;

        for (const alumno of alumnos) {
            await transporter.sendMail({
                from: NO_REPLY_ADDRESS,
                to: alumno.email,
                subject,
                text: textTemplates.reminder(rem),
                html: emailTemplates.reminder(rem)
            });
        }
    }
}

// const fechasPrueba = await getInscripcionDates();
// console.log(`Fechas de inscripción obtenidas: ${fechasPrueba.length} período(s)`);

// Configurar tarea programada
cron.schedule('0 22 * * *', async () => {
    try {
        let fechas = await getInscripcionDatesWithPuppeteer();

        console.log(`Fechas de inscripción obtenidas: ${fechas.length} evento(s)`);

        // Transformar la fecha para extraer el inicio y convertirlo en Date
        fechas = fechas.map(f => {
            const [inicioStr] = f.fecha.split(' al ');
            const [dia, mes, anio] = f.fecha.split(' al ')[1].split('-'); // usamos el final para el año
            const fechaInicio = new Date(`${anio}-${mes}-${inicioStr.padStart(2, '0')}`);
            return { ...f, inicio: fechaInicio };
        });

        fechas.forEach(({ periodo, evento, fecha, inicio }) => {
            console.log(`📌 [${periodo}] ${evento}: ${fecha} (Inicio: ${inicio.toDateString()})`);
        });

        const reminders = checkReminder(fechas);
        if (!reminders.length) {
            console.log('No hay recordatorios para enviar hoy.');
            return;
        }

        const alumnos = await User.find({ rol: 'alumno' });
        await sendReminder(reminders, alumnos);
        console.log(`✅ Correos enviados a ${alumnos.length} alumno(s) con ${reminders.length} recordatorio(s).`);

    } catch (err) {
        console.error('❌ Error en tarea programada:', err.message);
    }
}, {
    timezone: 'America/Santiago'
});
