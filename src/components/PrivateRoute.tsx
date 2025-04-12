
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute = ({ children, requireAdmin = false }: PrivateRouteProps) => {
  const { user, loading, isAdmin } = useAuthContext();
  const location = useLocation();
  
  if (loading) {
    // Exiba um indicador de carregamento enquanto verifica a autenticação
    return (
      <div className="min-h-screen flex items-center justify-center bg-bullet-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bullet"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirecionar para a página de login se não estiver autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    // Redirecionar para a página principal se não for um administrador
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;
