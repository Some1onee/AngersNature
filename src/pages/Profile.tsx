import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } else {
      toast.success('Profil mis à jour !');
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username,
      full_name: profile.full_name || '',
      bio: profile.bio || '',
    });
    setEditing(false);
  };

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mon profil</CardTitle>
                {!editing ? (
                  <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editing}
                    placeholder="Parlez-nous de vous..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Votre activité sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Commentaires</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Amis</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Groupes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
