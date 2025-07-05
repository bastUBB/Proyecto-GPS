// components/EditarMalla.jsx
import React, { useState } from "react";

export default function EditarMalla({ malla, onGuardar, onCancelar }) {
  const [nombreCarrera, setNombreCarrera] = useState(malla.carrera);
  const [ramos, setRamos] = useState([...malla.ramos]);
  const [nuevoRamo, setNuevoRamo] = useState({ nombre: "", creditos: "", semestre: "" });

  const handleRamoChange = (index, field, value) => {
    const updated = [...ramos];
    updated[index][field] = field === "semestre" || field === "creditos" ? parseInt(value) : value;
    setRamos(updated);
  };

  const agregarRamo = () => {
    if (nuevoRamo.nombre && nuevoRamo.creditos && nuevoRamo.semestre) {
      setRamos([...ramos, { ...nuevoRamo, semestre: parseInt(nuevoRamo.semestre) }]);
      setNuevoRamo({ nombre: "", creditos: "", semestre: "" });
    }
  };

  const eliminarRamo = (index) => {
    const actualizados = [...ramos];
    actualizados.splice(index, 1);
    setRamos(actualizados);
  };

  const guardarCambios = () => {
    const mallaEditada = {
      ...malla,
      carrera: nombreCarrera,
      ramos,
    };
    onGuardar(mallaEditada);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar Malla Curricular</h1>
      <div className="mb-4">
        <label htmlFor="nombreCarrera" className="block font-medium mb-1">Nombre de la carrera</label>
        <input
          id="nombreCarrera"
          type="text"
          value={nombreCarrera}
          onChange={(e) => setNombreCarrera(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Ramos existentes</h2>
      <div className="space-y-2">
        {ramos.map((ramo, index) => (
          <div key={ramo.nombre + '-' + ramo.semestre} className="grid md:grid-cols-4 gap-2 items-center">
            <input
              type="text"
              value={ramo.nombre}
              onChange={(e) => handleRamoChange(index, "nombre", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={ramo.creditos}
              onChange={(e) => handleRamoChange(index, "creditos", e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={ramo.semestre}
              onChange={(e) => handleRamoChange(index, "semestre", e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={() => eliminarRamo(index)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Agregar nuevo ramo</h2>
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <input
          type="text"
          placeholder="Nombre"
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
        <button
          onClick={agregarRamo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={guardarCambios}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Guardar cambios
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

import PropTypes from "prop-types";

EditarMalla.propTypes = {
  malla: PropTypes.shape({
    carrera: PropTypes.string.isRequired,
    ramos: PropTypes.arrayOf(
      PropTypes.shape({
        nombre: PropTypes.string.isRequired,
        creditos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        semestre: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      })
    ).isRequired,
  }).isRequired,
  onGuardar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
};
