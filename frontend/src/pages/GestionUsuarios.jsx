import React, { useState, useEffect } from "react";
import { Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
    Loader2,
    Shield,
    User,
    GraduationCap,
    AlertCircle
} from "lucide-react";
import Alert from "../components/Alert";
import PagGeneral from "../components/PagGeneral";
import TablaGestion from "../components/TablaGestion";
import EditarUsuario from "../components/EditarUsuario";

export default function GestionUsuarios() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
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
    const [alert, setAlert] = useState({ isVisible: false, type: '', title: '', message: '' });
    const navigate = useNavigate();

    // Funciones helper para alertas
    const showAlert = (type, title, message) => {
        setAlert({ isVisible: true, type, title, message });
    };

    const hideAlert = () => {
        setAlert({ isVisible: false, type: '', title: '', message: '' });
    };

    useEffect(() => {
        checkAdminAccess();
        loadUsers();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.trim().toLowerCase();
            setFilteredUsers(
                users.filter(u =>
                    u.nombreCompleto.toLowerCase().includes(term) ||
                    u.rut.toLowerCase().includes(term)
                )
            );
        }
    }, [searchTerm, users]);

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
                showAlert('error', 'Error de acceso', errorMessage);
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
        return validateUserData(formData);
    };

    const validateUserData = (data) => {
        const newErrors = {};

        if (!data.nombreCompleto.trim()) {
            newErrors.nombreCompleto = 'El nombre es obligatorio';
        }

        if (!data.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (!data.rut.trim()) {
            newErrors.rut = 'El RUT es obligatorio';
        } else if (!/^[0-9]{7,8}-[0-9kK]$/.test(data.rut)) {
            newErrors.rut = 'El RUT debe tener el formato 12345678-9';
        }

        if (!editingUser && !data.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (data.password && data.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!data.role) {
            newErrors.role = 'El rol es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e, userData = null) => {
        e.preventDefault();

        // Determinar qué datos usar
        const dataToUse = userData || formData;
        
        // Validar datos
        if (!validateUserData(dataToUse)) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSend = { ...dataToUse };

            if (editingUser && !dataToSend.password) {
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
            showAlert('success', 'Usuario Guardado', 'Usuario guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.message || 'Error al guardar usuario';
            showAlert('error', 'Error al guardar', errorMessage);
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
            showAlert('success', 'Usuario Eliminado', 'Usuario eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.message || 'Error al eliminar usuario';
            showAlert('error', 'Error al eliminar', errorMessage);
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

    // Configuración de columnas para la tabla
    const columns = [
        {
            key: 'nombreCompleto',
            title: 'Nombre Completo',
            render: (user) => (
                <div className="text-sm font-medium text-blue-900">
                    {user.nombreCompleto}
                </div>
            )
        },
        {
            key: 'email',
            title: 'Email',
            render: (user) => (
                <div className="text-sm text-blue-800">
                    {user.email}
                </div>
            )
        },
        {
            key: 'rut',
            title: 'RUT',
            render: (user) => (
                <div className="text-sm text-blue-800">
                    {user.rut}
                </div>
            )
        },
        {
            key: 'role',
            title: 'Rol',
            align: 'center',
            render: (user) => (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                </span>
            )
        },
        {
            key: 'createdAt',
            title: 'Fecha Creación',
            render: (user) => (
                <div className="text-sm text-blue-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
            )
        }
    ];

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
            <div className="p-4 sm:p-6 lg:p-8 bg-transparent">
                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

                    {/* Título principal */}
                    <div className="mb-6">
                        {/* Encabezado */}
                        <div className="text-center space-y-1 sm:space-y-2 mb-6">
                            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-sm sm:text-base text-blue-700">
                                Administra los usuarios del sistema y sus permisos
                            </p>
                        </div>
                    </div>

                {/* Tabla de usuarios */}
                <TablaGestion
                    data={filteredUsers}
                    columns={columns}
                    title="Usuarios del Sistema"
                    icon={<Users className="w-5 h-5" />}
                    searchPlaceholder="Buscar por nombre o RUT..."
                    onCreate={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    createButtonText="Nuevo Usuario"
                    onEdit={handleEdit}
                    onDelete={(user) => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                    }}
                    emptyMessage="No hay usuarios disponibles"
                    itemsPerPage={10}
                />

                {/* Modal para crear/editar usuario */}
                <EditarUsuario
                    visible={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditingUser(null);
                        resetForm();
                    }}
                    onSave={handleSubmit}
                    usuario={editingUser}
                    submitting={submitting}
                />

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

                {/* Componente de Alerta */}
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    isVisible={alert.isVisible}
                    onClose={hideAlert}
                    autoCloseTime={3000}
                />
            </div>
        </div>
    </PagGeneral>
);
}