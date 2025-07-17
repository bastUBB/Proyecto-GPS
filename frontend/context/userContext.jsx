import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carga
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Si hay token, verificar con el servidor
            axios.get('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(({ data }) => {
                setUser(data);
            })
            .catch((error) => {
                console.error('Error al cargar perfil:', error);
                // Si hay error de autenticación, limpiar token
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userData');
                }
            })
            .finally(() => {
                setLoading(false); // Terminar carga independientemente del resultado
            });
        } else {
            // Si no hay token, terminar carga inmediatamente
            setLoading(false);
        }
    }, []); // Eliminar dependencia de user para evitar bucles

    // Función para cerrar sesión
    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
}