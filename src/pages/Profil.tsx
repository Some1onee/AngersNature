import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { EcoImpactWidget } from "@/components/EcoImpactWidget";
import { BadgesDisplay } from "@/components/BadgesDisplay";
import { MessagingInterface } from "@/components/MessagingInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useEcoImpact } from "@/hooks/useEcoImpact";
import { useBadges } from "@/hooks/useBadges";
import { supabase } from "@/lib/supabaseClient";
import { 
  Heart, MapPin, Calendar, Users, Leaf, Settings, Camera, 
  UserPlus, MessageSquare, Share2, TrendingUp, Award,
  Send, Search, Plus, Map, Activity, CheckCircle2, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

const Profil = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { stats } = useEcoImpact();
  const { badges } = useBadges();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchFriend, setSearchFriend] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [shareLocation, setShareLocation] = useState("");
  
  // États pour les vraies données
  const [friendsCount, setFriendsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const favoritesByType = {
    balade: favorites.filter(f => f.type === 'balade'),
    event: favorites.filter(f => f.type === 'event'),
    garden: favorites.filter(f => f.type === 'garden'),
    association: favorites.filter(f => f.type === 'association'),
  };

  const typeIcons = {
    balade: MapPin,
    event: Calendar,
    garden: Leaf,
    association: Users,
  };

  const typeLabels = {
    balade: 'Balades',
    event: 'Événements',
    garden: 'Jardins',
    association: 'Associations',
  };

  const userLevel = Math.floor(stats.walksCompleted / 5) + 1;
  const nextLevelProgress = ((stats.walksCompleted % 5) / 5) * 100;

  // Récupérer les vraies données depuis Supabase
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Nombre d'amis (friendships acceptées)
        const { count: friendsCount } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');
        
        setFriendsCount(friendsCount || 0);

        // Nombre de demandes en attente (où user est le destinataire)
        const { count: pendingCount } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .eq('friend_id', user.id)
          .eq('status', 'pending');
        
        setPendingRequestsCount(pendingCount || 0);

        // Nombre de groupes dont l'utilisateur est membre
        const { count: groupsCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        setGroupsCount(groupsCount || 0);

      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header avec bannière et photo de profil */}
      <section className="relative">
        {/* Bannière */}
        <div className="h-48 bg-gradient-to-r from-primary via-primary-light to-accent relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560')] bg-cover bg-center opacity-30"></div>
          <Button 
            className="absolute top-4 right-4 z-10" 
            variant="secondary" 
            size="sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            Changer la bannière
          </Button>
        </div>

        {/* Profil info */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                    {user?.email?.substring(0, 2).toUpperCase() || "AN"}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Infos utilisateur */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      {user?.user_metadata?.username || user?.email?.split('@')[0] || "Éco-Citoyen"}
                    </h1>
                    <p className="text-muted-foreground mb-3">
                      {user?.email || "membre@angers-nature.fr"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        Niveau {userLevel}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {badges.length} badges
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Heart className="h-3 w-3" />
                        {favorites.length} favoris
                      </Badge>
                    </div>
                  </div>

                  <Link to="/settings">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Button>
                  </Link>
                </div>

                {/* Progression niveau */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Niveau {userLevel}</span>
                    <span className="font-medium">Niveau {userLevel + 1}</span>
                  </div>
                  <Progress value={nextLevelProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Plus que {5 - (stats.walksCompleted % 5)} balades pour atteindre le niveau suivant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques rapides */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{stats.walksCompleted}</p>
                <p className="text-sm text-muted-foreground">Balades</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold">{stats.co2Saved.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">kg CO₂</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-bold">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : friendsCount}
                </p>
                <p className="text-sm text-muted-foreground">Amis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-3xl font-bold">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : groupsCount}
                </p>
                <p className="text-sm text-muted-foreground">Groupes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contenu principal avec onglets */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="friends">Amis</TabsTrigger>
              <TabsTrigger value="groups">Groupes</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="map">Carte</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>

            {/* Onglet Aperçu */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <EcoImpactWidget />
                <BadgesDisplay />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Mes favoris ({favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun favori pour le moment
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {(Object.keys(favoritesByType) as Array<keyof typeof favoritesByType>).map((type) => {
                        const items = favoritesByType[type];
                        if (items.length === 0) return null;
                        const Icon = typeIcons[type];
                        return (
                          <div key={type}>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {typeLabels[type]} ({items.length})
                            </h3>
                            <div className="grid gap-2">
                              {items.slice(0, 3).map((fav) => (
                                <div key={fav.id} className="p-3 rounded-lg border hover:bg-accent/5">
                                  <p className="font-medium">{fav.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Amis */}
            <TabsContent value="friends" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trouver des amis</CardTitle>
                  <CardDescription>Recherchez et ajoutez des éco-citoyens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Rechercher par nom..." 
                      value={searchFriend}
                      onChange={(e) => setSearchFriend(e.target.value)}
                    />
                    <Button>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/friends">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-bold text-center mb-2">Mes amis</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Gérez votre liste d'amis et vos demandes
                      </p>
                      <Button className="w-full">
                        Voir mes amis →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-bold text-center mb-2">Invitations</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      {loading ? (
                        "Chargement..."
                      ) : pendingRequestsCount > 0 ? (
                        `Vous avez ${pendingRequestsCount} demande${pendingRequestsCount > 1 ? 's' : ''} d'ami en attente`
                      ) : (
                        "Aucune demande en attente"
                      )}
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir les demandes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Groupes */}
            <TabsContent value="groups" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un groupe</CardTitle>
                  <CardDescription>Rassemblez des éco-citoyens autour d'un intérêt commun</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nom du groupe..." 
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Link to="/groups">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold text-center mb-2">Mes groupes</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      Gérez vos groupes de balades et événements
                    </p>
                    <Button className="w-full">
                      Voir mes groupes →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>

            {/* Onglet Messages */}
            <TabsContent value="messages" className="space-y-6 mt-6">
              <MessagingInterface />
            </TabsContent>

            {/* Onglet Carte / Localisation */}
            <TabsContent value="map" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Partager ma localisation
                  </CardTitle>
                  <CardDescription>
                    Partagez votre position avec vos amis ou groupes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Où êtes-vous ? (ex: Parc Saint-Nicolas)" 
                      value={shareLocation}
                      onChange={(e) => setShareLocation(e.target.value)}
                    />
                    <Button>
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Mes lieux favoris</h3>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Jardin du Mail</p>
                            <p className="text-xs text-muted-foreground">Centre-ville</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Étang Saint-Nicolas</p>
                            <p className="text-xs text-muted-foreground">La Roseraie</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Activité */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activité récente
                  </CardTitle>
                  <CardDescription>Votre historique d'actions sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Historique d'activités bientôt disponible
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Retrouvez ici toutes vos actions sur la plateforme
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

    </div>
  );
};

export default Profil;
