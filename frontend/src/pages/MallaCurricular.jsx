import React, { useRef, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import PagGeneral from "../components/PagGeneral";
import Colores from "../components/Colores"; 


const mallaOriginal = [
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


const getColor = (estado) => estado || "bg-gray-200";

const MallaCurricular = () => {
  const mallaRef = useRef();
  const [asignaturas, setAsignaturas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem("mallaPersonalizada");
    setAsignaturas(savedData ? JSON.parse(savedData) : mallaOriginal);
  }, []);

  const guardarEnLocalStorage = (nuevaMalla) => {
    localStorage.setItem("mallaPersonalizada", JSON.stringify(nuevaMalla));
  };

  const handleAsignaturaClick = (nombre) => {
    setAsignaturaSeleccionada(nombre);
    setModalVisible(true);
  };

  const aplicarColor = (colorClase) => {
    const nuevaMalla = asignaturas.map((asig) =>
      asig.nombre === asignaturaSeleccionada
        ? { ...asig, estado: colorClase }
        : asig
    );
    setAsignaturas(nuevaMalla);
    guardarEnLocalStorage(nuevaMalla);
  };

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

  const handleResetMalla = () => {
    setAsignaturas(mallaOriginal);
    localStorage.removeItem("mallaPersonalizada");
  };

  const renderSemestre = (sem) => (
    <div key={sem} className="flex flex-col items-center gap-1">
      <h2 className="text-sm font-semibold text-center">Semestre {sem}</h2>
      {asignaturas
        .filter((asig) => asig.semestre === sem)
        .map((asig) => (
          <button
            key={asig.nombre}
            type="button"
            className={`w-28 h-16 border text-[11px] rounded shadow-sm overflow-hidden cursor-pointer p-1 text-center ${getColor(asig.estado)}`}
            onClick={() => handleAsignaturaClick(asig.nombre)}
            title="Haz clic para cambiar color"
          >
            <p className="font-semibold break-words leading-tight">{asig.nombre}</p>
            <p>Créditos: {asig.creditos}</p>
          </button>
        ))}
    </div>
  );

   return (
    <PagGeneral>
      <div className="flex-1 overflow-hidden flex flex-col px-4 pt-20">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Malla Curricular - Ingeniería Civil en Informática
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <img 
              src="/IconPdf.png" 
              alt="Icono PDF" 
              className="w-6 h-6" />{" "}
            </button>
            <button
              onClick={handleResetMalla}
              className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <img 
              src="/IconRegreso.png" 
              alt="Icono Restablecer" 
              className="w-5 h-5" />{" "}
              Restablecer
            </button>
          </div>
        </div>

        <div ref={mallaRef} className="overflow-x-auto">
          <div className="grid grid-cols-10 min-w-full gap-2">
            {[...Array(10)].map((_, i) => renderSemestre(i + 1))}
          </div>
        </div>

        <Colores
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={aplicarColor}
        />
      </div>
    </PagGeneral>
  );
};

export default MallaCurricular;
