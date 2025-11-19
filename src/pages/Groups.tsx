import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Users2, Lock, Globe } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  creator_id: string;
  member_count?: number;
}

const Groups = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      loadGroups();
    }
  }, [user, authLoading, navigate]);

  const loadGroups = async () => {
    if (!user) return;

    try {
      // Charger les groupes dont l'utilisateur est membre
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          walk_groups (
            id,
            name,
            description,
            is_private,
            creator_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const groupsData = data
        ?.map((item: any) => item.walk_groups)
        .filter(Boolean) || [];
      
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);

    try {
      // Créer le groupe
      const { data: groupData, error: groupError } = await supabase
        .from('walk_groups')
        .insert({
          name: formData.name,
          description: formData.description,
          is_private: formData.is_private,
          creator_id: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Ajouter le créateur comme admin du groupe
      const { error: memberError } = await supabase.from('group_members').insert({
        group_id: groupData.id,
        user_id: user.id,
        role: 'admin',
      });

      if (memberError) throw memberError;

      toast.success('Groupe créé !');
      setDialogOpen(false);
      setFormData({ name: '', description: '', is_private: false });
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Erreur lors de la création du groupe');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Mes groupes de balades</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau groupe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du groupe *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_private"
                      checked={formData.is_private}
                      onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_private" className="cursor-pointer">
                      Groupe privé (sur invitation uniquement)
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {groups.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucun groupe</CardTitle>
                <CardDescription>
                  Créez votre premier groupe pour organiser des balades avec vos amis !
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Users2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Les groupes permettent de discuter et organiser des sorties nature ensemble.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {groups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      {group.is_private ? (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Privé
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users2 className="h-4 w-4" />
                      <span>Voir les membres et messages</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
