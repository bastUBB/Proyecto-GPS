import { useNavigate  } from "react-router-dom"

export default function Navbar() {

    const navigate = useNavigate();

    return (
        <nav>
            <div className="flex justify-between items-center bg-[#143963] text-white p-2">
                <div className="flex items-center bg-[#145C9E] p-2 rounded">
                    <div className="w-8 h-8 bg-white rounded-full mr-2" />
                    <span className="text-sm text-black">Usuario</span>
                </div>
                <button
                        onClick={() => navigate(-1)}
                        className="bg-[#145C9E] p-2 rounded hover:bg-[#0779ee]"
                        >
                        Regresar
                </button>
            </div>
        </nav>
    )
}