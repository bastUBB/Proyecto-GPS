import Disponibilidad from '../models/disponibilidad.model.js';
import User from '../models/user.model.js';

// Configuración de salas disponibles
const TOTAL_SALAS = 20;
const SALAS_DISPONIBLES = Array.from({ length: TOTAL_SALAS }, (_, i) => `Sala ${i + 1}`);

// Configuración de tipos de bloques y sus duraciones en minutos
const TIPOS_BLOQUES = {
    '1h20min': 80,  // 1 hora y 20 minutos
    '2h10min': 130, // 2 horas y 10 minutos
    '2h50min': 170  // 2 horas y 50 minutos
};

/**
 * Genera un horario basado en la disponibilidad del profesor
 * @param {string} profesorId - ID del profesor
 * @param {Array} bloquesRequeridos - Array de objetos con tipo y cantidad de bloques
 * @returns {Object} Horario generado con salas asignadas
 */
export const generarHorarioProfesor = async (profesorId, bloquesRequeridos) => {
    try {
        // Verificar que el profesor existe
        const profesor = await User.findById(profesorId);
        if (!profesor || profesor.role !== 'profesor') {
            throw new Error('Profesor no encontrado o no válido');
        }

        // Obtener disponibilidad del profesor
        const disponibilidad = await Disponibilidad.findOne({ profesor: profesorId });
        if (!disponibilidad || !disponibilidad.bloques || disponibilidad.bloques.length === 0) {
            throw new Error('No se encontró disponibilidad para el profesor');
        }

        // Convertir bloques de disponibilidad a slots de tiempo
        const slotsDisponibles = convertirBloquesASlots(disponibilidad.bloques);
        
        // Generar horario con los bloques solicitados
        const horarioGenerado = generarHorarioConBloques(slotsDisponibles, bloquesRequeridos);
        
        // Asignar salas a cada bloque del horario
        const horarioConSalas = asignarSalas(horarioGenerado);

        // Calcular total de horas
        const totalHoras = calcularTotalHoras(horarioConSalas);

        return {
            profesorId,
            profesor: profesor.nombreCompleto,
            bloquesRequeridos,
            horario: horarioConSalas,
            totalBloquesAsignados: horarioConSalas.length,
            totalHorasAsignadas: totalHoras,
            fechaGeneracion: new Date()
        };
    } catch (error) {
        throw new Error(`Error al generar horario: ${error.message}`);
    }
};

/**
 * Convierte bloques de disponibilidad en slots de tiempo continuo
 * @param {Array} bloques - Bloques de disponibilidad
 * @returns {Array} Slots de tiempo disponibles
 */
const convertirBloquesASlots = (bloques) => {
    const slots = [];
    
    bloques.forEach(bloque => {
        const { dia, horaInicio, horaFin } = bloque;
        const inicioHora = parseInt(horaInicio.split(':')[0]);
        const inicioMinuto = parseInt(horaInicio.split(':')[1]);
        const finHora = parseInt(horaFin.split(':')[0]);
        const finMinuto = parseInt(horaFin.split(':')[1]);
        
        // Convertir a minutos para facilitar cálculos
        const inicioMinutos = inicioHora * 60 + inicioMinuto;
        const finMinutos = finHora * 60 + finMinuto;
        
        // Crear un slot continuo por cada bloque de disponibilidad
        slots.push({
            dia,
            horaInicio,
            horaFin,
            inicioMinutos,
            finMinutos,
            duracionMinutos: finMinutos - inicioMinutos,
            id: `${dia}-${inicioHora}-${inicioMinuto}-${finHora}-${finMinuto}`
        });
    });
    
    return slots;
};

/**
 * Genera un horario con bloques específicos
 * @param {Array} slotsDisponibles - Slots de tiempo disponibles
 * @param {Array} bloquesRequeridos - Bloques requeridos con tipo y cantidad
 * @returns {Array} Horario con bloques asignados
 */
const generarHorarioConBloques = (slotsDisponibles, bloquesRequeridos) => {
    const horarioGenerado = [];
    const slotsUsados = [];

    // Procesar cada tipo de bloque requerido
    bloquesRequeridos.forEach(bloqueRequerido => {
        const { tipo, cantidad } = bloqueRequerido;
        const duracionRequerida = TIPOS_BLOQUES[tipo];
        
        for (let i = 0; i < cantidad; i++) {
            // Buscar un slot disponible que pueda acomodar este tipo de bloque
            const slotDisponible = encontrarSlotDisponible(
                slotsDisponibles, 
                slotsUsados, 
                duracionRequerida
            );
            
            if (slotDisponible) {
                const bloqueAsignado = crearBloqueAsignado(slotDisponible, tipo, duracionRequerida);
                horarioGenerado.push(bloqueAsignado);
                slotsUsados.push(bloqueAsignado);
            } else {
                throw new Error(`No se pudo asignar el bloque ${tipo}. Disponibilidad insuficiente.`);
            }
        }
    });

    return horarioGenerado;
};

/**
 * Encuentra un slot disponible para un bloque de duración específica
 * @param {Array} slotsDisponibles - Slots disponibles
 * @param {Array} slotsUsados - Slots ya utilizados
 * @param {number} duracionRequerida - Duración en minutos
 * @returns {Object|null} Slot disponible o null si no se encuentra
 */
const encontrarSlotDisponible = (slotsDisponibles, slotsUsados, duracionRequerida) => {
    for (const slot of slotsDisponibles) {
        if (slot.duracionMinutos >= duracionRequerida) {
            // Verificar si el slot no está en conflicto con slots usados
            const hayConflicto = slotsUsados.some(slotUsado => 
                slot.dia === slotUsado.dia &&
                !(slot.finMinutos <= slotUsado.inicioMinutos || 
                  slot.inicioMinutos >= slotUsado.finMinutos)
            );
            
            if (!hayConflicto) {
                return slot;
            }
        }
    }
    return null;
};

/**
 * Crea un bloque asignado basado en un slot disponible
 * @param {Object} slot - Slot disponible
 * @param {string} tipo - Tipo de bloque
 * @param {number} duracionMinutos - Duración en minutos
 * @returns {Object} Bloque asignado
 */
const crearBloqueAsignado = (slot, tipo, duracionMinutos) => {
    const finMinutos = slot.inicioMinutos + duracionMinutos;
    const finHora = Math.floor(finMinutos / 60);
    const finMinuto = finMinutos % 60;
    
    return {
        dia: slot.dia,
        horaInicio: slot.horaInicio,
        horaFin: `${finHora.toString().padStart(2, '0')}:${finMinuto.toString().padStart(2, '0')}`,
        tipo,
        duracionMinutos,
        inicioMinutos: slot.inicioMinutos,
        finMinutos,
        id: `${slot.dia}-${slot.horaInicio}-${tipo}-${Date.now()}`
    };
};

/**
 * Calcula el total de horas de un horario
 * @param {Array} horario - Horario con bloques
 * @returns {number} Total de horas
 */
const calcularTotalHoras = (horario) => {
    const totalMinutos = horario.reduce((total, bloque) => total + bloque.duracionMinutos, 0);
    return Math.round((totalMinutos / 60) * 100) / 100; // Redondear a 2 decimales
};

/**
 * Asigna salas aleatoriamente a cada slot del horario
 * @param {Array} horario - Horario sin salas asignadas
 * @returns {Array} Horario con salas asignadas
 */
const asignarSalas = (horario) => {
    return horario.map(slot => ({
        ...slot,
        sala: SALAS_DISPONIBLES[Math.floor(Math.random() * SALAS_DISPONIBLES.length)]
    }));
};

/**
 * Obtiene todas las salas disponibles
 * @returns {Array} Lista de salas disponibles
 */
export const obtenerSalasDisponibles = () => {
    return SALAS_DISPONIBLES;
};

/**
 * Valida la disponibilidad de un profesor para generar horario
 * @param {string} profesorId - ID del profesor
 * @returns {Object} Información de validación
 */
export const validarDisponibilidadProfesor = async (profesorId) => {
    try {
        const profesor = await User.findById(profesorId);
        if (!profesor || profesor.role !== 'profesor') {
            return { valido: false, mensaje: 'Profesor no encontrado o no válido' };
        }

        const disponibilidad = await Disponibilidad.findOne({ profesor: profesorId });
        if (!disponibilidad || !disponibilidad.bloques || disponibilidad.bloques.length === 0) {
            return { valido: false, mensaje: 'No se encontró disponibilidad para el profesor' };
        }

        const slotsDisponibles = convertirBloquesASlots(disponibilidad.bloques);
        
        // Calcular capacidad máxima para cada tipo de bloque
        const capacidadPorTipo = {};
        Object.keys(TIPOS_BLOQUES).forEach(tipo => {
            capacidadPorTipo[tipo] = slotsDisponibles.filter(slot => 
                slot.duracionMinutos >= TIPOS_BLOQUES[tipo]
            ).length;
        });

        const totalMinutosDisponibles = slotsDisponibles.reduce((total, slot) => total + slot.duracionMinutos, 0);
        
        return {
            valido: true,
            mensaje: 'Profesor válido para generar horario',
            profesor: profesor.nombreCompleto,
            totalSlotsDisponibles: slotsDisponibles.length,
            totalMinutosDisponibles,
            totalHorasDisponibles: Math.round((totalMinutosDisponibles / 60) * 100) / 100,
            diasDisponibles: [...new Set(slotsDisponibles.map(slot => slot.dia))],
            capacidadPorTipo,
            tiposBloqueDisponibles: Object.keys(TIPOS_BLOQUES),
            slotsDisponibles
        };
    } catch (error) {
        return { valido: false, mensaje: `Error al validar: ${error.message}` };
    }
};

/**
 * Obtiene información sobre los tipos de bloques disponibles
 * @returns {Object} Información de tipos de bloques
 */
export const obtenerTiposBloques = () => {
    return {
        tipos: Object.keys(TIPOS_BLOQUES).map(tipo => ({
            tipo,
            duracionMinutos: TIPOS_BLOQUES[tipo],
            duracionTexto: tipo,
            duracionHoras: Math.round((TIPOS_BLOQUES[tipo] / 60) * 100) / 100
        })),
        descripcion: 'Tipos de bloques disponibles para generar horarios'
    };
};
