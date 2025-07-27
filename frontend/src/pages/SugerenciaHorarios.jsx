import React, { useState, useEffect, useContext } from "react";
import PagGeneral from "../components/PagGeneral";
import { UserContext } from "../../context/userContext";
import axios from 'axios';
import HelpTooltip from "../components/PuntoAyuda";
import ModalConfiguracionHoras from "../components/ModalConfiguracionHoras";
import { use } from "react";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const horasDisponibles = [
  "08:10", "09:30", "09:40", "11:00", "11:10", "12:30",
  "12:40", "14:00", "14:10", "15:30", "15:40", "17:00",
  "17:10", "18:30", "18:40", "20:00"
];

// Colores para asignaturas
const coloresAsignaturas = {
  '620431': '#3B82F6', // Azul
  '620433': '#10B981', // Verde
  '620435': '#F59E0B', // Amarillo
  '620437': '#EF4444', // Rojo
  '620439': '#8B5CF6', // Púrpura
  '620441': '#06B6D4', // Cian
  '620443': '#F97316', // Naranja
  '620445': '#84CC16', // Lima
};

export default function SugerenciaHorarios() {
  const { user } = useContext(UserContext);
  const [asignaturas, setAsignaturas] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [configuracion, setConfiguracion] = useState({
    maxHorasPorDia: 8,
    preferenciaMorning: true,
    evitarSabado: true,
    descansoAlmuerzo: true
  });

  // Estados específicos para administradores
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [disponibilidadProfesor, setDisponibilidadProfesor] = useState({});

  // Nuevos estados para profesores
  const [asignaturasProfesor, setAsignaturasProfesor] = useState([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [modalAsignaturas, setModalAsignaturas] = useState(false);
  const [asignaturasConHoras, setAsignaturasConHoras] = useState([]);
  const [modalHorasAsignatura, setModalHorasAsignatura] = useState(false);
  const [asignaturaParaHoras, setAsignaturaParaHoras] = useState(null);

  const [combinacionGlobal, setCombinacionGlobal] = useState(null);
  const [profesorActual, setProfesorActual] = useState(0);

  const [modalHoras, setModalHoras] = useState(false);
  const [profesorHorasActual, setProfesorHorasActual] = useState(null);
  const [asignaturasHoras, setAsignaturasHoras] = useState([]);

  useEffect(() => {
    if (combinacionGlobal) {
      // eslint-disable-next-line
      console.log('combinacionGlobal:', combinacionGlobal);
    }
  }, [combinacionGlobal]);

  useEffect(() => {
    setProfesorActual(0);
  }, [combinacionGlobal]);

  // Configurar axios con token de autenticación
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Cargar lista de profesores (solo para administradores)
  const cargarProfesores = async () => {
    if (user?.role !== 'admin' && user?.role !== 'director') return;

    try {
      setLoading(true);
      setMensaje('');

      // Usar el endpoint con filtro por rol
      const response = await axios.get('/api/users/filter?role=profesor',
        getAuthConfig()
      );

      if (response.data && response.data.data) {
        setProfesores(response.data.data);
        //console.log('Profesores cargados:', response.data.data);
      } else {
        setMensaje('No se encontraron profesores');
        setProfesores([]);
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      if (error.response?.status === 401) {
        setMensaje('No tienes autorización para ver esta información');
      } else if (error.response?.status === 404) {
        setMensaje('No se encontraron profesores');
        setProfesores([]);
      } else {
        setMensaje(error.response?.data?.message || 'Error al cargar la lista de profesores');
      }
    } finally {
      setLoading(false);
    }
  };

  const abrirModalHoras = async (profesor) => {
    setProfesorHorasActual(profesor);
    setModalHoras(true);
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5500/api/combi/profesor/${profesor._id}/asignaturas`,
        getAuthConfig()
      );
      if (response.data && response.data.data) {
        const asignaturas = (response.data.data.asignaturas || []).map(asig => ({
          ...asig,
          horasSemanales: asig.horasSemanales || 0
        }));
        setAsignaturasHoras(asignaturas);
      } else {
        setAsignaturasHoras([]);
      }
    } catch (error) {
      setAsignaturasHoras([]);
    } finally {
      setLoading(false);
    }
  };

  const guardarHorasSemanales = async (asignaturasConHoras) => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5500/api/combi/profesor/${profesorHorasActual._id}/asignaturas`,
        { asignaturas: asignaturasConHoras },
        getAuthConfig()
      );
      setModalHoras(false);
      setMensaje('Horas semanales guardadas exitosamente');
      // Recargar profesores para reflejar los cambios
      await cargarProfesores();
    } catch (error) {
      setMensaje('Error al guardar las horas semanales');
    } finally {
      setLoading(false);
    }
  };

  // Cargar disponibilidad de un profesor específico (para administradores)
  const cargarDisponibilidadProfesorAdmin = async (profesorId) => {
    try {
      setLoading(true);
      setMensaje('');

      const response = await axios.get(`/api/disponibilidad?profesorId=${profesorId}`,
        getAuthConfig()
      );

      if (response.data && response.data.data) {
        // Convertir los bloques del backend al formato de disponibilidad del frontend
        const disponibilidadFormateada = {};
        response.data.data.bloques?.forEach(bloque => {
          const key = `${bloque.dia}-${bloque.horaInicio}`;
          disponibilidadFormateada[key] = true;
        });
        setDisponibilidadProfesor(disponibilidadFormateada);
        //console.log('Disponibilidad del profesor cargada:', disponibilidadFormateada);
      } else {
        setDisponibilidadProfesor({});
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad del profesor:', error);
      if (error.response?.status === 404) {
        // No hay disponibilidad guardada para este profesor
        setDisponibilidadProfesor({});
        setMensaje('Este profesor no ha configurado su disponibilidad horaria');
      } else if (error.response?.status === 401) {
        setMensaje('No tienes autorización para ver esta información');
      } else {
        setMensaje(error.response?.data?.message || 'Error al cargar la disponibilidad del profesor');
        setDisponibilidadProfesor({});
      }
    } finally {
      setLoading(false);
    }
  };

  const generarCombinacionGlobal = async () => {
    setLoading(true);
    setMensaje('');
    setCombinacionGlobal(null);

    const datos = profesores.map(profesor => ({
      profesorId: profesor._id,
      asignaturas: (profesor.asignaturasImpartidas || [])
        .filter(asig => asig.horasSemanales > 0)
        .map(asig => ({
          codigo: asig.codigo,
          horasSemanales: asig.horasSemanales
        }))
    })).filter(p => p.asignaturas.length > 0);

    console.log('Datos a enviar para generar combinación global:', datos);

    try {
      const response = await axios.post(
        'http://localhost:5500/api/combi/horario/generar-global',
        datos, // <-- aquí va el arreglo correcto
        getAuthConfig()
      );
      
      setCombinacionGlobal(response.data?.data || []);
      setMensaje(`Recomendación generada exitosamente `);
    } catch (error) {
      console.error('Error al generar combinación global:', error);
      setMensaje(error.response?.data?.message || 'Error al generar la recomendación');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar profesor y cargar su disponibilidad
  const seleccionarProfesor = (profesor) => {
    setProfesorSeleccionado(profesor);
    setMensaje(''); // Limpiar mensajes anteriores
    cargarDisponibilidadProfesorAdmin(profesor._id);
  };

  // Cargar disponibilidad del profesor desde el backend (para profesores)
  const cargarDisponibilidadProfesor = async () => {
    if (user?.role !== 'profesor') return;

    try {
      setLoading(true);
      setMensaje('');

      const response = await axios.get('/api/disponibilidad',
        getAuthConfig()
      );

      if (response.data && response.data.data) {
        // Convertir los bloques del backend al formato de disponibilidad del frontend
        const disponibilidadFormateada = {};
        response.data.data.bloques?.forEach(bloque => {
          const key = `${bloque.dia}-${bloque.horaInicio}`;
          disponibilidadFormateada[key] = true;
        });
        setDisponibilidad(disponibilidadFormateada);
        //console.log('Mi disponibilidad cargada:', disponibilidadFormateada);
      } else {
        setDisponibilidad({});
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      if (error.response?.status === 404) {
        // No hay disponibilidad guardada, inicializar vacía
        setDisponibilidad({});
        //console.log('No hay disponibilidad guardada, iniciando con tabla vacía');
      } else if (error.response?.status === 401) {
        setMensaje('No tienes autorización para acceder a esta función');
      } else {
        setMensaje(error.response?.data?.message || 'Error al cargar la disponibilidad');
      }
    } finally {
      setLoading(false);
    }
  };

  // Guardar disponibilidad del profesor en el backend (para profesores)
  const guardarDisponibilidadProfesor = async () => {
    if (user?.role !== 'profesor') return;

    try {
      setLoading(true);
      setMensaje('');

      // Convertir disponibilidad del frontend al formato esperado por el backend
      const bloques = [];
      Object.entries(disponibilidad).forEach(([key, isDisponible]) => {
        if (isDisponible) {
          const [dia, horaInicio] = key.split('-');
          const horaInicioIndex = horasDisponibles.indexOf(horaInicio);
          const horaFin = horasDisponibles[horaInicioIndex + 1] || horaInicio;

          bloques.push({
            dia,
            horaInicio,
            horaFin
          });
        }
      });

      //console.log('Datos a enviar:', { bloques });
      //console.log('Usuario:', user);
      //console.log('ID del usuario:', user?.id || user?._id);

      const response = await axios.post('/api/disponibilidad',
        { bloques },
        getAuthConfig()
      );

      if (response.data) {
        setMensaje('Disponibilidad guardada exitosamente');
        //console.log('Disponibilidad guardada:', response.data);
        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('Código de estado:', error.response?.status);

      if (error.response?.status === 401) {
        setMensaje('No tienes autorización para realizar esta acción');
      } else if (error.response?.status === 403) {
        setMensaje('Solo los profesores pueden configurar disponibilidad');
      } else if (error.response?.status === 400) {
        // Mostrar detalles del error de validación
        const errorDetails = error.response?.data?.details || error.response?.data?.message;
        setMensaje(`Error de validación: ${Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails}`);
      } else {
        setMensaje(error.response?.data?.message || 'Error al guardar la disponibilidad');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar asignaturas disponibles desde la base de datos
  const cargarAsignaturasDisponibles = async () => {
    try {
      setLoading(true);
      setMensaje('');

      // Usar el nuevo endpoint específico para asignaturas disponibles
      const response = await axios.get('http://localhost:5500/api/combi/asignaturas-disponibles', getAuthConfig());

      if (response.data && response.data.data) {
        // Formatear las asignaturas para el modal
        const asignaturasFormateadas = response.data.data.map(asignatura => ({
          codigo: asignatura.codigo,
          nombre: asignatura.nombre.toUpperCase(),
          creditos: asignatura.creditos,
          semestre: asignatura.semestre,
          _id: asignatura._id
        }));

        setAsignaturasDisponibles(asignaturasFormateadas);
        console.log('Asignaturas cargadas desde la base de datos:', asignaturasFormateadas);
      } else {
        console.error('No se encontraron asignaturas en la respuesta');
        setMensaje('No se pudieron cargar las asignaturas disponibles');
        setAsignaturasDisponibles([]);
      }
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);

      if (error.response?.status === 404) {
        setMensaje('No hay asignaturas registradas en el sistema');
        setAsignaturasDisponibles([]);
      } else if (error.response?.status === 401) {
        setMensaje('No tienes autorización para ver las asignaturas');
      } else {
        setMensaje('Error al cargar las asignaturas desde la base de datos');

        // Fallback: usar datos simulados solo si es necesario
        const asignaturasSimuladas = [
          { codigo: '620431', nombre: 'INTRODUCCIÓN A LA PROGRAMACIÓN' },
          { codigo: '620433', nombre: 'PROGRAMACIÓN ORIENTADA AL OBJETO' },
          { codigo: '620435', nombre: 'ESTRUCTURAS DE DATOS' },
          { codigo: '620437', nombre: 'FUNDAMENTOS DE CIENCIAS DE LA COMPUTACIÓN' },
          { codigo: '620439', nombre: 'BASE DE DATOS' }
        ];
        setAsignaturasDisponibles(asignaturasSimuladas);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar asignaturas del profesor
  const cargarAsignaturasProfesor = async () => {
    if (user?.role !== 'profesor') return;

    try {
      const response = await axios.get(`/api/combi/profesor/${user.id || user._id}/asignaturas`,
        getAuthConfig()
      );

      if (response.data && response.data.data) {
        const asignaturas = response.data.data.asignaturas || [];
        setAsignaturasProfesor(asignaturas);
        // Separar asignaturas que ya tienen horas configuradas
        const conHoras = asignaturas.filter(a => a.horasSemanales);
        const sinHoras = asignaturas.filter(a => !a.horasSemanales);
        setAsignaturasConHoras(conHoras);

        // Si hay asignaturas sin horas, mostrar modal para configurarlas
        if (sinHoras.length > 0) {
          setAsignaturaParaHoras(sinHoras[0]);
          setModalHorasAsignatura(true);
        }
      }
    } catch (error) {
      console.error('Error al cargar asignaturas del profesor:', error);
    }
  };

  // Guardar asignaturas del profesor
  const guardarAsignaturasProfesor = async (asignaturasSeleccionadas) => {
    if (user?.role !== 'profesor') return;

    try {
      setLoading(true);
      // Preservar las horas ya configuradas al agregar nuevas asignaturas
      const asignaturasConHorasExistentes = asignaturasSeleccionadas.map(asignatura => {
        const existente = asignaturasConHoras.find(a => a.codigo === asignatura.codigo);
        return existente || asignatura;
      });

      const response = await axios.post(
        `http://localhost:5500/api/combi/profesor/${user.id || user._id}/asignaturas`,
        { asignaturas: asignaturasConHorasExistentes },
        getAuthConfig()
      );

      if (response.data) {
        setAsignaturasProfesor(asignaturasConHorasExistentes);
        setMensaje('Asignaturas guardadas exitosamente');
        setModalAsignaturas(false);

        // Verificar si hay asignaturas nuevas sin horas configuradas
        const sinHoras = asignaturasConHorasExistentes.filter(a => !a.horasSemanales);
        if (sinHoras.length > 0) {
          setAsignaturaParaHoras(sinHoras[0]);
          setModalHorasAsignatura(true);
        }

        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (error) {
      console.error('Error al guardar asignaturas:', error);
      setMensaje(error.response?.data?.message || 'Error al guardar las asignaturas');
    } finally {
      setLoading(false);
    }
  };

  // Guardar horas de una asignatura específica
  const guardarHorasAsignatura = async (asignaturaId, horasSemanales) => {
    try {
      setLoading(true);

      // Actualizar la asignatura con las horas configuradas
      const asignaturasActualizadas = asignaturasProfesor.map(asig =>
        asig._id === asignaturaId ? { ...asig, horasSemanales } : asig
      );

      // Guardar en el backend
      const response = await axios.post(
        `http://localhost:5500/api/combi/profesor/${user.id || user._id}/asignaturas`,
        { asignaturas: asignaturasActualizadas },
        getAuthConfig()
      );

      if (response.data) {
        setAsignaturasProfesor(asignaturasActualizadas);

        // Actualizar asignaturasConHoras
        const asignaturaActualizada = asignaturasActualizadas.find(a => a._id === asignaturaId);
        setAsignaturasConHoras(prev => {
          const filtered = prev.filter(a => a._id !== asignaturaId);
          return [...filtered, asignaturaActualizada];
        });

        setMensaje(`Horas configuradas para ${asignaturaParaHoras.nombreAsignatura}`);
        setModalHorasAsignatura(false);
        setAsignaturaParaHoras(null);

        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (error) {
      console.error('Error al guardar horas de asignatura:', error);
      setMensaje(error.response?.data?.message || 'Error al guardar las horas');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar sugerencia seleccionada
  const aplicarSugerencia = async (sugerencia) => {
    try {
      setLoading(true);

      // Para profesores, podríamos guardar la sugerencia en el backend
      if (user?.role === 'profesor') {
        // Aquí podrías implementar la lógica para enviar la sugerencia al backend
        // Por ahora solo guardamos en localStorage
        localStorage.setItem("horarioSeleccionado", JSON.stringify(sugerencia.horarios));
        setMensaje(`Sugerencia "${sugerencia.nombre}" aplicada correctamente`);
      } else {
        // Para otros roles, usar la lógica original
        localStorage.setItem("horarioSeleccionado", JSON.stringify(sugerencia.horarios));
        setMensaje(`Horario "${sugerencia.nombre}" aplicado correctamente`);
      }

      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al aplicar sugerencia:', error);
      setMensaje('Error al aplicar la sugerencia');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'director') {
      cargarProfesores();
    } else if (user?.role === 'profesor') {
      cargarDisponibilidadProfesor();
      cargarAsignaturasDisponibles();
      cargarAsignaturasProfesor();
    } else if (user?.role !== 'profesor' && user?.role !== 'admin' && user?.role !== 'director') {
      // Código original para otros roles
      const asignaturasGuardadas = localStorage.getItem("asignaturasDisponibles");
      if (asignaturasGuardadas) {
        setAsignaturas(JSON.parse(asignaturasGuardadas));
      } else {
        // Datos de ejemplo
        setAsignaturas([
          { id: 1, nombre: "Cálculo Diferencial", creditos: 6, semestre: 2 },
          { id: 2, nombre: "Programación OOP", creditos: 8, semestre: 2 },
          { id: 3, nombre: "Estructuras Discretas", creditos: 5, semestre: 2 },
          { id: 4, nombre: "Química General", creditos: 8, semestre: 2 },
          { id: 5, nombre: "Inglés I", creditos: 4, semestre: 3 }
        ]);
      }

      const disponibilidadGuardada = localStorage.getItem("disponibilidadHoraria");
      if (disponibilidadGuardada) {
        setDisponibilidad(JSON.parse(disponibilidadGuardada));
      }
    }
  }, [user]);

  const handleConfiguracionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleDisponibilidad = (dia, hora) => {
    const key = `${dia}-${hora}`;
    setDisponibilidad(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // Para profesores, no guardar en localStorage ya que se maneja en el backend
    if (user?.role !== 'profesor') {
      // Guardar en localStorage para otros roles
      const nuevaDisponibilidad = {
        ...disponibilidad,
        [key]: !disponibilidad[key]
      };
      localStorage.setItem("disponibilidadHoraria", JSON.stringify(nuevaDisponibilidad));
    }
  };

  const generarSugerencias = () => {
    // Algoritmo básico de sugerencias
    const nuevasSugerencias = [];

    // Filtrar asignaturas según configuración
    const asignaturasFiltered = asignaturas.filter(asig => {
      // Aquí se pueden agregar más filtros
      return true;
    });

    // Generar 3 sugerencias diferentes
    for (let i = 0; i < 3; i++) {
      const sugerencia = {
        id: i + 1,
        nombre: `Opción ${i + 1}`,
        horarios: [],
        puntuacion: Math.floor(Math.random() * 100) + 1
      };

      // Asignar horarios aleatorios (esto se puede mejorar con un algoritmo más sofisticado)
      asignaturasFiltered.forEach(asignatura => {
        const diaRandom = diasSemana[Math.floor(Math.random() * diasSemana.length)];
        const horaRandom = horasDisponibles[Math.floor(Math.random() * horasDisponibles.length)];

        sugerencia.horarios.push({
          asignatura: asignatura.nombre,
          dia: diaRandom,
          horaInicio: horaRandom,
          horaFin: horasDisponibles[horasDisponibles.indexOf(horaRandom) + 1] || horaRandom,
          sala: `Sala ${Math.floor(Math.random() * 20) + 1}`,
          profesor: `Profesor ${Math.floor(Math.random() * 10) + 1}`
        });
      });

      nuevasSugerencias.push(sugerencia);
    }

    setSugerencias(nuevasSugerencias);
  };

  // Si no hay usuario logueado
  if (!user) {
    return (
      <PagGeneral>
        <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
                Acceso Restringido
              </h1>
              <p className="text-sm sm:text-base text-blue-700">
                Debes iniciar sesión para acceder a esta página
              </p>
            </div>
          </div>
        </div>
      </PagGeneral>
    );
  }

  // Vista para administradores - Lista de profesores y disponibilidad
  if (user.role === 'admin' || user.role === 'director') {
    return (
      <PagGeneral>
        <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Encabezado para administradores */}
            <div className="text-center space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
                Gestión de Disponibilidad de Profesores
              </h1>
              <p className="text-sm sm:text-base text-blue-700">
                Consulta la disponibilidad horaria de todos los profesores
              </p>
            </div>

            {/* Mensajes */}
            {mensaje && (
              <div className={`p-4 rounded-lg text-center ${mensaje.includes('exitosamente') || mensaje.includes('cargado')
                ? 'bg-green-100 text-green-700 border border-green-300'
                : mensaje.includes('no ha configurado')
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                <div className="flex items-center justify-center gap-2">
                  {mensaje.includes('exitosamente') || mensaje.includes('cargado') ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : mensaje.includes('no ha configurado') ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {mensaje}
                </div>
              </div>
            )}

            <div className="flex justify-end mb-4">
              <button
                onClick={generarCombinacionGlobal}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Recomendación de Horarios'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de profesores */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6 hide-in-pdf">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Lista de Profesores ({profesores.length})
                    <HelpTooltip className="text-white hover:text-yellow-300">
                      <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                      <p className="text-gray-600 text-xs">
                        Elige un profesor para ver su disponibilidad horaria, asignarle horas de clases por semana para cada asignatura y genera las sugerencias para estos profesores.
                      </p>
                    </HelpTooltip>
                  </h2>
                </div>

                <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
                  {loading && !profesorSeleccionado ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-blue-600 mt-2">Cargando profesores...</p>
                    </div>
                  ) : profesores.length === 0 ? (
                    <div className="text-center py-4">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-gray-500">No se encontraron profesores</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profesores.map((profesor) => (
                        <div
                          key={profesor._id}
                          onClick={() => seleccionarProfesor(profesor)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${profesorSeleccionado?._id === profesor._id
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-blue-900">
                                {profesor.nombreCompleto || `${profesor.nombres} ${profesor.apellidos}`}
                              </p>
                              <p className="text-sm text-blue-600">{profesor.email}</p>
                              <p className="text-xs text-gray-500">
                                RUT: {profesor.rut}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button
                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalHoras(profesor);
                                }}
                              >
                                Definir Horas
                              </button>
                              <div className="text-blue-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Disponibilidad del profesor seleccionado */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6 hide-in-pdf">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Disponibilidad Horaria
                    <HelpTooltip className="text-white hover:text-yellow-300">
                      <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes ver aquí?</h3>
                      <p className="text-gray-600 text-xs">
                        Aquí puedes visualizar la disponibilidad de cualquier profesor dentro de la semana.
                      </p>
                    </HelpTooltip>
                  </h2>
                  {/* {profesorSeleccionado && (
                    <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                      {profesorSeleccionado.nombreCompleto || `${profesorSeleccionado.nombres} ${profesorSeleccionado.apellidos}`}
                    </p>
                  )} */}
                </div>

                <div className="p-4 sm:p-6">
                  {!profesorSeleccionado ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">Selecciona un profesor para ver su disponibilidad</p>
                    </div>
                  ) : loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-blue-600 mt-2">Cargando disponibilidad...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="border border-blue-200 px-2 py-1 text-blue-900 font-semibold text-xs">
                              Hora
                            </th>
                            {diasSemana.map(dia => (
                              <th key={dia} className="border border-blue-200 px-2 py-1 text-blue-900 font-semibold text-xs">
                                {dia.substring(0, 3)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {horasDisponibles.map(hora => (
                            <tr key={hora}>
                              <td className="border border-blue-200 px-2 py-1 text-blue-900 font-medium text-xs bg-blue-50">
                                {hora}
                              </td>
                              {diasSemana.map(dia => {
                                const key = `${dia}-${hora}`;
                                const isDisponible = disponibilidadProfesor[key];
                                return (
                                  <td key={key} className="border border-blue-200 p-1">
                                    <div
                                      className={`w-full h-6 rounded transition-colors ${isDisponible
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                        }`}
                                      title={isDisponible ? 'Disponible' : 'No disponible'}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Disponible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-700">No disponible</span>
                </div>
              </div>
            </div>

            {/* Quitar el bloque amarillo de debug */}
            {/* {combinacionGlobal && (
              <div className="bg-yellow-50 border border-yellow-300 rounded p-2 my-4 text-xs text-yellow-900 overflow-x-auto">
                <b>DEBUG combinacionGlobal:</b>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(combinacionGlobal, null, 2)}
                </pre>
              </div>
            )} */}

            {/* Mostrar solo una tabla de profesor a la vez, con navegación */}
            {combinacionGlobal && Array.isArray(combinacionGlobal) && combinacionGlobal.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-blue-900 text-center mb-4">
                  Recomendación de Horarios Generada
                </h2>
                <div className="flex justify-center items-center gap-4 my-4">
                  <button
                    className="px-4 py-2 bg-blue-200 text-blue-800 rounded disabled:opacity-50"
                    onClick={() => setProfesorActual((prev) => Math.max(prev - 1, 0))}
                    disabled={profesorActual === 0}
                  >
                    ← Anterior
                  </button>
                  <span className="font-semibold text-blue-900">
                    Profesor {profesorActual + 1} de {combinacionGlobal.length}
                  </span>
                  <button
                    className="px-4 py-2 bg-blue-200 text-blue-800 rounded disabled:opacity-50"
                    onClick={() => setProfesorActual((prev) => Math.min(prev + 1, combinacionGlobal.length - 1))}
                    disabled={profesorActual === combinacionGlobal.length - 1}
                  >
                    Siguiente →
                  </button>
                </div>
                <TablaCombinacionGlobal combinacion={[combinacionGlobal[profesorActual]]} profesores={profesores} />
              </div>
            )}
          </div>
        </div>

        {modalHoras && (
          <ModalHorasSemanales
            profesor={profesorHorasActual}
            asignaturas={asignaturasHoras}
            onGuardar={guardarHorasSemanales}
            onCerrar={() => setModalHoras(false)}
            loading={loading}
          />
        )}
      </PagGeneral>
    );
  }

  // Vista para profesores - Disponibilidad y asignaturas
  if (user.role === 'profesor') {
    return (
      <PagGeneral>
        <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Encabezado para profesores */}
            <div className="text-center space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
                Mi Disponibilidad Horaria
              </h1>
              <p className="text-sm sm:text-base text-blue-700">
                Configura tu disponibilidad para dictar clases
              </p>
            </div>

            {/* Mensajes */}
            {mensaje && (
              <div className={`p-4 rounded-lg text-center ${mensaje.includes('exitosamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {mensaje}
              </div>
            )}

            {/* Disponibilidad Horaria */}
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <img src="/IconHorario.png" alt="Icono Horario" className="w-5 h-5" />
                  Mi Disponibilidad Horaria
                  <HelpTooltip>
                    <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes hacer aquí?</h3>
                    <p className="text-gray-600 text-xs">
                      Aquí debes marcar las casillas en las que puedes dictar clases. Si están marcadas en verde, significa que estas disponible para dictar clases en ese horario.
                    </p>
                  </HelpTooltip>
                </h2>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-blue-200 px-3 py-2 text-blue-900 font-semibold text-sm">
                        Hora
                      </th>
                      {diasSemana.map(dia => (
                        <th key={dia} className="border border-blue-200 px-3 py-2 text-blue-900 font-semibold text-sm">
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horasDisponibles.map(hora => (
                      <tr key={hora}>
                        <td className="border border-blue-200 px-3 py-2 text-blue-900 font-medium text-sm bg-blue-50">
                          {hora}
                        </td>
                        {diasSemana.map(dia => {
                          const key = `${dia}-${hora}`;
                          const isDisponible = disponibilidad[key];
                          return (
                            <td key={key} className="border border-blue-200 p-1">
                              <button
                                onClick={() => toggleDisponibilidad(dia, hora)}
                                disabled={loading}
                                className={`w-full h-8 rounded transition-colors ${isDisponible
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-gray-200 hover:bg-gray-300'
                                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isDisponible ? 'Disponible' : 'No disponible'}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Botón para guardar disponibilidad */}
              <div className="p-4 bg-gray-50 text-center">
                <button
                  onClick={guardarDisponibilidadProfesor}
                  disabled={loading}
                  className={`bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Disponibilidad
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Asignaturas del Profesor */}
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Mis Asignaturas
                  <HelpTooltip>
                    <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes hacer aquí?</h3>
                    <p className="text-gray-600 text-xs">
                      Aquí debes configurar las asignaturas que vas a impartir este semestre.
                    </p>
                  </HelpTooltip>
                </h2>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Asignaturas Asignadas ({asignaturasProfesor.length})
                  </h3>
                  <button
                    onClick={() => setModalAsignaturas(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Gestionar Asignaturas
                  </button>
                </div>

                {asignaturasProfesor.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500 text-lg">No hay asignaturas asignadas</p>
                    <p className="text-gray-400 text-sm mt-1">Haz clic en "Gestionar Asignaturas" para comenzar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {asignaturasProfesor.map((asignatura, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-900">{asignatura.codigo}</p>
                        <p className="text-blue-700 text-sm mb-3">{asignatura.nombre}</p>

                        {/* Mostrar horas configuradas */}
                        {asignatura.horasSemanales ? (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-600 text-sm font-medium">
                              {asignatura.horasSemanales} hrs/semana
                            </span>
                            <button
                              onClick={() => {
                                setAsignaturaParaHoras(asignatura);
                                setModalHorasAsignatura(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Editar horas
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAsignaturaParaHoras(asignatura);
                              setModalHorasAsignatura(true);
                            }}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Configurar horas
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal para gestionar asignaturas */}
            {modalAsignaturas && (
              <ModalAsignaturas
                asignaturasDisponibles={asignaturasDisponibles}
                asignaturasSeleccionadas={asignaturasProfesor}
                onGuardar={guardarAsignaturasProfesor}
                onCerrar={() => setModalAsignaturas(false)}
                loading={loading}
              />
            )}

            {/* Modal para configurar horas de asignatura */}
            {modalHorasAsignatura && asignaturaParaHoras && (
              <ModalConfiguracionHoras
                asignatura={asignaturaParaHoras}
                onGuardar={guardarHorasAsignatura}
                onCerrar={() => setModalHorasAsignatura(false)}
              />
            )}
          </div>
        </div>
      </PagGeneral>
    );
  }

  // Vista original para otros roles (alumnos, etc.)
  return (
    <PagGeneral>
      <div className="min-h-screen from-blue-50 to-cyan-50 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
              Sugerencias de Horarios
            </h1>
            <p className="text-sm sm:text-base text-blue-700">
              Genera horarios optimizados según tus preferencias y disponibilidad
            </p>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <img src="/IconHorario.png" alt="Icono Horario" className="w-5 h-5" />
                Configuración de Preferencias
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                  <p className="text-gray-600 text-xs">
                    Ajusta tus preferencias para obtener mejores sugerencias
                  </p>
                </HelpTooltip>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Máximo horas por día
                </label>
                <input
                  type="number"
                  name="maxHorasPorDia"
                  value={configuracion.maxHorasPorDia}
                  onChange={handleConfiguracionChange}
                  min="2"
                  max="12"
                  className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="preferenciaMorning"
                  checked={configuracion.preferenciaMorning}
                  onChange={handleConfiguracionChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-blue-900">
                  Preferir horarios matutinos
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="evitarSabado"
                  checked={configuracion.evitarSabado}
                  onChange={handleConfiguracionChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-blue-900">
                  Evitar clases los sábados
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="descansoAlmuerzo"
                  checked={configuracion.descansoAlmuerzo}
                  onChange={handleConfiguracionChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-blue-900">
                  Respetar hora de almuerzo
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={generarSugerencias}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Generar Sugerencias
              </button>
            </div>
          </div>

          {/* Disponibilidad Horaria */}
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 ">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Disponibilidad Horaria
                <HelpTooltip className="text-white hover:text-yellow-300">
                  <h3 className="text-blue-700 font-bold text-sm mb-1">¿Cómo funciona?</h3>
                  <p className="text-gray-600 text-xs">
                    1. Ajusta tus preferencias de horario según tus necesidades.
                    2. Marca los horarios en los que puedes tomar clases.
                    3. El sistema genera múltiples opciones optimizadas.
                    4. Elige la opción que mejor se adapte a ti.
                    5. Marca los horarios en los que estás disponible (verde = disponible)
                  </p>
                </HelpTooltip>
              </h2>
            </div>

            <div className="p-4 sm:p-6 overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-blue-200 px-3 py-2 text-blue-900 font-semibold text-sm">
                      Hora
                    </th>
                    {diasSemana.map(dia => (
                      <th key={dia} className="border border-blue-200 px-3 py-2 text-blue-900 font-semibold text-sm">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horasDisponibles.map(hora => (
                    <tr key={hora}>
                      <td className="border border-blue-200 px-3 py-2 text-blue-900 font-medium text-sm bg-blue-50">
                        {hora}
                      </td>
                      {diasSemana.map(dia => {
                        const key = `${dia}-${hora}`;
                        const isDisponible = disponibilidad[key];
                        return (
                          <td key={key} className="border border-blue-200 p-1">
                            <button
                              onClick={() => toggleDisponibilidad(dia, hora)}
                              className={`w-full h-8 rounded transition-colors ${isDisponible
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              title={isDisponible ? 'Disponible' : 'No disponible'}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sugerencias Generadas */}
          {sugerencias.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-blue-900 text-center">
                Sugerencias Generadas
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {sugerencias.map(sugerencia => (
                  <div key={sugerencia.id} className="bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3">
                      <h3 className="font-semibold text-lg">{sugerencia.nombre}</h3>
                      <p className="text-blue-100 text-sm">
                        Puntuación: {sugerencia.puntuacion}/100
                      </p>
                    </div>

                    <div className="p-4 space-y-2">
                      {sugerencia.horarios.map((horario, index) => (
                        <div key={index} className="bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="font-semibold text-blue-900 text-sm">
                            {horario.asignatura}
                          </p>
                          <p className="text-blue-700 text-xs">
                            {horario.dia} - {horario.horaInicio} a {horario.horaFin}
                          </p>
                          <p className="text-blue-600 text-xs">
                            {horario.sala} - {horario.profesor}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-gray-50 text-center">
                      <button
                        onClick={() => aplicarSugerencia(sugerencia)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                      >
                        Aplicar Horario
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PagGeneral>
  );
}

// Componente Modal para gestionar asignaturas
const ModalAsignaturas = ({ asignaturasDisponibles, asignaturasSeleccionadas, onGuardar, onCerrar, loading }) => {
  const [seleccionadas, setSeleccionadas] = useState(asignaturasSeleccionadas);

  const toggleAsignatura = (asignatura) => {
    setSeleccionadas(prev => {
      const existe = prev.find(a => a.codigo === asignatura.codigo);
      if (existe) {
        return prev.filter(a => a.codigo !== asignatura.codigo);
      } else {
        return [...prev, asignatura];
      }
    });
  };

  const handleGuardar = () => {
    onGuardar(seleccionadas);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
          <h3 className="text-lg font-semibold">Gestionar Asignaturas</h3>
          <p className="text-green-100 text-sm mt-1">
            Selecciona las asignaturas que impartirás este semestre
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {asignaturasDisponibles.map((asignatura) => {
              const isSelected = seleccionadas.find(a => a.codigo === asignatura.codigo);
              return (
                <div
                  key={asignatura.codigo}
                  onClick={() => toggleAsignatura(asignatura)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                    ? 'bg-green-50 border-green-500 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{asignatura.codigo}</p>
                      <p className="text-sm text-gray-600">{asignatura.nombre}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onCerrar}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar ({seleccionadas.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Utilidad para agrupar combinaciones globales por "matriz de bloques" (día+hora)
function agruparCombinacionesPorBloques(combinacionGlobal) {
  // Creamos una clave única para cada combinación de bloques (ignorando la sala)
  const tablas = [];
  const claves = [];

  combinacionGlobal.forEach((prof) => {
    prof.horarios.forEach((h) => {
      // clave: profesor-dia-horaInicio-horaFin-asignatura
      h._bloqueKey = `${h.dia}-${h.horaInicio}-${h.horaFin}`;
    });
  });

  // Creamos una matriz para cada variante de asignación de salas
  combinacionGlobal.forEach((prof) => {
    prof.horarios.forEach((h) => {
      // Para cada bloque, buscamos si ya existe una tabla con ese patrón de bloques
      let tablaEncontrada = null;
      for (let i = 0; i < tablas.length; i++) {
        const tabla = tablas[i];
        // Comprobamos si para este bloque, en esta tabla, ya existe una asignación de sala diferente
        const existe = tabla.some(
          (p) =>
            p.profesorId === prof.profesorId &&
            p.horarios.some(
              (b) =>
                b._bloqueKey === h._bloqueKey &&
                b.sala === h.sala
            )
        );
        if (!existe) {
          tablaEncontrada = tabla;
          break;
        }
      }
      if (!tablaEncontrada) {
        // Creamos una nueva tabla (copia profunda de la estructura de combinacionGlobal)
        const nuevaTabla = combinacionGlobal.map((p) => ({
          ...p,
          horarios: p.horarios.filter(() => false), // vacía, se llenará abajo
        }));
        tablas.push(nuevaTabla);
        tablaEncontrada = nuevaTabla;
      }
      // Agregamos el bloque a la tabla encontrada
      const profTabla = tablaEncontrada.find((p) => p.profesorId === prof.profesorId);
      if (profTabla) {
        // Evitar duplicados exactos
        if (!profTabla.horarios.some((b) => b._bloqueKey === h._bloqueKey && b.sala === h.sala)) {
          profTabla.horarios.push({ ...h });
        }
      }
    });
  });

  // Limpiar claves auxiliares
  tablas.forEach((tabla) =>
    tabla.forEach((p) =>
      p.horarios.forEach((h) => {
        delete h._bloqueKey;
      })
    )
  );

  return tablas;
}

// Tabla visual para la combinación global
function TablaCombinacionGlobal({ combinacion, profesores }) {
  // Unimos todos los bloques de todos los profesores para saber qué días y horas mostrar
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horasDisponibles = [
    "08:10", "09:30", "09:40", "11:00", "11:10", "12:30",
    "12:40", "14:00", "14:10", "15:30", "15:40", "17:00",
    "17:10", "18:30", "18:40", "20:00"
  ];

  // Creamos un mapa: [profesorId][dia][hora] = { asignatura, ... }
  const bloquesPorProfesor = {};
  combinacion.forEach((prof) => {
    bloquesPorProfesor[prof.profesorId] = {};
    diasSemana.forEach((dia) => {
      bloquesPorProfesor[prof.profesorId][dia] = {};
    });
    // Recorre asignaturas y sus bloquesAsignados
    prof.asignaturas.forEach((asig) => {
      asig.bloquesAsignados.forEach((bloque) => {
        bloquesPorProfesor[prof.profesorId][bloque.dia][bloque.horaInicio] = {
          ...bloque,
          asignatura: asig.codigo
        };
      });
    });
  });

  return (
    <div className="overflow-x-auto mb-8">
      {combinacion.map((prof) => (
        <div key={prof.profesorId} className="mb-8">
          <h4 className="font-semibold text-blue-700 mb-2">
            {
              (profesores.find(p => p._id === prof.profesorId)?.nombreCompleto ||
                profesores.find(p => p._id === prof.profesorId)?.nombres + ' ' + profesores.find(p => p._id === prof.profesorId)?.apellidos ||
                prof.profesorId)
            }
          </h4>
          <table className="w-full border-collapse text-xs mb-4">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 px-2 py-1 text-blue-900 font-semibold text-xs">Hora</th>
                {diasSemana.map((dia) => (
                  <th key={dia} className="border border-blue-200 px-2 py-1 text-blue-900 font-semibold text-xs">
                    {dia.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horasDisponibles.map((hora) => (
                <tr key={hora}>
                  <td className="border border-blue-200 px-2 py-1 text-blue-900 font-medium text-xs bg-blue-50">
                    {hora}
                  </td>
                  {diasSemana.map((dia) => {
                    const bloque = bloquesPorProfesor[prof.profesorId][dia][hora];
                    return (
                      <td key={dia + hora} className="border border-blue-200 p-1 min-w-[120px]">
                        {bloque ? (
                          <div className="bg-green-100 rounded p-1 text-xs text-blue-900">
                            <div className="font-bold">
                              {
                                // Buscar el nombre en las asignaturasImpartidas del profesor
                                profesores.find(p => p._id === prof.profesorId)
                                  ?.asignaturasImpartidas?.find(a => a.codigo === bloque.asignatura)?.nombre
                                || bloque.asignatura
                              }
                            </div>
                            <div className="text-blue-700">{bloque.tipo}</div>
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded h-6" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ModalHorasSemanales({ profesor, asignaturas, onGuardar, onCerrar, loading }) {
  const [horas, setHoras] = useState(asignaturas);

  useEffect(() => {
    setHoras(asignaturas);
  }, [asignaturas]);

  const handleHorasChange = (index, value) => {
    setHoras(prev =>
      prev.map((asig, i) =>
        i === index ? { ...asig, horasSemanales: Number(value) } : asig
      )
    );
  };

  const handleGuardar = () => {
    onGuardar(horas);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">Definir Horas Semanales</h3>
          <p className="text-blue-100 text-sm mt-1">
            Profesor: <span className="font-bold">{profesor?.nombreCompleto || `${profesor?.nombres} ${profesor?.apellidos}`}</span>
          </p>
        </div>
        <div className="p-6">
          {horas.length === 0 ? (
            <div className="text-center text-gray-500">No tiene asignaturas asignadas</div>
          ) : (
            <div className="space-y-4">
              {horas.map((asig, idx) => (
                <div key={asig.codigo} className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">{asig.nombre || asig.codigo}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={asig.horasSemanales}
                    onChange={e => handleHorasChange(idx, e.target.value)}
                    className="border border-blue-300 rounded px-2 py-1 w-24"
                    disabled={loading}
                  />
                  <span className="text-xs text-gray-500 ml-2">horas/sem</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onCerrar}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}