
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Menu,
  User,
  MessageSquare,
  CheckSquare,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isAuthenticated, isAdmin = false, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    toast({
      title: t("navbar.logoutSuccess"),
      description: t("navbar.logoutMessage"),
    });
    navigate("/login");
  };

  // Fechar menu mobile em tela grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    {
      label: t("navbar.skins"),
      icon: <CheckSquare className="w-5 h-5 mr-2" />,
      href: "/skins",
      show: isAuthenticated,
    },
    {
      label: t("navbar.profile"),
      icon: <User className="w-5 h-5 mr-2" />,
      href: "/profile",
      show: isAuthenticated,
    },
    {
      label: t("navbar.chat"),
      icon: <MessageSquare className="w-5 h-5 mr-2" />,
      href: "/chat",
      show: isAuthenticated,
    },
    {
      label: t("navbar.admin"),
      icon: <Settings className="w-5 h-5 mr-2" />,
      href: "/admin",
      show: isAuthenticated && isAdmin,
    },
  ];

  return (
    <nav className="bg-bullet-gray sticky top-0 z-50 py-2 px-4 border-b border-bullet-gray/50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="text-2xl font-rajdhani font-bold text-bullet cursor-pointer flex items-center"
            onClick={() => navigate("/")}
          >
            <span className="animate-pulse-glow">BULLET</span>
            <span className="text-white ml-2">ECHO</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks
            .filter((link) => link.show)
            .map((link, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex items-center hover:bg-bullet hover:text-white"
                onClick={() => navigate(link.href)}
              >
                {link.icon}
                {link.label}
              </Button>
            ))}

          <LanguageSwitcher />

          {isAuthenticated && (
            <Button 
              variant="destructive" 
              className="ml-2"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t("navbar.logout")}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bullet-gray border-t border-bullet-gray/50 py-2">
          <div className="container mx-auto px-4 flex flex-col">
            {navLinks
              .filter((link) => link.show)
              .map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="flex items-center justify-start hover:bg-bullet hover:text-white my-1 w-full"
                  onClick={() => {
                    navigate(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.icon}
                  {link.label}
                </Button>
              ))}

            <div className="flex items-center my-2">
              <LanguageSwitcher />
            </div>

            {isAuthenticated && (
              <Button 
                variant="destructive" 
                className="my-1 w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t("navbar.logout")}
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
