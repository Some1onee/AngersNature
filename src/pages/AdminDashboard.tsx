import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Leaf,
  Building2,
  ShoppingBag,
  Star,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import WalksManager from "@/components/admin/WalksManager";
import EventsManager from "@/components/admin/EventsManager";
import SpacesManager from "@/components/admin/SpacesManager";
import GardensManager from "@/components/admin/GardensManager";
import AssociationsManager from "@/components/admin/AssociationsManager";
import MarketsManager from "@/components/admin/MarketsManager";
import UsersManager from "@/components/admin/UsersManager";

type Stats = {
  users: number;
  walks: number;
  events: number;
  natural_spaces: number;
  gardens: number;
  associations: number;
  markets: number;
  ratings: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    walks: 0,
    events: 0,
    natural_spaces: 0,
    gardens: 0,
    associations: 0,
    markets: 0,
    ratings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [
        { count: usersCount },
        { count: walksCount },
        { count: eventsCount },
        { count: spacesCount },
        { count: gardensCount },
        { count: assosCount },
        { count: marketsCount },
        { count: ratingsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("walks").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("natural_spaces").select("*", { count: "exact", head: true }),
        supabase.from("gardens").select("*", { count: "exact", head: true }),
        supabase.from("associations").select("*", { count: "exact", head: true }),
        supabase.from("markets").select("*", { count: "exact", head: true }),
        supabase.from("site_ratings").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        users: usersCount || 0,
        walks: walksCount || 0,
        events: eventsCount || 0,
        natural_spaces: spacesCount || 0,
        gardens: gardensCount || 0,
        associations: assosCount || 0,
        markets: marketsCount || 0,
        ratings: ratingsCount || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
      toast.error("Erreur de chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      link: "#users",
    },
    {
      title: "Balades",
      value: stats.walks,
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-50",
      link: "#walks",
    },
    {
      title: "Événements",
      value: stats.events,
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      link: "#events",
    },
    {
      title: "Espaces naturels",
      value: stats.natural_spaces,
      icon: Leaf,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      link: "#spaces",
    },
    {
      title: "Jardins partagés",
      value: stats.gardens,
      icon: Leaf,
      color: "text-lime-500",
      bgColor: "bg-lime-50",
      link: "#gardens",
    },
    {
      title: "Associations",
      value: stats.associations,
      icon: Building2,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      link: "#associations",
    },
    {
      title: "Marchés",
      value: stats.markets,
      icon: ShoppingBag,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      link: "#markets",
    },
    {
      title: "Notes du site",
      value: stats.ratings,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      link: "/admin/ratings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <BarChart3 className="h-10 w-10 text-primary" />
            Tableau de bord Admin
          </h1>
          <p className="text-muted-foreground">
            Gérez toutes les données du site Angers Nature
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            const isExternal = stat.link.startsWith("/");
            const Component = isExternal ? Link : "a";
            
            return (
              <Component
                key={stat.title}
                to={isExternal ? stat.link : undefined}
                href={!isExternal ? stat.link : undefined}
                className="block"
              >
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </Component>
            );
          })}
        </div>

        {/* Tabs pour gérer les données */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Gestion des données</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="walks" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="walks">Balades</TabsTrigger>
                <TabsTrigger value="events">Événements</TabsTrigger>
                <TabsTrigger value="spaces">Espaces</TabsTrigger>
                <TabsTrigger value="gardens">Jardins</TabsTrigger>
                <TabsTrigger value="associations">Associations</TabsTrigger>
                <TabsTrigger value="markets">Marchés</TabsTrigger>
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              </TabsList>

              {/* Chaque TabsContent sera implémenté dans des composants séparés */}
              <TabsContent value="walks" className="space-y-4">
                <WalksManager />
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <EventsManager />
              </TabsContent>

              <TabsContent value="spaces" className="space-y-4">
                <SpacesManager />
              </TabsContent>

              <TabsContent value="gardens" className="space-y-4">
                <GardensManager />
              </TabsContent>

              <TabsContent value="associations" className="space-y-4">
                <AssociationsManager />
              </TabsContent>

              <TabsContent value="markets" className="space-y-4">
                <MarketsManager />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <UsersManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Liens rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Liens rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/ratings">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Voir toutes les notes
                </Button>
              </Link>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ouvrir Supabase Dashboard
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => fetchStats()}>
                <Loader2 className="h-4 w-4 mr-2" />
                Rafraîchir les statistiques
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
