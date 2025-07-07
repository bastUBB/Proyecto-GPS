import React from "react";
import PropTypes from "prop-types";

export default function PagGeneral({ children }) {
  return (
    <div className="relative min-w-screen min-h-screen overflow-hidden bg-gradient-to-b from-[#b8ebff] to-[#edfaff] pt-20">
      {/* Contenido principal */}
      <main className="w-screen h-screen">{children}</main>

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