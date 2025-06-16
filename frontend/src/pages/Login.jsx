import { useState, useContext } from 'react'
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const loginUser = async (e) => {
        e.preventDefault();
        const { email, password } = data;
        try {
            const { data: response } = await axios.post('/login', {
                email,
                password
            });
            if (response.error) {
                toast.error(response.error);
            } else {
                setUser(response); 
                setData({});
                navigate('/');
            }
        } catch (error) {
            
        }
    };


    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="UBB"
                    src="https://www.ubiobio.cl/w/img/Escudo-UBB.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                    Iniciar sesión
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={loginUser} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">
                            Correo electrónico
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Escribe tu correo"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">
                            Contraseña
                        </label>
                        <div className="mt-2">
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Escribe tu contraseña"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
                <p className="mt-10 text-center text-sm text-gray-500">
                    ¿No tienes cuenta?{' '}
                    <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Regístrate
                    </a>
                </p>
            </div>
        </div>
    )
}