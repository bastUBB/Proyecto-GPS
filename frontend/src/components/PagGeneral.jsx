import React from "react";

export default function PagGeneral({ children }) {
  return (
    <div className="min-w-screen min-h-screen bg-[url('/FondoHome1.jpg')] bg-cover bg-center bg-opacity-20 flex flex-col">
      {/* Contenido */}
      <main className="flex-1">{children}</main>

      {/* Pie logo */}
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
