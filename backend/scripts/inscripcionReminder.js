import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer';  // Necesario para Nodemailer
import User from '../src/models/user.model.js'; // Asegúrate de que la ruta y el nombre del archivo sean correctos y usa la extensión .js si usas ES Modules
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Nodemailer para Mailtrap
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Mailtrap host
    port: 587,  // Usamos el puerto 587 para STARTTLS
    secure: false,  // No SSL/TLS directo
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // Permite conexiones con certificados no verificados (útil en desarrollo)
    }
});

async function sendStartupTestEmail() {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: 'nicolas.gomez2101@alumnos.ubiobio.cl',  // Correo donde recibirás el mensaje de prueba
            subject: '✅ Backend iniciado - Email de prueba',
            text: 'Este es un mensaje de prueba enviado automáticamente al iniciar el backend.'
        });
        console.log('✅ Correo de prueba enviado al iniciar el backend.');
    } catch (error) {
        console.error('❌ Error al enviar correo de prueba:', error.message);
    }
}

async function getInscripcionDates() {
    const url = 'https://www.ubiobio.cl/w/Calendario_Academico/';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const regex = /Período Inscripción de Asignaturas[^:]*:\s*([0-9]{2}-[0-9]{2}-[0-9]{4})\s*(?:al|y)\s*([0-9]{2}-[0-9]{2}-[0-9]{4})/g;
    const text = $('body').text();
    const matches = [...text.matchAll(regex)];

    return matches.map(m => ({
        inicio: new Date(m[1].split('-').reverse().join('-')),
        fin: new Date(m[2].split('-').reverse().join('-'))
    }));
}

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

async function sendReminder(reminders, alumnos) {
    for (const rem of reminders) {
        const subject = `Recordatorio: inscripción comienza en ${rem.dias} día(s)`;
        const text = `Recuerda que el período de inscripción comienza el ${rem.periodo.inicio.toLocaleDateString()}.`;

        for (const alumno of alumnos) {
            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: alumno.email,
                subject,
                text
            });
        }
    }
}

sendStartupTestEmail();  // Enviar el correo de prueba al iniciar el backend

cron.schedule('0 22 * * *', async () => {
    try {
        const fechas = await getInscripcionDates();
        console.log(`Fechas de inscripción obtenidas: ${fechas.length} período(s)`);
        const reminders = checkReminder(fechas);
        if (!reminders.length) return;
        const alumnos = await User.find({ rol: 'alumno' });
        await sendReminder(reminders, alumnos);
        console.log(`Correo enviado a ${alumnos.length} alumno(s) con ${reminders.length} recordatorio(s).`);
    } catch (err) {
        console.error('Error en tarea programada:', err.message);
    }
}, {
    timezone: 'America/Santiago'
});


// esto tengo en el .env para probar el sercivio de correo, necesito algun numero para cambiarlo por un correo de gmail TODO:

// SMTP_HOST=sandbox.smtp.mailtrap.io
// SMTP_PORT=587
// SMTP_USER=a602f90aa0f42c
// SMTP_PASS=3430a18809556e    # No es tu contraseña normal, es una "App Password"
// SMTP_FROM="Backend AsigUBB"
