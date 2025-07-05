import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import PagGeneral from "../components/PagGeneral";

const malla = [
  { nombre: "Álgebra y Trigonometría", creditos: 8, semestre: 1 },
  { nombre: "Introducción a la Ingeniería", creditos: 6, semestre: 1 },
  { nombre: "Comunicación Oral y Escrita", creditos: 4, semestre: 1 },
  { nombre: "Introducción a la Programación", creditos: 6, semestre: 1 },
  { nombre: "Formación Integral (Oferta Institucional)", creditos: 2, semestre: 1 },
  { nombre: "Cálculo Diferencial", creditos: 6, semestre: 2 },
  { nombre: "Química General", creditos: 8, semestre: 2 },
  { nombre: "Programación Orientada a Objetos", creditos: 8, semestre: 2 },
  { nombre: "Estructuras Discretas para Cie. de la Computación", creditos: 5, semestre: 2 },
  { nombre: "Formación Integral (Oferta Institucional)", creditos: 2, semestre: 2 },
  { nombre: "Formación Integral (Oferta Institucional)", creditos: 2, semestre: 2 },
  { nombre: "Cálculo Integral", creditos: 6, semestre: 3 },
  { nombre: "Álgebra Lineal", creditos: 5, semestre: 3 },
  { nombre: "Física Newtoniana", creditos: 6, semestre: 3 },
  { nombre: "Estructura de Datos", creditos: 6, semestre: 3 },
  { nombre: "Inglés I", creditos: 4, semestre: 3 },
  { nombre: "Administración General", creditos: 3, semestre: 3 },
  { nombre: "Cálculo en Varias Variables", creditos: 6, semestre: 4 },
  { nombre: "Ecuaciones Diferenciales", creditos: 5, semestre: 4 },
  { nombre: "Electromagnetismo", creditos: 6, semestre: 4 },
  { nombre: "Modelamiento de Procesos de Información", creditos: 7, semestre: 4 },
  { nombre: "Inglés II", creditos: 4, semestre: 4 },
  { nombre: "Formación Integral (Oferta Institucional)", creditos: 2, semestre: 4 },
  { nombre: "Ondas, Óptica y Física Moderna", creditos: 6, semestre: 5 },
  { nombre: "Sistemas Digitales", creditos: 5, semestre: 5 },
  { nombre: "Fundamentos de Ciencias de la computación", creditos: 6, semestre: 5 },
  { nombre: "Teoría de Sistemas", creditos: 4, semestre: 5 },
  { nombre: "Inglés III", creditos: 4, semestre: 5 },
  { nombre: "Gestión Contable", creditos: 4, semestre: 5 },
  { nombre: "Estadística y Probabilidades", creditos: 6, semestre: 6 },
  { nombre: "Economía", creditos: 4, semestre: 6 },
  { nombre: "Análisis y Diseño de Algoritmos", creditos: 5, semestre: 6 },
  { nombre: "Base de Datos", creditos: 6, semestre: 6 },
  { nombre: "Inglés IV", creditos: 4, semestre: 6 },
  { nombre: "Práctica Profesional I", creditos: 6, semestre: 6 },
  { nombre: "Investigación de Operaciones", creditos: 4, semestre: 7 },
  { nombre: "Arquitectura de Computadores", creditos: 6, semestre: 7 },
  { nombre: "Administración y Programación de BD", creditos: 6, semestre: 7 },
  { nombre: "Sistemas de Información", creditos: 4, semestre: 7 },
  { nombre: "Gestión Estratégica", creditos: 3, semestre: 7 },
  { nombre: "Formación Integral (Oferta Institucional)", creditos: 2, semestre: 7 },
  { nombre: "Gestión Presupuestaria y Financiera", creditos: 4, semestre: 7 },
  { nombre: "Legislación", creditos: 3, semestre: 8 },
  { nombre: "Sistemas Operativos", creditos: 6, semestre: 8 },
  { nombre: "Inteligencia Artificial", creditos: 4, semestre: 8 },
  { nombre: "Ingeniería de Software", creditos: 5, semestre: 8 },
  { nombre: "Formulación y Evaluación de Proyectos", creditos: 4, semestre: 8 },
  { nombre: "Práctica Profesional II", creditos: 9, semestre: 8 },
  { nombre: "Anteproyecto de Título", creditos: 4, semestre: 9 },
  { nombre: "Comunicación de Datos y Redes", creditos: 5, semestre: 9 },
  { nombre: "Electivo Profesional I", creditos: 5, semestre: 9 },
  { nombre: "Electivo Profesional II", creditos: 5, semestre: 9 },
  { nombre: "Electivo Profesional III", creditos: 5, semestre: 9 },
  { nombre: "Gestión de Proyectos de Software", creditos: 4, semestre: 9 },
  { nombre: "Gestión de Recursos Humanos", creditos: 3, semestre: 9 },
  { nombre: "Proyecto de Título", creditos: 10, semestre: 10 },
  { nombre: "Seguridad Informática", creditos: 4, semestre: 10 },
  { nombre: "Electivo Profesional IV", creditos: 5, semestre: 10 },
  { nombre: "Electivo Profesional V", creditos: 5, semestre: 10 },
  { nombre: "Electivo Profesional VI", creditos: 5, semestre: 10 },
];

const getColor = (estado) => {
  switch (estado) {
    case "aprobada":
      return "bg-green-300 border-green-600";
    case "disponible":
      return "bg-purple-200 border-purple-500";
    default:
      return "bg-gray-200";
  }
};

const MallaCurricular = () => {
  const mallaRef = useRef();

  const handleDownloadPDF = () => {
    const element = mallaRef.current;
    const options = {
      margin: 0.3,
      filename: "MallaCurricular.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "legal", orientation: "landscape" },
    };
    html2pdf().set(options).from(element).save();
  };

  const renderSemestre = (sem) => (
    <div key={sem} className="flex flex-col items-center gap-1">
      <h2 className="text-sm font-semibold text-center">Semestre {sem}</h2>
      {malla
        .filter((asig) => asig.semestre === sem)
        .map((asig) => (
          <div
            key={asig.nombre}
            className={`w-28 h-16 border text-xs rounded shadow-sm overflow-hidden ${getColor(
              asig.estado
            )}`}
          >
            <p className="font-semibold">{asig.nombre}</p>
            <p>Créditos: {asig.creditos}</p>
          </div>
        ))}
    </div>
  );

  return (
    <PagGeneral>
    <div className="min-h-screen mt-12 flex flex-col px-4 py-6">
      {/* Título + Botón */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Malla Curricular - Ingeniería Civil en Informática
        </h1>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          PDF
        </button>
      </div>

      {/* Contenido de la malla */}
      <div ref={mallaRef} className="overflow-x-auto">
        <div className="grid grid-cols-10 min-w-full">
          {[...Array(10)].map((_, i) => renderSemestre(i + 1))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="text-xs mt-6 self-start max-w-full">
        <h2 className="font-semibold mb-1">Leyenda de colores:</h2>
        <ul className="flex flex-wrap gap-4">
          <li className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 bg-green-300 border border-green-600"></span>{" "}
            Aprobada
          </li>
          <li className="flex items-center">
            <span className="inline-block w-3 h-3 mr-1 bg-purple-200 border border-purple-500"></span>{" "}
            Disponible para cursar
          </li>
        </ul>
      </div>
    </div>
    </PagGeneral>
  );
};
export default MallaCurricular;
