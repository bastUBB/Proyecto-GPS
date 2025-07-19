import React, { useState, useEffect } from "react";
import PagGeneral from "../components/PagGeneral";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const horasDisponibles = [
  "08:10", "09:30", "09:40", "11:00", "11:10", "12:30",
  "12:40", "14:00", "14:10", "15:30", "15:40", "17:00",
  "17:10", "18:30", "18:40", "20:00"
];

export default function SugerenciaHorarios() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [sugerencias, setSugerencias] = useState([]);
  const [configuracion, setConfiguracion] = useState({
    maxHorasPorDia: 8,
    preferenciaMorning: true,
    evitarSabado: true,
    descansoAlmuerzo: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    const asignaturasGuardadas = localStorage.getItem("asignaturasDisponibles");
    if (asignaturasGuardadas) {
      setAsignaturas(JSON.parse(asignaturasGuardadas));
    } else {
      // Datos de ejemplo
      setAsignaturas([
        { id: 1, nombre: "Cálculo Diferencial", creditos: 6, semestre: 2 },
        { id: 2, nombre: "Programación OOP", creditos: 8, semestre: 2 },
        { id: 3, nombre: "Estructuras Discretas", creditos: 5, semestre: 2 },
        { id: 4, nombre: "Química General", creditos: 8, semestre: 2 },
        { id: 5, nombre: "Inglés I", creditos: 4, semestre: 3 }
      ]);
    }

    const disponibilidadGuardada = localStorage.getItem("disponibilidadHoraria");
    if (disponibilidadGuardada) {
      setDisponibilidad(JSON.parse(disponibilidadGuardada));
    }
  }, []);

  const handleConfiguracionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleDisponibilidad = (dia, hora) => {
    const key = `${dia}-${hora}`;
    setDisponibilidad(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generarSugerencias = () => {
    // Algoritmo básico de sugerencias
    const nuevasSugerencias = [];

    // Filtrar asignaturas según configuración
    const asignaturasFiltered = asignaturas.filter(asig => {
      // Aquí se pueden agregar más filtros
      return true;
    });

    // Generar 3 sugerencias diferentes
    for (let i = 0; i < 3; i++) {
      const sugerencia = {
        id: i + 1,
        nombre: `Opción ${i + 1}`,
        horarios: [],
        puntuacion: Math.floor(Math.random() * 100) + 1
      };

      // Asignar horarios aleatorios (esto se puede mejorar con un algoritmo más sofisticado)
      asignaturasFiltered.forEach(asignatura => {
        const diaRandom = diasSemana[Math.floor(Math.random() * diasSemana.length)];
        const horaRandom = horasDisponibles[Math.floor(Math.random() * horasDisponibles.length)];

        sugerencia.horarios.push({
          asignatura: asignatura.nombre,
          dia: diaRandom,
          horaInicio: horaRandom,
          horaFin: horasDisponibles[horasDisponibles.indexOf(horaRandom) + 1] || horaRandom,
          sala: `Sala ${Math.floor(Math.random() * 20) + 1}`,
          profesor: `Profesor ${Math.floor(Math.random() * 10) + 1}`
        });
      });

      nuevasSugerencias.push(sugerencia);
    }

    setSugerencias(nuevasSugerencias);
  };

  const aplicarSugerencia = (sugerencia) => {
    // Guardar la sugerencia seleccionada en localStorage
    localStorage.setItem("horarioSeleccionado", JSON.stringify(sugerencia.horarios));
    alert(`Horario "${sugerencia.nombre}" aplicado correctamente`);
  };

  return (
    <PagGeneral>
      <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
              Sugerencias de Horarios
            </h1>
            <p className="text-sm sm:text-base text-blue-700">
              Genera horarios optimizados según tus preferencias y disponibilidad
            </p>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconHorario.png" alt="Icono Horario" className="w-5 h-5" />
                Configuración de Preferencias
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Máximo horas por día
                </label>
                <input
                  type="number"
                  name="maxHorasPorDia"
                  value={configuracion.maxHorasPorDia}
                  onChange={handleConfiguracionChange}
                  min="2"
                  max="12"
                  className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="preferenciaMorning"
                  checked={configuracion.preferenciaMorning}
                  onChange={handleConfiguracionChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-blue-900">
                  Preferir horarios matutinos
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="evitarSabado"
                  checked={configuracion.evitarSabado}
                  onChange={handleConfiguracionChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-blue-900">
                  Evitar clases los sábados
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="descansoAlmuerzo"
                  checked={configuracion.descansoAlmuerzo}
                  onChange={handleConfiguracionChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-blue-900">
                  Respetar hora de almuerzo
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={generarSugerencias}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Generar Sugerencias
              </button>
            </div>
          </div>

          {/* Disponibilidad Horaria */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Disponibilidad Horaria
              </h2>
            </div>

            <div className="p-4 sm:p-6 overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-blue-200 px-3 py-2 text-blue-900 font-semibold text-sm">
                      Hora
                    </th>
                    {diasSemana.map(dia => (
                      <th key={dia} className="border border-blue-200 px-3 py-2 text-blue-900 font-semibold text-sm">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horasDisponibles.map(hora => (
                    <tr key={hora}>
                      <td className="border border-blue-200 px-3 py-2 text-blue-900 font-medium text-sm bg-blue-50">
                        {hora}
                      </td>
                      {diasSemana.map(dia => {
                        const key = `${dia}-${hora}`;
                        const isDisponible = disponibilidad[key];
                        return (
                          <td key={key} className="border border-blue-200 p-1">
                            <button
                              onClick={() => toggleDisponibilidad(dia, hora)}
                              className={`w-full h-8 rounded transition-colors ${isDisponible
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              title={isDisponible ? 'Disponible' : 'No disponible'}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sugerencias Generadas */}
          {sugerencias.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-blue-900 text-center">
                Sugerencias Generadas
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {sugerencias.map(sugerencia => (
                  <div key={sugerencia.id} className="bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3">
                      <h3 className="font-semibold text-lg">{sugerencia.nombre}</h3>
                      <p className="text-blue-100 text-sm">
                        Puntuación: {sugerencia.puntuacion}/100
                      </p>
                    </div>

                    <div className="p-4 space-y-2">
                      {sugerencia.horarios.map((horario, index) => (
                        <div key={index} className="bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="font-semibold text-blue-900 text-sm">
                            {horario.asignatura}
                          </p>
                          <p className="text-blue-700 text-xs">
                            {horario.dia} - {horario.horaInicio} a {horario.horaFin}
                          </p>
                          <p className="text-blue-600 text-xs">
                            {horario.sala} - {horario.profesor}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-gray-50 text-center">
                      <button
                        onClick={() => aplicarSugerencia(sugerencia)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                      >
                        Aplicar Horario
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de ayuda */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                ¿Como funciona?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">1. Configuración</p>
                <p className="text-blue-700">
                  Ajusta tus preferencias de horario según tus necesidades
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">2. Disponibilidad</p>
                <p className="text-blue-700">
                  Marca los horarios en los que puedes tomar clases
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">3. Generación</p>
                <p className="text-blue-700">
                  El sistema genera múltiples opciones optimizadas
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">4. Selección</p>
                <p className="text-blue-700">
                  Elige la opción que mejor se adapte a ti
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PagGeneral>
  );
}
