import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { isAdmin } = useAuth();

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}