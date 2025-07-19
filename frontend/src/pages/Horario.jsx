import React, { useState } from "react";
import PagGeneral from "../components/PagGeneral";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = [
  "08:10", "09:30", "09:40", "11:00", "11:10", "12:30",
  "12:40", "14:00", "14:10", "15:30", "15:40", "17:00",
  "17:10", "18:30", "18:40", "20:00"
];

export default function Horario() {
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({
    dia: "Lunes",
    horaInicio: "08:10",
    horaFin: "09:30",
    asignatura: "",
    sala: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const agregarHorario = (e) => {
    e.preventDefault();
    if (!form.asignatura || !form.sala) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setHorarios([...horarios, { ...form }]);
    setForm({ ...form, asignatura: "", sala: "" });
  };

  const eliminarHorario = (index) => {
    const nuevosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(nuevosHorarios);
  };

  const renderCelda = (dia, hora) => {
    const item = horarios.find(
      (h) => h.dia === dia && h.horaInicio === hora
    );
    const key = `${dia}-${hora}`;
    if (item) {
      return (
        <td key={key} className="border px-2 py-1 bg-blue-100 text-blue-900 text-sm border-blue-200 relative group">
          <div className="space-y-1">
            <p className="font-semibold text-blue-900">{item.asignatura}</p>
            <p className="text-blue-700">{item.sala}</p>
            <p className="text-blue-600 text-xs">{item.horaInicio} - {item.horaFin}</p>
          </div>
          <button
            onClick={() => eliminarHorario(horarios.indexOf(item))}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar"
          >
            ×
          </button>
        </td>
      );
    }
    return <td key={key} className="border px-2 py-1 bg-white border-blue-200 h-16"></td>;
  };

  return (
    <PagGeneral>
      <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Horario UBB</h1>
            <p className="text-sm sm:text-base text-blue-700">Gestiona y visualiza tus horarios de clases</p>
          </div>

          {/* Formulario para agregar horarios */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Agregar clase al horario
              </h2>
            </div>

            <form onSubmit={agregarHorario} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Día</label>
                  <select
                    name="dia"
                    value={form.dia}
                    onChange={handleChange}
                    className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Hora Inicio</label>
                  <select
                    name="horaInicio"
                    value={form.horaInicio}
                    onChange={handleChange}
                    className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Hora Fin</label>
                  <select
                    name="horaFin"
                    value={form.horaFin}
                    onChange={handleChange}
                    className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Asignatura *</label>
                  <input
                    type="text"
                    name="asignatura"
                    placeholder="Ej: Matemáticas"
                    value={form.asignatura}
                    onChange={handleChange}
                    className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Sala *</label>
                  <input
                    type="text"
                    name="sala"
                    placeholder="Ej: A-101"
                    value={form.sala}
                    onChange={handleChange}
                    className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Agregar al Horario
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de horarios */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Horario de clases
              </h2>
            </div>

            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-blue-200 px-3 py-2 bg-blue-100 text-blue-900 font-semibold text-sm">Hora</th>
                    {days.map((dia) => (
                      <th key={dia} className="border border-blue-200 px-3 py-2 bg-blue-500 text-white font-semibold text-sm">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hora) => (
                    <tr key={hora} className="hover:bg-blue-50">
                      <td className="border border-blue-200 px-3 py-2 font-medium bg-blue-50 text-blue-900 text-sm text-center">
                        {hora}
                      </td>
                      {days.map((dia) => renderCelda(dia, hora))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de horarios */}
          {horarios.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Resumen de Clases ({horarios.length} clase{horarios.length !== 1 ? 's' : ''})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {horarios.map((horario, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900">{horario.asignatura}</p>
                    <p className="text-blue-700 text-sm">{horario.dia} - {horario.sala}</p>
                    <p className="text-blue-600 text-xs">{horario.horaInicio} - {horario.horaFin}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PagGeneral>
  );
}
