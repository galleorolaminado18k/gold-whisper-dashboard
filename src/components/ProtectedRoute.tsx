import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Readonly<ProtectedRouteProps>) {
  const { user, loading } = useAuth();

  // NUNCA MOSTRAR LOADING - Ir directo al contenido o login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
