import { useState, useEffect } from 'react';

// Hook personalizado para manejar evaluaciones y notificaciones
export const useEvaluaciones = (userRole, authToken) => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [nuevasEvaluaciones, setNuevasEvaluaciones] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const authenticatedFetch = async (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                ...options.headers,
            },
        });
    };

    const loadEvaluaciones = async () => {
        if (userRole !== 'profesor') return;

        try {
            setLoading(true);
            setError('');

            const response = await authenticatedFetch(
                'http://localhost:5500/api/evaluacionDocente/profesor/mis-evaluaciones'
            );

            const data = await response.json();

            if (response.ok) {
                const evaluacionesData = data.data || [];

                // Calcular evaluaciones nuevas (últimas 24 horas)
                const hace24Horas = new Date();
                hace24Horas.setHours(hace24Horas.getHours() - 24);

                const nuevas = evaluacionesData.filter(evaluacion =>
                    new Date(evaluacion.fecha) > hace24Horas
                ).length;

                setEvaluaciones(evaluacionesData);
                setNuevasEvaluaciones(nuevas);
            } else {
                setError(data.message || 'Error al cargar evaluaciones');
            }
        } catch (error) {
            setError('Error de conexión al cargar evaluaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken && userRole === 'profesor') {
            loadEvaluaciones();

            // Recargar cada 5 minutos para capturar nuevas evaluaciones
            const interval = setInterval(loadEvaluaciones, 5 * 60 * 1000);

            return () => clearInterval(interval);
        }
    }, [authToken, userRole]);

    const marcarComoLeidas = () => {
        setNuevasEvaluaciones(0);
    };

    return {
        evaluaciones,
        nuevasEvaluaciones,
        loading,
        error,
        recargar: loadEvaluaciones,
        marcarComoLeidas
    };
};
