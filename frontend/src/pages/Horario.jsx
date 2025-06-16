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
    setHorarios([...horarios, { ...form }]);
    setForm({ ...form, asignatura: "", sala: "" });
  };

  const renderCelda = (dia, hora) => {
    const item = horarios.find(
      (h) => h.dia === dia && h.horaInicio === hora
    );
    const key = `${dia}-${hora}`;
    if (item) {
      return (
        <td key={key} className="border px-2 py-1 bg-blue-100 text-sm">
          <strong>{item.asignatura}</strong>
          <br />
          {item.sala}
          <br />
          {item.horaInicio} - {item.horaFin}
        </td>
      );
    }
    return <td key={key} className="border px-2 py-1"></td>;
  };

  return (
    <PagGeneral>
      <div className="w-full max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Horario UBB</h2>

        <form onSubmit={agregarHorario} className="space-y-2 mb-6">
          <div className="flex gap-2 flex-wrap justify-center">
            <select name="dia" value={form.dia} onChange={handleChange}>
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select name="horaInicio" value={form.horaInicio} onChange={handleChange}>
              {hours.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>

            <select name="horaFin" value={form.horaFin} onChange={handleChange}>
              {hours.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>

            <input
              type="text"
              name="asignatura"
              placeholder="Asignatura"
              value={form.asignatura}
              onChange={handleChange}
              className="border px-2"
            />
            <input
              type="text"
              name="sala"
              placeholder="Sala"
              value={form.sala}
              onChange={handleChange}
              className="border px-2"
            />
            <button
              type="submit"
              className="bg-[#145C9E] text-white px-3 py-1 rounded"
            >
              Agregar
            </button>
          </div>
        </form>

        <div className="overflow-auto border rounded shadow">
          <table className="border-collapse border w-full">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-100">Hora</th>
                {days.map((dia) => (
                  <th key={dia} className="border px-2 py-1 bg-gray-100">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hora) => (
                <tr key={hora}>
                  <td className="border px-2 py-1 font-medium">{hora}</td>
                  {days.map((dia) => renderCelda(dia, hora))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PagGeneral>
  );
}
