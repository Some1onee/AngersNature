import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Users, MapPin, Calendar, Leaf, Award, MessageSquare, 
  TrendingUp, AlertCircle, Shield, Settings, UserCog,
  Trash2, Mail, Database, Activity, BarChart3, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const AdminNew = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalades: 0,
    totalEvents: 0,
    totalComments: 0,
    totalBadges: 0,
    totalGroups: 0,
  });
  
  const [users, setUsers] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Charger les vraies statistiques
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Compter les vrais utilisateurs depuis auth.users via user_roles
        const { count: usersCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });

        // Compter les balades
        const { count: baladesCount } = await supabase
          .from('balades')
          .select('*', { count: 'exact', head: true });

        // Compter les événements
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        // Compter les commentaires
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true });

        // Compter les badges débloqués (user_badges)
        const { count: badgesCount } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true });

        // Compter les groupes
        const { count: groupsCount } = await supabase
          .from('user_groups')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: usersCount || 0,
          totalBalades: baladesCount || 0,
          totalEvents: eventsCount || 0,
          totalComments: commentsCount || 0,
          totalBadges: badgesCount || 0,
          totalGroups: groupsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Charger les utilisateurs via la vue user_info_admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Utiliser la vue qui combine auth.users et user_roles
        const { data: usersData, error } = await supabase
          .from('user_info_admin')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Erreur lors du chargement des utilisateurs');
          setUsers([]);
        } else {
          setUsers(usersData || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
        setUsers([]);
      }
    };

    if (selectedTab === 'users') {
      fetchUsers();
    }
  }, [selectedTab]);

  const copyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast.success('ID copié dans le presse-papier');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-12 w-12 text-white" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Panel Administrateur
              </h1>
              <p className="text-lg text-white/90">
                Gérez votre plateforme Angers Nature
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques globales */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold">{stats.totalBalades}</p>
                <p className="text-sm text-muted-foreground">Balades</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Événements</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-3xl font-bold">{stats.totalComments}</p>
                <p className="text-sm text-muted-foreground">Commentaires</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-3xl font-bold">{stats.totalBadges}</p>
                <p className="text-sm text-muted-foreground">Badges</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                <p className="text-3xl font-bold">{stats.totalGroups}</p>
                <p className="text-sm text-muted-foreground">Groupes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="users">
                <UserCog className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="content">
                <Database className="h-4 w-4 mr-2" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="moderation">
                <AlertCircle className="h-4 w-4 mr-2" />
                Modération
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Onglet Aperçu */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Aucune activité récente pour le moment
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Tendances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Aucune donnée de tendance disponible
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Utilisateurs */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Consultez la liste des utilisateurs. Pour changer un rôle, copiez l'ID et modifiez-le dans Supabase.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {user.email?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Inscrit {formatDistanceToNow(new Date(user.created_at), { 
                                  addSuffix: true, 
                                  locale: fr 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </Badge>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyUserId(user.id)}
                            >
                              Copier ID
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Contenu */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Balades</CardTitle>
                    <CardDescription>{stats.totalBalades} balades au total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Gérer les balades
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Événements</CardTitle>
                    <CardDescription>{stats.totalEvents} événements au total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Gérer les événements
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Jardins partagés</CardTitle>
                    <CardDescription>Gérer les jardins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Gérer les jardins
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Associations</CardTitle>
                    <CardDescription>Gérer les associations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Gérer les associations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Modération */}
            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Signalements en attente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Aucun signalement en attente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commentaires récents</CardTitle>
                  <CardDescription>
                    {stats.totalComments} commentaires au total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Modérer les commentaires
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Paramètres */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de la plateforme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Inscriptions ouvertes</p>
                      <p className="text-sm text-muted-foreground">
                        Permettre aux nouveaux utilisateurs de s'inscrire
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode maintenance</p>
                      <p className="text-sm text-muted-foreground">
                        Désactiver temporairement le site
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Modération automatique</p>
                      <p className="text-sm text-muted-foreground">
                        Activer le filtrage automatique des contenus
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Zone de danger
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    Réinitialiser toutes les statistiques
                  </Button>
                  <Button variant="outline" className="w-full text-destructive">
                    Supprimer tous les commentaires
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdminNew;
