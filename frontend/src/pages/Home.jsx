import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleButtonClick = (id) => {
    if (id === "circle1") {
      navigate("/horario"); 
    } else {
      alert(`Clic en ${id}`);
    }
};

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col">  
      {/* Barra superior */}
      <div className="bg-[#143963] flex justify-between items-center px-4 py-3 w-full"> 
        {/* Cuadro del perfil */}
        <div className="bg-[#145C9E] flex items-center gap-2 px-4 py-1 rounded">   
          {/* Avatar */} 
          <div className="w-8 h-8 bg-white rounded-full" /> 
          <span className="text-black">Usuario</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-start flex-1 w-full">
        {/* Logo */}
        <img
          src="/Escudo.svg"
          alt="Escudo"
          className="h-48 mt-12 mb-16 opacity-70"
        />

        {/* Círculos */}
        <div className="flex gap-16">
          {["circle1", "circle2", "circle3", "circle4", "circle5"].map((id) => (
            <button
                key={id}
                className="w-44 h-44 bg-[#143963] rounded-full cursor-pointer border-none hover:bg-[#0779ee] focus:outline-none"
                onClick={() => handleButtonClick(id)}
            />
        ))}
        </div>
      </div>
    </div>
  );
}
