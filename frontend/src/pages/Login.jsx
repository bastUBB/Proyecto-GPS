import { useState } from 'react'
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const loginUser = async (e) => {
        e.preventDefault();
        const { email, password } = data;
        try {
            const {data} = await axios.post('/login', {
                email,
                password
            });
            if (data.error) {
                toast.error(data.error);
            } else {
                setData({});
                navigate('/');
            }
        } catch (error) {
            
        }
    };

    return (
        <div>
            <form onSubmit={loginUser}>
                <label>Email</label>
                <input type="text" name="email" placeholder="Escribe tu correo" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} />
                <label>Contraseña</label>
                <input type="password" name="password" placeholder="Escribe tu contraseña" value={data.password} onChange={(e) => setData({...data, password: e.target.value})} />
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    )
}