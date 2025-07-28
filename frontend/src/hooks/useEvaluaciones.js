import { useState, useEffect } from 'react';
import axios from 'axios';

export const useEvaluaciones = (userRole, authToken) => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [nuevasEvaluaciones, setNuevasEvaluaciones] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadEvaluaciones = async () => {
        if (userRole !== 'profesor') return;

        try {
            setLoading(true);
            setError('');

            const response = await axios.get('/api/evaluacionDocente/detail', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const evaluacionesData = response.data.data || [];

            const hace24Horas = new Date();
            hace24Horas.setHours(hace24Horas.getHours() - 24);

            const nuevas = evaluacionesData.filter(evaluacion =>
                new Date(evaluacion.fecha) > hace24Horas
            ).length;

            setEvaluaciones(evaluacionesData);
            setNuevasEvaluaciones(nuevas);
        } catch (error) {
            console.error('Error al cargar evaluaciones:', error);
            
            // Si es error de autenticación, no establecer el error para evitar bucles
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError('Sesión expirada o sin permisos para ver evaluaciones');
                setEvaluaciones([]);
                setNuevasEvaluaciones(0);
            } else {
                setError(error.response?.data?.message || 'Error de conexión al cargar evaluaciones');
            }
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLeidas = () => {
        setNuevasEvaluaciones(0);
    };

    useEffect(() => {
        if (authToken && userRole === 'profesor') {
            loadEvaluaciones();
            const interval = setInterval(loadEvaluaciones, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [authToken, userRole]);

    return {
        evaluaciones,
        nuevasEvaluaciones,
        loading,
        error,
        recargar: loadEvaluaciones,
        marcarComoLeidas
    };
};
