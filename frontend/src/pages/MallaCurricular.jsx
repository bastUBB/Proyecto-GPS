import { useRef, useEffect, useState, useContext } from "react";
import html2pdf from "html2pdf.js";
import PagGeneral from "../components/PagGeneral";
import Colores from "../components/Colores";
import { UserContext } from "../../context/userContext";
import axios from "axios";
import { HelpCircle } from "lucide-react";
import HelpTooltip from "../components/PuntoAyuda";
import Alert from "../components/Alert";


const mallaOriginal = [
  { id: 1, nombre: "Álgebra y Trigonometría", creditos: 8, semestre: 1 },
  { id: 2, nombre: "Introducción a la Ingeniería", creditos: 6, semestre: 1 },
  { id: 3, nombre: "Comunicación Oral y Escrita", creditos: 4, semestre: 1 },
  { id: 4, nombre: "Introducción a la Programación", creditos: 6, semestre: 1 },
  { id: 5, nombre: "Formación Integral I", creditos: 2, semestre: 1 },
  { id: 6, nombre: "Cálculo Diferencial", creditos: 6, semestre: 2 },
  { id: 7, nombre: "Química General", creditos: 8, semestre: 2 },
  { id: 8, nombre: "Programación Orientada a Objetos", creditos: 8, semestre: 2 },
  { id: 9, nombre: "Estructuras Discretas para Cs. de la Computación", creditos: 5, semestre: 2 },
  { id: 10, nombre: "Formación Integral II", creditos: 2, semestre: 2 },
  { id: 11, nombre: "Formación Integral III", creditos: 2, semestre: 2 },
  { id: 12, nombre: "Cálculo Integral", creditos: 6, semestre: 3 },
  { id: 13, nombre: "Álgebra Lineal", creditos: 5, semestre: 3 },
  { id: 14, nombre: "Física Newtoniana", creditos: 6, semestre: 3 },
  { id: 15, nombre: "Estructura de Datos", creditos: 6, semestre: 3 },
  { id: 16, nombre: "Inglés I", creditos: 4, semestre: 3 },
  { id: 17, nombre: "Administración General", creditos: 3, semestre: 3 },
  { id: 18, nombre: "Cálculo en Varias Variables", creditos: 6, semestre: 4 },
  { id: 19, nombre: "Ecuaciones Diferenciales", creditos: 5, semestre: 4 },
  { id: 20, nombre: "Electro-magnetismo", creditos: 6, semestre: 4 },
  { id: 21, nombre: "Modelamiento de Procesos e Información", creditos: 7, semestre: 4 },
  { id: 22, nombre: "Inglés II", creditos: 4, semestre: 4 },
  { id: 23, nombre: "Formación Integral IV", creditos: 2, semestre: 4 },
  { id: 24, nombre: "Ondas, Óptica y Física Moderna", creditos: 6, semestre: 5 },
  { id: 25, nombre: "Sistemas Digitales", creditos: 5, semestre: 5 },
  { id: 26, nombre: "Fundamentos de las Ciencias de la Computación", creditos: 6, semestre: 5 },
  { id: 27, nombre: "Teoría de Sistemas", creditos: 4, semestre: 5 },
  { id: 28, nombre: "Inglés III", creditos: 4, semestre: 5 },
  { id: 29, nombre: "Gestión Contable", creditos: 4, semestre: 5 },
  { id: 30, nombre: "Estadística y Probabilidades", creditos: 6, semestre: 6 },
  { id: 31, nombre: "Economía", creditos: 4, semestre: 6 },
  { id: 32, nombre: "Análisis y Diseño de Algoritmos", creditos: 5, semestre: 6 },
  { id: 33, nombre: "Base de Datos", creditos: 6, semestre: 6 },
  { id: 34, nombre: "Inglés IV", creditos: 4, semestre: 6 },
  { id: 35, nombre: "Práctica Profesional 1", creditos: 6, semestre: 6 },
  { id: 36, nombre: "Investigación de Operaciones", creditos: 4, semestre: 7 },
  { id: 37, nombre: "Arquitectura de Computadores", creditos: 6, semestre: 7 },
  { id: 38, nombre: "Administración y Programación de Base de Datos", creditos: 6, semestre: 7 },
  { id: 39, nombre: "Sistemas de Información", creditos: 4, semestre: 7 },
  { id: 40, nombre: "Gestión Estratégica", creditos: 3, semestre: 7 },
  { id: 41, nombre: "Formación Integral V", creditos: 2, semestre: 7 },
  { id: 42, nombre: "Gestión Presupuestaria y Financiera", creditos: 4, semestre: 7 },
  { id: 43, nombre: "Legislación", creditos: 3, semestre: 8 },
  { id: 44, nombre: "Sistemas Operativos", creditos: 6, semestre: 8 },
  { id: 45, nombre: "Inteligencia Artificial", creditos: 4, semestre: 8 },
  { id: 46, nombre: "Ingeniería de Software", creditos: 5, semestre: 8 },
  { id: 47, nombre: "Formulación y Evaluación de Proyectos", creditos: 4, semestre: 8 },
  { id: 48, nombre: "Práctica Profesional 2", creditos: 9, semestre: 8 },
  { id: 49, nombre: "Anteproyecto de Título", creditos: 4, semestre: 9 },
  { id: 50, nombre: "Comunicación de Datos y Redes", creditos: 5, semestre: 9 },
  { id: 51, nombre: "Electivo Profesional 1", creditos: 5, semestre: 9 },
  { id: 52, nombre: "Electivo Profesional 2", creditos: 5, semestre: 9 },
  { id: 53, nombre: "Electivo Profesional 3", creditos: 5, semestre: 9 },
  { id: 54, nombre: "Gestión de Proyectos de Software", creditos: 4, semestre: 9 },
  { id: 55, nombre: "Gestión de Recursos Humanos", creditos: 3, semestre: 9 },
  { id: 56, nombre: "Proyecto de Título", creditos: 10, semestre: 10 },
  { id: 57, nombre: "Seguridad Informática", creditos: 4, semestre: 10 },
  { id: 58, nombre: "Electivo Profesional 4", creditos: 5, semestre: 10 },
  { id: 59, nombre: "Electivo Profesional 5", creditos: 5, semestre: 10 },
  { id: 60, nombre: "Electivo Profesional 6", creditos: 5, semestre: 10 },
];


const getColor = (estado) => {
  switch (estado) {
    case "completada":
      return "bg-green-200 border-green-400 text-green-800";
    case "inscribible":
      return "bg-blue-200 border-blue-400 text-blue-800";
    case "no-inscribible":
      return "bg-red-200 border-red-400 text-red-800";
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
  const { user } = useContext(UserContext);
  const mallaRef = useRef();
  const [asignaturas, setAsignaturas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [asignaturasCompletadasLocal, setAsignaturasCompletadasLocal] = useState([]);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // Funciones helper para alertas
  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: '', title: '', message: '' });
  };

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  // Función para obtener los headers de autenticación
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Función para crear una malla inicial con las primeras asignaturas del semestre 1 como inscribibles
  const crearMallaInicial = () => {
    const asignaturasIniciales = mallaOriginal.filter(asig => asig.semestre === 1);

    const mallaConEstados = mallaOriginal.map(asignatura => {
      let estado = 'default';

      // Marcar las del semestre 1 como inscribibles
      if (asignaturasIniciales.some(inicial => inicial.nombre === asignatura.nombre)) {
        estado = 'inscribible';
      } else {
        estado = 'no-inscribible';
      }

      return { ...asignatura, estado };
    });

    setAsignaturas(mallaConEstados);
    setAsignaturasCompletadasLocal([]);
    setCambiosPendientes(false);
  };

  // Función para cargar los datos de la malla del usuario
  const cargarMallaUsuario = async () => {
    if (!user || !user.rut || user.role !== 'alumno') {
      // Si no es alumno, mostrar malla original sin colores
      setAsignaturas(mallaOriginal);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get('/api/mallaUser/detail', {
        headers: getAuthHeaders(),
        params: { rutUser: user.rut }
      });

      //console.log('Respuesta del backend (Carga):', response.data);
      // console.log('Response completo:', response);
      // console.log('Tipo de response.data:', typeof response.data);
      // console.log('response.data.status:', response.data?.status);
      // console.log('response.data.data:', response.data?.data);

      if (response.data && (response.data.success || response.data.status === 'Success')) {
        const mallaData = response.data.data;
        // console.log('Llamando a aplicarEstadosAsignaturas con:', mallaData);
        aplicarEstadosAsignaturas(mallaData);
      } else {
        // console.log('No success o no data, creando malla inicial');
        // Si no existe malla para el usuario, crear malla inicial
        crearMallaInicial();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Malla no encontrada, crear malla inicial con primeras asignaturas inscribibles
        crearMallaInicial();
      } else {
        showAlert('error', 'Error de Carga', 'Error al cargar los datos de la malla');
        // console.error('Error al cargar malla del usuario:', error);
        crearMallaInicial(); // Fallback a malla inicial
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar los estados a las asignaturas
  const aplicarEstadosAsignaturas = (mallaData) => {
    // console.log('Aplicando estados con datos del backend:', mallaData);
    // console.log('Asignaturas cursadas del backend:', mallaData.asignaturasCursadas);
    // console.log('Asignaturas inscribibles del backend:', mallaData.asignaturasInscribibles);
    // console.log('Asignaturas no inscribibles del backend:', mallaData.asignaturasNoInscribibles);

    // Debug: mostrar nombres del frontend
    // console.log('Nombres de asignaturas en el frontend:');
    // mallaOriginal.forEach(asig => //console.log(`- "${asig.nombre}"`));

    const mallaConEstados = mallaOriginal.map(asignatura => {
      let estado = 'default';

      if (mallaData.asignaturasCursadas && mallaData.asignaturasCursadas.includes(asignatura.nombre)) {
        estado = 'completada';
        // console.log(`✓ Asignatura "${asignatura.nombre}" marcada como completada`);
      } else if (mallaData.asignaturasInscribibles && mallaData.asignaturasInscribibles.includes(asignatura.nombre)) {
        estado = 'inscribible';
        // console.log(`○ Asignatura "${asignatura.nombre}" marcada como inscribible`);
      } else if (mallaData.asignaturasNoInscribibles && mallaData.asignaturasNoInscribibles.includes(asignatura.nombre)) {
        estado = 'no-inscribible';
        // console.log(`✕ Asignatura "${asignatura.nombre}" marcada como no-inscribible`);
      } else {
        // console.log(`⚠ Asignatura "${asignatura.nombre}" NO ENCONTRADA en ninguna lista del backend`);

        // Buscar coincidencias parciales
        const encontradaEnCursadas = mallaData.asignaturasCursadas?.find(backendNombre =>
          backendNombre.toLowerCase().includes(asignatura.nombre.toLowerCase()) ||
          asignatura.nombre.toLowerCase().includes(backendNombre.toLowerCase())
        );
        const encontradaEnInscribibles = mallaData.asignaturasInscribibles?.find(backendNombre =>
          backendNombre.toLowerCase().includes(asignatura.nombre.toLowerCase()) ||
          asignatura.nombre.toLowerCase().includes(backendNombre.toLowerCase())
        );
        const encontradaEnNoInscribibles = mallaData.asignaturasNoInscribibles?.find(backendNombre =>
          backendNombre.toLowerCase().includes(asignatura.nombre.toLowerCase()) ||
          asignatura.nombre.toLowerCase().includes(backendNombre.toLowerCase())
        );

        if (encontradaEnCursadas) {
          // console.log(`  → Posible coincidencia en cursadas: "${encontradaEnCursadas}"`);
        }
        if (encontradaEnInscribibles) {
          // console.log(`  → Posible coincidencia en inscribibles: "${encontradaEnInscribibles}"`);
        }
        if (encontradaEnNoInscribibles) {
          // console.log(`  → Posible coincidencia en no-inscribibles: "${encontradaEnNoInscribibles}"`);
        }
      }

      return { ...asignatura, estado };
    });

    //console.log('Malla con estados aplicados:', mallaConEstados);
    setAsignaturas(mallaConEstados);
    // Actualizar la lista local de asignaturas completadas
    setAsignaturasCompletadasLocal(mallaData.asignaturasCursadas || []);
    setCambiosPendientes(false);
  };

  // Función para actualizar la malla del usuario en el backend
  const guardarCambiosEnBackend = async () => {
    if (!user || !user.rut || user.role !== 'alumno') {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        rutUser: user.rut,
        asignaturasCursadas: asignaturasCompletadasLocal
      };

      // console.log('Guardando cambios en backend:', payload);

      const response = await axios.patch('/api/mallaUser/detail', payload, {
        headers: getAuthHeaders(),
        params: { rutUser: user.rut }
      });

      // console.log('Respuesta del backend (Actualización):', response.data);

      if (response.data && (response.data.success || response.data.status === 'Success')) {
        // console.log('Malla actualizada exitosamente');
        setCambiosPendientes(false);
        showAlert('success', 'Éxito', 'Malla actualizada correctamente');
        // Recargar la malla para obtener los nuevos estados
        setTimeout(() => cargarMallaUsuario(), 500);
      }
    } catch (error) {
      console.error('Error al actualizar la malla:', error);
      showAlert('error', 'Error de Actualización', 'Error al actualizar la malla del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Función para alternar el estado de una asignatura: inscribible ↔ completada
  const alternarEstadoAsignatura = (nombreAsignatura) => {
    const asignatura = asignaturas.find(a => a.nombre === nombreAsignatura);
    if (!asignatura) return;

    let nuevasAsignaturasCompletadas = [...asignaturasCompletadasLocal];
    let nuevoEstado = asignatura.estado;

    if (asignatura.estado === 'inscribible') {
      // De inscribible a completada
      nuevasAsignaturasCompletadas.push(nombreAsignatura);
      nuevoEstado = 'completada';
    } else if (asignatura.estado === 'completada') {
      // De completada a inscribible
      nuevasAsignaturasCompletadas = nuevasAsignaturasCompletadas.filter(nombre => nombre !== nombreAsignatura);
      nuevoEstado = 'inscribible';
    }

    // Actualizar estado local
    const nuevaMalla = asignaturas.map(asig =>
      asig.nombre === nombreAsignatura
        ? { ...asig, estado: nuevoEstado }
        : asig
    );

    setAsignaturas(nuevaMalla);
    setAsignaturasCompletadasLocal(nuevasAsignaturasCompletadas);
    setCambiosPendientes(true);
  };

  // Función para determinar el estado original de una asignatura
  const determinarEstadoOriginal = (nombreAsignatura) => {
    // Buscar en la última respuesta del backend o usar lógica de prerrequisitos
    // Por simplicidad, asumir que si no está en completadas, debe ser inscribible o no-inscribible
    const asignaturaOriginal = mallaOriginal.find(a => a.nombre === nombreAsignatura);
    if (asignaturaOriginal?.semestre === 1) {
      return 'inscribible';
    }
    return 'no-inscribible'; // Por defecto, requerirá recalcular desde el backend
  };

  useEffect(() => {
    if (user) {
      cargarMallaUsuario();
    } else {
      // Si no hay usuario, mostrar malla original
      setAsignaturas(mallaOriginal);
    }
  }, [user]);

  const guardarEnLocalStorage = (nuevaMalla) => {
    // Solo guardar en localStorage para personalización manual (colores personalizados)
    // Los datos de progreso académico vienen del backend
    const mallaPersonalizada = nuevaMalla.filter(asig =>
      !['completada', 'inscribible', 'no-inscribible', 'default'].includes(asig.estado)
    );
    if (mallaPersonalizada.length > 0) {
      localStorage.setItem("mallaPersonalizada", JSON.stringify(nuevaMalla));
    }
  };

  const handleAsignaturaClick = (nombre) => {
    // Si es alumno, manejar estados del sistema
    if (user && user.role === 'alumno') {
      const asignatura = asignaturas.find(a => a.nombre === nombre);

      if (asignatura) {
        if (['inscribible', 'completada'].includes(asignatura.estado)) {
          // Alternar entre inscribible ↔ completada
          alternarEstadoAsignatura(nombre);
          return;
        } else if (asignatura.estado === 'no-inscribible') {
          // No permitir cambiar si no es inscribible
          // console.log('Esta asignatura requiere prerrequisitos');
          return;
        }
      }
    }

    // Para usuarios no-alumno o asignaturas sin estado del sistema, abrir modal de colores
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

  const handleDownloadPDF = async () => {
    try {
      setLoadingPDF(true);
      // setError(''); // Limpiar errores previos

      let element = mallaRef.current;

      // Si no encuentra el elemento con ref, buscar por clase o ID
      if (!element) {
        console.warn('Referencia no encontrada, buscando elemento alternativo...');
        element = document.querySelector('.malla-container') ||
          document.querySelector('[data-pdf-content]') ||
          document.body;
      }

      if (!element) {
        console.error('No se pudo encontrar ningún elemento para el PDF');
        setError('Error: No se pudo encontrar el contenido para exportar');
        return;
      }

      //console.log('Elemento encontrado para PDF:', element);

      // Ocultar elementos que no queremos en el PDF
      const elementsToHide = document.querySelectorAll('.hide-in-pdf');
      elementsToHide.forEach(el => {
        el.style.display = 'none';
      });

      // Esperar un momento para asegurar que todo esté renderizado
      await new Promise(resolve => setTimeout(resolve, 100));

      const opt = {
        margin: 0.2,
        filename: `MallaCurricular_${user?.nombreCompleto?.replace(/\s+/g, '_') || 'Usuario'}.pdf`,
        image: { type: "png", quality: 0.98 },
        html2canvas: {
          scale: 2, // Reducir escala para mejor rendimiento
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          logging: false, // Desactivar logs para mejor rendimiento
          allowTaint: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: "in",
          format: "legal",
          orientation: "landscape",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      //console.log('Iniciando generación de PDF...');

      await html2pdf().set(opt).from(element).save();
      //console.log('PDF generado exitosamente');

      // Restaurar elementos ocultos
      elementsToHide.forEach(el => {
        el.style.display = '';
      });

    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError(`Error al generar el PDF: ${error.message}`);

      // Asegurar que los elementos se restauren incluso si hay error
      const elementsToHide = document.querySelectorAll('.hide-in-pdf');
      elementsToHide.forEach(el => {
        el.style.display = '';
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleResetMalla = async () => {
    localStorage.removeItem("mallaPersonalizada");

    if (user && user.role === 'alumno') {
      try {
        setLoading(true);
        setError('');

        // Eliminar la malla del backend
        await axios.delete('/api/mallaUser/detail', {
          headers: getAuthHeaders(),
          params: { rutUser: user.rut }
        });

        //console.log('Malla del usuario eliminada del backend');

        // Crear malla inicial (solo semestre 1 inscribible)
        crearMallaInicial();
        setCambiosPendientes(false);

      } catch (error) {
        if (error.response?.status === 404) {
          // Si no existe la malla, simplemente crear malla inicial
          //console.log('No existía malla para eliminar, creando malla inicial');
          crearMallaInicial();
        } else {
          console.error('Error al eliminar la malla:', error);
          setError('Error al restablecer la malla del usuario');
          // Aún así, crear malla inicial como fallback
          crearMallaInicial();
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Para usuarios no-alumno, solo restablecer visualización
      setAsignaturas(mallaOriginal);
    }
  };

  const renderSemestre = (sem) => (
    <div key={sem} className="flex flex-col items-center gap-1">
      <h2 className="text-xs font-medium text-blue-900 text-center mb-1">Semestre {sem}</h2>
      {asignaturas
        .filter((asig) => asig.semestre === sem)
        .map((asig) => {
          const isSystemState = ['completada', 'inscribible', 'no-inscribible'].includes(asig.estado);
          const isClickable = user && user.role === 'alumno'
            ? ['inscribible', 'completada'].includes(asig.estado)
            : !isSystemState;

          // Obtener símbolo según el estado
          const getSymbol = () => {
            if (!isSystemState || !user || user.role !== 'alumno') return '';
            switch (asig.estado) {
              case 'completada': return '✓';
              case 'inscribible': return '◯';
              case 'no-inscribible': return '✕';
              default: return '';
            }
          };

          return (
            <button
              key={asig.id || asig.nombre}
              type="button"
              className={`relative w-24 h-16 border text-[9px] rounded shadow-sm overflow-hidden p-1 text-center mb-1 transition-all duration-200 ${getColor(asig.estado)} ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                }`}
              onClick={() => isClickable && handleAsignaturaClick(asig.nombre)}
              title={
                user && user.role === 'alumno' && isSystemState
                  ? `${asig.estado === 'completada' ? 'Aprobada - Clic para desmarcar' :
                    asig.estado === 'inscribible' ? 'Disponible - Clic para marcar como aprobada' :
                      'Requiere prerrequisitos - No se puede inscribir'}`
                  : isSystemState
                    ? `${asig.estado === 'completada' ? 'Asignatura aprobada' :
                      asig.estado === 'inscribible' ? 'Asignatura inscribible' :
                        'Requiere prerrequisitos'}`
                    : "Haz clic para cambiar color"
              }
            >
              {/* Símbolo de fondo */}
              {getSymbol() && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none hide-in-pdf"
                  style={{
                    opacity: 0.18, // más transparente
                    zIndex: 0, // fondo
                    color: '#2563eb', // azul-600
                  }}
                >
                  {getSymbol()}
                </span>
              )}

              {/* Contenido principal */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <p className="font-medium break-words text-[10px] leading-tight text-blue-900 text-center mb-auto">{asig.nombre}</p>
                <p className="text-blue-700 text-[8px] mt-auto text-center">Créditos: {asig.creditos}</p>
              </div>
            </button>
          );
        })}
    </div>
  );

  return (
    <PagGeneral>
      <div className="p-4 sm:p-6 lg:p-8 ">
        <div ref={mallaRef} data-pdf-content className="malla-container w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 ">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
              Malla Curricular
            </h1>
            <p className="text-sm sm:text-base text-blue-700">
              Ingeniería Civil en Informática - Universidad del Bío-Bío
            </p>
            {user && user.role === 'alumno' && (
              <p className="text-xs sm:text-sm text-blue-600">
                Estudiante: {user.nombreCompleto} - RUT: {user.rut}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Generado el: {new Date().toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Controles y Leyenda combinados */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6 hide-in-pdf">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconMalla.png" alt="Icono Malla" className="w-5 h-5" />
                Herramientas y Estados de Malla
                <HelpTooltip>
                  <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes ver aquí?</h3>
                  <p className="text-gray-600 text-xs">
                    Aquí puedes ver las opciones disponibles para interactuar con tu malla curricular.
                  </p>
                </HelpTooltip>
              </h2>
            </div>



            {/* Leyenda de colores para alumnos */}
            {user && user.role === 'alumno' && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Estado de Asignaturas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                    <div>
                      <p className="font-medium text-green-800">Aprobadas</p>
                      <p className="text-xs text-green-600">Asignaturas completadas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                    <div>
                      <p className="font-medium text-blue-800">Inscribibles</p>
                      <p className="text-xs text-blue-600">Disponibles para inscribir</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                    <div>
                      <p className="font-medium text-red-800">No Inscribibles</p>
                      <p className="text-xs text-red-600">Requieren prerrequisitos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de control */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button
                onClick={handleDownloadPDF}
                disabled={loadingPDF}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPDF ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <img src="/IconPdf.png" alt="Icono PDF" className="w-5 h-5" />
                )}
                {loadingPDF ? 'Generando PDF...' : 'Descargar PDF'}
              </button>

              {user && user.role === 'alumno' && (
                <>
                  <button
                    onClick={cargarMallaUsuario}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src="/IconRegreso.png" alt="Icono Actualizar" className="w-5 h-5" />
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                  </button>

                  {cambiosPendientes && (
                    <>
                      <button
                        onClick={guardarCambiosEnBackend}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img src="/IconMalla.png" alt="Icono Guardar" className="w-5 h-5" />
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>

                      <button
                        onClick={() => {
                          cargarMallaUsuario();
                          setCambiosPendientes(false);
                        }}
                        disabled={loading}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img src="/IconRegreso.png" alt="Icono Descartar" className="w-5 h-5" />
                        Descartar Cambios
                      </button>
                    </>
                  )}
                </>
              )}
              {user && user.role === 'alumno' && (
                <button
                  onClick={handleResetMalla}
                  disabled={loading}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img src="/IconRegreso.png" alt="Icono Restablecer" className="w-5 h-5" />
                  {loading ? 'Restableciendo...' : (user && user.role === 'alumno' ? 'Restablecer Progreso' : 'Restablecer')}
                </button>
              )}
            </div>
          </div>

          {/* Malla Curricular */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 hide-in-pdf">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconMalla.png"
                  alt="Icono Malla"
                  className="w-5 h-5"
                />
                Plan de Estudios
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">
                    {user && user.role === 'alumno' ? 'Guía para estudiantes' : 'Guía de personalización'}
                  </h3>
                  <p className="text-gray-600 text-xs">
                    {user && user.role === 'alumno'
                      ? 'Haz clic en las asignaturas azules (inscribibles) o verdes (aprobadas) para cambiar su estado. Las rojas requieren prerrequisitos.'
                      : 'Haz clic en las asignaturas para cambiar su color y personalizar tu vista.'
                    }
                  </p>
                </HelpTooltip> */}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {/* {user && user.role === 'alumno'
                  ? 'Haz clic en las asignaturas azules o verdes para alternar: Inscribible ↔ Aprobada'
                  : 'Clic en las asignaturas para cambiar su color'
                } */}
              </p>
            </div>

            <div className="p-2 sm:p-4">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-10 min-w-max gap-3 mx-auto justify-center">
                  {[...Array(10)].map((_, i) => renderSemestre(i + 1))}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 hide-in-pdf">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconMalla.png" alt="Icono Malla" className="w-5 h-5" />
                {user && user.role === 'alumno' ? (
                  <>
                    Mi Progreso Académico
                    <HelpTooltip>
                      <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes ver aquí?</h3>
                      <p className="text-gray-600 text-xs">
                        Aquí puedes ver información del programa de la carrera con relación a tu progreso académico.
                      </p>
                    </HelpTooltip>
                  </>
                ) : (
                  <>
                    Información del Programa
                    <HelpTooltip>
                      <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes ver aquí?</h3>
                      <p className="text-gray-600 text-xs">
                        Aquí puedes ver información del programa de la carrera.
                      </p>
                    </HelpTooltip>
                  </>
                )}
              </h2>
            </div>

            {user && user.role === 'alumno' ? (
              // Estadísticas personalizadas para alumnos
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="font-medium text-green-900">Completadas</p>
                  <p className="text-green-700 text-lg font-bold">
                    {asignaturas.filter(a => a.estado === 'completada').length}
                  </p>
                  <p className="text-green-600 text-xs">
                    {asignaturas.filter(a => a.estado === 'completada').reduce((acc, a) => acc + a.creditos, 0)} créditos
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Inscribibles</p>
                  <p className="text-blue-700 text-lg font-bold">
                    {asignaturas.filter(a => a.estado === 'inscribible').length}
                  </p>
                  <p className="text-blue-600 text-xs">
                    {asignaturas.filter(a => a.estado === 'inscribible').reduce((acc, a) => acc + a.creditos, 0)} créditos
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="font-medium text-red-900">Pendientes</p>
                  <p className="text-red-700 text-lg font-bold">
                    {asignaturas.filter(a => a.estado === 'no-inscribible').length}
                  </p>
                  <p className="text-red-600 text-xs">
                    {asignaturas.filter(a => a.estado === 'no-inscribible').reduce((acc, a) => acc + a.creditos, 0)} créditos
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <p className="font-medium text-purple-900">Progreso</p>
                  <p className="text-purple-700 text-lg font-bold">
                    {Math.round((asignaturas.filter(a => a.estado === 'completada').length / mallaOriginal.length) * 100)}%
                  </p>
                  <p className="text-purple-600 text-xs">
                    {asignaturas.filter(a => a.estado === 'completada').length}/{mallaOriginal.length} asignaturas
                  </p>
                </div>
              </div>
            ) : (
              // Información general del programa
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
            )}
          </div>

          {/* Notificación de cambios pendientes
          {user && user.role === 'alumno' && cambiosPendientes && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 hide-in-pdf">
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></div>
                <h3 className="font-medium text-yellow-800">Cambios pendientes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-yellow-700 text-sm mb-2">
                    <strong>Aprobadas:</strong> {asignaturasCompletadasLocal.length}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {asignaturasCompletadasLocal.slice(0, 3).map((nombre, index) => (
                      <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                        {nombre}
                      </span>
                    ))}
                    {asignaturasCompletadasLocal.length > 3 && (
                      <span className="text-yellow-600 text-xs">
                        +{asignaturasCompletadasLocal.length - 3} más...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Indicador de carga */}
          {loading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2 hide-in-pdf">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Cargando datos de progreso académico...
            </div>
          )}
        </div>

        <Colores
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={aplicarColor}
        />

        {/* Componente Alert */}
        {alert.show && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={hideAlert}
            autoClose={3000}
          />
        )}
      </div>
    </PagGeneral>
  );
};

export default MallaCurricular;