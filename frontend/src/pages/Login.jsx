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
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión");
    }
  };

  return (
    <div className="w-screen h-screen bg-[#EEF5FF] flex items-center justify-center gap-44">
      <img
        src="/Escudo.svg"
        alt="Escudo"
        className="h-80 opacity-85"
      />

      {/* Cuadro de login */}
      <div className="bg-[#115397] p-4 h-[470px] rounded shadow-[0_8px_24px_rgba(59,130,246,0.5)]">
        <img
          src="/Escudo-ubb.svg"
          alt="Escudo"
          className="h-20 mx-auto mt-12 mb-10"
        />

        <form
          onSubmit={loginUser}
          className="w-full flex flex-col items-center gap-8 text-black font-bold rounded p-4"
        >
          <input
            type="email"
            placeholder="Correo institucional"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
            className="w-[280px] p-2 rounded bg-white text-black border-2 border-gray-300 text-sm"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
            className="w-[280px] p-2 rounded bg-white text-black border-2 border-gray-300 text-sm"
          />
          <button
            type="submit"
            className="w-[200px] bg-white text-[#115397] py-2 rounded hover:bg-[#FBB13C] transition-colors"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}