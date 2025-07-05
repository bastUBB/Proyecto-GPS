// components/CrearMalla.jsx
import React, { useState } from "react";

export default function CrearMalla({ onGuardar, onCancelar }) {
  const [nombreCarrera, setNombreCarrera] = useState("");
  const [ramos, setRamos] = useState([]);
  const [nuevoRamo, setNuevoRamo] = useState({ nombre: "", creditos: "", semestre: "" });

  const agregarRamo = () => {
    if (nuevoRamo.nombre && nuevoRamo.creditos && nuevoRamo.semestre) {
      setRamos([...ramos, { ...nuevoRamo, semestre: parseInt(nuevoRamo.semestre) }]);
      setNuevoRamo({ nombre: "", creditos: "", semestre: "" });
    }
  };

  const guardar = () => {
    if (!nombreCarrera.trim()) return;
    onGuardar({ id: Date.now(), carrera: nombreCarrera, ramos });
    setNombreCarrera("");
    setRamos([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Crear Malla Curricular</h1>
      <div className="mb-4">
        <label className="block font-medium mb-1">Nombre de la carrera</label>
        <input
          type="text"
          value={nombreCarrera}
          onChange={(e) => setNombreCarrera(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Ej: Ingeniería Civil"
        />
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Agregar Ramo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nombre del ramo"
            value={nuevoRamo.nombre}
            onChange={(e) => setNuevoRamo({ ...nuevoRamo, nombre: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Créditos"
            value={nuevoRamo.creditos}
            onChange={(e) => setNuevoRamo({ ...nuevoRamo, creditos: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Semestre"
            value={nuevoRamo.semestre}
            onChange={(e) => setNuevoRamo({ ...nuevoRamo, semestre: e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={agregarRamo}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar ramo
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={guardar}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Guardar malla
        </button>
        <button
          onClick={onCancelar}
          className="bg-gray-500 text-white px-6 py-2 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
