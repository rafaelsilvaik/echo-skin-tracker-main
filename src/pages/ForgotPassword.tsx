
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: t("auth.resetPassword"),
        description: t("auth.invalidCredentials"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
      toast({
        title: t("auth.resetPassword"),
        description: t("auth.resetPasswordInstructions"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.resetPassword"),
        description: error.message,
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
          <CardTitle className="text-2xl text-center">{t("auth.resetPassword")}</CardTitle>
          <CardDescription className="text-center">{t("auth.resetPasswordInstructions")}</CardDescription>
        </CardHeader>
        
        {!sent ? (
          <form onSubmit={handleResetPassword}>
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
                    {t("auth.send")}...
                  </div>
                ) : (
                  t("auth.send")
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <span className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-bullet hover:underline">
                    {t("auth.backToLogin")}
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {t("auth.resetPasswordInstructions")}
            </p>
            <Button 
              onClick={() => navigate("/login")} 
              className="mt-4 bg-bullet hover:bg-bullet-dark"
            >
              {t("auth.backToLogin")}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
