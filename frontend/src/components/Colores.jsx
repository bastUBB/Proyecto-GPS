import React from "react";
import PropTypes from "prop-types";

const colorOpciones = [
  { nombre: "Rojo", clase: "bg-red-300 border-red-600" },
  { nombre: "Azul", clase: "bg-blue-300 border-blue-600" },
  { nombre: "Verde", clase: "bg-green-300 border-green-600" },
  { nombre: "Amarillo", clase: "bg-yellow-300 border-yellow-600" },
  { nombre: "Gris", clase: "bg-gray-200" },
  { nombre: "Violeta", clase: "bg-purple-300 border-purple-600" },
];

const Colores = ({ visible, onClose, onSelect }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-md w-72">
        <h2 className="text-lg font-bold mb-4">Selecciona un color</h2>
        <div className="grid grid-cols-2 gap-2">
          {colorOpciones.map((color) => (
            <button
              key={color.nombre}
              className={`h-10 rounded border ${color.clase}`}
              onClick={() => {
                onSelect(color.clase);
                onClose();
              }}
              title={color.nombre}
            >
              {color.nombre}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
Colores.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Colores;