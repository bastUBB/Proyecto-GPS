import { useState } from "react";
import PagGeneral from "../components/PagGeneral";

export default function FormularioDudas() {
  const [correo, setCorreo] = useState("");
  const [comentario, setComentario] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Correo del profesor:", correo);
    console.log("Comentario:", comentario);
    setCorreo("");
    setComentario("");
  };

  return (
    <PagGeneral>
    <div className="min-h-screen flex items-center justify-center  p-4">
      <form
        onSubmit={handleSubmit}
        //className="bg-[#b4ecff] p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Consultas</h2>

        <label htmlFor="correo" className="block mb-2 font-medium">Correo del Profesor:</label>
        <input
          id="correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Ej: profesor@ubiobio.cl"
          required
        />

        <label htmlFor="Comentario" className="block mb-2 font-medium">Comentario:</label>
        <textarea
          id="Comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Escribe tu comentario aquí..."
          rows={5}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </form>
    </div>
    </PagGeneral>
  );
}
