import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        rut: "",
        email: "",
        password: ""
    });

    const registerUser = async (e) => {
        e.preventDefault();
        const { name, rut, email, password } = data;

        let role = "";
        if (email.endsWith('@alumnos.ubiobio.cl')) {
            role = "estudiante";
        } else if (email.endsWith('@ubiobio.cl')) {
            role = "profesor";
        }

        try {
            const {data} = await axios.post('/register', {
                name,
                rut,
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
                <label>RUT</label>
                <input type="text" placeholder="Escribe tu RUT" value={data.rut} onChange={(e) => setData({...data, rut: e.target.value})} />
                <label>Email</label>
                <input type="text" placeholder="Escribe tu correo" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} />
                <label>Contraseña</label>
                <input type="text" placeholder="Escribe tu contraseña" value={data.password} onChange={(e) => setData({...data, password: e.target.value})} />
                <button type="submit">Registrarse</button>
            </form>
        </div>
    )
}