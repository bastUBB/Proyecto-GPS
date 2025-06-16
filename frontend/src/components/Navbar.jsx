import { Link, useLocation, useNavigate } from "react-router-dom"
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import axios from "axios";

export default function Navbar() {
    const location = useLocation();
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await axios.post('/logout'); 
        setUser(null);
        navigate('/login');
    };


    if (location.pathname === "/" && user) {
        return (
            <nav>
                <button onClick={handleLogout}>Cerrar sesión</button>
            </nav>
        );
    }

    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </nav>
    )
}