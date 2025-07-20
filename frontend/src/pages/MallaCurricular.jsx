import { useRef, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import PagGeneral from "../components/PagGeneral";
import Colores from "../components/Colores";
import HelpTooltip from "../components/PuntoAyuda";

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


const getColor = (estado) => {
  switch (estado) {
    case "bg-red-300 border-red-600":
      return "bg-red-200 border-red-400";
    case "bg-blue-300 border-blue-600":
      return "bg-blue-200 border-blue-400";
    case "bg-green-300 border-green-600":
      return "bg-green-200 border-green-400";
    case "bg-yellow-300 border-yellow-600":
      return "bg-yellow-200 border-yellow-400";
    case "bg-purple-300 border-purple-600":
      return "bg-purple-200 border-purple-400";
    case "bg-gray-200":
      return "bg-gray-100 border-gray-300";
    default:
      return "bg-white border-gray-300";
  }
};

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

    const opt = {
      margin: 0.2, // margen pequeño 
      filename: "MallaCurricular.pdf",
      image: { type: "png" },
      html2canvas: {
        scale: 3, // más resolución = menos borroso
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      },
      jsPDF: {
        unit: "in",
        format: "legal", // tamaño oficio: 8.5 x 14 pulgadas
        orientation: "landscape", // horizontal
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"], // evita cortar contenido 
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleResetMalla = () => {
    setAsignaturas(mallaOriginal);
    localStorage.removeItem("mallaPersonalizada");
  };

  const renderSemestre = (sem) => (
    <div key={sem} className="flex flex-col items-center gap-2">
      <h2 className="text-sm font-medium text-blue-900 text-center">Semestre {sem}</h2>
      {asignaturas
        .filter((asig) => asig.semestre === sem)
        .map((asig) => (
          <button
            key={asig.nombre}
            type="button"
            className={`w-full aspect-[3/2] border text-[11px] rounded shadow-sm overflow-visible cursor-pointer px-2 py-1 text-center ${getColor(asig.estado)}`}
            onClick={() => handleAsignaturaClick(asig.nombre)}
            title="Haz clic para cambiar color"
          >
            <p className="font-medium break-words leading-tight text-blue-900">{asig.nombre}</p>
            <p className="text-blue-700">Créditos: {asig.creditos}</p>
          </button>
        ))}
    </div>
  );

  return (
    <PagGeneral>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
              Malla Curricular
            </h1>
            <p className="text-sm sm:text-base text-blue-700">
              Ingeniería Civil en Informática - Universidad del Bío-Bío
            </p>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconMalla.png"
                  alt="Icono Malla"
                  className="w-5 h-5"
                />
                Herramientas de Malla
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                  <p className="text-gray-600 text-xs">
                    Personaliza tu progreso académico y descarga tu malla.
                  </p>
                </HelpTooltip>
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <img src="/IconPdf.png"
                  alt="Icono PDF"
                  className="w-5 h-5"
                />
                Descargar PDF
              </button>
              <button
                onClick={handleResetMalla}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <img src="/IconRegreso.png"
                  alt="Icono Restablecer"
                  className="w-5 h-5"
                />
                Restablecer
              </button>
            </div>
          </div>

          {/* Malla Curricular */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconMalla.png"
                  alt="Icono Malla"
                  className="w-5 h-5"
                />
                Plan de Estudios
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">Guía de personalización académica</h3>
                  <p className="text-gray-600 text-xs">
                    Haz Clic en las asignaturas para cambiar su color
                  </p>
                </HelpTooltip>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div ref={mallaRef} className="overflow-x-auto">
                <div className="grid grid-cols-10 min-w-full gap-3">
                  {[...Array(10)].map((_, i) => renderSemestre(i + 1))}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconMalla.png"
                  alt="Icono Malla"
                  className="w-5 h-5"
                />
                Información del Programa
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="font-medium text-blue-900">Duración</p>
                <p className="text-blue-700">10 semestres</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="font-medium text-blue-900">Total Créditos</p>
                <p className="text-blue-700">{mallaOriginal.reduce((acc, asig) => acc + asig.creditos, 0)} créditos</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="font-medium text-blue-900">Asignaturas</p>
                <p className="text-blue-700">{mallaOriginal.length} asignaturas</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="font-medium text-blue-900">Prácticas</p>
                <p className="text-blue-700">2 prácticas profesionales</p>
              </div>
            </div>
          </div>

          <Colores
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSelect={aplicarColor}
          />
        </div>
      </div>
    </PagGeneral>
  );
};

export default MallaCurricular;
