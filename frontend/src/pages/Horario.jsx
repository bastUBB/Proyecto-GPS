import React, { useState, useRef } from "react";
import PagGeneral from "../components/PagGeneral";
import HelpTooltip from "../components/PuntoAyuda";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AlertCircle, Loader2 } from "lucide-react";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = [
  "08:10", "08:45", "09:30", "DESCANSO", "09:40", "10:25", "11:00", "DESCANSO",
  "11:10", "11:55", "12:30", "DESCANSO", "12:40", "13:25", "14:00", "DESCANSO",
  "14:10", "14:55", "15:30", "DESCANSO", "15:40", "16:25", "17:00", "DESCANSO",
  "17:10", "17:55", "18:30", "DESCANSO", "18:40", "19:25", "20:00", "DESCANSO",
  "20:10", "20:55", "21:30"
];

// Horarios predefinidos para prueba
const horariosOfrecidos = [
  {
    id: 1,
    nombre: "Horario Matutino - Semestre 1",
    descripcion: "Clases concentradas en la mañana",
    horarios: [
      { dia: "Lunes", horaInicio: "08:10", horaFin: "09:30", asignatura: "Álgebra y Trigonometría", sala: "A-101" },
      { dia: "Lunes", horaInicio: "09:40", horaFin: "11:00", asignatura: "Introducción a la Programación", sala: "Lab-1" },
      { dia: "Martes", horaInicio: "08:10", horaFin: "09:30", asignatura: "Comunicación Oral y Escrita", sala: "B-201" },
      { dia: "Martes", horaInicio: "09:40", horaFin: "11:00", asignatura: "Introducción a la Ingeniería", sala: "C-301" },
      { dia: "Miércoles", horaInicio: "08:10", horaFin: "09:30", asignatura: "Álgebra y Trigonometría", sala: "A-101" },
      { dia: "Jueves", horaInicio: "08:10", horaFin: "09:30", asignatura: "Introducción a la Programación", sala: "Lab-1" },
      { dia: "Viernes", horaInicio: "08:10", horaFin: "09:30", asignatura: "Formación Integral I", sala: "D-401" },
    ]
  },
  {
    id: 2,
    nombre: "Horario Vespertino - Semestre 1",
    descripcion: "Clases en la tarde",
    horarios: [
      { dia: "Lunes", horaInicio: "14:10", horaFin: "15:30", asignatura: "Álgebra y Trigonometría", sala: "A-102" },
      { dia: "Lunes", horaInicio: "15:40", horaFin: "17:00", asignatura: "Introducción a la Programación", sala: "Lab-2" },
      { dia: "Martes", horaInicio: "14:10", horaFin: "15:30", asignatura: "Comunicación Oral y Escrita", sala: "B-202" },
      { dia: "Martes", horaInicio: "15:40", horaFin: "17:00", asignatura: "Introducción a la Ingeniería", sala: "C-302" },
      { dia: "Miércoles", horaInicio: "14:10", horaFin: "15:30", asignatura: "Álgebra y Trigonometría", sala: "A-102" },
      { dia: "Jueves", horaInicio: "14:10", horaFin: "15:30", asignatura: "Introducción a la Programación", sala: "Lab-2" },
      { dia: "Viernes", horaInicio: "14:10", horaFin: "15:30", asignatura: "Formación Integral I", sala: "D-402" },
    ]
  },
  {
    id: 3,
    nombre: "Horario Mixto - Semestre 2",
    descripcion: "Combinación de mañana y tarde",
    horarios: [
      { dia: "Lunes", horaInicio: "08:10", horaFin: "09:30", asignatura: "Cálculo Diferencial", sala: "A-103" },
      { dia: "Lunes", horaInicio: "14:10", horaFin: "15:30", asignatura: "Programación Orientada a Objetos", sala: "Lab-3" },
      { dia: "Martes", horaInicio: "09:40", horaFin: "11:00", asignatura: "Química General", sala: "Lab-Quim" },
      { dia: "Martes", horaInicio: "15:40", horaFin: "17:00", asignatura: "Estructuras Discretas", sala: "B-203" },
      { dia: "Miércoles", horaInicio: "08:10", horaFin: "09:30", asignatura: "Cálculo Diferencial", sala: "A-103" },
      { dia: "Jueves", horaInicio: "14:10", horaFin: "14:55", asignatura: "Programación Orientada a Objetos", sala: "Lab-3" },
      { dia: "Viernes", horaInicio: "11:10", horaFin: "12:30", asignatura: "Formación Integral II", sala: "D-403" },
    ]
  }
];

export default function Horario() {
  const [horarios, setHorarios] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const horarioRef = useRef(null);
  const [form, setForm] = useState({
    dia: "Lunes",
    horaInicio: "08:10",
    horaFin: "09:30",
    asignatura: "",
    sala: "",
  });

  // Paleta de colores para asignaturas
  const coloresAsignaturas = [
    { bg: "from-blue-100 to-blue-50", text: "text-blue-900", border: "border-blue-300", sala: "text-blue-700", hora: "text-blue-600" },
    { bg: "from-green-100 to-green-50", text: "text-green-900", border: "border-green-300", sala: "text-green-700", hora: "text-green-600" },
    { bg: "from-purple-100 to-purple-50", text: "text-purple-900", border: "border-purple-300", sala: "text-purple-700", hora: "text-purple-600" },
    { bg: "from-red-100 to-red-50", text: "text-red-900", border: "border-red-300", sala: "text-red-700", hora: "text-red-600" },
    { bg: "from-yellow-100 to-yellow-50", text: "text-yellow-900", border: "border-yellow-300", sala: "text-yellow-700", hora: "text-yellow-600" },
    { bg: "from-pink-100 to-pink-50", text: "text-pink-900", border: "border-pink-300", sala: "text-pink-700", hora: "text-pink-600" },
    { bg: "from-indigo-100 to-indigo-50", text: "text-indigo-900", border: "border-indigo-300", sala: "text-indigo-700", hora: "text-indigo-600" },
    { bg: "from-teal-100 to-teal-50", text: "text-teal-900", border: "border-teal-300", sala: "text-teal-700", hora: "text-teal-600" },
    { bg: "from-orange-100 to-orange-50", text: "text-orange-900", border: "border-orange-300", sala: "text-orange-700", hora: "text-orange-600" },
    { bg: "from-cyan-100 to-cyan-50", text: "text-cyan-900", border: "border-cyan-300", sala: "text-cyan-700", hora: "text-cyan-600" }
  ];

  // Función para obtener el color de una asignatura
  const obtenerColorAsignatura = (nombreAsignatura) => {
    const asignaturasUnicas = [...new Set(horarios.map(h => h.asignatura))];
    const indice = asignaturasUnicas.indexOf(nombreAsignatura);
    return coloresAsignaturas[indice % coloresAsignaturas.length];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.asignatura.trim()) {
      newErrors.asignatura = 'El nombre de la asignatura es requerido';
    }

    if (!form.sala.trim()) {
      newErrors.sala = 'La sala es requerida';
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    const inicioIndex = hours.indexOf(form.horaInicio);
    const finIndex = hours.indexOf(form.horaFin);

    if (finIndex <= inicioIndex) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Verificar conflictos de horario
    const tieneConflicto = horarios.some(horario => {
      if (horario.dia !== form.dia) return false;

      const horarioInicioIndex = hours.indexOf(horario.horaInicio);
      const horarioFinIndex = hours.indexOf(horario.horaFin);

      // Verificar si hay solapamiento
      return !(finIndex <= horarioInicioIndex || inicioIndex >= horarioFinIndex);
    });

    if (tieneConflicto) {
      newErrors.dia = 'Ya existe una clase en ese horario. Por favor selecciona otro horario.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const agregarHorario = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Simular una pequeña demora para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHorarios([...horarios, { ...form }]);
      setForm({ 
        dia: "Lunes",
        horaInicio: "08:10",
        horaFin: "09:30",
        asignatura: "", 
        sala: "" 
      });
      setErrors({});
      setMostrarPopup(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      dia: "Lunes",
      horaInicio: "08:10",
      horaFin: "09:30",
      asignatura: "",
      sala: ""
    });
    setErrors({});
    setMostrarPopup(false);
  };

  const eliminarHorario = (index) => {
    const nuevosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(nuevosHorarios);
  };

  const seleccionarHorario = (horarioOfrecido) => {
    setHorarios(horarioOfrecido.horarios);
    setHorarioSeleccionado(horarioOfrecido);
  };

  const limpiarHorario = () => {
    setHorarios([]);
    setHorarioSeleccionado(null);
  };

  const descargarHorario = async () => {
    if (!horarioRef.current) return;

    try {
      // Crear un canvas de la tabla del horario
      const canvas = await html2canvas(horarioRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: horarioRef.current.offsetWidth,
        height: horarioRef.current.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png');

      // Crear el PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Añadir título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const titulo = horarioSeleccionado ? horarioSeleccionado.nombre : 'Horario Personalizado';
      pdf.text(titulo, 10, 15);

      // Añadir información adicional
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 10, 25);
      pdf.text(`Total de clases: ${horarios.length}`, 10, 30);

      // Calcular las dimensiones para ajustar la imagen
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Márgenes de 10mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Verificar si la imagen cabe en la página
      if (imgHeight <= pdfHeight - 50) {
        // La imagen cabe, añadirla
        pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      } else {
        // La imagen es muy alta, escalarla para que quepa
        const scaledHeight = pdfHeight - 50;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(imgData, 'PNG', 10, 40, scaledWidth, scaledHeight);
      }

      // Descargar el PDF
      const nombreArchivo = `horario_${horarioSeleccionado ? horarioSeleccionado.nombre.replace(/\s+/g, '_') : 'personalizado'}.pdf`;
      pdf.save(nombreArchivo);

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para determinar qué horas mostrar basándose en las clases existentes
  const obtenerHorasAMostrar = () => {
    if (horarios.length === 0) {
      // Si no hay horarios, mostrar solo hasta las 17:00 incluyendo descansos
      const indice1700 = hours.indexOf("17:00");
      return hours.slice(0, indice1700 + 1);
    }

    // Encontrar la hora más tardía utilizada
    let ultimaHoraUsada = "17:00"; // Hora por defecto

    horarios.forEach(horario => {
      const finIndex = hours.indexOf(horario.horaFin);
      const ultimaIndex = hours.indexOf(ultimaHoraUsada);

      if (finIndex > ultimaIndex) {
        ultimaHoraUsada = horario.horaFin;
      }
    });

    // Retornar las horas hasta la última hora usada (inclusive)
    // Pero asegurándonos de incluir el descanso siguiente si existe
    const ultimaIndex = hours.indexOf(ultimaHoraUsada);
    let indiceAMostrar = ultimaIndex;

    // Si la siguiente posición es un descanso, incluirlo también
    if (ultimaIndex + 1 < hours.length && hours[ultimaIndex + 1] === "DESCANSO") {
      indiceAMostrar = ultimaIndex + 1;
    }

    return hours.slice(0, indiceAMostrar + 1);
  };

  const renderCelda = (dia, hora) => {
    const key = `${dia}-${hora}`;
    const horasVisibles = obtenerHorasAMostrar();

    // Si es una fila de descanso, renderizar celda especial
    if (hora === "DESCANSO") {
      return (
        <td key={key} className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-500 text-xs text-center align-middle border border-gray-300 min-h-[25px]">
          <span className="text-gray-400 font-medium">•••</span>
        </td>
      );
    }

    // Buscar si hay una clase que comience en esta hora
    const claseInicia = horarios.find(
      (h) => h.dia === dia && h.horaInicio === hora
    );

    // Buscar si hay una clase activa en esta hora (que haya comenzado antes y aún no termine)
    const claseActiva = horarios.find((h) => {
      if (h.dia !== dia) return false;
      const inicioIndex = hours.indexOf(h.horaInicio);
      const finIndex = hours.indexOf(h.horaFin);
      const horaActualIndex = hours.indexOf(hora);
      return inicioIndex < horaActualIndex && horaActualIndex <= finIndex;
    });

    if (claseInicia) {
      // Calcular cuántas celdas debe abarcar esta clase dentro de las horas visibles
      const inicioIndex = hours.indexOf(claseInicia.horaInicio);
      const finIndex = hours.indexOf(claseInicia.horaFin);

      // En las horas visibles, contar desde inicio hasta fin (inclusivo)
      const inicioIndexVisible = horasVisibles.indexOf(claseInicia.horaInicio);
      let finIndexVisible = horasVisibles.indexOf(claseInicia.horaFin);

      // Si la hora de fin no está visible, usar la última hora visible
      if (finIndexVisible === -1) {
        finIndexVisible = horasVisibles.length;
      }

      // El rowSpan incluye la hora de fin (+1 para incluir la hora final)
      const rowSpan = finIndexVisible - inicioIndexVisible + 1;

      // Obtener colores para esta asignatura
      const colores = obtenerColorAsignatura(claseInicia.asignatura);

      return (
        <td
          key={key}
          rowSpan={Math.max(1, rowSpan)}
          className={`px-2 py-2 bg-gradient-to-br ${colores.bg} ${colores.text} text-sm relative group align-top border ${colores.border} shadow-sm`}
        >
          <div className="space-y-1 h-full flex flex-col justify-center min-h-[80px]">
            <p className={`font-semibold ${colores.text} break-words leading-tight text-center`}>{claseInicia.asignatura}</p>
            <p className={`${colores.sala} text-xs font-medium text-center`}>{claseInicia.sala}</p>
            <p className={`${colores.hora} text-xs text-center`}>{claseInicia.horaInicio} - {claseInicia.horaFin}</p>
          </div>
          <button
            onClick={() => eliminarHorario(horarios.indexOf(claseInicia))}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
            title="Eliminar"
          >
            ×
          </button>
        </td>
      );
    } else if (claseActiva) {
      // Esta celda está ocupada por una clase que comenzó antes, no renderizar nada
      return null;
    } else {
      // Celda vacía
      return (
        <td key={key} className="px-2 py-1 bg-white min-h-[40px] align-top border border-gray-200 hover:bg-gray-50 transition-colors duration-150"></td>
      );
    }
  };

  return (
    <PagGeneral>
      <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Horario UBB</h1>
            <p className="text-sm sm:text-base text-blue-700">Gestiona y visualiza tus horarios de clases</p>
          </div>

          {/* Sección de Horarios Ofrecidos */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Gestión de Horarios
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-green-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                  <p className="text-gray-600 text-xs">
                    Selecciona uno de los horarios predefinidos para cargarlo automáticamente en tu horario.
                  </p>
                </HelpTooltip>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {horariosOfrecidos.map((horarioOfrecido) => (
                <div
                  key={horarioOfrecido.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${horarioSeleccionado?.id === horarioOfrecido.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:border-green-300'
                    }`}
                  onClick={() => seleccionarHorario(horarioOfrecido)}
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-green-900 text-sm">{horarioOfrecido.nombre}</h3>
                    <p className="text-gray-600 text-xs">{horarioOfrecido.descripcion}</p>
                    <div className="text-xs text-gray-500">
                      <p>📚 {horarioOfrecido.horarios.length} clases</p>
                      <p>🕐 {Math.min(...horarioOfrecido.horarios.map(h => h.horaInicio))} - {Math.max(...horarioOfrecido.horarios.map(h => h.horaFin))}</p>
                    </div>
                    {horarioSeleccionado?.id === horarioOfrecido.id && (
                      <div className="flex items-center text-green-600 text-xs font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Seleccionado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {horarioSeleccionado && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={limpiarHorario}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                >
                  Limpiar Horario
                </button>
                {horarios.length > 0 && (
                  <button
                    onClick={descargarHorario}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar PDF
                  </button>
                )}
                <button
                  onClick={() => setMostrarPopup(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Clase Manual
                </button>
              </div>
            )}
          </div>

          {/* Tabla de horarios */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            < div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Horario Actual
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes ver aquí?</h3>
                  <p className="text-gray-600 text-xs">
                    Aquí puedes ver tu horario actual con las clases que has agregado.
                  </p>
                </HelpTooltip>
              </h2>
            </div>
            <div className="p-4 sm:p-6 overflow-x-auto" ref={horarioRef}>
              <table className="w-full min-w-[600px] border-collapse border border-gray-300 table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
                    <th className="px-3 py-3 text-blue-900 font-bold text-sm border border-blue-300 w-16">
                      Hora
                    </th>
                    {days.map((dia) => (
                      <th
                        key={dia}
                        className="px-3 py-3 text-blue-900 font-bold text-sm border border-blue-300 w-1/5"
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {obtenerHorasAMostrar().map((hora, index) => (
                    <tr key={hora} className={
                      hora === "DESCANSO"
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100'
                        : index % 2 === 0 ? 'bg-blue-25' : 'bg-white'
                    }>
                      <td className={`px-3 py-2 text-blue-900 font-medium text-sm border border-blue-200 min-w-[60px] ${hora === "DESCANSO"
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 text-center min-h-[25px]'
                        : 'bg-gradient-to-r from-blue-50 to-blue-25 min-h-[40px]'
                        }`}>
                        {hora === "DESCANSO" ? "" : hora}
                      </td>
                      {days.map((dia) => {
                        const celda = renderCelda(dia, hora);
                        return celda;
                      }).filter(celda => celda !== null)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>



          {/* Resumen de horarios */}
          {horarios.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-semibold text-blue-900">
                  Resumen de Clases ({horarios.length} clase{horarios.length !== 1 ? 's' : ''})
                </h3>
                <button
                  onClick={descargarHorario}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar PDF
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {horarios.map((horario, index) => {
                  const colores = obtenerColorAsignatura(horario.asignatura);
                  return (
                    <div key={index} className={`bg-gradient-to-br ${colores.bg} p-4 rounded-lg border ${colores.border} hover:shadow-md transition-shadow duration-200`}>
                      <p className={`font-semibold ${colores.text} break-words leading-tight`}>{horario.asignatura}</p>
                      <p className={`${colores.sala} text-sm font-medium mt-1`}>{horario.dia} - {horario.sala}</p>
                      <p className={`${colores.hora} text-xs mt-1`}>{horario.horaInicio} - {horario.horaFin}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Popup Modal para agregar clase */}
        {mostrarPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Agregar Nueva Clase
                </h2>
                
                <form onSubmit={agregarHorario} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día
                    </label>
                    <select
                      name="dia"
                      value={form.dia}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dia ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.dia && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.dia}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio
                    </label>
                    <select
                      name="horaInicio"
                      value={form.horaInicio}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.horaInicio ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {hours.filter(h => h !== "DESCANSO").map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {errors.horaInicio && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.horaInicio}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fin
                    </label>
                    <select
                      name="horaFin"
                      value={form.horaFin}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.horaFin ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {hours.filter(h => h !== "DESCANSO").map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {errors.horaFin && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.horaFin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sala
                    </label>
                    <input
                      type="text"
                      name="sala"
                      value={form.sala}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sala ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Ej: A-101"
                    />
                    {errors.sala && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.sala}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asignatura
                    </label>
                    <input
                      type="text"
                      name="asignatura"
                      value={form.asignatura}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.asignatura ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Ej: Matemáticas, Física, Programación..."
                    />
                    {errors.asignatura && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.asignatura}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-1">
                      Las clases con el mismo nombre de asignatura tendrán el mismo color automáticamente
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Agregando...
                        </span>
                      ) : (
                        'Agregar Clase'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div >
    </PagGeneral >
  );
}
