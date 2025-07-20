import React, { useState, useEffect } from "react";
import PagGeneral from "../components/PagGeneral";
import EditarAsignaturaMalla from "../components/EditarAsignaturaMalla";
import TablaGestion from "../components/TablaGestion";
import { Plus } from "lucide-react";
import axios from 'axios';

export default function GestionMallaCurricular() {
    const [asignaturas, setAsignaturas] = useState([]);
    const [form, setForm] = useState({
        nombre: "",
        codigo: "",
        creditos: "",
        semestre: "",
        prerrequisitos: "",
        descripcion: ""
    });
    const [editando, setEditando] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [asignaturaAEditar, setAsignaturaAEditar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Cargar asignaturas desde la BD
    useEffect(() => {
        cargarAsignaturas();
    }, []);

    const cargarAsignaturas = async () => {
        try {
            setLoading(true);
            console.log('🔍 Intentando cargar asignaturas...');
            console.log('🔑 Token en localStorage:', localStorage.getItem('token'));
            
            // El interceptor de axios ya agrega automáticamente el token
            const response = await axios.get('/api/asignaturas');
            console.log('✅ Respuesta exitosa:', response.data);
            setAsignaturas(response.data.data || []);
        } catch (error) {
            console.error('❌ Error al cargar asignaturas:', error);
            console.error('📊 Status:', error.response?.status);
            console.error('📝 Message:', error.response?.data?.message);
            console.error('🔍 Full response:', error.response);
            
            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else {
                setError('Error al cargar las asignaturas: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre || !form.codigo || !form.creditos || !form.semestre) {
            setError("Por favor completa todos los campos obligatorios");
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const asignaturaData = {
                nombre: form.nombre,
                codigo: form.codigo,
                creditos: parseInt(form.creditos),
                semestre: parseInt(form.semestre),
                prerrequisitos: form.prerrequisitos,
                descripcion: form.descripcion
            };

            if (editando) {
                await axios.put(`/api/asignaturas/${editando._id}`, asignaturaData);
                setSuccess('Asignatura actualizada correctamente');
            } else {
                await axios.post('/api/asignaturas', asignaturaData);
                setSuccess('Asignatura creada correctamente');
            }

            await cargarAsignaturas();
            resetForm();
        } catch (error) {
            console.error('Error al guardar asignatura:', error);
            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else {
                setError(error.response?.data?.message || 'Error al guardar la asignatura');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (asignatura) => {
        setEditando(asignatura);
        setForm({
            nombre: asignatura.nombre,
            codigo: asignatura.codigo,
            creditos: asignatura.creditos.toString(),
            semestre: asignatura.semestre.toString(),
            prerrequisitos: asignatura.prerrequisitos || '',
            descripcion: asignatura.descripcion || ''
        });
        setMostrarFormulario(true);
    };

    const handleEditarConModal = (asignatura) => {
        setAsignaturaAEditar(asignatura);
        setEditModalVisible(true);
    };

    const handleGuardarAsignatura = async (asignaturaEditada) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await axios.put(`/api/asignaturas/${asignaturaEditada._id}`, asignaturaEditada);

            setSuccess('Asignatura actualizada correctamente');
            await cargarAsignaturas();
            setEditModalVisible(false);
            setAsignaturaAEditar(null);
        } catch (error) {
            console.error('Error al actualizar asignatura:', error);
            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else {
                setError(error.response?.data?.message || 'Error al actualizar la asignatura');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta asignatura?')) {
            try {
                setLoading(true);
                setError('');
                setSuccess('');

                await axios.delete(`/api/asignaturas/${id}`);

                setSuccess('Asignatura eliminada correctamente');
                await cargarAsignaturas();
            } catch (error) {
                console.error('Error al eliminar asignatura:', error);
                if (error.response?.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else {
                    setError(error.response?.data?.message || 'Error al eliminar la asignatura');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setForm({
            nombre: "",
            codigo: "",
            creditos: "",
            semestre: "",
            prerrequisitos: "",
            descripcion: ""
        });
        setEditando(null);
        setMostrarFormulario(false);
    };

    // Configuración de columnas para la tabla
    const columns = [
        {
            key: 'codigo',
            title: 'Código',
            render: (asignatura) => (
                <div className="text-sm font-medium text-blue-900">
                    {asignatura.codigo}
                </div>
            )
        },
        {
            key: 'nombre',
            title: 'Nombre',
            render: (asignatura) => (
                <div className="text-sm text-blue-800">
                    {asignatura.nombre}
                </div>
            )
        },
        {
            key: 'creditos',
            title: 'Créditos',
            align: 'center',
            render: (asignatura) => (
                <div className="text-sm font-medium text-blue-900">
                    {asignatura.creditos}
                </div>
            )
        },
        {
            key: 'semestre',
            title: 'Semestre',
            align: 'center',
            render: (asignatura) => (
                <div className="text-sm font-medium text-blue-900">
                    {asignatura.semestre}°
                </div>
            )
        },
        {
            key: 'prerrequisitos',
            title: 'Prerrequisitos',
            render: (asignatura) => (
                <div className="text-sm text-blue-800">
                    {/* Hacer que se ponga Ninguno cuando el array esté vacío */}
                    {asignatura.prerrequisitos.length > 0 ? asignatura.prerrequisitos.join(', ') : 'Ninguno'}
                </div>
            )
        }
    ];

    return (
        <PagGeneral>
            <div className="p-4 sm:p-6 lg:p-8 bg-transparent">
                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                {/* Mensajes de éxito y error */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Título principal */}
                <div className="mb-6">
                    {/* Encabezado */}
                    <div className="text-center space-y-1 sm:space-y-2 mb-6">
                        <h1 className="text-xl sm:text-3xl font-bold text-blue-900">
                            Gestión de Malla Curricular
                        </h1>
                        <p className="text-sm sm:text-base text-blue-700">
                            Administra las asignaturas de la malla curricular
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva Asignatura
                        </button>
                    </div>
                </div>

                {/* Formulario de creación/edición */}
                {mostrarFormulario && (
                    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-6 mb-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">
                            {editando ? 'Editar Asignatura' : 'Crear Nueva Asignatura'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Código *</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        placeholder="Ej: MAT100"
                                        value={form.codigo}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Ej: Matemáticas I"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Créditos *</label>
                                    <input
                                        type="number"
                                        name="creditos"
                                        placeholder="Ej: 4"
                                        value={form.creditos}
                                        onChange={handleChange}
                                        min="1"
                                        max="10"
                                        className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Semestre *</label>
                                    <select
                                        name="semestre"
                                        value={form.semestre}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar semestre</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => (
                                            <option key={sem} value={sem}>{sem}° Semestre</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-blue-900 mb-1">prerrequisitos</label>
                                    <input
                                        type="text"
                                        name="prerrequisitos"
                                        placeholder="Ej: MAT100, FIS101"
                                        value={form.prerrequisitos}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    placeholder="Descripción de la asignatura..."
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-blue-300 px-3 py-2 bg-white text-blue-900 placeholder-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear')} Asignatura
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de asignaturas */}
                <TablaGestion
                    data={asignaturas}
                    columns={columns}
                    title="Asignaturas Registradas"
                    icon="/IconMalla.png"
                    searchPlaceholder="Buscar asignaturas..."
                    onEdit={handleEditarConModal}
                    onDelete={(asignatura) => handleEliminar(asignatura._id || asignatura.id)}
                    emptyMessage="No hay asignaturas registradas"
                    itemsPerPage={10}
                />

                {/* Estadísticas */}
                {asignaturas.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6 mt-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Estadísticas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-blue-600 text-sm">Total Asignaturas</p>
                                <p className="text-2xl font-bold text-blue-900">{asignaturas.length}</p>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                                <p className="text-cyan-600 text-sm">Total Créditos</p>
                                <p className="text-2xl font-bold text-cyan-900">
                                    {asignaturas.reduce((sum, asig) => sum + asig.creditos, 0)}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="text-green-600 text-sm">Semestres</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {asignaturas.length > 0 ? Math.max(...asignaturas.map(asig => asig.semestre)) : 0}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <p className="text-purple-600 text-sm">Promedio Créditos</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {asignaturas.length > 0 ? (asignaturas.reduce((sum, asig) => sum + asig.creditos, 0) / asignaturas.length).toFixed(1) : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>

            {/* Modal de edición */}
            <EditarAsignaturaMalla
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleGuardarAsignatura}
                asignatura={asignaturaAEditar}
            />
        </PagGeneral>
    );
}