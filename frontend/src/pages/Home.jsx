import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Calendar, 
  BookOpen, 
  MessageCircle, 
  Users, 
  FileSpreadsheet, 
  GraduationCap, 
  History,
  Settings,
  Clock,
  PlusCircle
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [availablePages, setAvailablePages] = useState([]);

  useEffect(() => {
    // Obtener rol del usuario desde localStorage
    const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    // console.log('Datos del usuario desde localStorage:', storedUserData); // Debug
    setUserData(storedUserData);
    setUserRole(storedUserData.role);
  }, []);

  useEffect(() => {
    console.log('UserRole actual:', userRole); // Debug
    
    // Definir páginas disponibles según el rol
    const getAvailablePages = (role) => {
      const basePages = [
        { id: "horario", route: "/horario", icon: Calendar, label: "Horario" },
        { id: "malla", route: "/malla", icon: BookOpen, label: "Malla" },
        { id: "foro", route: "/foro", icon: MessageCircle, label: "Foro" },
      ];

      const roleSpecificPages = {
        admin: [
          ...basePages,
          { id: "usuarios", route: "/gestion-usuarios", icon: Users, label: "Usuarios" },
          { id: "excel", route: "/subida-excel", icon: FileSpreadsheet, label: "Excel" },
          { id: "gestion-malla", route: "/gestion-malla", icon: Settings, label: "Gestión Malla" },
          { id: "sugerencias", route: "/sugerencia-horarios", icon: Clock, label: "Sugerencias" },
        ],
        profesor: [
          ...basePages,
          { id: "sugerencias", route: "/sugerencia-horarios", icon: Clock, label: "Sugerencias" },
        ],
        alumno: [
          ...basePages,
          { id: "historial", route: "/historial", icon: History, label: "Historial" },
        ],
        estudiante: [
          ...basePages,
          { id: "historial", route: "/historial", icon: History, label: "Historial" },
        ],
      };

      console.log('Páginas disponibles para rol', role, ':', roleSpecificPages[role] || basePages); // Debug
      return roleSpecificPages[role] || basePages;
    };

    if (userRole) {
      const pages = getAvailablePages(userRole);
      setAvailablePages(pages);
      console.log('Páginas configuradas:', pages); // Debug
    }
  }, [userRole]);

  const handleButtonClick = (route) => {
    navigate(route);
  };

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

  const getGridLayout = (itemCount) => {
    // Determinar el layout del grid según la cantidad de elementos
    if (itemCount <= 3) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    } else if (itemCount <= 4) {
      return "grid-cols-2 lg:grid-cols-4";
    } else if (itemCount <= 6) {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3";
    } else if (itemCount <= 8) {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    } else {
      return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5";
    }
  };

  return (
    <div className="w-screen h-screen bg-[url('/FondoHome.jpg')] bg-cover bg-center flex flex-col">
      <div className="flex flex-col items-center justify-start flex-1 p-8 pt-24 overflow-y-auto perspective-[1000px]">
        <img
          src="/Escudo.svg"
          alt="Escudo"
          className="h-[170px] mb-6 opacity-90"
        />

        {/* Círculos dinámicos */}
        <div className={`grid gap-6 sm:gap-8 lg:gap-12 justify-center max-w-6xl pb-8 ${getGridLayout(availablePages.length)}`}>
          {availablePages.map(({ id, route, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleButtonClick(route)}
              onMouseMove={handle3DRotate}
              onMouseLeave={reset3DRotate}
              className="
                w-36 h-36 sm:w-44 sm:h-44 rounded-full cursor-pointer 
                bg-[#123a68] hover:bg-[#0d61c0] 
                text-white transition-all duration-300
                flex flex-col items-center justify-center overflow-hidden
                shadow-[0_0_25px_rgba(13,97,192,0.9)]
                will-change-transform focus:outline-none
                transform-gpu
              "
            >
              <Icon 
                size={48} 
                className="mb-2 drop-shadow-md" 
              />
              <span className="text-sm sm:text-md font-semibold text-center px-2">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}