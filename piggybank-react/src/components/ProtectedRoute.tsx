import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type Props = {
  children: React.ReactNode;
  role: "parent" | "child";
};

export default function ProtectedRoute({ children, role }: Props) {
  const { user, isAuthenticated } = useAuth();

  // ❌ No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Rol incorrecto
  if (user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ OK
  return <>{children}</>;
}