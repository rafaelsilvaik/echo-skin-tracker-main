
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const MainLayout = ({ 
  children, 
  isAuthenticated, 
  isAdmin = false,
  onLogout 
}: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        isAdmin={isAdmin}
        onLogout={onLogout}
      />
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
