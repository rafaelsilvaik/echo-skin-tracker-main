
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";
import Skins from "@/pages/Skins";
import Admin from "@/pages/Admin";
import SkinRanking from "@/pages/SkinRanking";

// Inicialização i18n
import "@/i18n/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,     // Recarrega dados quando a janela ganha foco
      refetchOnMount: true,           // Recarrega dados quando o componente é montado
      retry: 1,                       // Tenta novamente uma vez se falhar
      staleTime: 30 * 1000,          // Considera os dados obsoletos após 30 segundos
      gcTime: 5 * 60 * 1000,         // Mantém os dados em cache por 5 minutos
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Rotas privadas */}
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } />
            <Route path="/skins" element={
              <PrivateRoute>
                <Skins />
              </PrivateRoute>
            } />
            <Route path="/skin-ranking" element={
              <PrivateRoute>
                <SkinRanking />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute requireAdmin>
                <Admin />
              </PrivateRoute>
            } />
            
            {/* Rota de erro 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
