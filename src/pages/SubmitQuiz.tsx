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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X, Send } from 'lucide-react';

const SubmitQuiz = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctIndex: 0,
    explanation: '',
    difficulty: 'facile',
    category: 'Biodiversité',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      toast.error('La question est obligatoire');
      return;
    }

    if (!formData.option1.trim() || !formData.option2.trim() || !formData.option3.trim() || !formData.option4.trim()) {
      toast.error('Les 4 options sont obligatoires');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('user_quiz_submissions').insert({
        user_id: user!.id,
        question: formData.question,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correct_index: formData.correctIndex,
        explanation: formData.explanation || null,
        difficulty: formData.difficulty,
        category: formData.category,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Question soumise avec succès !', {
        description: 'Elle sera examinée par un modérateur avant publication.',
      });

      // Réinitialiser le formulaire
      setFormData({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctIndex: 0,
        explanation: '',
        difficulty: 'facile',
        category: 'Biodiversité',
      });
    } catch (error) {
      console.error('Error submitting quiz question:', error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Proposer une question de quiz</h1>
            <p className="text-muted-foreground">
              Partagez vos connaissances sur la nature angevine ! Vos questions seront examinées par notre équipe avant publication.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nouvelle question</CardTitle>
              <CardDescription>
                Créez une question pédagogique sur la biodiversité, la flore ou la faune d'Angers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question */}
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Ex: Quel oiseau au plumage noir chante tôt le matin ?"
                    rows={3}
                    required
                  />
                </div>

                {/* Options de réponse */}
                <div className="space-y-4">
                  <Label>Réponses possibles *</Label>
                  <p className="text-sm text-muted-foreground">
                    Cochez la bonne réponse
                  </p>

                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        id={`correct-${index}`}
                        name="correct"
                        checked={formData.correctIndex === index}
                        onChange={() => setFormData({ ...formData, correctIndex: index })}
                        className="rounded-full"
                      />
                      <Label htmlFor={`correct-${index}`} className="sr-only">
                        Marquer comme bonne réponse
                      </Label>
                      <Input
                        value={formData[`option${index + 1}` as keyof typeof formData] as string}
                        onChange={(e) =>
                          setFormData({ ...formData, [`option${index + 1}`]: e.target.value })
                        }
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Explication */}
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explication (optionnel)</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Expliquez pourquoi c'est la bonne réponse..."
                    rows={3}
                  />
                </div>

                {/* Métadonnées */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulté</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="difficile">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Oiseaux">Oiseaux</SelectItem>
                        <SelectItem value="Flore">Flore</SelectItem>
                        <SelectItem value="Insectes">Insectes</SelectItem>
                        <SelectItem value="Mammifères">Mammifères</SelectItem>
                        <SelectItem value="Arbres">Arbres</SelectItem>
                        <SelectItem value="Amphibiens">Amphibiens</SelectItem>
                        <SelectItem value="Écologie">Écologie</SelectItem>
                        <SelectItem value="Biodiversité">Biodiversité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Soumettre la question
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/quiz')}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">💡 Conseils pour une bonne question</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Soyez précis et clair dans votre question</li>
                <li>• Proposez 4 options de réponse crédibles</li>
                <li>• Ajoutez une explication pédagogique</li>
                <li>• Basez-vous sur des faits vérifiables</li>
                <li>• Choisissez la bonne catégorie et difficulté</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuiz;
