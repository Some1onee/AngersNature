import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, TrendingUp, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type Rating = {
  id: string;
  user_id: string;
  rating: number;
  message: string | null;
  page_url: string | null;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
};

const AdminRatings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    withMessage: 0,
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);

      // Récupérer les notes sans jointure
      const { data, error } = await supabase
        .from("site_ratings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur SQL:", error);
        throw error;
      }

      // Récupérer les profils séparément si on a des notes
      if (data && data.length > 0) {
        const userIds = data.map((r) => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);

        // Associer les profils aux notes
        const ratingsWithProfiles = data.map((rating) => ({
          ...rating,
          profiles: profilesData?.find((p) => p.id === rating.user_id),
        }));

        setRatings(ratingsWithProfiles);

        // Calculer les stats
        const avg = data.reduce((sum, r) => sum + Number(r.rating), 0) / data.length;
        const withMsg = data.filter((r) => r.message).length;
        
        setStats({
          average: avg,
          total: data.length,
          withMessage: withMsg,
        });
      } else {
        setRatings([]);
        setStats({
          average: 0,
          total: 0,
          withMessage: 0,
        });
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des notes:", error);
      toast.error("Erreur: " + (error.message || "Impossible de charger les notes"));
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative inline-block">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Notes du site</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average.toFixed(1)} / 5</div>
              <div className="flex gap-0.5 mt-2">
                {renderStars(stats.average)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de notes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2">
                utilisateurs ont noté
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avec message</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withMessage}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total > 0 ? Math.round((stats.withMessage / stats.total) * 100) : 0}% des notes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des notes */}
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune note pour le moment
              </CardContent>
            </Card>
          ) : (
            ratings.map((rating) => (
              <Card key={rating.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-0.5">
                          {renderStars(Number(rating.rating))}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {rating.rating}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {rating.profiles?.full_name || rating.profiles?.username || "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {rating.page_url && (
                      <Badge variant="outline" className="text-xs">
                        {rating.page_url}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                {rating.message && (
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm">{rating.message}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRatings;
