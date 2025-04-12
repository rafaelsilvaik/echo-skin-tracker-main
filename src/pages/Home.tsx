import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { CheckSquare, User, MessageSquare } from "lucide-react";
import { usePageVisibility } from "@/lib/hooks/usePageVisibility";
import { useCallback } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, refreshUser } = useAuthContext();
  const { t } = useTranslation();
  
  // Função para atualizar os dados do usuário quando a página ficar visível
  const handlePageVisible = useCallback(() => {
    if (user) {
      console.log("Atualizando dados do usuário na Home...");
      refreshUser();
    }
  }, [user, refreshUser]);
  
  // Usar o hook de visibilidade
  usePageVisibility(handlePageVisible);
  
  const features = [
    {
      icon: <CheckSquare className="w-10 h-10 text-bullet" />,
      title: t("home.checklistFeature"),
      description: t("home.checklistDescription"),
      link: "/skins",
    },
    {
      icon: <User className="w-10 h-10 text-bullet" />,
      title: t("home.profileFeature"),
      description: t("home.profileDescription"),
      link: "/profile",
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-bullet" />,
      title: t("home.chatFeature"),
      description: t("home.chatDescription"),
      link: "/chat",
    },
  ];

  return (
    <MainLayout isAuthenticated={!!user} isAdmin={isAdmin} onLogout={logout}>
      <div className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            <span className="text-bullet">{t("app.title")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-3xl mb-8">
            {t("home.description")}
          </p>
          
          {user ? (
            <Button 
              size="lg" 
              className="bg-bullet hover:bg-bullet-dark"
              onClick={() => navigate("/skins")}
            >
              {t("home.getStarted")}
            </Button>
          ) : (
            <div className="space-x-4">
              <Button 
                size="lg" 
                className="bg-bullet hover:bg-bullet-dark"
                onClick={() => navigate("/login")}
              >
                {t("auth.login")}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/register")}
              >
                {t("auth.register")}
              </Button>
            </div>
          )}
        </section>
        
        {/* Features Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">{t("home.features")}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-panel p-6 w-full max-w-sm flex flex-col items-center text-center hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => user ? navigate(feature.link) : navigate("/login")}
                >
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  {!user && (
                    <p className="text-sm italic text-muted-foreground mt-auto">
                      {t("home.loginRequired")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;
