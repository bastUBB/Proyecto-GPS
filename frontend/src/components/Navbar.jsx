import { Link, useLocation, useNavigate } from "react-router-dom"
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import axios from "axios";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = async () => {
    await axios.post('/logout');
    setUser(null);
    navigate('/login');
  };

  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav>
      <div className="flex justify-between items-center bg-[#143963] text-white p-2">
        <div className="flex items-center bg-[#145C9E] p-2 rounded">
          <div className="w-8 h-8 bg-white rounded-full mr-2" />
          <span className="text-sm text-black">
            {user ? user.nombre || "Usuario" : "Invitado"}
          </span>
        </div>

        <div className="flex gap-2">
          {user && location.pathname === "/" && (
            <button
              onClick={handleLogout}
              className="bg-red-500 p-2 rounded hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          )}
          {!isLoginOrRegister && (
            <button
              onClick={() => navigate(-1)}
              className="bg-[#145C9E] p-2 rounded hover:bg-[#0779ee]"
            >
              Regresar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
