import { useState, useEffect } from "react";
import PagGeneral from "../components/PagGeneral";
import EditarAsignaturaMalla from "../components/EditarAsignaturaMalla";
import TablaGestion from "../components/TablaGestion";
import { Table2 } from 'lucide-react';
import Alert from "../components/Alert";
import axios from 'axios';
import HelpTooltip from "../components/PuntoAyuda";

export default function GestionMallaCurricular() {
    const [asignaturas, setAsignaturas] = useState([]);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [asignaturaAEditar, setAsignaturaAEditar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ isVisible: false, type: '', title: '', message: '' });
    const [confirmDelete, setConfirmDelete] = useState({ isVisible: false, asignaturaId: null, asignaturaNombre: '' });

    // Funciones helper para alertas
    const showAlert = (type, title, message) => {
        setAlert({ isVisible: true, type, title, message });
    };

    const hideAlert = () => {
        setAlert({ isVisible: false, type: '', title: '', message: '' });
    };

    // Funciones helper para confirmación de eliminación
    const showConfirmDelete = (id, nombre) => {
        setConfirmDelete({ isVisible: true, asignaturaId: id, asignaturaNombre: nombre });
    };

    const hideConfirmDelete = () => {
        setConfirmDelete({ isVisible: false, asignaturaId: null, asignaturaNombre: '' });
    };

    // Cargar asignaturas desde la BD
    useEffect(() => {
        cargarAsignaturas();
    }, []);

    const cargarAsignaturas = async () => {
        try {
            setLoading(true);
            //console.log('🔍 Intentando cargar asignaturas...');
            //console.log('🔑 Token en localStorage:', localStorage.getItem('token'));
            
            // El interceptor de axios ya agrega automáticamente el token
            const response = await axios.get('/api/asignaturas');
            //console.log('✅ Respuesta exitosa:', response.data);
            setAsignaturas(response.data.data || []);
        } catch (error) {
            console.error('❌ Error al cargar asignaturas:', error);
            console.error('📊 Status:', error.response?.status);
            console.error('📝 Message:', error.response?.data?.message);
            console.error('🔍 Full response:', error.response);

            if (error.response?.status === 401) {
                showAlert('error', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente.');
            } else {
                showAlert('error', 'Error al cargar asignaturas', error.response?.data?.message || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditarConModal = (asignatura) => {
        setAsignaturaAEditar(asignatura);
        setEditModalVisible(true);
    };

    const handleGuardarAsignatura = async (asignaturaData) => {
        try {
            setLoading(true);

            if (asignaturaAEditar) {
                // Actualizar asignatura existente
                await axios.put(`/api/asignaturas/${asignaturaAEditar._id}`, asignaturaData);
                showAlert('success', 'Asignatura Actualizada', 'La asignatura ha sido actualizada correctamente');
            } else {
                // Crear nueva asignatura
                await axios.post('/api/asignaturas', asignaturaData);
                showAlert('success', 'Asignatura Creada', 'La asignatura ha sido creada correctamente');
            }

            await cargarAsignaturas();
            setEditModalVisible(false);
            setAsignaturaAEditar(null);
        } catch (error) {
            console.error('Error al guardar asignatura:', error);
            if (error.response?.status === 401) {
                showAlert('error', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente.');
            } else {
                showAlert('error', 'Error al Guardar', error.response?.data?.message || 'Error al guardar la asignatura');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        try {
            setLoading(true);

            await axios.delete(`/api/asignaturas/${id}`);

            showAlert('success', 'Asignatura Eliminada', 'La asignatura ha sido eliminada correctamente');
            await cargarAsignaturas();
        } catch (error) {
            console.error('Error al eliminar asignatura:', error);
            if (error.response?.status === 401) {
                showAlert('error', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente.');
            } else {
                showAlert('error', 'Error al Eliminar', error.response?.data?.message || 'Error al eliminar la asignatura');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmEliminar = (asignatura) => {
        showConfirmDelete(asignatura._id || asignatura.id, asignatura.nombre);
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
                </div>

                {/* Tabla de asignaturas */}
                <TablaGestion
                    data={asignaturas}
                    columns={columns}
                    title="Asignaturas Registradas"
                    icon={<Table2 className="w-5 h-5" />}
                    searchPlaceholder="Buscar asignaturas..."
                    onCreate={() => {
                        setAsignaturaAEditar(null);
                        setEditModalVisible(true);
                    }}
                    createButtonText="Nueva Asignatura"
                    onEdit={handleEditarConModal}
                    onDelete={handleConfirmEliminar}
                    emptyMessage="No hay asignaturas registradas"
                    itemsPerPage={10}
                />

                    {/* Estadísticas */}
                    {asignaturas.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 sm:p-6 hide-in-pdf">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-2 rounded-lg mb-4">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">Estadísticas
                                    <HelpTooltip className="text-white hover:text-yellow-300">
                                        <h3 className="text-blue-700 font-bold text-sm mb-1">¿Qué puedes hacer aquí?</h3>
                                        <p className="text-gray-600 text-xs">
                                            Aquí puedes ver un resumen académico.
                                        </p>
                                    </HelpTooltip>
                                </h3>
                            </div>
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

            {/* Componente de Alerta */}
            <Alert
                type={alert.type}
                title={alert.title}
                message={alert.message}
                isVisible={alert.isVisible}
                onClose={hideAlert}
                autoCloseTime={3000}
            />

            {/* Componente de Confirmación de Eliminación */}
            <Alert
                type="confirm"
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar la asignatura "${confirmDelete.asignaturaNombre}"?`}
                details="Esta acción no se puede deshacer."
                isVisible={confirmDelete.isVisible}
                onClose={hideConfirmDelete}
                onConfirm={() => {
                    handleEliminar(confirmDelete.asignaturaId);
                    hideConfirmDelete();
                }}
                acceptButtonText="Eliminar"
                cancelButtonText="Cancelar"
            />
        </PagGeneral>
    );
}