import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        role: ""
    });

    const registerUser = async (e) => {
        e.preventDefault();
        const { name, email, password, role } = data;
        try {
            const {data} = await axios.post('/register', {
                name,
                email,
                password,
                role
            });
            if (data.error) {
                toast.error(data.error);
            } else {
                setData({})
                toast.success('Usuario registrado correctamente');
                navigate('/login');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <form onSubmit={registerUser}>
                <label>Nombre</label>
                <input type="text" placeholder="Escribe tu nombre" value={data.name} onChange={(e) => setData({...data, name: e.target.value})}/>
                <label>Email</label>
                <input type="text" placeholder="Escribe tu correo" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} />
                <label>Contraseña</label>
                <input type="text" placeholder="Escribe tu contraseña" value={data.password} onChange={(e) => setData({...data, password: e.target.value})} />
                <label>Rol</label>
                <input type="text" placeholder="¿Que eres?" value={data.role} onChange={(e) => setData({...data, role: e.target.value})} />
                <button type="submit">Registrarse</button>
            </form>
        </div>
    )
}