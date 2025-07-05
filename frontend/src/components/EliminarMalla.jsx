// components/EliminarMalla.jsx
import React from "react";

export default function EliminarMalla({ onEliminar }) {
  return (
    <button
      onClick={onEliminar}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Eliminar
    </button>
  );
}