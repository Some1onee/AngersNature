import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, UserPlus, Check, X, Search } from 'lucide-react';

interface Friendship {
  id: string;
  status: string;
  user_id: string;
  friend_id: string;
  profiles: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      loadFriendships();
    }
  }, [user, authLoading, navigate]);

  const loadFriendships = async () => {
    if (!user) return;

    try {
      // Charger les amis acceptés où je suis user_id
      const { data: sentFriendships, error: sentError } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (sentError) throw sentError;

      // Charger les amis acceptés où je suis friend_id (ceux qui m'ont envoyé une demande que j'ai acceptée)
      const { data: receivedFriendships, error: receivedError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      if (receivedError) throw receivedError;

      // Combiner les deux listes
      const allFriendships = [...(sentFriendships || []), ...(receivedFriendships || [])];

      // Charger les profils des amis
      if (allFriendships.length > 0) {
        // Pour les friendships où je suis user_id, l'ami est friend_id
        // Pour les friendships où je suis friend_id, l'ami est user_id
        const friendIds = allFriendships.map(f => 
          f.user_id === user.id ? f.friend_id : f.user_id
        );
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', friendIds);

        const friendsWithProfiles = allFriendships.map(friendship => {
          const friendId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
          return {
            ...friendship,
            profiles: profilesData?.find(p => p.id === friendId),
          };
        });

        setFriends(friendsWithProfiles as Friendship[]);
      } else {
        setFriends([]);
      }

      // Charger les demandes en attente reçues (sans jointure)
      const { data: requestsData, error: requestsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Charger les profils des demandeurs
      if (requestsData && requestsData.length > 0) {
        const userIds = requestsData.map(r => r.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', userIds);

        const requestsWithProfiles = requestsData.map(request => ({
          ...request,
          profiles: profilesData?.find(p => p.id === request.user_id),
        }));

        setRequests(requestsWithProfiles as Friendship[]);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading friendships:', error);
      toast.error('Erreur lors du chargement des amis');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    setSearching(true);
    try {
      console.log('Recherche de:', searchQuery);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) {
        console.error('Erreur recherche:', error);
        throw error;
      }
      
      console.log('Résultats trouvés:', data);
      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info('Aucun utilisateur trouvé avec ce nom');
      } else {
        toast.success(`${data.length} utilisateur(s) trouvé(s)`);
      }
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast.error('Erreur lors de la recherche: ' + (error.message || ''));
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      });

      if (error) throw error;
      toast.success('Demande d\'ami envoyée !');
      setSearchResults(searchResults.filter((u) => u.id !== friendId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Demande acceptée !');
      loadFriendships();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Erreur lors de l\'acceptation');
    }
  };

  const declineRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);

      if (error) throw error;
      toast.success('Demande refusée');
      setRequests(requests.filter((r) => r.id !== friendshipId));
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Erreur lors du refus');
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
          <h1 className="text-3xl font-bold mb-8">Mes amis</h1>

          <Tabs defaultValue="friends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                Amis ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests">
                Demandes ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="search">Rechercher</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              {friends.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Vous n'avez pas encore d'amis. Commencez par rechercher des utilisateurs !
                  </CardContent>
                </Card>
              ) : (
                friends.map((friendship) => (
                  <Card key={friendship.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friendship.profiles.avatar_url} />
                          <AvatarFallback>
                            {friendship.profiles.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friendship.profiles.username}</p>
                          {friendship.profiles.full_name && (
                            <p className="text-sm text-muted-foreground">
                              {friendship.profiles.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Ami</Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Aucune demande en attente
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.profiles.avatar_url} />
                          <AvatarFallback>
                            {request.profiles.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.profiles.username}</p>
                          {request.profiles.full_name && (
                            <p className="text-sm text-muted-foreground">
                              {request.profiles.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => acceptRequest(request.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineRequest(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des utilisateurs</CardTitle>
                  <CardDescription>Trouvez des amis par leur nom d'utilisateur</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nom d'utilisateur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={searching}>
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((profile) => (
                    <Card key={profile.id}>
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>
                              {profile.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.username}</p>
                            {profile.full_name && (
                              <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                            )}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => sendFriendRequest(profile.id)}>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Friends;
