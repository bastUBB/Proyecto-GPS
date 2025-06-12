import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', data);
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setData({ email: "", password: "" });
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión");
    }
  };

  return (
    <div className="w-screen h-screen bg-[#EEF5FF] bg-[url('/Escudo.svg')] bg-no-repeat bg-[length:600px_auto] bg-[position:calc(100%-80px)_center] flex justify-start items-center relative">
      <div className="bg-[#115397] p-4 h-[420px] w-[350px] bg-[url('/Escudo-ubb.svg')] bg-[length:200px_auto] bg-no-repeat bg-[position:center_30px] text-center shadow-[0_0_20px_rgba(0,0,0,0.2)] relative ml-[100px]">
        <form onSubmit={loginUser} className="w-full flex flex-col items-center gap-8 text-black font-bold rounded p-4 mt-40">
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
