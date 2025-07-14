import { useState, useEffect, useContext } from "react";
import PagGeneral from "../components/PagGeneral";
import EvaluacionStats from "../components/EvaluacionStats";
import { useEvaluaciones } from "../hooks/useEvaluaciones";
import { useAdminEvaluaciones } from "../hooks/useAdminEvaluaciones";
import { UserContext } from '../../context/userContext';
import { Star, User, BookOpen, Calendar, MessageSquare, Bell, Trash2, Shield } from 'lucide-react';
import axios from 'axios';

export default function Foro() {
  const { user } = useContext(UserContext);
  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      // Para profesores, el hook useEvaluaciones se encarga de cargar las evaluaciones
    }
  }, [user]);

  // Usar errores del hook si es profesor o admin
  useEffect(() => {
    if (user?.role === 'profesor' && errorEvaluaciones) {
      setError(errorEvaluaciones);
    }
    if (user?.role === 'admin' && errorAdmin) {
      setError(errorAdmin);
    }
  }, [errorEvaluaciones, errorAdmin, user?.role]);

  // Cargar lista de docentes (solo para alumnos)
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
      
      setSuccess('Evaluación creada exitosamente');
      setFormData({
        docente: '',
        asignatura: '',
        texto: '',
        calificacion: 5,
        visibilidad: 'Anónima'
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('💥 Error:', error);
      setError(error.response?.data?.message || 'Error al crear evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de evaluaciones (solo administradores)
  const handleDeleteEvaluacion = async (evaluacionId) => {
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
        <div className="min-h-screen pt-4">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4 text-blue-600">
              Evaluación Docente
            </h1>
            <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
          </div>
        </div>
      </PagGeneral>
    );
  }

  return (
    <PagGeneral>
      <div className="min-h-screen pt-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              {user.role === 'alumno' 
                ? 'Evaluar Docentes' 
                : user.role === 'profesor' 
                ? 'Mis Evaluaciones Recibidas'
                : 'Gestión de Evaluaciones Docentes'
              }
            </h1>
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
              
              <form onSubmit={handleSubmitEvaluacion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Docente
                    </label>
                    <select
                      value={formData.docente}
                      onChange={(e) => setFormData({...formData, docente: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, asignatura: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, calificacion: parseInt(e.target.value)})}
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
                    onChange={(e) => setFormData({...formData, texto: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, visibilidad: e.target.value})}
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

          {/* Lista de evaluaciones para profesores */}
          {user.role === 'profesor' && (
            <div className="space-y-4" onClick={() => nuevasEvaluaciones > 0 && marcarComoLeidas()}>
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
                  <p className="text-gray-500 text-lg">Aún no tienes evaluaciones recibidas.</p>
                </div>
              ) : (
                evaluaciones.map((evaluacion) => (
                  <div
                    key={evaluacion._id}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
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
          )}

          {/* Panel de administración para administradores */}
          {user.role === 'admin' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-blue-800">Panel de Administración</h2>
                </div>
                <p className="text-blue-700 text-sm">
                  Como administrador, puedes revisar todas las evaluaciones del sistema y eliminar aquellas que consideres inapropiadas.
                </p>
              </div>

              {/* Estadísticas generales */}
              {evaluacionesAdmin.length > 0 && <EvaluacionStats evaluaciones={evaluacionesAdmin} />}
              
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
                      Todas las Evaluaciones ({evaluacionesAdmin.length})
                    </h3>
                    <button
                      onClick={reloadEvaluaciones}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Actualizar
                    </button>
                  </div>
                  
                  {evaluacionesAdmin.map((evaluacion) => (
                    <div
                      key={evaluacion._id}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative"
                    >
                      {/* Botón de eliminar */}
                      <button
                        onClick={() => handleDeleteEvaluacion(evaluacion._id)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar evaluación"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex justify-between items-start mb-4 pr-12">
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
                      
                      <div className="border-t pt-4">
                        <p className="text-gray-800 leading-relaxed">{evaluacion.texto}</p>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {evaluacion.visibilidad}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {evaluacion._id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
