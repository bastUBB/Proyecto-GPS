import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(UserContext);

    // Si está cargando, mostrar indicador de carga
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    // Si terminó de cargar y no hay usuario, redirigir al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}