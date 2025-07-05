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
    } else if (id === "circle4") {
      navigate("/createmalla");
    } else {
      alert(`Clic en ${id}`);
    }
  };

  const circleData = [
    { id: "circle1", image: "/IconHorario.png", label: "Horario" },
    { id: "circle2", image: "/IconMalla.png", label: "Malla" },
    { id: "circle3", image: "/IconChat.png", label: "Consultas" },
    { id: "circle4", image: "/IconMalla.png", label: "Mallas Curriculares" }, // Nuevo círculo
  ];

  return (
    <div className="min-w-screen min-h-screen bg-[url('/FondoHome.jpg')] bg-cover bg-center flex flex-col">
      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-start flex-1 w-full p-12">
        {/* Logo */}
        <img
          src="/Escudo.svg"
          alt="Escudo"
          className="h-48 mt-32 mb-16 opacity-90"
        />

        {/* Círculos con labels dentro */}
        <div className="flex gap-16 flex-wrap justify-center">
          {circleData.map(({ id, image, label }) => (
            <button
              key={id}
              className="w-44 h-44 bg-[#143963] rounded-full cursor-pointer border-none hover:bg-[#0779ee] focus:outline-none shadow-[0_8px_24px_rgba(59,130,246,0.5)] flex flex-col items-center justify-center overflow-hidden text-white"
              onClick={() => handleButtonClick(id)}
            >
              <img
                src={image}
                alt={id}
                className="w-16 h-16 object-contain mb-2 pointer-events-none"
              />
              <span className="text-md font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
