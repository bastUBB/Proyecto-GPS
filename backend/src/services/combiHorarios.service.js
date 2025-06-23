import Disponibilidad from '../models/disponibilidad.model.js';

export const generarCombinacionHorarios = async (profesorId, horasSemana) => {
    const disponibilidad = await Disponibilidad.findOne({ profesor: profesorId });
    if (!disponibilidad || !disponibilidad.bloques || disponibilidad.bloques.length === 0) {
        throw new Error('El profesor no tiene disponibilidad registrada');
    }

    // Selecciona bloques hasta sumar la cantidad de horas solicitada
    let horasAcumuladas = 0;
    const combinacion = [];

    for (const bloque of disponibilidad.bloques) {
        // Calcula la duración del bloque en horas
        const [hIni, mIni] = bloque.horaInicio.split(':').map(Number);
        const [hFin, mFin] = bloque.horaFin.split(':').map(Number);
        const duracion = (hFin + mFin/60) - (hIni + mIni/60);

        if (horasAcumuladas + duracion <= horasSemana) {
            combinacion.push(bloque);
            horasAcumuladas += duracion;
        } else if (horasAcumuladas < horasSemana) {
            // Si falta solo una fracción, ajusta el bloque final
            const faltante = horasSemana - horasAcumuladas;
            const nuevoFin = hIni + faltante;
            const horaFinAjustada = `${String(Math.floor(nuevoFin)).padStart(2, '0')}:${String(Math.round((nuevoFin % 1) * 60)).padStart(2, '0')}`;
            combinacion.push({
                ...bloque.toObject(),
                horaFin: horaFinAjustada
            });
            horasAcumuladas = horasSemana;
            break;
        } else {
            break;
        }
    }

    return combinacion;
};