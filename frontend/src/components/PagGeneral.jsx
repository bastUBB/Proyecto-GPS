import React from "react";
import PropTypes from "prop-types";

export default function PagGeneral({ children }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#b8ebff] to-[#edfaff] pt-20">
      {/* Contenido principal */}
      <main className="w-full h-full overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-full">
          {children}
        </div>
      </main>

      {/* Pie de página decorativo */}
      <footer className="absolute bottom-0 right-0 pr-4 pb-4 pointer-events-none">
        <img
          src="/Escudo.svg"
          alt="Universidad del Bío-Bío"
          className="w-24 opacity-40"
        />
      </footer>
    </div>
  );
}

PagGeneral.propTypes = {
  children: PropTypes.node,
};