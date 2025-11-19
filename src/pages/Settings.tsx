import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2, Save, User, Bell, Lock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
    bio: user?.user_metadata?.bio || '',
    avatar_url: user?.user_metadata?.avatar_url || '',
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    badge_notifications: true,
    friend_requests: true,
    group_invites: true,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: profileData.username,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        }
      });

      if (error) throw error;

      toast.success('Profil mis à jour !');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                Vous devez être connecté pour accéder aux paramètres
              </p>
              <Button onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Paramètres
          </h1>
          <p className="text-lg text-muted-foreground">
            Gérez votre profil et vos préférences
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          
          {/* Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du profil
              </CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="Votre nom d'utilisateur"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL de l'avatar</Label>
                <Input
                  id="avatar_url"
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez des emails pour les événements importants
                  </p>
                </div>
                <Switch
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, email_notifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Badges débloqués</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications quand vous débloquez un badge
                  </p>
                </div>
                <Switch
                  checked={notifications.badge_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, badge_notifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Demandes d'ami</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les nouvelles demandes
                  </p>
                </div>
                <Switch
                  checked={notifications.friend_requests}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, friend_requests: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invitations aux groupes</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications quand vous êtes invité à un groupe
                  </p>
                </div>
                <Switch
                  checked={notifications.group_invites}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, group_invites: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Gérez vos paramètres de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full">
                Télécharger mes données
              </Button>
            </CardContent>
          </Card>

          {/* Zone de danger */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Zone de danger
              </CardTitle>
              <CardDescription>
                Actions irréversibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Supprimer mon compte
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Cette action est irréversible. Toutes vos données seront supprimées.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
};

export default Settings;
