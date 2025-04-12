import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePageVisibility } from "@/lib/hooks/usePageVisibility";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare,
  Filter,
  Check,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getSkins,
  getHeroes,
  getUserSkins,
  toggleUserSkin,
  Hero,
  Skin,
} from "@/lib/data-service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Skins = () => {
  const { user, isAdmin, logout } = useAuthContext();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State for skins and filters
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [userSkins, setUserSkins] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [heroFilter, setHeroFilter] = useState<number | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOwned, setShowOwned] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const skinsPerPage = 20;

  // Função para carregar os dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Carregando dados de skins...");

      // Fetch heroes
      const heroesData = await getHeroes();
      setHeroes(heroesData);

      // Fetch skins
      const skinsData = await getSkins();
      setSkins(skinsData);

      // Fetch user skins if user is authenticated
      if (user) {
        const userSkinsData = await getUserSkins(user.id);
        setUserSkins(new Set(userSkinsData.map(skin => skin.skin_id)));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: t("skins.error"),
        description: t("skins.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, t]);

  // Usar o hook de visibilidade para recarregar dados quando a aba ficar visível
  usePageVisibility(loadData);

  // Handle toggling a skin (add/remove from user's collection)
  const handleToggleSkin = async (skinId: number) => {
    if (!user) return;

    try {
      const newOwned = !userSkins.has(skinId);
      await toggleUserSkin(user.id, skinId, newOwned);

      // Update local state
      const updatedUserSkins = new Set(userSkins);
      if (newOwned) {
        updatedUserSkins.add(skinId);
      } else {
        updatedUserSkins.delete(skinId);
      }
      setUserSkins(updatedUserSkins);

      toast({
        title: t("skins.success"),
        description: newOwned
          ? t("skins.skinAdded")
          : t("skins.skinRemoved"),
      });
    } catch (error) {
      console.error("Error toggling skin:", error);
      toast({
        title: t("skins.error"),
        description: t("skins.errorToggling"),
        variant: "destructive",
      });
    }
  };

  // Filter skins based on current filters
  const filteredSkins = skins.filter((skin) => {
    // Hero filter
    if (heroFilter !== "all" && skin.hero_id !== heroFilter) {
      return false;
    }

    // Rarity filter
    if (rarityFilter !== "all" && skin.rarity !== rarityFilter) {
      return false;
    }

    // Search query
    if (
      searchQuery &&
      !skin.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Owned/missing filters
    if (showOwned && !userSkins.has(skin.id)) {
      return false;
    }

    if (showMissing && userSkins.has(skin.id)) {
      return false;
    }

    return true;
  });

  // Calculate pagination
  const indexOfLastSkin = currentPage * skinsPerPage;
  const indexOfFirstSkin = indexOfLastSkin - skinsPerPage;
  const currentSkins = filteredSkins.slice(indexOfFirstSkin, indexOfLastSkin);
  const totalPages = Math.ceil(filteredSkins.length / skinsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [heroFilter, rarityFilter, searchQuery, showOwned, showMissing]);

  // Calculate completion statistics
  const calculateStats = () => {
    if (skins.length === 0) return { total: 0, owned: 0, percentage: 0 };

    const total = skins.length;
    const owned = userSkins.size;
    const percentage = Math.round((owned / total) * 100);

    return { total, owned, percentage };
  };

  const stats = calculateStats();

  // Get unique rarities from skins
  const rarities = Array.from(new Set(skins.map((skin) => skin.rarity))).sort();

  // Get hero name by ID
  const getHeroName = (heroId: number) => {
    return heroes.find((hero) => hero.id === heroId)?.name || "Unknown";
  };

  // Get color class based on rarity
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-amber-500";
      case "mythic":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <MainLayout isAuthenticated={!!user} isAdmin={isAdmin} onLogout={logout}>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <CheckSquare className="inline-block mr-2" />
          {t("skins.title")}
        </h1>

        <div className="glass-panel p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold">{t("skins.collectionStats")}</h2>
              <p className="text-muted-foreground">
                {t("skins.totalOwned")}: {stats.owned} / {stats.total}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Progress value={stats.percentage} className="w-40 h-3" />
              <span className="font-bold">{stats.percentage}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("skins.searchPlaceholder")}</label>
              <Input
                placeholder={t("skins.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bullet-black border-bullet-lightgray"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("skins.filterByHero")}</label>
              <Select
                value={heroFilter.toString()}
                onValueChange={(value) =>
                  setHeroFilter(value === "all" ? "all" : parseInt(value))
                }
              >
                <SelectTrigger className="bg-bullet-black border-bullet-lightgray">
                  <SelectValue placeholder={t("skins.allHeroes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("skins.allHeroes")}</SelectItem>
                  {heroes.map((hero) => (
                    <SelectItem key={hero.id} value={hero.id.toString()}>
                      {hero.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("skins.filterByRarity")}</label>
              <Select
                value={rarityFilter.toString()}
                onValueChange={(value) => setRarityFilter(value)}
              >
                <SelectTrigger className="bg-bullet-black border-bullet-lightgray">
                  <SelectValue placeholder={t("skins.allRarities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("skins.allRarities")}</SelectItem>
                  {rarities.map((rarity) => (
                    <SelectItem key={rarity} value={rarity}>
                      {t(`skins.rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="owned"
                checked={showOwned}
                onCheckedChange={(checked) => setShowOwned(!!checked)}
              />
              <label htmlFor="owned" className="text-sm cursor-pointer">
                {t("skins.owned")}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="missing"
                checked={showMissing}
                onCheckedChange={(checked) => setShowMissing(!!checked)}
              />
              <label htmlFor="missing" className="text-sm cursor-pointer">
                {t("skins.notOwned")}
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHeroFilter("all");
                setRarityFilter("all");
                setSearchQuery("");
                setShowOwned(false);
                setShowMissing(false);
              }}
              className="ml-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("skins.clearFilters") || "Clear Filters"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bullet"></div>
          </div>
        ) : (
          <>
            {currentSkins.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">
                  {t("skins.noSkinsFound")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {currentSkins.map((skin) => (
                  <Card
                    key={skin.id}
                    className={`overflow-hidden transition-all ${
                      userSkins.has(skin.id)
                        ? "border-bullet border-2"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="relative">
                      {skin.image_url ? (
                        <img
                          src={skin.image_url}
                          alt={skin.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-bullet-black flex items-center justify-center">
                          <span className="text-muted-foreground">
                            {t("skins.noImage") || "No Image"}
                          </span>
                        </div>
                      )}
                      <Badge
                        className={`absolute top-2 right-2 ${getRarityColor(
                          skin.rarity
                        )}`}
                      >
                        {t(`skins.rarity${skin.rarity.charAt(0).toUpperCase() + skin.rarity.slice(1)}`) || skin.rarity}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{skin.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getHeroName(skin.hero_id)}
                          </p>
                        </div>
                        <Button
                          variant={userSkins.has(skin.id) ? "default" : "outline"}
                          size="icon"
                          className={
                            userSkins.has(skin.id)
                              ? "bg-bullet hover:bg-bullet-dark"
                              : ""
                          }
                          onClick={() => handleToggleSkin(skin.id)}
                        >
                          {userSkins.has(skin.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Skins;
