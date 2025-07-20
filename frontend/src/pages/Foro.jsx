import { useState, useEffect, useContext } from "react";
import PagGeneral from "../components/PagGeneral";
import EvaluacionStats from "../components/EvaluacionStats";
import { useEvaluaciones } from "../hooks/useEvaluaciones";
import { useAdminEvaluaciones } from "../hooks/useAdminEvaluaciones";
import { UserContext } from '../../context/userContext';
import { Star, User, BookOpen, Calendar, MessageSquare, Bell, Trash2, Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';


export default function Foro() {
  const { user } = useContext(UserContext);
  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // nuevo estado para filtros
  const [filtroProfesor, setFiltroProfesor] = useState(''); // filtro por profesor
  const [filtroAsignatura, setFiltroAsignatura] = useState(''); // filtro por asignatura

  // Hook personalizado para evaluaciones (solo profesores)
  const {
    evaluaciones,
    nuevasEvaluaciones,
    loading: loadingEvaluaciones,
    error: errorEvaluaciones,
    marcarComoLeidas
  } = useEvaluaciones(user?.role, getAuthToken());

  // Hook personalizado para administradores
  const {
    evaluaciones: evaluacionesAdmin,
    loading: loadingAdmin,
    error: errorAdmin,
    deleteEvaluacion,
    reloadEvaluaciones
  } = useAdminEvaluaciones(user?.role, getAuthToken());

  // Estados para el formulario de evaluación (solo alumnos)
  const [formData, setFormData] = useState({
    docente: '',
    asignatura: '',
    texto: '',
    calificacion: 5,
    visibilidad: 'Anónima'
  });

  // Función para obtener el token del usuario
  function getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  // Configurar headers de autenticación para axios
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      if (user.role === 'alumno') {
        loadDocentes();
        loadAsignaturas();
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'profesor' && errorEvaluaciones) {
      setError(errorEvaluaciones);
    }
    if (user?.role === 'admin' && errorAdmin) {
      setError(errorAdmin);
    }
  }, [errorEvaluaciones, errorAdmin, user?.role]);

  const loadDocentes = async () => {
    try {
      const response = await axios.get('/api/evaluacionDocente/docentes', {
        headers: getAuthHeaders()
      });
      setDocentes(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      setError(error.response?.data?.message || 'Error al cargar docentes');
    }
  };

  // Cargar lista de asignaturas (solo para alumnos)
  const loadAsignaturas = async () => {
    try {
      const response = await axios.get('/api/evaluacionDocente/asignaturas', {
        headers: getAuthHeaders()
      });
      setAsignaturas(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
      setError(error.response?.data?.message || 'Error al cargar asignaturas');
    }
  };

  // Manejar envío del formulario de evaluación (solo alumnos)
  const handleSubmitEvaluacion = async (e) => {
    e.preventDefault();
    if (!formData.docente || !formData.asignatura || !formData.texto) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('📤 Enviando datos:', formData);
      console.log('🔑 Token:', getAuthToken());

      const response = await axios.post('/api/evaluacionDocente/alumno', formData, {
        headers: getAuthHeaders()
      });

      console.log('📥 Respuesta:', response.data);

      setSuccess('Evaluación enviada exitosamente. Será revisada por un administrador antes de ser publicada.');
      setFormData({
        docente: '',
        asignatura: '',
        texto: '',
        calificacion: 5,
        visibilidad: 'Anónima'
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('💥 Error:', error);
      setError(error.response?.data?.message || 'Error al crear evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Manejar aprobación de evaluaciones (solo administradores)
  const handleAprobarEvaluacion = async (evaluacionId) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.put(`/api/evaluacionDocente/aprobar/${evaluacionId}`, {}, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setSuccess('Evaluación aprobada correctamente');
        await reloadEvaluaciones();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Error al aprobar evaluación');
      }
    } catch (error) {
      console.error('Error al aprobar evaluación:', error);
      setError(error.response?.data?.message || 'Error al aprobar evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Manejar rechazo de evaluaciones (solo administradores)
  const handleRechazarEvaluacion = async (evaluacionId) => {
    if (!window.confirm('¿Estás seguro de que deseas rechazar esta evaluación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.put(`/api/evaluacionDocente/rechazar/${evaluacionId}`, {}, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setSuccess('Evaluación rechazada correctamente');
        await reloadEvaluaciones();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Error al rechazar evaluación');
      }
    } catch (error) {
      console.error('Error al rechazar evaluación:', error);
      setError(error.response?.data?.message || 'Error al rechazar evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de evaluaciones (solo administradores)
  const handleDeleteEvaluacion = async (evaluacionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await deleteEvaluacion(evaluacionId);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      setError('Error inesperado al eliminar evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener evaluaciones filtradas
  const getEvaluacionesFiltradas = () => {
    let evaluacionesFiltradas = evaluacionesAdmin;

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(evaluacion => evaluacion.estado === filtroEstado);
    }

    // Filtrar por profesor
    if (filtroProfesor) {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(evaluacion =>
        evaluacion.docente.toLowerCase().includes(filtroProfesor.toLowerCase())
      );
    }

    // Filtrar por asignatura
    if (filtroAsignatura) {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(evaluacion =>
        evaluacion.asignatura.toLowerCase().includes(filtroAsignatura.toLowerCase())
      );
    }

    return evaluacionesFiltradas;
  };

  // Función para obtener lista única de profesores
  const getProfesoresUnicos = () => {
    const profesores = [...new Set(evaluacionesAdmin.map(evaluacion => evaluacion.docente))];
    return profesores.sort();
  };

  // Función para obtener lista única de asignaturas
  const getAsignaturasUnicas = () => {
    const asignaturas = [...new Set(evaluacionesAdmin.map(evaluacion => evaluacion.asignatura))];
    return asignaturas.sort();
  };

  // Función para generar el título de los filtros aplicados
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

  // Función para obtener el color del estado
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

  // Función para obtener el icono del estado
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

  // Manejar eliminación de evaluaciones (solo administradores)
  const handleDeleteEvaluacionOld = async (evaluacionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta evaluación?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await deleteEvaluacion(evaluacionId);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      setError('Error inesperado al eliminar evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar estrellas para calificación
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

  // Si no hay usuario logueado
  if (!user) {
    return (
      <PagGeneral>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            {/* Encabezado */}
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
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Encabezado */}
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
            {/* Indicador de notificaciones para profesores */}
            {user.role === 'profesor' && nuevasEvaluaciones > 0 && (
              <div className="ml-4 flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                <Bell className="w-4 h-4" />
                <span>{nuevasEvaluaciones} nueva{nuevasEvaluaciones > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Formulario para alumnos */}
          {user.role === 'alumno' && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Crear Nueva Evaluación
              </h2>

              {/* Información del proceso */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Proceso de Evaluación</h3>
                </div>
                <p className="text-blue-700 text-sm">
                  Las evaluaciones son revisadas por un administrador antes de ser publicadas.
                  Solo las evaluaciones aprobadas serán visibles para los profesores.
                </p>
              </div>

              <form onSubmit={handleSubmitEvaluacion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    >
                      <option value="">Seleccionar docente...</option>
                      {docentes.map((docente) => (
                        <option key={docente._id} value={docente.nombreCompleto}>
                          {docente.nombreCompleto}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      <option value="">Seleccionar asignatura...</option>
                      {asignaturas.map((asignatura) => (
                        <option key={asignatura._id} value={asignatura.nombre}>
                          {asignatura.nombre}
                        </option>
                      ))}
                    </select>
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

          {/* Lista de evaluaciones para profesores (solo aprobadas) */}
          {user.role === 'profesor' && (
            <div className="space-y-4" onClick={() => nuevasEvaluaciones > 0 && marcarComoLeidas()}>
              {/* Información sobre el proceso */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Evaluaciones Aprobadas</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Solo se muestran las evaluaciones que han sido revisadas y aprobadas por un administrador.
                </p>
              </div>

              {/* Estadísticas de evaluaciones */}
              {evaluaciones.length > 0 && <EvaluacionStats evaluaciones={evaluaciones} />}

              {loadingEvaluaciones ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando evaluaciones...</p>
                </div>
              ) : evaluaciones.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aún no tienes evaluaciones aprobadas.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Las evaluaciones deben ser revisadas por un administrador antes de aparecer aquí.
                  </p>
                </div>
              ) : (
                evaluaciones.map((evaluacion) => (
                  <div
                    key={evaluacion._id}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative"
                  >
                    {/* Indicador de evaluación aprobada */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Aprobada</span>
                    </div>

                    <div className="flex justify-between items-start mb-4 pr-20">
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
          )}

          {/* Panel de administración para administradores */}
          {user.role === 'admin' && (
            <div className="space-y-4">
              {/* Contenedor blanco con el recuadro cian dentro */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-4">

                {/* Recuadro cian como encabezado delgado dentro del blanco */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-4 rounded-lg text-white font-semibold text-lg mb-6">
                  Resumen de Evaluaciones
                </div>

                {/* Cuadros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-800">Pendientes</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {evaluacionesAdmin.filter(e => e.estado === 'pendiente').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-800">Aprobadas</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {evaluacionesAdmin.filter(e => e.estado === 'aprobada').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-gray-800">Rechazadas</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {evaluacionesAdmin.filter(e => e.estado === 'rechazada').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Total</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {evaluacionesAdmin.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              {/* Contenedor blanco con el recuadro cian dentro */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-4">
                {/* Recuadro cian como encabezado delgado dentro del blanco */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-4 rounded-lg text-white font-semibold text-lg mb-6">
                  Filtros de busqueda
                </div>
                {/* Filtros por estado */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Filtro por Estado */}
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

                    {/* Filtro por Profesor */}
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

                    {/* Filtro por Asignatura */}
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
                {/* Eliminar la sección separada de filtros por profesor y asignatura */}

                {/* Botón para limpiar filtros */}
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
                        {/* Estado y acciones */}
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

                          {/* Botones de acción */}
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
                                  onClick={() => handleRechazarEvaluacion(evaluacion._id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                  disabled={loading}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Rechazar
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteEvaluacion(evaluacion._id)}
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
              </div>
            </div>
          )}

          {/* Mensaje para otros roles */}
          {user.role !== 'alumno' && user.role !== 'profesor' && user.role !== 'admin' && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Esta página está disponible solo para alumnos, profesores y administradores.</p>
            </div>
          )}
        </div>
      </div>
    </PagGeneral>
  );
}
