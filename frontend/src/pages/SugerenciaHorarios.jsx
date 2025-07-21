import React, { useState, useEffect, useContext } from "react";
import PagGeneral from "../components/PagGeneral";
import { UserContext } from "../../context/userContext";
import axios from 'axios';
import HelpTooltip from "../components/PuntoAyuda";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const horasDisponibles = [
  "08:10", "09:30", "09:40", "11:00", "11:10", "12:30",
  "12:40", "14:00", "14:10", "15:30", "15:40", "17:00",
  "17:10", "18:30", "18:40", "20:00"
];

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
      const response = await axios.get(
        'http://localhost:5500/api/users/filter?role=profesor',
        getAuthConfig()
      );

      if (response.data && response.data.data) {
        setProfesores(response.data.data);
        console.log('Profesores cargados:', response.data.data);
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

  // Cargar disponibilidad de un profesor específico (para administradores)
  const cargarDisponibilidadProfesorAdmin = async (profesorId) => {
    try {
      setLoading(true);
      setMensaje('');

      const response = await axios.get(
        `http://localhost:5500/api/disponibilidad?profesorId=${profesorId}`,
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
        console.log('Disponibilidad del profesor cargada:', disponibilidadFormateada);
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

      const response = await axios.get(
        'http://localhost:5500/api/disponibilidad',
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
        console.log('Mi disponibilidad cargada:', disponibilidadFormateada);
      } else {
        setDisponibilidad({});
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      if (error.response?.status === 404) {
        // No hay disponibilidad guardada, inicializar vacía
        setDisponibilidad({});
        console.log('No hay disponibilidad guardada, iniciando con tabla vacía');
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

      console.log('Datos a enviar:', { bloques });
      console.log('Usuario:', user);
      console.log('ID del usuario:', user?.id || user?._id);

      const response = await axios.post(
        'http://localhost:5500/api/disponibilidad',
        { bloques },
        getAuthConfig()
      );

      if (response.data) {
        setMensaje('Disponibilidad guardada exitosamente');
        console.log('Disponibilidad guardada:', response.data);
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

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'director') {
      cargarProfesores();
    } else if (user?.role === 'profesor') {
      cargarDisponibilidadProfesor();
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

  const aplicarSugerencia = (sugerencia) => {
    // Guardar la sugerencia seleccionada en localStorage
    localStorage.setItem("horarioSeleccionado", JSON.stringify(sugerencia.horarios));
    alert(`Horario "${sugerencia.nombre}" aplicado correctamente`);
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de profesores */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-t-lg">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Lista de Profesores ({profesores.length})
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">
                    Selecciona un profesor para ver su disponibilidad
                  </p>
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
                            <div className="text-blue-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Disponibilidad del profesor seleccionado */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 sm:p-4 rounded-t-lg">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Disponibilidad Horaria
                  </h2>
                  {profesorSeleccionado && (
                    <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                      {profesorSeleccionado.nombreCompleto || `${profesorSeleccionado.nombres} ${profesorSeleccionado.apellidos}`}
                    </p>
                  )}
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
          </div>
        </div>
      </PagGeneral>
    );
  }

  // Vista para profesores - Solo disponibilidad horaria
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
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 sm:p-4">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <img src="/IconHorario.png" alt="Icono Horario" className="w-5 h-5" />
                  Mi Disponibilidad Horaria
                </h2>
                <p className="text-cyan-100 text-xs sm:text-sm mt-1">
                  Marca los horarios en los que puedes dictar clases (verde = disponible)
                </p>
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

            {/* Información de ayuda para profesores */}
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Instrucciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-1">1. Seleccionar Horarios</p>
                  <p className="text-blue-700">
                    Haz clic en las casillas para marcar tu disponibilidad
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-1">2. Guardar Cambios</p>
                  <p className="text-blue-700">
                    Presiona "Guardar Disponibilidad" para confirmar los cambios
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-1">3. Disponibilidad</p>
                  <p className="text-blue-700">
                    Verde = Disponible, Gris = No disponible
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-1">4. Actualizaciones</p>
                  <p className="text-blue-700">
                    Puedes modificar tu disponibilidad en cualquier momento
                  </p>
                </div>
              </div>
            </div>
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
