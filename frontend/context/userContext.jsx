import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
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
            });
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}