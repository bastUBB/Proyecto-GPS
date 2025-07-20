import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAdminEvaluaciones = (userRole, token) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAllEvaluaciones = async () => {
    if (userRole !== 'admin' || !token) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/evaluacionDocente', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setEvaluaciones(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      setError(error.response?.data?.message || 'Error de conexión al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvaluacion = async (evaluacionId) => {
    try {
      await axios.delete(`/api/evaluacionDocente/detail?_id=${evaluacionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setEvaluaciones(prev => prev.filter(evaluacion => evaluacion._id !== evaluacionId));
      return { success: true, message: 'Evaluación eliminada exitosamente' };
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión al eliminar evaluación' 
      };
    }
  };

  const updateEvaluacionLocal = (evaluacionId, newData) => {
    setEvaluaciones(prev => 
      prev.map(evaluacion => 
        evaluacion._id === evaluacionId 
          ? { ...evaluacion, ...newData }
          : evaluacion
      )
    );
  };

  useEffect(() => {
    loadAllEvaluaciones();
  }, [userRole, token]);

  return {
    evaluaciones,
    loading,
    error,
    deleteEvaluacion,
    reloadEvaluaciones: loadAllEvaluaciones,
    updateEvaluacionLocal
  };
};
