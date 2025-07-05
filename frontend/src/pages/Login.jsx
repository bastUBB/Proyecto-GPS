import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [data, setData] = useState({ email: "", password: "" });

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = data;
    try {
      const { data: response } = await axios.post('/login', { email, password });
      if (response.error) {
        toast.error(response.error);
      } else {
        setUser(response);
        setData({ email: "", password: "" });
        //contraseña por 
        console.log(response.password);
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión");
    }
  };

  return (
    <div className="w-screen h-screen relative">
      {/* Imagen de fondo */}
      <img
        src="/FondoL.jpg"
        alt="Fondo Login"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      <div className="w-full h-full flex justify-end items-center pr-40">
        {/* Cuadro de login */}
        <div className="bg-gradient-to-b from-[#0c549c] to-[#b4ecff] p-4 h-[470px] rounded shadow-[0_8px_24px_rgba(59,130,246,0.5)]">
          <img
            src="/Escudo-ubb.svg"
            alt="Escudo UBB"
            className="h-20 mx-auto mt-12 mb-10"
          />

          <form
            onSubmit={loginUser}
            className="w-full flex flex-col items-center gap-8 text-black font-bold rounded p-4"
          >
            {/* Campo de correo */}
            <div className="relative">
              <img
                src="/IconCorreo.png"
                alt="icono correo"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-30"
              />
              <input
                type="email"
                placeholder="Correo institucional"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
                className="w-[280px] pl-10 p-2 rounded bg-white text-black border-2 border-gray-300 text-sm"
              />
            </div>

            {/* Campo de contraseña */}
            <div className="relative">
              <img
                src="/IconContraseña.png"
                alt="icono contraseña"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-30"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
                className="w-[280px] pl-10 p-2 rounded bg-white text-black border-2 border-gray-300 text-sm"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-[200px] bg-white text-[#115397] py-2 rounded hover:bg-[#FBB13C] transition-colors"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
