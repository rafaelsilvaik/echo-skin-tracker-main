
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import MainLayout from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { getUserRankings } from "@/lib/data-service";
import { usePageVisibility } from "@/lib/hooks/usePageVisibility";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trophy, Medal, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SkinRanking = () => {
  const { user, isAdmin, logout } = useAuthContext();
  const { t } = useTranslation();
  
  const { data: rankings, isLoading, error, refetch } = useQuery({
    queryKey: ['user-rankings'],
    queryFn: getUserRankings,
    // Diminuir o staleTime para recarregar mais frequentemente
    staleTime: 60 * 1000, // 1 minuto
  });

  // Função para recarregar os dados - força ignorar o cache
  const handleRefresh = useCallback(() => {
    console.log("Atualizando dados do ranking...");
    refetch({ cancelRefetch: false }); // Força uma nova requisição ignorando o cache
  }, [refetch]);

  // Usar o hook de visibilidade para recarregar dados quando a aba ficar visível
  usePageVisibility(handleRefresh);

  const getMedalIcon = (rank: number) => {
    switch(rank) {
      case 0:
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout isAuthenticated={!!user} isAdmin={isAdmin} onLogout={logout}>
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <Trophy className="inline-block mr-2" />
          {t("skinRanking.title")}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("skinRanking.title")}</CardTitle>
            <CardDescription>{t("skinRanking.description")}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullet"></div>
                <span className="ml-2">{t("skinRanking.loading")}</span>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                {t("skinRanking.error")}
              </div>
            ) : rankings && rankings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t("skinRanking.rank")}</TableHead>
                    <TableHead>{t("skinRanking.user")}</TableHead>
                    <TableHead className="text-right">{t("skinRanking.skinsCount")}</TableHead>
                    <TableHead className="text-right">{t("skinRanking.trophies")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((ranking, index) => (
                    <TableRow key={ranking.id} className={user?.id === ranking.id ? "bg-bullet/10" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getMedalIcon(index)}
                          <span className="ml-1">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2 text-bullet" />
                          {ranking.username || t("admin.unnamed")}
                          {user?.id === ranking.id && (
                            <span className="ml-2 text-xs text-bullet">(You)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{ranking.skin_count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                          {ranking.trophies}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                {t("skinRanking.noUsers")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SkinRanking;
