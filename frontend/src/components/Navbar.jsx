import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/userContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    // Priorizar datos del contexto, luego localStorage
    if (user) {
      setUserData(user);
    } else {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (storedUserData && Object.keys(storedUserData).length > 0) {
        setUserData(storedUserData);
      }
    }
  }, [user]);

  // Función para obtener las iniciales del nombre
  const getInitials = (nombreCompleto) => {
    console.log('Obteniendo iniciales para:', nombreCompleto); // Debug
    if (!nombreCompleto) return '?';
    const nombres = nombreCompleto.split(' ');
    if (nombres.length >= 2) {
      return (nombres[0].charAt(0) + nombres[1].charAt(0)).toUpperCase();
    }
    return nombres[0].charAt(0).toUpperCase();
  };

  // Función para obtener nombre corto (primer nombre + primer apellido)
  const getShortName = (nombreCompleto) => {
    if (!nombreCompleto) return 'Usuario';
    const nombres = nombreCompleto.trim().split(' ').filter(nombre => nombre.length > 0);
    if (nombres.length >= 2) {
      return `${nombres[0]} ${nombres[1]}`;
    }
    return nombres[0] || 'Usuario';
  };

  // Función para obtener el color del rol
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600';
      case 'profesor':
        return 'text-yellow-600';
      case 'alumno':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#123a68] backdrop-blur-sm">
      <div className="flex justify-between items-center text-white h-16 px-4">
        <div className="flex items-center bg-[#145C9E] p-2 rounded min-w-0">
          <div className="w-8 h-8 bg-white rounded-full mr-2 flex items-center justify-center flex-shrink-0">
            {/* Mostrar iniciales del nombre */}
            <span className={`font-bold text-xs ${getRoleColor(userData?.role)}`}>
              {getInitials(userData?.nombreCompleto)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-white font-medium truncate">
              {getShortName(userData?.nombreCompleto)}
            </span>
            {userData?.role && (
              <span className={`text-xs ${getRoleColor(userData.role)} capitalize`}>
                {userData.role}
              </span>
            )}
          </div>
        </div>
        
        {/* Botón dinámico según la página */}
        {isHome ? (
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="bg-[#145C9E] text-white p-2 rounded hover:bg-[#0779ee] transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline text-white">Regresar</span>
          </button>
        )}
      </div>
    </nav>
  );
}