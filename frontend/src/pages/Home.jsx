import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

 const handleButtonClick = (id) => {
    if (id === "circle1") {
      navigate("/horario");
    } else if (id === "circle2") {
      navigate("/malla");
    } else if (id === "circle3") {
      navigate("/consultas");
    } else {
      alert(`Clic en ${id}`);
    }
  };

  return (
    <div className="min-w-screen min-h-screen bg-[url('/FondoHome1.jpg')] bg-cover bg-center flex flex-col">
      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-start flex-1 w-full p-12">
        {/* Logo */}
        <img
          src="/Escudo.svg"
          alt="Escudo"
          className="h-48 mt-32 mb-16 opacity-90"
        />

        {/* Círculos */}
        <div className="flex gap-16 ">
          {["circle1", "circle2", "circle3", "circle4"].map((id) => (
            <button
              key={id}
              className="w-44 h-44 bg-[#143963] rounded-full cursor-pointer border-none hover:bg-[#0779ee] focus:outline-none shadow-[0_8px_24px_rgba(59,130,246,0.5)]"
              onClick={() => handleButtonClick(id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 