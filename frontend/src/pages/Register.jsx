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
            //console.log(error);
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
                    Crear cuenta
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={registerUser} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">
                            Nombre
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                placeholder="Escribe tu nombre"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">
                            RUT
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                placeholder="Escribe tu RUT"
                                value={data.rut}
                                onChange={(e) => setData({ ...data, rut: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">
                            Correo electrónico
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
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
                            Registrarse
                        </button>
                    </div>
                </form>
                <p className="mt-10 text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Inicia sesión
                    </a>
                </p>
            </div>
        </div>
    );
}