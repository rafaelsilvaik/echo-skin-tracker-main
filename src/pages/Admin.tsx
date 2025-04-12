import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Trash, Edit, Plus, User, CheckSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getHeroes,
  getSkins,
  createHero,
  updateHero,
  deleteHero,
  createSkin,
  updateSkin,
  deleteSkin,
  getUsers,
  Hero,
  Skin,
  UserProfile
} from "@/lib/data-service";

const Admin = () => {
  const { user, isAdmin, logout } = useAuthContext();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newHero, setNewHero] = useState({ name: "", description: "" });
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  
  const [newSkin, setNewSkin] = useState({ 
    hero_id: 0, 
    name: "", 
    rarity: "Common", 
    image_url: "" 
  });
  const [editingSkin, setEditingSkin] = useState<Skin | null>(null);
  
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [skinDialogOpen, setSkinDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'hero' | 'skin', id: number } | null>(null);
  
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: t("admin.unauthorized"),
        description: t("admin.unauthorizedDesc"),
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        try {
          const heroesData = await getHeroes();
          setHeroes(heroesData);
        } catch (error) {
          console.error("Error loading heroes:", error);
          toast({
            title: t("admin.error"),
            description: "Could not load heroes: " + (error as Error).message,
            variant: "destructive",
          });
        }
        
        try {
          const skinsData = await getSkins();
          setSkins(skinsData);
        } catch (error) {
          console.error("Error loading skins:", error);
          toast({
            title: t("admin.error"),
            description: "Could not load skins: " + (error as Error).message,
            variant: "destructive",
          });
        }
        
        try {
          const usersData = await getUsers();
          setUsers(usersData);
        } catch (error) {
          console.error("Error loading users:", error);
          toast({
            title: t("admin.error"),
            description: "Could not load users: " + (error as Error).message,
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAdmin, navigate, toast, t]);
  
  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingHero) {
        try {
          const updatedHero = await updateHero(editingHero.id, {
            name: editingHero.name,
            description: editingHero.description
          });
          
          setHeroes(heroes.map(hero => 
            hero.id === updatedHero.id ? updatedHero : hero
          ));
          
          toast({
            title: t("admin.success"),
            description: t("admin.heroUpdated"),
          });
        } catch (error) {
          console.error("Error updating hero:", error);
          toast({
            title: t("admin.error"),
            description: "Error updating hero: " + (error as Error).message,
            variant: "destructive",
          });
          return;
        }
      } else {
        try {
          const createdHero = await createHero(newHero);
          setHeroes([...heroes, createdHero]);
          
          toast({
            title: t("admin.success"),
            description: t("admin.heroCreated"),
          });
        } catch (error) {
          console.error("Error creating hero:", error);
          toast({
            title: t("admin.error"),
            description: "Error creating hero: " + (error as Error).message,
            variant: "destructive",
          });
          return;
        }
      }
      
      setNewHero({ name: "", description: "" });
      setEditingHero(null);
      setHeroDialogOpen(false);
    } catch (error) {
      console.error("Error saving hero:", error);
      toast({
        title: t("admin.error"),
        description: t("admin.errorSaving"),
        variant: "destructive",
      });
    }
  };
  
  const handleSkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSkin) {
        const updatedSkin = await updateSkin(editingSkin.id, {
          hero_id: editingSkin.hero_id,
          name: editingSkin.name,
          rarity: editingSkin.rarity,
          image_url: editingSkin.image_url
        });
        
        setSkins(skins.map(skin => 
          skin.id === updatedSkin.id ? updatedSkin : skin
        ));
        
        toast({
          title: t("admin.success"),
          description: t("admin.skinUpdated"),
        });
      } else {
        const createdSkin = await createSkin(newSkin);
        setSkins([...skins, createdSkin]);
        
        toast({
          title: t("admin.success"),
          description: t("admin.skinCreated"),
        });
      }
      
      setNewSkin({ hero_id: 0, name: "", rarity: "Common", image_url: "" });
      setEditingSkin(null);
      setSkinDialogOpen(false);
    } catch (error) {
      console.error("Error saving skin:", error);
      toast({
        title: t("admin.error"),
        description: t("admin.errorSaving"),
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!itemToDelete) return;
      
      if (itemToDelete.type === 'hero') {
        await deleteHero(itemToDelete.id);
        setHeroes(heroes.filter(hero => hero.id !== itemToDelete.id));
        
        toast({
          title: t("admin.success"),
          description: t("admin.heroDeleted"),
        });
      } else {
        await deleteSkin(itemToDelete.id);
        setSkins(skins.filter(skin => skin.id !== itemToDelete.id));
        
        toast({
          title: t("admin.success"),
          description: t("admin.skinDeleted"),
        });
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: t("admin.error"),
        description: t("admin.errorDeleting"),
        variant: "destructive",
      });
    }
  };
  
  const getHeroName = (heroId: number) => {
    return heroes.find(hero => hero.id === heroId)?.name || "Unknown";
  };
  
  if (!user || !isAdmin) {
    return null;
  }
  
  return (
    <MainLayout isAuthenticated={!!user} isAdmin={isAdmin} onLogout={logout}>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <Settings className="inline-block mr-2" />
          {t("admin.title")}
        </h1>
        
        <Tabs defaultValue="heroes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heroes">{t("admin.heroes")}</TabsTrigger>
            <TabsTrigger value="skins">{t("admin.skins")}</TabsTrigger>
            <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="heroes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t("admin.heroesManagement")}</CardTitle>
                    <CardDescription>{t("admin.heroesManagementDesc")}</CardDescription>
                  </div>
                  <Dialog open={heroDialogOpen} onOpenChange={setHeroDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingHero(null);
                          setNewHero({ name: "", description: "" });
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("admin.addHero")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingHero ? t("admin.editHero") : t("admin.addHero")}
                        </DialogTitle>
                        <DialogDescription>
                          {t("admin.heroFormDesc")}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleHeroSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="hero-name" className="text-sm font-medium">
                              {t("admin.name")}
                            </label>
                            <Input
                              id="hero-name"
                              value={editingHero ? editingHero.name : newHero.name}
                              onChange={(e) => {
                                if (editingHero) {
                                  setEditingHero({...editingHero, name: e.target.value});
                                } else {
                                  setNewHero({...newHero, name: e.target.value});
                                }
                              }}
                              className="bg-bullet-black border-bullet-lightgray"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="hero-description" className="text-sm font-medium">
                              {t("admin.description")}
                            </label>
                            <Textarea
                              id="hero-description"
                              value={editingHero ? editingHero.description || "" : newHero.description}
                              onChange={(e) => {
                                if (editingHero) {
                                  setEditingHero({...editingHero, description: e.target.value});
                                } else {
                                  setNewHero({...newHero, description: e.target.value});
                                }
                              }}
                              className="min-h-[100px] bg-bullet-black border-bullet-lightgray"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {editingHero ? t("admin.update") : t("admin.create")}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullet"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>{t("admin.name")}</TableHead>
                        <TableHead className="hidden md:table-cell">{t("admin.description")}</TableHead>
                        <TableHead>{t("admin.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {heroes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            {t("admin.noHeroes")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        heroes.map((hero) => (
                          <TableRow key={hero.id}>
                            <TableCell className="font-medium">{hero.id}</TableCell>
                            <TableCell>{hero.name}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {hero.description ? hero.description.substring(0, 50) + (hero.description.length > 50 ? "..." : "") : ""}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog open={heroDialogOpen} onOpenChange={setHeroDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="outline" onClick={() => setEditingHero(hero)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                                <Button 
                                  size="icon" 
                                  variant="destructive"
                                  onClick={() => {
                                    setItemToDelete({ type: 'hero', id: hero.id });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skins">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t("admin.skinsManagement")}</CardTitle>
                    <CardDescription>{t("admin.skinsManagementDesc")}</CardDescription>
                  </div>
                  <Dialog open={skinDialogOpen} onOpenChange={setSkinDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingSkin(null);
                          setNewSkin({ hero_id: heroes[0]?.id || 0, name: "", rarity: "Common", image_url: "" });
                        }}
                        disabled={heroes.length === 0}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("admin.addSkin")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingSkin ? t("admin.editSkin") : t("admin.addSkin")}
                        </DialogTitle>
                        <DialogDescription>
                          {t("admin.skinFormDesc")}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSkinSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="skin-hero" className="text-sm font-medium">
                              {t("admin.hero")}
                            </label>
                            <Select
                              value={String(editingSkin ? editingSkin.hero_id : newSkin.hero_id)}
                              onValueChange={(value) => {
                                const heroId = parseInt(value);
                                if (editingSkin) {
                                  setEditingSkin({...editingSkin, hero_id: heroId});
                                } else {
                                  setNewSkin({...newSkin, hero_id: heroId});
                                }
                              }}
                              required
                            >
                              <SelectTrigger className="bg-bullet-black border-bullet-lightgray">
                                <SelectValue placeholder={t("admin.selectHero")} />
                              </SelectTrigger>
                              <SelectContent>
                                {heroes.map((hero) => (
                                  <SelectItem key={hero.id} value={String(hero.id)}>
                                    {hero.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="skin-name" className="text-sm font-medium">
                              {t("admin.name")}
                            </label>
                            <Input
                              id="skin-name"
                              value={editingSkin ? editingSkin.name : newSkin.name}
                              onChange={(e) => {
                                if (editingSkin) {
                                  setEditingSkin({...editingSkin, name: e.target.value});
                                } else {
                                  setNewSkin({...newSkin, name: e.target.value});
                                }
                              }}
                              className="bg-bullet-black border-bullet-lightgray"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="skin-rarity" className="text-sm font-medium">
                              {t("admin.rarity")}
                            </label>
                            <Select
                              value={editingSkin ? editingSkin.rarity : newSkin.rarity}
                              onValueChange={(value) => {
                                if (editingSkin) {
                                  setEditingSkin({...editingSkin, rarity: value});
                                } else {
                                  setNewSkin({...newSkin, rarity: value});
                                }
                              }}
                              required
                            >
                              <SelectTrigger className="bg-bullet-black border-bullet-lightgray">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"].map((rarity) => (
                                  <SelectItem key={rarity} value={rarity}>
                                    {rarity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="skin-image" className="text-sm font-medium">
                              {t("admin.imageUrl")}
                            </label>
                            <Input
                              id="skin-image"
                              value={editingSkin ? editingSkin.image_url || "" : newSkin.image_url}
                              onChange={(e) => {
                                if (editingSkin) {
                                  setEditingSkin({...editingSkin, image_url: e.target.value});
                                } else {
                                  setNewSkin({...newSkin, image_url: e.target.value});
                                }
                              }}
                              className="bg-bullet-black border-bullet-lightgray"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {editingSkin ? t("admin.update") : t("admin.create")}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullet"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>{t("admin.name")}</TableHead>
                        <TableHead>{t("admin.hero")}</TableHead>
                        <TableHead>{t("admin.rarity")}</TableHead>
                        <TableHead>{t("admin.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            {t("admin.noSkins")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        skins.map((skin) => (
                          <TableRow key={skin.id}>
                            <TableCell className="font-medium">{skin.id}</TableCell>
                            <TableCell>{skin.name}</TableCell>
                            <TableCell>{getHeroName(skin.hero_id)}</TableCell>
                            <TableCell>{skin.rarity}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog open={skinDialogOpen} onOpenChange={setSkinDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="outline" onClick={() => setEditingSkin(skin)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </Dialog>
                                <Button 
                                  size="icon" 
                                  variant="destructive"
                                  onClick={() => {
                                    setItemToDelete({ type: 'skin', id: skin.id });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.usersManagement")}</CardTitle>
                <CardDescription>{t("admin.usersManagementDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullet"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.username")}</TableHead>
                        <TableHead>{t("admin.email")}</TableHead>
                        <TableHead>{t("admin.role")}</TableHead>
                        <TableHead>{t("admin.syndicate")}</TableHead>
                        <TableHead>{t("admin.trophies")}</TableHead>
                        <TableHead>{t("admin.joinDate")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            {t("admin.noUsers")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">
                              {profile.username || t("admin.unnamed")}
                            </TableCell>
                            <TableCell>{profile.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                profile.role === 'admin' ? 'bg-bullet text-white' : 'bg-gray-200 text-gray-800'
                              }`}>
                                {profile.role || 'user'}
                              </span>
                            </TableCell>
                            <TableCell>{profile.syndicate || "-"}</TableCell>
                            <TableCell>{profile.trophies || 0}</TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.confirmDelete")}</DialogTitle>
              <DialogDescription>
                {itemToDelete?.type === 'hero'
                  ? t("admin.confirmDeleteHero")
                  : t("admin.confirmDeleteSkin")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {t("admin.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t("admin.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Admin;
