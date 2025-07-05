// components/VerMalla.jsx
import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

export default function VerMalla({ malla, onVolver }) {
  const mallaRef = useRef();

  const descargarPDF = () => {
    const element = mallaRef.current;
    const options = {
      margin: 0.3,
      filename: `${malla?.carrera || "Malla"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "legal", orientation: "landscape" },
    };
    html2pdf().set(options).from(element).save();
  };

  const renderSemestre = (sem, ramos) => (
    <div key={sem} className="flex flex-col items-center gap-1">
      <h2 className="text-sm font-semibold text-center">Semestre {sem}</h2>
      {ramos
        .filter((asig) => asig.semestre === sem)
        .map((asig) => (
          <div
            key={asig.nombre + '-' + asig.semestre}
            className="w-28 h-20 border text-xs rounded shadow-sm overflow-hidden p-1 bg-gray-200 border-gray-400"
          >
            <p className="font-semibold truncate">{asig.nombre}</p>
            <p>Créditos: {asig.creditos}</p>
          </div>
        ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Malla - {malla.carrera}</h1>
        <div className="flex gap-2">
          <button
            onClick={onVolver}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Volver
          </button>
          <button
            onClick={descargarPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div ref={mallaRef} className="overflow-x-auto">
        <div className="grid grid-cols-10 min-w-full">
          {[...Array(10)].map((_, i) => renderSemestre(i + 1, malla.ramos))}
        </div>
      </div>
    </div>
  );
}
