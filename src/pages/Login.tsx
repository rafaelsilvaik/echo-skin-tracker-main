
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t("auth.errorLogin"),
        description: t("auth.invalidCredentials"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await signIn(email, password);
      navigate("/");
    } catch (error: any) {
      toast({
        title: t("auth.errorLogin"),
        description: error.message || t("auth.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bullet-black p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div 
        className="text-4xl sm:text-5xl font-rajdhani font-bold text-bullet cursor-pointer mb-8 text-center"
        onClick={() => navigate("/")}
      >
        <span className="animate-pulse-glow">BULLET</span>
        <span className="text-white ml-2">ECHO</span>
        <span className="text-bullet ml-2">CHECKLIST</span>
      </div>
      
      <Card className="w-full max-w-md bg-bullet-gray border-bullet-lightgray">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t("auth.login")}</CardTitle>
          <CardDescription className="text-center">{t("auth.pleaseLogin")}</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.emailPlaceholder")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-bullet-black border-bullet-lightgray"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t("auth.passwordPlaceholder")}</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-bullet hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-bullet-black border-bullet-lightgray"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full bg-bullet hover:bg-bullet-dark"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("auth.login")}...
                </div>
              ) : (
                t("auth.login")
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <Link to="/register" className="text-bullet hover:underline">
                  {t("auth.createAccount")}
                </Link>
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
