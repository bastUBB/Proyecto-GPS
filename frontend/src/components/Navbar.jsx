import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#123a68] backdrop-blur-sm">
      <div className="flex justify-between items-center text-white p-2 h-16">
        <div className="flex items-center bg-[#145C9E] p-2 rounded">
          <div className="w-8 h-8 bg-white rounded-full mr-2" />
          <span className="text-sm text-black">Usuario</span>
        </div>
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="bg-[#145C9E] p-2 rounded hover:bg-[#0779ee]"
          >
            Regresar
          </button>
        )}
      </div>
    </nav>
  );
}
