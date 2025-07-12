import { useState, useEffect } from 'react';

export const useAdminEvaluaciones = (userRole, token) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para realizar peticiones autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Cargar todas las evaluaciones para administradores
  const loadAllEvaluaciones = async () => {
    if (userRole !== 'admin' || !token) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await authenticatedFetch('http://localhost:5500/api/evaluacionDocente/admin/todas');
      const data = await response.json();
      
      if (response.ok) {
        setEvaluaciones(data.data || []);
      } else {
        setError(data.message || 'Error al cargar evaluaciones');
      }
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      setError('Error de conexión al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar evaluación
  const deleteEvaluacion = async (evaluacionId) => {
    try {
      const response = await authenticatedFetch(`http://localhost:5500/api/evaluacionDocente/admin/${evaluacionId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Actualizar la lista local removiendo la evaluación eliminada
        setEvaluaciones(prev => prev.filter(evaluacion => evaluacion._id !== evaluacionId));
        return { success: true, message: 'Evaluación eliminada exitosamente' };
      } else {
        return { success: false, message: data.message || 'Error al eliminar evaluación' };
      }
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      return { success: false, message: 'Error de conexión al eliminar evaluación' };
    }
  };

  // Cargar evaluaciones cuando el componente se monta o cambia el rol/token
  useEffect(() => {
    loadAllEvaluaciones();
  }, [userRole, token]);

  return {
    evaluaciones,
    loading,
    error,
    deleteEvaluacion,
    reloadEvaluaciones: loadAllEvaluaciones
  };
};
