import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'  
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Horario from './pages/Horario'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import { UserContextProvider } from '../context/userContext'

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true

function App() {
  const location = useLocation()
  const hideNavbarRoutes = ['/login', '/register']

  return (
    <UserContextProvider>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/horario" element={<Horario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </UserContextProvider>
  )
}

export default App
