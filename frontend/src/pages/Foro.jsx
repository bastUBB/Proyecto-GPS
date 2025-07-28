import { useState, useEffect, useContext } from "react";
import PagGeneral from "../components/PagGeneral";
import EvaluacionStats from "../components/EvaluacionStats";
import { useEvaluaciones } from "../hooks/useEvaluaciones";
import { useAdminEvaluaciones } from "../hooks/useAdminEvaluaciones";
import { UserContext } from '../../context/userContext';
import { Star, User, BookOpen, Calendar, MessageSquare, Bell, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Search } from 'lucide-react';
import Alert from "../components/Alert";
import axios from 'axios';
import HelpTooltip from "../components/PuntoAyuda";


export default function Foro() {
  const { user } = useContext(UserContext);
  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ isVisible: false, type: '', title: '', message: '' });
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [confirmAction, setConfirmAction] = useState({ isVisible: false, type: '', evaluacionId: null, message: '' });

  // Funciones helper para alertas
  const showAlert = (type, title, message) => {
    setAlert({ isVisible: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert({ isVisible: false, type: '', title: '', message: '' });
  };

  // Funciones helper para confirmaciones
  const showConfirmAction = (type, evaluacionId, message) => {
    setConfirmAction({ isVisible: true, type, evaluacionId, message });
  };

  const hideConfirmAction = () => {
    setConfirmAction({ isVisible: false, type: '', evaluacionId: null, message: '' });
  };
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [filtroAsignatura, setFiltroAsignatura] = useState('');

  const {
    evaluaciones,
    nuevasEvaluaciones,
    loading: loadingEvaluaciones,
    error: errorEvaluaciones,
    marcarComoLeidas
  } = useEvaluaciones(user?.role, getAuthToken());

  const {
    evaluaciones: evaluacionesAdmin,
    loading: loadingAdmin,
    error: errorAdmin,
    deleteEvaluacion,
    reloadEvaluaciones,
    updateEvaluacionLocal
  } = useAdminEvaluaciones(user?.role, getAuthToken());

  const [formData, setFormData] = useState({
    docente: '',
    asignatura: '',
    texto: '',
    calificacion: 5,
    visibilidad: 'Anónima'
  });

  function getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'alumno') {
        loadAsignaturas(); // Solo cargar asignaturas inicialmente
        // Los docentes se cargarán cuando se seleccione una asignatura
      }
    }
  }, [user]);

  // Efecto para cargar docentes cuando cambie la asignatura seleccionada
  useEffect(() => {
    if (formData.asignatura && user?.role === 'alumno') {
      loadDocentes(formData.asignatura);
      // Limpiar docente seleccionado cuando cambie la asignatura
      setFormData(prev => ({ ...prev, docente: '' }));
    }
  }, [formData.asignatura, user?.role]);

  useEffect(() => {
    if (user?.role === 'profesor' && errorEvaluaciones) {
      showAlert('error', 'Error de Carga', errorEvaluaciones);
    }
    if ((user?.role === 'admin' || user?.role === 'director') && errorAdmin) {
      showAlert('error', 'Error de Carga', errorAdmin);
    }
  }, [errorEvaluaciones, errorAdmin, user?.role]);

  // Función para cargar asignaturas cursadas desde mallaUser
  const loadAsignaturas = async () => {
    try {
      if (!user?.rut) {
        console.log('No se encontró RUT del usuario');
        return;
      }

      const response = await axios.get(`/api/mallaUser/detail?rutUser=${user.rut}`, {
        headers: getAuthHeaders()
      });

      // console.log('Respuesta de mallaUser:', response.data.data);

      // console.log('Datos de asignaturasCursadas:', response.data.data.asignaturasCursadas);

      // console.log('Datos de Success:', response.data.data.success);

      if (response.data.data) {
        // Extraer solo las asignaturas cursadas
        const asignaturasCursadas = response.data.data.asignaturasCursadas || [];

        // console.log('Asignaturas cursadas:', asignaturasCursadas);

        // Convertir strings a objetos con formato esperado
        const asignaturasFormateadas = asignaturasCursadas.map((nombre, index) => ({
          _id: `cursada_${index}`,
          nombre: nombre
        }));

        // console.log('Asignaturas formateadas:', asignaturasFormateadas);

        // Eliminar las asignaturas de nombre formacion y electivo
        const asignaturasFiltradas = asignaturasFormateadas.filter(
          asig =>
            !asig.nombre.toLowerCase().includes('formación') &&
            !asig.nombre.toLowerCase().includes('electivo')
        );
        setAsignaturas(asignaturasFiltradas);

        // setAsignaturas(asignaturasFormateadas);
      } else {
        showAlert('warning', 'Sin datos', 'No se encontraron asignaturas cursadas para este usuario');
        setAsignaturas([]);
      }
    } catch (error) {
      console.error('Error al cargar asignaturas desde mallaUser:', error);
      showAlert('error', 'Error de Carga', error.response?.data?.message || 'Error al cargar asignaturas cursadas');
      setAsignaturas([]);
    }
  };

  // Función para cargar docentes filtrados por asignatura seleccionada
  const loadDocentes = async (asignaturaSeleccionada = null) => {
    try {
      if (!asignaturaSeleccionada) {
        setDocentes([]);
        return;
      }

      const response = await axios.get('/api/asignaturasDocente', {
        headers: getAuthHeaders()
      });

      // console.log('Respuesta de asignaturasDocente:', response.data.data[0]);

      if (response.data.data) {
        // Filtrar docentes que enseñan la asignatura seleccionada
        // console.log('Datos de asignaturasDocente:', response.data.data.length);
        const docentesFiltrados = response.data.data
          .filter(asigDoc =>
            asigDoc.asignaturas &&
            asigDoc.asignaturas.some(asig =>
              asig.toLowerCase() === asignaturaSeleccionada.toLowerCase()
            )
          )
          .map(asigDoc => ({
            _id: asigDoc._id,
            nombreCompleto: asigDoc.docente,
            role: 'profesor'
          }));

        // console.log('Docentes filtrados:', docentesFiltrados);

        // Validar que no se repitan los profesores (mantener formato de objeto)
        const nombresUnicos = new Set();
        const docentesUnicos = docentesFiltrados.filter(docente => {
          if (nombresUnicos.has(docente.nombreCompleto)) {
            return false;
          }
          nombresUnicos.add(docente.nombreCompleto);
          return true;
        });

        // console.log('Docentes únicos:', docentesUnicos);

        setDocentes(docentesUnicos);

        if (docentesUnicos.length === 0) {
          showAlert('info', 'Sin profesores', 'No se encontraron profesores para esta asignatura');
        }
      } else {
        setDocentes([]);
      }
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      showAlert('error', 'Error de Carga', error.response?.data?.message || 'Error al cargar docentes');
      setDocentes([]);
    }
  };

  const handleSubmitEvaluacion = async (e) => {
    e.preventDefault();
    if (!formData.docente || !formData.asignatura || !formData.texto) {
      showAlert('warning', 'Campos obligatorios', 'Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post('/api/evaluacionDocente', formData, {
        headers: getAuthHeaders()
      });

      showAlert('success', 'Evaluación Enviada', 'La evaluación ha sido enviada exitosamente');
      setFormData({
        docente: '',
        asignatura: '',
        texto: '',
        calificacion: 5,
        visibilidad: 'Anónima'
      });
    } catch (error) {
      showAlert('error', 'Error al crear evaluación', error.response?.data?.message || 'Error al crear evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobarEvaluacion = async (evaluacionId) => {
    try {
      setLoading(true);

      updateEvaluacionLocal(evaluacionId, { estado: 'aprobada' });

      const response = await axios.patch(`/api/evaluacionDocente/detail?_id=${evaluacionId}`,
        { estado: 'aprobada' },
        { headers: getAuthHeaders() }
      );

      if (response.data.success || response.status === 200) {
        showAlert('success', 'Evaluación Aprobada', 'La evaluación ha sido aprobada correctamente');
        setTimeout(() => reloadEvaluaciones(), 1000);
      } else {
        await reloadEvaluaciones();
        showAlert('error', 'Error al aprobar', response.data.message || 'Error al aprobar evaluación');
      }
    } catch (error) {
      await reloadEvaluaciones();
      showAlert('error', 'Error al aprobar', error.response?.data?.message || 'Error al aprobar evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazarEvaluacion = async (evaluacionId) => {
    try {
      setLoading(true);

      updateEvaluacionLocal(evaluacionId, { estado: 'rechazada' });

      const response = await axios.patch(`/api/evaluacionDocente/detail?_id=${evaluacionId}`,
        { estado: 'rechazada' },
        { headers: getAuthHeaders() }
      );

      if (response.data.success || response.status === 200) {
        showAlert('success', 'Evaluación Rechazada', 'La evaluación ha sido rechazada correctamente');
        setTimeout(() => reloadEvaluaciones(), 1000);
      } else {
        await reloadEvaluaciones();
        showAlert('error', 'Error al rechazar', response.data.message || 'Error al rechazar evaluación');
      }
    } catch (error) {
      await reloadEvaluaciones();
      showAlert('error', 'Error al rechazar', error.response?.data?.message || 'Error al rechazar evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluacion = async (evaluacionId) => {
    try {
      setLoading(true);

      const result = await deleteEvaluacion(evaluacionId);

      if (result.success) {
        showAlert('success', 'Evaluación Eliminada', result.message);
      } else {
        showAlert('error', 'Error al eliminar', result.message);
      }
    } catch (error) {
      showAlert('error', 'Error al eliminar', 'Error inesperado al eliminar evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para mostrar confirmaciones
  const handleConfirmRechazar = (evaluacionId) => {
    showConfirmAction('rechazar', evaluacionId, '¿Estás seguro de que deseas rechazar esta evaluación? Esta acción no se puede deshacer.');
  };

  const handleConfirmEliminar = (evaluacionId) => {
    showConfirmAction('eliminar', evaluacionId, '¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.');
  };

  // Función para ejecutar la acción confirmada
  const executeConfirmedAction = () => {
    if (confirmAction.type === 'rechazar') {
      handleRechazarEvaluacion(confirmAction.evaluacionId);
    } else if (confirmAction.type === 'eliminar') {
      handleDeleteEvaluacion(confirmAction.evaluacionId);
    }
    hideConfirmAction();
  };

  const getEvaluacionesFiltradas = () => {
    let evaluacionesFiltradas = evaluacionesAdmin;

    if (filtroEstado !== 'todos') {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(evaluacion => evaluacion.estado === filtroEstado);
    }

    if (filtroProfesor) {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(evaluacion =>
        evaluacion.docente.toLowerCase().includes(filtroProfesor.toLowerCase())
      );
    }

    if (filtroAsignatura) {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(evaluacion =>
        evaluacion.asignatura.toLowerCase().includes(filtroAsignatura.toLowerCase())
      );
    }

    return evaluacionesFiltradas;
  };

  const getProfesoresUnicos = () => {
    const profesores = [...new Set(evaluacionesAdmin.map(evaluacion => evaluacion.docente))];
    return profesores.sort();
  };

  const getAsignaturasUnicas = () => {
    const asignaturas = [...new Set(evaluacionesAdmin.map(evaluacion => evaluacion.asignatura))];
    return asignaturas.sort();
  };

  const getTituloFiltros = () => {
    const filtros = [];
    const resultados = getEvaluacionesFiltradas();

    if (filtroEstado !== 'todos') {
      filtros.push(`Estado: ${filtroEstado}`);
    }
    if (filtroProfesor) {
      filtros.push(`Profesor: ${filtroProfesor}`);
    }
    if (filtroAsignatura) {
      filtros.push(`Asignatura: ${filtroAsignatura}`);
    }

    const baseTitulo = filtros.length > 0 ? 'Evaluaciones Filtradas' : 'Todas las Evaluaciones';
    const filtrosTexto = filtros.length > 0 ? ` (${filtros.join(', ')})` : '';

    return `${baseTitulo}${filtrosTexto} - ${resultados.length} resultado${resultados.length !== 1 ? 's' : ''}`;
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'aprobada':
        return 'text-green-600 bg-green-100';
      case 'rechazada':
        return 'text-red-600 bg-red-100';
      case 'pendiente':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'aprobada':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4" />;
      case 'pendiente':
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 7; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (!user) {
    return (
      <PagGeneral>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
                Evaluación Docente
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

  return (
    <PagGeneral>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
              {user.role === 'alumno'
                ? 'Evaluar Docentes'
                : user.role === 'profesor'
                  ? 'Mis Evaluaciones Recibidas'
                  : 'Gestión de Evaluaciones Docentes'
              }
            </h1>
            <p className="text-sm sm:text-base text-blue-700">
              {user.role === 'alumno'
                ? 'Evalúa a tus docentes y ayuda a mejorar la calidad educativa'
                : user.role === 'profesor'
                  ? 'Revisa las evaluaciones que has recibido de tus estudiantes'
                  : 'Administra las evaluaciones docentes del sistema'
              }
            </p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div></div>
            {user.role === 'profesor' && nuevasEvaluaciones > 0 && (
              <div className="ml-4 flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                <Bell className="w-4 h-4" />
                <span>{nuevasEvaluaciones} nueva{nuevasEvaluaciones > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )} */}

          {/* {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )} */}

          {user.role === 'alumno' && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Crear Nueva Evaluación
                  <HelpTooltip>
                    <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                    <p className="text-gray-600 text-xs">
                      Aquí puedes crear una nueva evaluación para un docente, seleccionando la asignatura y proporcionando una calificación y comentarios. Ademas, puedes elegir si la evaluación será anónima o pública a la vista del profesor.
                    </p>
                  </HelpTooltip>
                </h2>
              </div>

              {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Proceso de Evaluación</h3>
                </div>
                <p className="text-blue-700 text-sm">
                  Las evaluaciones se envían directamente y serán visibles para los profesores.
                </p>
              </div> */}

              <form onSubmit={handleSubmitEvaluacion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Asignatura
                    </label>
                    <select
                      value={formData.asignatura}
                      onChange={(e) => setFormData({ ...formData, asignatura: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">
                        {asignaturas.length === 0
                          ? "Cargando asignaturas cursadas..."
                          : "Seleccionar asignatura cursada..."
                        }
                      </option>
                      {asignaturas.map((asignatura) => (
                        <option key={asignatura._id} value={asignatura.nombre}>
                          {asignatura.nombre}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Solo se muestran las asignaturas que has cursado
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Docente
                    </label>
                    <select
                      value={formData.docente}
                      onChange={(e) => setFormData({ ...formData, docente: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!formData.asignatura}
                    >
                      <option value="">
                        {!formData.asignatura
                          ? "Primero selecciona una asignatura..."
                          : docentes.length === 0
                            ? "No hay docentes disponibles para esta asignatura"
                            : "Seleccionar docente..."
                        }
                      </option>
                      {docentes.map((docente) => (
                        <option key={docente._id} value={docente.nombreCompleto}>
                          {docente.nombreCompleto}
                        </option>
                      ))}
                    </select>
                    {!formData.asignatura && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selecciona primero una asignatura para ver los docentes disponibles
                      </p>
                    )}
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calificación (1-7)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={formData.calificacion}
                      onChange={(e) => setFormData({ ...formData, calificacion: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-blue-600">{formData.calificacion}/7</span>
                      <div className="flex">
                        {renderStars(formData.calificacion)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios
                  </label>
                  <textarea
                    value={formData.texto}
                    onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Comparte tu experiencia con este docente..."
                    minLength="10"
                    maxLength="500"
                    required
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.texto.length}/500 caracteres (mínimo 10)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibilidad
                  </label>
                  <select
                    value={formData.visibilidad}
                    onChange={(e) => setFormData({ ...formData, visibilidad: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Anónima">Anónima (recomendado)</option>
                    <option value="Pública">Pública</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Evaluación'}
                </button>
              </form>
            </div>
          )}

          {user.role === 'profesor' && (
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6 hide-in-pdf">
              <div className="space-y-4" onClick={() => nuevasEvaluaciones > 0 && marcarComoLeidas()}>
                {/* <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Evaluaciones Recibidas</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Aquí se muestran todas las evaluaciones que has recibido de tus estudiantes.
                </p>
              </div> */}

                {evaluaciones.length > 0 && <EvaluacionStats evaluaciones={evaluaciones} />}

                {loadingEvaluaciones ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Cargando evaluaciones...</p>
                  </div>
                ) : evaluaciones.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aún no tienes evaluaciones.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Las evaluaciones aparecerán aquí cuando los estudiantes las envíen.
                    </p>
                  </div>
                ) : (
                  evaluaciones.map((evaluacion) => (
                    <div
                      key={evaluacion._id}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-lg">{evaluacion.asignatura}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">
                              {evaluacion.visibilidad === 'Anónima' ? 'Alumno Anónimo' : evaluacion.alumno}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(evaluacion.calificacion)}
                            <span className="ml-2 font-semibold text-lg">{evaluacion.calificacion}/7</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(evaluacion.fecha).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-gray-800 leading-relaxed">{evaluacion.texto}</p>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 uppercase tracking-wide">
                        {evaluacion.visibilidad}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(user.role === 'admin' || user.role === 'director') && (
            <div className="space-y-4">
              {/* Estadísticas de evaluaciones */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Estadísticas de Evaluaciones
                  </h2>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-800 text-sm">Pendientes</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {evaluacionesAdmin.filter(e => e.estado === 'pendiente').length}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-800 text-sm">Aprobadas</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {evaluacionesAdmin.filter(e => e.estado === 'aprobada').length}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-800 text-sm">Rechazadas</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {evaluacionesAdmin.filter(e => e.estado === 'rechazada').length}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-800 text-sm">Total</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {evaluacionesAdmin.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-lg mb-4 text-center">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Filtros de Búsqueda
                    <HelpTooltip>
                      <h3 className="text-blue-700 font-bold text-sm mb-1">¿Que puedes hacer aquí?</h3>
                      <p className="text-gray-600 text-xs">
                        Puedes filtrar las evaluaciones por estado, profesor y asignatura para encontrar rápidamente lo que necesitas.
                      </p>
                    </HelpTooltip>
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Estado de la Evaluación:
                      </label>
                      <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="todos">
                          Todas las evaluaciones ({evaluacionesAdmin.length})
                        </option>
                        <option value="pendiente">
                          Pendientes ({evaluacionesAdmin.filter(e => e.estado === 'pendiente').length})
                        </option>
                        <option value="aprobada">
                          Aprobadas ({evaluacionesAdmin.filter(e => e.estado === 'aprobada').length})
                        </option>
                        <option value="rechazada">
                          Rechazadas ({evaluacionesAdmin.filter(e => e.estado === 'rechazada').length})
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Filtrar por Profesor:
                      </label>
                      <select
                        value={filtroProfesor}
                        onChange={(e) => setFiltroProfesor(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Todos los profesores</option>
                        {getProfesoresUnicos().map((profesor) => (
                          <option key={profesor} value={profesor}>
                            {profesor}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        Filtrar por Asignatura:
                      </label>
                      <select
                        value={filtroAsignatura}
                        onChange={(e) => setFiltroAsignatura(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Todas las asignaturas</option>
                        {getAsignaturasUnicas().map((asignatura) => (
                          <option key={asignatura} value={asignatura}>
                            {asignatura}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {(filtroProfesor || filtroAsignatura || filtroEstado !== 'todos') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setFiltroProfesor('');
                        setFiltroAsignatura('');
                        setFiltroEstado('todos');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </div>

              {loadingAdmin ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando evaluaciones...</p>
                </div>
              ) : evaluacionesAdmin.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No hay evaluaciones en el sistema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    {/* <div> */}


                    <h3 className="text-lg font-semibold text-gray-800">
                      {getTituloFiltros()}
                    </h3>
                    <button
                      onClick={reloadEvaluaciones}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Actualizar
                    </button>
                  </div>

                  {getEvaluacionesFiltradas().length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay evaluaciones en el sistema.</p>
                    </div>
                  ) : (
                    getEvaluacionesFiltradas().map((evaluacion) => (
                      <div
                        key={evaluacion._id}
                        className={`bg-white p-6 rounded-lg shadow-md border-2 relative ${evaluacion.estado === 'pendiente' ? 'border-yellow-200' :
                          evaluacion.estado === 'aprobada' ? 'border-green-200' :
                            'border-red-200'
                          }`}
                      >
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluacion.estado)}`}>
                            {getStatusIcon(evaluacion.estado)}
                            <span className="capitalize">{evaluacion.estado}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-start mb-4 pr-32">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-lg">{evaluacion.asignatura}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">
                                Profesor: <strong>{evaluacion.docente}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="text-gray-700">
                                {evaluacion.visibilidad === 'Anónima' ? 'Alumno Anónimo' : `Alumno: ${evaluacion.alumno}`}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 mb-1">
                              {renderStars(evaluacion.calificacion)}
                              <span className="ml-2 font-semibold text-lg">{evaluacion.calificacion}/7</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(evaluacion.fecha).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4 mb-4">
                          <p className="text-gray-800 leading-relaxed">{evaluacion.texto}</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {evaluacion.visibilidad}
                          </div>

                          <div className="flex gap-2">
                            {evaluacion.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => handleAprobarEvaluacion(evaluacion._id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                  disabled={loading}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleConfirmRechazar(evaluacion._id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                  disabled={loading}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Rechazar
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleConfirmEliminar(evaluacion._id)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-400">
                          ID: {evaluacion._id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user.role !== 'alumno' && user.role !== 'profesor' && user.role !== 'admin' && user.role !== 'director' && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Esta página está disponible solo para alumnos, profesores, administradores y directores.</p>
            </div>
          )}
        </div>
      </div>

      {/* Componente de Alerta */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        autoCloseTime={3000}
      />

      {/* Componente de Confirmación */}
      <Alert
        type="confirm"
        title="Confirmar Acción"
        message={confirmAction.message}
        isVisible={confirmAction.isVisible}
        onClose={hideConfirmAction}
        onConfirm={executeConfirmedAction}
        acceptButtonText={confirmAction.type === 'rechazar' ? 'Rechazar' : 'Eliminar'}
        cancelButtonText="Cancelar"
      />
    </PagGeneral>
  );
}