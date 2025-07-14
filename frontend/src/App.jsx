import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'  
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Horario from './pages/Horario'
import SubidaExcel from './pages/SubidaExcel'
import GestionUsuarios from './pages/GestionUsuarios'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import { UserContextProvider } from '../context/userContext'
import ProtectedRoute from './components/ProtectedRoute'
import MallaCurricular from './pages/MallaCurricular'
import Foro from './pages/Foro'

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5500'
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true

// Interceptor para agregar automáticamente el token a todas las requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expirado o inválido, limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      // Recargar la página para reiniciar el estado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const location = useLocation()
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register"

  return (
    <div className="w-screen h-screen overflow-hidden">
      <UserContextProvider>
        {!hideNavbar && <Navbar />}
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/horario" element={<Horario />} />
        <Route path="/malla" element={<MallaCurricular />} />
        <Route path="/foro" element={<Foro />} />
        
        {/* Rutas específicas para admin */}
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/subida-excel" element={<SubidaExcel />} />
        
        {/* Rutas para profesores */}
        <Route path="/evaluaciones" element={<div>Página de Evaluaciones - En desarrollo</div>} />
        
        {/* Rutas para estudiantes */}
        <Route path="/historial" element={<div>Página de Historial - En desarrollo</div>} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta legacy (mantener por compatibilidad) */}
        <Route path="/ExcelUploader" element={<SubidaExcel />} />
      </Routes>
    </UserContextProvider>
    </div>
  )
}

export default App