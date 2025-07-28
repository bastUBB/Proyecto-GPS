import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/userContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

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
        return 'text-red-400';
      case 'profesor':
        return 'text-yellow-400';
      case 'alumno':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  // Determinar si el usuario es administrador
  const isAdmin = userData?.role === 'admin' || userData?.role === 'administrador';
  const isAlumno = userData?.role === 'alumno' || userData?.role === 'estudiante';
  const isProfesor = userData?.role === 'profesor' || userData?.role === 'docente';

  // Menú de navegación
  const navigationItems = [
    { 
      // name: 'Inicio', 
      // path: '/', 
      // icon: (
      //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      //   </svg>
      // ),
      // visible: true
    },
    { 
      name: 'Horario', 
      path: '/horario', 
      icon: (
        <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      visible: !isHome && !isAdmin && !isProfesor
    },
    { 
      name: 'Malla Curricular', 
      path: '/malla', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      visible: !isHome
    },
    { 
      name: 'Notas', 
      path: '/notas', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      visible: !isHome && !isAdmin && !isProfesor
    },
    { 
      name: 'Sugerencia Horarios', 
      path: '/sugerencia-horarios', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      visible: !isAlumno && !isHome
    },
    { 
      name: 'Foro', 
      path: '/foro', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      visible: !isHome
    },
    { 
      name: 'Administración', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      subItems: [
        { name: 'Gestión Malla', path: '/gestion-malla', visible: isAdmin },
        { name: 'Gestión Usuarios', path: '/gestion-usuarios', visible: isAdmin },
        { name: 'Subida Excel', path: '/subida-excel', visible: isAdmin }
      ],
      visible: isAdmin && !isHome
    }
  ];

  // Función para verificar si un elemento de navegación está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#0d2c4d] to-[#123a68] backdrop-blur-sm shadow-lg">
      <div className="flex justify-between items-center text-white h-16 px-4 ">
        {/* Logo y Nombre de Usuario */}
        <div className="flex items-center bg-[#145C9E] p-2 rounded min-w-0 hover:bg-[#1a6fbd] transition-colors cursor-pointer "
          onClick={() => navigate('/')}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full mr-2 flex items-center justify-center flex-shrink-0">
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
        </div>
        
        {/* Menú de navegación - Versión escritorio */}
        <div className="hidden lg:flex items-center space-x-4">
          {navigationItems.map((item, index) => (
            item.visible && (
              <div key={index} className="relative">
                {item.path ? (
                  <button
                    onClick={() => navigate(item.path)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all bg-blue-800 ${
                      isActive(item.path)
                        ? 'bg-[#1e7fd6] text-white shadow-md'
                        : 'hover:bg-[#1a6fbd] text-blue-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <button
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeDropdown === item.name
                        ? 'bg-gradient-to-r from-[#145C9E] to-[#0779ee] text-white shadow-md'
                        : 'bg-blue-800 hover:bg-gradient-to-r hover:from-[#145C9E] hover:to-[#0779ee] text-blue-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span>{item.name}</span>
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {item.subItems && activeDropdown === item.name && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-[#145C9E] rounded-md shadow-lg py-1 z-10 border border-blue-800"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.subItems.map((subItem, subIndex) => (
                      subItem.visible && (
                        <button
                          key={subIndex}
                          onClick={() => navigate(subItem.path)}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 font-semibold ${
                            isActive(subItem.path)
                              ? 'bg-[#1e7fd6] text-white shadow-md'
                              : 'bg-[#145C9E] text-white hover:bg-white hover:text-[#145C9E] hover:shadow-md'
                          }`}
                        >
                          {subItem.name}
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
        
        {/* Menú móvil y botones de acción */}
        <div className="flex items-center">
          {/* Botón de menú móvil */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="lg:hidden text-white p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Botón de salir/regresar */}
          {isHome ? (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded hover:from-red-700 hover:to-red-800 transition-colors flex items-center gap-2 flex-shrink-0 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Salir</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="flex items-center bg-[#145C9E] p-2 rounded min-w-0 hover:bg-[#1a6fbd] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline text-white">Regresar</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Menú móvil desplegable */}
      {showMenu && (
        <div className="lg:hidden bg-gradient-to-br from-[#145C9E] to-[#0d2c4d] shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item, index) => (
              item.visible && (
                <div key={index}>
                  <button
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                        setShowMenu(false);
                      } else {
                        setActiveDropdown(activeDropdown === item.name ? null : item.name);
                      }
                    }}
                    className={`flex items-center w-full text-left px-4 py-2 rounded-lg mb-1 transition-all duration-200 ${
                      (isActive(item.path) || activeDropdown === item.name)
                        ? 'bg-gradient-to-r from-[#145C9E] to-[#0779ee] text-white shadow-md'
                        : 'bg-blue-800 text-blue-100 hover:bg-gradient-to-r hover:from-[#145C9E] hover:to-[#0779ee]'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-grow">{item.name}</span>
                    {item.subItems && (
                      <svg className={`w-4 h-4 transform transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {item.subItems && activeDropdown === item.name && (
                    <div className="pl-8 pr-2 py-1 space-y-1">
                      {item.subItems.map((subItem, subIndex) => (
                        subItem.visible && (
                          <button
                            key={subIndex}
                            onClick={() => {
                              navigate(subItem.path);
                              setShowMenu(false);
                            }}
                            className={`block w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                              isActive(subItem.path)
                                ? 'bg-[#1e7fd6] text-white shadow-md'
                                : 'bg-[#145C9E] text-white hover:bg-white hover:text-[#145C9E] hover:shadow-md'
                            }`}
                          >
                            {subItem.name}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}