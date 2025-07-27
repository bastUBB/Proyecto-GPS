import TablaGestion from "../components/TablaGestion";
import EditarNotaModal from "../components/EditarNotaModal";
import EditarNotasParcialesModal from "../components/EditarNotasParcialesModal";
import { Table2, Loader2, BookOpenCheck, Edit, Plus, Save, X } from "lucide-react";
import PagGeneral from "../components/PagGeneral";
import Alert from "../components/Alert";
import { useState, useEffect, useContext } from "react";
import { UserContext } from '../../context/userContext';
import axios from 'axios';

export default function Notas() {
    const { user } = useContext(UserContext);
    const [asignaturas, setAsignaturas] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAsignatura, setEditingAsignatura] = useState(null);
    const [editingCurrentNote, setEditingCurrentNote] = useState(null);
    const [editingCurrentSemestre, setEditingCurrentSemestre] = useState(null);
    const [editingTipo, setEditingTipo] = useState(null);
    const [editingNotasParciales, setEditingNotasParciales] = useState([]);
    const [alert, setAlert] = useState({ 
        type: '', 
        title: '', 
        message: '', 
        isVisible: false 
    });

    // Funciones helper para alertas
    const showAlert = (type, title, message) => {
        setAlert({ isVisible: true, type, title, message });
    };

    const hideAlert = () => {
        setAlert({ isVisible: false, type: '', title: '', message: '' });
    };

    function getAuthToken() {
        return localStorage.getItem('token') || '';
    }

    const getAuthHeaders = () => {
        const token = getAuthToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Cargar asignaturas cursadas desde mallaUser
    const loadAsignaturasCursadas = async () => {
        try {
            if (!user?.rut) {
                // console.log('No se encontró RUT del usuario');
                return [];
            }

            const response = await axios.get(`/api/mallaUser/detail?rutUser=${user.rut}`, {
                headers: getAuthHeaders()
            });

            if (response.data.data) {
                return response.data.data.asignaturasCursadas || [];
            }
            return [];
        } catch (error) {
            console.error('Error al cargar asignaturas cursadas:', error);
            showAlert('error', 'Error de Carga', 'Error al cargar asignaturas cursadas');
            return [];
        }
    };

    // Cargar asignaturas inscribibles desde mallaUser
    const loadAsignaturasInscribibles = async () => {
        try {
            if (!user?.rut) {
                return [];
            }

            const response = await axios.get(`/api/mallaUser/detail?rutUser=${user.rut}`, {
                headers: getAuthHeaders()
            });

            if (response.data.data) {
                return response.data.data.asignaturasInscribibles || [];
            }
            return [];
        } catch (error) {
            console.error('Error al cargar asignaturas inscribibles:', error);
            return [];
        }
    };

    // Cargar historial de notas
    const loadHistorial = async () => {
        try {
            if (!user?.nombreCompleto) {
                return [];
            }

            const response = await axios.get(`/api/historial/detail?alumno=${encodeURIComponent(user.nombreCompleto)}`, {
                headers: getAuthHeaders()
            });

            console.log('Historial guardado cargado:', response.data);

            if (response.data.status && response.data.data) {
                return response.data.data[0]?.asignaturasCursadas || [];
            }
            return [];
        } catch (error) {
            // Si no existe historial, no mostrar error
            if (error.response?.status === 404) {
                return [];
            }
            console.error('Error al cargar historial:', error);
            return [];
        }
    };

    // Combinar asignaturas cursadas e inscribibles con notas del historial
    const combineData = (asignaturasCursadas, asignaturasInscribibles, historialData) => {
        const todasAsignaturas = [
            ...asignaturasCursadas.map(asig => ({ asignatura: asig, tipo: 'cursada' })),
            ...asignaturasInscribibles.map(asig => ({ asignatura: asig, tipo: 'inscribible' }))
        ];

        return todasAsignaturas.map((item, index) => {
            const notaData = historialData.find(h => h.asignatura === item.asignatura);
            return {
                id: `asig_${index}`,
                asignatura: item.asignatura,
                semestre: notaData?.semestre || 1,
                año: new Date().getFullYear(),
                nota: notaData?.notaFinal || null,
                tipo: item.tipo,
                notasParciales: notaData?.notasParciales || []
            };
        });
    };

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            
            setLoading(true);
            try {
                const [asignaturasCursadas, asignaturasInscribibles, historialData] = await Promise.all([
                    loadAsignaturasCursadas(),
                    loadAsignaturasInscribibles(),
                    loadHistorial()
                ]);

                const combinedData = combineData(asignaturasCursadas, asignaturasInscribibles, historialData);
                setAsignaturas(combinedData);
                setHistorial(historialData);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                showAlert('error', 'Error', 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Función para refrescar datos desde el servidor
    const refreshData = async () => {
        if (!user) return;
        
        try {
            const [asignaturasCursadas, asignaturasInscribibles, historialData] = await Promise.all([
                loadAsignaturasCursadas(),
                loadAsignaturasInscribibles(),
                loadHistorial()
            ]);

            const combinedData = combineData(asignaturasCursadas, asignaturasInscribibles, historialData);
            setAsignaturas(combinedData);
            setHistorial(historialData);
        } catch (error) {
            console.error('Error al refrescar datos:', error);
            showAlert('error', 'Error', 'Error al actualizar los datos');
        }
    };

    // Guardar nota en historial
    const saveNote = async (asignatura, nota, semestre, notasParciales = []) => {
        try {
            if (!user?.nombreCompleto) return;

            const asignaturaData = asignaturas.find(a => a.asignatura === asignatura);
            const isInscribible = asignaturaData?.tipo === 'inscribible';
            const notaFloat = parseFloat(nota);

            // Verificar si la asignatura existía previamente en el historial
            const existingAsignatura = historial.find(h => h.asignatura === asignatura);
            const wasInscribible = existingAsignatura?.estado === 'inscribible';
            const nowIsCursada = !isInscribible; // Si no es inscribible, es cursada

            // Detectar cambio de inscribible a cursada
            const cambioAEstadoCursada = wasInscribible && nowIsCursada;

            // Validar nota mínima para asignaturas cursadas (aprobadas)
            if (!isInscribible && notaFloat < 4.0) {
                // Si es un cambio de estado y la nota es menor a 4.0, reemplazar automáticamente
                if (cambioAEstadoCursada) {
                    showAlert('warning', 'Nota Ajustada', 
                        `La asignatura cambió a estado "cursada". Nota ajustada de ${notaFloat.toFixed(2)} a 4.0 (mínimo aprobación)`);
                    // Continuar con nota = 4.0
                    nota = '4.0';
                } else {
                    showAlert('error', 'Nota Inválida', 'Las asignaturas cursadas deben tener nota mínima de 4.0 (aprobada)');
                    return;
                }
            }

            // Preparar datos para el historial
            const updatedHistorial = [...historial];
            const existingIndex = updatedHistorial.findIndex(h => h.asignatura === asignatura);
            
            // Convertir notas parciales a números y validar estructura
            let notasParcialesFinales = (notasParciales || []).map(parcial => ({
                evaluacion: parcial.evaluacion,
                nota: parseFloat(parcial.nota), // Convertir string a número
                ponderacion: parseInt(parcial.ponderacion) // Asegurar que sea entero
            }));

            // Si cambió de inscribible a cursada, convertir las notas parciales en historial formal
            if (cambioAEstadoCursada && notasParcialesFinales.length > 0) {
                showAlert('info', 'Conversión de Estado', 
                    'Las notas parciales se han convertido en el historial formal de la asignatura cursada');
                // Las notas parciales se mantienen como están, pero ahora representan el historial formal
            } else if (nowIsCursada) {
                // Si es cursada pero no había notas parciales previas, limpiar las notas parciales
                notasParcialesFinales = [];
            }
            
            const asignaturaHistorial = {
                asignatura: asignatura,
                notaFinal: parseFloat(nota), // Usar la nota final (posiblemente ajustada)
                semestre: parseInt(semestre),
                estado: isInscribible ? 'inscribible' : 'cursada',
                notasParciales: notasParcialesFinales
            };

            if (existingIndex >= 0) {
                updatedHistorial[existingIndex] = asignaturaHistorial;
            } else {
                updatedHistorial.push(asignaturaHistorial);
            }

            // Asegurar que todas las asignaturas tengan semestre definido
            const historialValidado = updatedHistorial.map(asig => ({
                ...asig,
                semestre: asig.semestre || 1, // Usar semestre 1 como default si no está definido
                notasParciales: (asig.notasParciales || []).map(parcial => ({
                    evaluacion: parcial.evaluacion,
                    nota: typeof parcial.nota === 'string' ? parseFloat(parcial.nota) : parcial.nota,
                    ponderacion: typeof parcial.ponderacion === 'string' ? parseInt(parcial.ponderacion) : parcial.ponderacion
                }))
            }));

            const historialData = {
                alumno: user.nombreCompleto,
                asignaturasCursadas: historialValidado
            };

            console.log('Datos a enviar (validados):', JSON.stringify(historialData, null, 2));

            let response;
            try {
                // Intentar actualizar historial existente primero
                response = await axios.patch(`/api/historial/detail?alumno=${encodeURIComponent(user.nombreCompleto)}`,
                    historialData,
                    { headers: getAuthHeaders() }
                );

                console.log('Historial actualizado:', response.data);
            } catch (updateError) {
                console.log('Error en PATCH, intentando POST:', updateError.response?.data);
                // Si falla la actualización (ej: no existe), crear uno nuevo
                if (updateError.response?.status === 404) {
                    response = await axios.post('/api/historial', historialData, {
                        headers: getAuthHeaders()
                    });
                    console.log('Historial creado:', response.data);
                } else {
                    console.error('Error en PATCH:', updateError.response?.data);
                    throw updateError;
                }
            }

            if (response.data.status) {
                if (cambioAEstadoCursada) {
                    showAlert('success', 'Estado Actualizado', 
                        'La asignatura ha sido marcada como cursada y las notas parciales se han convertido en historial académico formal');
                } else {
                    showAlert('success', 'Nota Guardada', 'La nota se ha guardado correctamente');
                }
                setModalOpen(false);
                setEditingAsignatura(null);
                setEditingCurrentNote(null);

                // Recargar datos desde el servidor para actualizar la tabla
                await refreshData();
            }
        } catch (error) {
            console.error('Error al guardar nota:', error);
            showAlert('error', 'Error', error.response?.data?.message || 'Error al guardar la nota');
        }
    };

    // Manejar edición de nota
    const handleEditNote = (asignatura, currentNote, currentSemestre, tipo, notasParciales = []) => {
        setEditingAsignatura(asignatura);
        setEditingCurrentNote(currentNote);
        setEditingCurrentSemestre(currentSemestre);
        setEditingTipo(tipo);
        setEditingNotasParciales(notasParciales);
        setModalOpen(true);
    };

    // Cerrar modal
    const closeModal = () => {
        setModalOpen(false);
        setEditingAsignatura(null);
        setEditingCurrentNote(null);
        setEditingCurrentSemestre(null);
        setEditingTipo(null);
        setEditingNotasParciales([]);
    };

    const columns = [
        {
            key: "asignatura",
            title: "Asignatura",
            render: (item) => (
                <div className="flex flex-col">
                    <div className={`text-sm font-medium ${
                        item.tipo === 'cursada' ? 'text-green-800' : 'text-blue-800'
                    }`}>
                        {item.asignatura}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                        item.tipo === 'cursada' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                    }`}>
                        {item.tipo === 'cursada' ? 'Cursada' : 'Inscribible'}
                    </div>
                </div>
            )
        },
        {
            key: "semestre",
            title: "Semestre",
            render: (item) => (
                <div className="text-sm text-blue-800">
                    {item.semestre === 1 ? "Primer Semestre" : "Segundo Semestre"}
                </div>
            )
        },
        {
            key: "año",
            title: "Año",
            render: (item) => (
                <div className="text-sm text-blue-800">{item.año}</div>
            )
        },
        {
            key: "nota",
            title: "Nota",
            align: "center",
            render: (item) => (
                <div className="flex items-center justify-center gap-2">
                    <div className={`text-sm font-semibold ${
                        item.nota === null ? "text-gray-400" : 
                        item.nota >= 4 ? "text-green-600" : "text-red-600"
                    }`}>
                        {item.nota === null ? "Sin nota" : item.nota.toFixed(1)}
                    </div>
                    {item.tipo === 'inscribible' && item.notasParciales.length > 0 && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {item.notasParciales.length} parcial{item.notasParciales.length > 1 ? 'es' : ''}
                        </div>
                    )}
                    <button
                        onClick={() => handleEditNote(item.asignatura, item.nota, item.semestre, item.tipo, item.notasParciales)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title={item.tipo === 'inscribible' ? "Editar notas parciales" : "Editar nota"}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

        return loading ? (
            <PagGeneral>
                <div className="flex items-center justify-center h-full bg-white rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </PagGeneral>
        ) : (
            <PagGeneral>
                <div className="p-4 sm:p-6 lg:p-8 bg-transparent">
                    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                        {/* Encabezado */}
                        <div className="text-center space-y-1 sm:space-y-2 mb-6">
                            <h1 className="text-xl sm:text-3xl font-bold text-blue-900">Mis Notas</h1>
                            <p className="text-sm sm:text-base text-blue-700">
                                Visualiza y edita tu rendimiento académico
                            </p>
                        </div>

                        {/* Estadísticas de rendimiento */}
                        {asignaturas.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <h4 className="font-medium text-green-900">Cursadas</h4>
                                        </div>
                                        <p className="text-2xl font-bold text-green-800">
                                            {asignaturas.filter(a => a.tipo === 'cursada').length}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            Promedio: {
                                                asignaturas
                                                    .filter(a => a.tipo === 'cursada' && a.nota !== null)
                                                    .length > 0 
                                                    ? (asignaturas
                                                        .filter(a => a.tipo === 'cursada' && a.nota !== null)
                                                        .reduce((sum, a) => sum + a.nota, 0) / 
                                                       asignaturas.filter(a => a.tipo === 'cursada' && a.nota !== null).length
                                                      ).toFixed(2)
                                                    : 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <h4 className="font-medium text-blue-900">Inscribibles</h4>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-800">
                                            {asignaturas.filter(a => a.tipo === 'inscribible').length}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            Con notas: {asignaturas.filter(a => a.tipo === 'inscribible' && a.nota !== null).length}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <h4 className="font-medium text-purple-900">Promedio General</h4>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-800">
                                            {
                                                asignaturas.filter(a => a.nota !== null).length > 0
                                                    ? (asignaturas
                                                        .filter(a => a.nota !== null)
                                                        .reduce((sum, a) => sum + a.nota, 0) / 
                                                       asignaturas.filter(a => a.nota !== null).length
                                                      ).toFixed(2)
                                                    : 'N/A'
                                            }
                                        </p>
                                        <p className="text-sm text-purple-600">
                                            {asignaturas.filter(a => a.nota !== null).length} asignaturas
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <h4 className="font-medium text-yellow-900">Aprobadas</h4>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-800">
                                            {asignaturas.filter(a => a.nota !== null && a.nota >= 4).length}
                                        </p>
                                        <p className="text-sm text-yellow-600">
                                            de {asignaturas.filter(a => a.nota !== null).length} evaluadas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabla de asignaturas con notas */}
                        <TablaGestion
                            data={asignaturas}
                            columns={columns}
                            title="Mis Calificaciones"
                            icon={<BookOpenCheck className="w-5 h-5" />}
                            searchPlaceholder="Buscar asignaturas..."
                            emptyMessage="No hay asignaturas cursadas registradas"
                            itemsPerPage={10}
                            showActions={false}
                        />
                    </div>

                    {/* Componente de Alerta */}
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        isVisible={alert.isVisible}
                        onClose={hideAlert}
                        autoCloseTime={3000}
                    />

                    {/* Modales de edición de notas */}
                    {editingTipo === 'cursada' ? (
                        <EditarNotaModal
                            isOpen={modalOpen}
                            onClose={closeModal}
                            asignatura={editingAsignatura}
                            currentNote={editingCurrentNote}
                            currentSemestre={editingCurrentSemestre}
                            onSave={(asignatura, nota, semestre) => saveNote(asignatura, nota, semestre, [])}
                        />
                    ) : (
                        <EditarNotasParcialesModal
                            isOpen={modalOpen}
                            onClose={closeModal}
                            asignatura={editingAsignatura}
                            currentNote={editingCurrentNote}
                            currentSemestre={editingCurrentSemestre}
                            notasParciales={editingNotasParciales}
                            tipo={editingTipo}
                            onSave={saveNote}
                        />
                    )}
                </div>
            </PagGeneral>
        );
}
