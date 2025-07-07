import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleButtonClick = (id) => {
    switch (id) {
      case "circle1":
        navigate("/horario");
        break;
      case "circle2":
        navigate("/malla");
        break;
      case "circle3":
        navigate("/consultas");
        break;
      default:
        alert(`Clic en ${id}`);
    }
  };

  const circleData = [
    { id: "circle1", image: "/IconHorario.png", label: "Horario" },
    { id: "circle2", image: "/IconMalla.png", label: "Malla" },
    { id: "circle3", image: "/IconChat.png", label: "Consultas" },
  ];

  const handle3DRotate = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / (rect.height / 2)) * 10;
    const rotateY = (x / (rect.width / 2)) * 10;
    el.style.transform = `perspective(1000px) scale(1.1) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    el.classList.add("shadow-[0_25px_40px_rgba(59,130,246,0.8)]", "shadow-white/60");
  };

  const reset3DRotate = (e) => {
    const el = e.currentTarget;
    el.style.transform = "perspective(1000px) scale(1)";
    el.classList.remove("shadow-[0_25px_40px_rgba(59,130,246,0.8)]", "shadow-white/60");
  };

  return (
    <div className="min-w-screen min-h-screen bg-[url('/FondoHome.jpg')] bg-cover bg-center flex flex-col">
      <div className="flex flex-col items-center justify-start flex-1 w-full p-12 perspective-[1000px]">
        <img
          src="/Escudo.svg"
          alt="Escudo"
          className="h-48 mt-32 mb-16 opacity-90"
        />
      {/*Circulos*/}
        <div className="flex gap-16 flex-wrap justify-center">
          {circleData.map(({ id, image, label }) => (
            <button
              key={id}
              onClick={() => handleButtonClick(id)}
              onMouseMove={handle3DRotate}
              onMouseLeave={reset3DRotate}
              className="
                w-44 h-44 rounded-full cursor-pointer 
                bg-[#123a68] hover:bg-[#0d61c0] 
                text-white transition-transform 
                flex flex-col items-center justify-center overflow-hidden
                shadow-[0_0_25px_rgba(13,97,192,0.9)]
                will-change-transform focus:outline-none
              "
            >
              <img
                src={image}
                alt={id}
                className="w-16 h-16 object-contain mb-2 pointer-events-none drop-shadow-md"
              />
              <span className="text-md font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
