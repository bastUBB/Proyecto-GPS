import TablaGestion from "../components/TablaGestion";
import { Table2, Loader2,  BookOpenCheck } from "lucide-react";
import PagGeneral from "../components/PagGeneral";
import Alert from "../components/Alert";

export default function Notas() {
    const asignaturas = [
        {
            asignatura: "Matemáticas",
            semestre: "1°",
            año: "2025",
            nota: 6.3,
        },
        {
            asignatura: "Historia",
            semestre: "1°",
            año: "2023",
            nota: 3.8,
        }
    ];

    const columns = [
        {
            key: "asignatura",
            title: "Asignatura",
            render: (item) => (
                <div className="text-sm font-medium text-blue-900">{item.asignatura}</div>
            )
        },
        {
            key: "semestre",
            title: "Semestre",
            render: (item) => (
                <div className="text-sm text-blue-800">{item.semestre}</div>
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
                <div className={`text-sm font-semibold ${item.nota >= 4 ? "text-green-600" : "text-red-600"}`}>
                    {item.nota}
                </div>
            )
        }
    ];

        const loading = false;
        const alert = {
            type: "success",
            title: "OK",
            message: "Acción completada",
            isVisible: false
        };

        const hideAlert = () => { };

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
                                Visualiza tu rendimiento académico
                            </p>
                        </div>

                        {/* Tabla de asignaturas con notas */}
                        <TablaGestion
                            data={asignaturas}
                            columns={columns}
                            title="Mis Calificaciones"
                            icon={< BookOpenCheck className="w-5 h-5" />}
                            searchPlaceholder="Buscar asignaturas..."
                            emptyMessage="No hay notas registradas"
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
                </div>
            </PagGeneral>
        );
}
