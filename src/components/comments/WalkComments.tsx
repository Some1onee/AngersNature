import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MessageSquare, Star, Loader2, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
  user_id: string;
}

interface WalkCommentsProps {
  walkId: string;
}

export function WalkComments({ walkId }: WalkCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    loadComments();
  }, [walkId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('walk_comments')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('walk_id', walkId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('walk_comments').insert({
        walk_id: walkId,
        user_id: user.id,
        content: newComment.trim(),
        rating,
      });

      if (error) throw error;

      toast.success('Commentaire ajouté !');
      setNewComment('');
      setRating(null);
      loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('walk_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Commentaire supprimé');
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const averageRating = comments.length > 0
    ? comments.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / comments.filter(c => c.rating).length
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires ({comments.length})
            </CardTitle>
            {averageRating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulaire de nouveau commentaire */}
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-3 border-b pb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Note (optionnel)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star === rating ? null : star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating && star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Partagez votre expérience sur cette balade..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publier
              </Button>
            </form>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="py-4 text-center text-sm text-muted-foreground">
                Connectez-vous pour laisser un commentaire
              </CardContent>
            </Card>
          )}

          {/* Liste des commentaires */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun commentaire pour le moment. Soyez le premier !
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.profiles.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.profiles.username}
                          </span>
                          {comment.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(comment.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
