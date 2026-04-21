import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Role = "parent" | "child";

type Props = {
  children: React.ReactNode;
  role?: Role;
  roles?: Role[];
};

export default function ProtectedRoute({ children, role, roles }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // ❌ No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Seguridad extra (por si acaso)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ múltiples roles
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ❌ rol único
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ OK
  return <>{children}</>;
}
