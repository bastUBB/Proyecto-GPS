import React, { useState } from "react";
import PropTypes from "prop-types";
import CrearMalla from "../components/CrearMalla";
import EditarMalla from "../components/EditarMalla";
import EliminarMalla from "../components/EliminarMalla";

function RenderSemestre({ malla, sem }) {
  return (
    <div key={sem} className="flex flex-col items-center gap-1">
      <h2 className="text-sm font-semibold text-center">Semestre {sem}</h2>
      {malla.ramos
        .filter((asig) => asig.semestre === sem)
        .map((asig) => (
          <div
            key={asig.id || asig.nombre}
            className="w-28 h-16 border text-xs rounded shadow-sm overflow-hidden bg-gray-200"
          >
            <p className="font-semibold truncate px-1">{asig.nombre}</p>
            <p>Créditos: {asig.creditos}</p>
          </div>
        ))}
    </div>
  );
}

RenderSemestre.propTypes = {
  malla: PropTypes.shape({
    ramos: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        nombre: PropTypes.string.isRequired,
        creditos: PropTypes.number,
        semestre: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
  sem: PropTypes.number.isRequired,
};

export default function CreateMalla() {
  const [modalActivo, setModalActivo] = useState(null); // "crear", "editar", "eliminar", null
  const [mallas, setMallas] = useState([]);

  const abrirModal = (id) => setModalActivo(id);
  const cerrarModal = () => setModalActivo(null);

  return (
    <div className="min-w-screen min-h-screen mt-12 relative bg-gray-50 overflow-x-hidden">
      {/* Botones superiores */}
      <div className="absolute top-6 right-6 flex gap-4">
        <button
          onClick={() => abrirModal("crear")}
          className="w-20 h-12 bg-green-600 rounded-xl shadow-lg text-white flex flex-col items-center justify-center hover:brightness-110 transition"
        >
          <img 
            src="/IconAgregar.png" 
            alt="Crear Malla" 
            className="w-6 h-6 mb-1 pointer-events-none" 
          />
          <span className="text-xs font-semibold">Crear</span>
        </button>

        <button
          onClick={() => abrirModal("editar")}
          className="w-20 h-12 bg-yellow-500 rounded-xl shadow-lg text-white flex flex-col items-center justify-center hover:brightness-110 transition"
        >
          <img 
            src="/IconEditar.png" 
            alt="Editar Malla" 
            className="w-6 h-6 mb-1 pointer-events-none" 
          />
          <span className="text-xs font-semibold">Editar</span>
        </button>

        <button
          onClick={() => abrirModal("eliminar")}
          className="w-20 h-12 bg-red-600 rounded-xl shadow-lg text-white flex flex-col items-center justify-center hover:brightness-110 transition"
        >
          <img 
            src="/IconEliminar.png" 
            alt="Eliminar Malla" 
            className="w-6 h-6 mb-1 pointer-events-none" 
          />
          <span className="text-xs font-semibold">Eliminar</span>
        </button>
      </div>

      {/* Vista de Mallas */}
      <div className="mt-48 px-6 py-4">
        {mallas.length === 0 ? (
          <p className="text-gray-500 col-span-full">No hay mallas creadas.</p>
        ) : (
          mallas.map((malla, index) => (
            <div key={index} className="bg-white rounded shadow p-4 border mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{malla.nombreCarrera}</h2>
                <div className="grid grid-cols-10 min-w-full gap-2">
                  {[...new Set(malla.ramos.map(r => r.semestre))]
                    .sort((a, b) => a - b)
                    .map((sem) => (
                      <RenderSemestre key={sem} malla={malla} sem={sem} />
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {modalActivo === "crear" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-gray-700 hover:text-black font-bold text-xl"
            >
              &times;
            </button>
            <CrearMalla 
              onCancelar={cerrarModal} 
              onGuardarMalla={(nuevaMalla) => {
                setMallas([...mallas, nuevaMalla]);
                cerrarModal();
              }} 
            />
          </div>
        </div>
      )}

      {modalActivo === "editar" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-gray-700 hover:text-black font-bold text-xl"
            >
              &times;
            </button>
            <EditarMalla onCancelar={cerrarModal} />
          </div>
        </div>
      )}

      {modalActivo === "eliminar" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-gray-700 hover:text-black font-bold text-xl"
            >
              &times;
            </button>
            <EliminarMalla onCancelar={cerrarModal} />
          </div>
        </div>
      )}
    </div>
  );
}
