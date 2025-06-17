import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { user } = useContext(UserContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}