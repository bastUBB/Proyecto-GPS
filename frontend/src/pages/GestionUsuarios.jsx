import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../components/ui/table";
import Button from "../components/ui/button";
import { 
    Users, 
    UserPlus, 
    Edit, 
    Trash2, 
    Loader2, 
    Shield, 
    User, 
    GraduationCap,
    AlertCircle
} from "lucide-react";
import PagGeneral from "../components/PagGeneral";

export default function GestionUsuarios() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        email: '',
        rut: '',
        password: '',
        role: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
        loadUsers();
    }, []);

    const checkAdminAccess = () => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!token || userData.role !== 'admin') {
            navigate('/');
            return;
        }
    };

    const loadUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Tu backend devuelve { statusCode: 200, message: "...", data: [...] }
            const usersData = response.data.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setUsers([]);
            
            if (error.response?.status === 403) {
                navigate('/');
            } else {
                const errorMessage = error.response?.data?.details || error.response?.data?.message || 'Error al cargar usuarios';
                showAlert(errorMessage, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombreCompleto.trim()) {
            newErrors.nombreCompleto = 'El nombre es obligatorio';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }
        
        if (!formData.rut.trim()) {
            newErrors.rut = 'El RUT es obligatorio';
        } else if (!/^[0-9]{7,8}-[0-9kK]$/.test(formData.rut)) {
            newErrors.rut = 'El RUT debe tener el formato 12345678-9';
        }
        
        if (!editingUser && !formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        if (!formData.role) {
            newErrors.role = 'El rol es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSend = { ...formData };
            
            if (editingUser && !formData.password) {
                delete dataToSend.password;
            }

            if (editingUser) {
                // Actualizar usuario usando query params con RUT
                await axios.patch(`/api/users/detail?rut=${editingUser.rut}`, dataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Crear nuevo usuario
                await axios.post('/api/users', dataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            setShowModal(false);
            resetForm();
            loadUsers();
            showAlert('Usuario guardado exitosamente', 'success');
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.message || 'Error al guardar usuario';
            showAlert(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            nombreCompleto: user.nombreCompleto,
            email: user.email,
            rut: user.rut,
            password: '',
            role: user.role
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            // Eliminar usuario usando query params con RUT
            await axios.delete(`/api/users/detail?rut=${userToDelete.rut}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setShowDeleteModal(false);
            setUserToDelete(null);
            loadUsers();
            showAlert('Usuario eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.message || 'Error al eliminar usuario';
            showAlert(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nombreCompleto: '',
            email: '',
            rut: '',
            password: '',
            role: ''
        });
        setEditingUser(null);
        setErrors({});
    };

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => {
            setAlert({ show: false, message: '', type: '' });
        }, 5000);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-4 h-4 text-red-500" />;
            case 'profesor':
                return <User className="w-4 h-4 text-yellow-500" />;
            case 'estudiante':
                return <GraduationCap className="w-4 h-4 text-blue-500" />;
            default:
                return <User className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'profesor':
                return 'bg-yellow-100 text-yellow-800';
            case 'estudiante':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <PagGeneral>
                <div className="flex items-center justify-center h-full bg-white rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </PagGeneral>
        );
    }

    return (
        <PagGeneral>
            <div className="flex-1 overflow-hidden flex flex-col bg-transparent">
                {/* Alerta */}
                {alert.show && (
                    <div className={`mb-4 p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                        {alert.message}
                    </div>
                )}

                {/* Título principal */}
                <div className="flex flex-wrap gap-2 items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Usuarios
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    RUT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Creación
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.nombreCompleto}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.rut}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="Editar usuario"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No hay usuarios disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal para crear/editar usuario */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-900">
                                    {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
                                </h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            name="nombreCompleto"
                                            value={formData.nombreCompleto}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombreCompleto ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Ingresa el nombre completo"
                                        />
                                        {errors.nombreCompleto && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.nombreCompleto}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="ejemplo@email.com"
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            RUT
                                        </label>
                                        <input
                                            type="text"
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${errors.rut ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="12345678-9"
                                            disabled={editingUser}
                                        />
                                        {editingUser && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                El RUT no se puede modificar
                                            </p>
                                        )}
                                        {errors.rut && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.rut}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder={editingUser ? "Dejar vacío para mantener actual" : "Ingresa la contraseña"}
                                        />
                                        {editingUser && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                Deja vacío para mantener la contraseña actual
                                            </p>
                                        )}
                                        {errors.password && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rol
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.role ? 'border-red-300' : 'border-gray-300'}`}
                                        >
                                            <option value="">Seleccionar rol</option>
                                            <option value="admin">Administrador</option>
                                            <option value="profesor">Profesor</option>
                                            <option value="estudiante">Estudiante</option>
                                        </select>
                                        {errors.role && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.role}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                resetForm();
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Guardando...
                                                </span>
                                            ) : (
                                                editingUser ? 'Actualizar' : 'Crear'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación para eliminar */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6" />
                                    Confirmar Eliminación
                                </h2>
                                <p className="text-gray-700 mb-6">
                                    ¿Estás seguro de que deseas eliminar al usuario{' '}
                                    <span className="font-semibold text-gray-900">{userToDelete?.nombreCompleto}</span>?
                                    Esta acción no se puede deshacer.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setUserToDelete(null);
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={submitting}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Eliminando...
                                            </span>
                                        ) : (
                                            'Eliminar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PagGeneral>
    );
}