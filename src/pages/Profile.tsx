
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Users, LogOut, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getProfile, updateProfile, UserProfile } from "@/lib/data-service";

const Profile = () => {
  const { user, isAdmin, logout } = useAuthContext();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [syndicate, setSyndicate] = useState("");
  const [about, setAbout] = useState("");
  const [trophies, setTrophies] = useState(0);
  const [role, setRole] = useState("user");
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profile = await getProfile(user.id);
        
        if (profile) {
          setUsername(profile.username || "");
          setSyndicate(profile.syndicate || "");
          setAbout(profile.about || "");
          setTrophies(profile.trophies || 0);
          setRole(profile.role || "user");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: t("profile.error"),
          description: t("profile.errorLoading"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, toast, t]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setSaving(true);
      
      await updateProfile(user.id, {
        username,
        syndicate,
        about,
        trophies,
      });
      
      toast({
        title: t("profile.success"),
        description: t("profile.profileUpdated"),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("profile.error"),
        description: t("profile.errorUpdating"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const incrementTrophies = () => {
    setTrophies(prev => prev + 1);
  };

  const decrementTrophies = () => {
    setTrophies(prev => Math.max(0, prev - 1));
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <MainLayout isAuthenticated={!!user} isAdmin={isAdmin} onLogout={logout}>
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <User className="inline-block mr-2" />
          {t("profile.title")}
        </h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t("profile.info")}</TabsTrigger>
            <TabsTrigger value="account">{t("profile.account")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.personalInfo")}</CardTitle>
                <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="py-6 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullet"></div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="username">{t("profile.username")}</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-bullet-black border-bullet-lightgray"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="syndicate">{t("profile.syndicate")}</Label>
                        <Input
                          id="syndicate"
                          value={syndicate}
                          onChange={(e) => setSyndicate(e.target.value)}
                          className="bg-bullet-black border-bullet-lightgray"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="about">{t("profile.aboutMe")}</Label>
                        <Textarea
                          id="about"
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                          className="min-h-[100px] bg-bullet-black border-bullet-lightgray"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="trophies">{t("profile.trophies")}</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={decrementTrophies}
                            className="h-8 w-8"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Input
                            id="trophies"
                            type="number"
                            value={trophies}
                            onChange={(e) => setTrophies(parseInt(e.target.value) || 0)}
                            className="bg-bullet-black border-bullet-lightgray"
                            min={0}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={incrementTrophies}
                            className="h-8 w-8"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="bg-bullet hover:bg-bullet-dark ml-auto"
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t("profile.saving")}
                      </div>
                    ) : (
                      t("profile.save")
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.accountSettings")}</CardTitle>
                <CardDescription>{t("profile.accountSettingsDesc")}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("profile.email")}</Label>
                  <div className="p-2 bg-bullet-black/50 rounded border border-bullet-lightgray">
                    {user.email}
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center gap-2 p-2 bg-bullet/10 rounded">
                    <Shield className="text-bullet" />
                    <span className="font-semibold">{t("profile.role")}: {role}</span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="destructive" 
                  className="ml-auto"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2" />
                  {t("navbar.logout")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
