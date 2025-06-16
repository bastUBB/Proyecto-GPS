import React from "react";
import { useNavigate } from "react-router-dom";

export default function PagGeneral({ children }) {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
      <header className="flex justify-between items-center bg-[#143963] text-white p-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-[#145C9E] p-2 rounded hover:bg-[#0779ee]"
        >
          Regresar
        </button>

        {/* Perfil de usuario */}
        <div className="flex items-center bg-[#145C9E] p-2 rounded">
          <div className="w-8 h-8 bg-white rounded-full mr-2" />
          <span className="text-sm text-black">Usuario</span>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1">{children}</main>

      {/* Footer con logo */}
      <footer className="flex justify-end items-end pr-4 pb-4">
        <img
          src="/Escudo.svg"
          alt="Universidad del Bío-Bío"
          className="w-24 opacity-40"
        />
      </footer>
    </div>
  );
}