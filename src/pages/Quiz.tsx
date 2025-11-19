import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges } from "@/hooks/useBadges";
import { CheckCircle2, XCircle, RotateCcw, Loader2, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  difficulty?: string;
  category?: string;
  image_url?: string;
};

const Quiz = () => {
  const { user } = useAuth();
  const { checkAndUnlockBadges } = useBadges();
  
  // États pour le quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);

  // États pour le formulaire de soumission
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
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          setQuizQuestions(data);
        } else {
          setError('Aucune question disponible pour le moment.');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des questions:', err);
        setError('Impossible de charger les questions. Veuillez réessayer plus tard.');
        toast.error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setAnswered(true);

    const isCorrect = answerIndex === quizQuestions[currentQuestion].correct_index;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        setShowResult(true);
        const percentage = Math.round(((score + (isCorrect ? 1 : 0)) / quizQuestions.length) * 100);
        if (percentage >= 80) {
          checkAndUnlockBadges("quiz_master");
        }
        if (percentage === 100) {
          checkAndUnlockBadges("quiz_perfect");
        }
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setAnswered(false);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour proposer une question');
      return;
    }

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
        user_id: user.id,
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

  const getResultMessage = () => {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    if (percentage === 100) {
      return {
        title: "🌟 Parfait !",
        message: "Vous êtes un véritable expert de la nature angevine !",
      };
    } else if (percentage >= 80) {
      return {
        title: "🎓 Excellent !",
        message: "Vous connaissez très bien la biodiversité locale !",
      };
    } else if (percentage >= 60) {
      return {
        title: "👍 Bien joué !",
        message: "Vous avez de bonnes connaissances sur la nature !",
      };
    } else if (percentage >= 40) {
      return {
        title: "🌱 Pas mal !",
        message: "Continuez à explorer la nature angevine !",
      };
    } else {
      return {
        title: "🌿 Bon début !",
        message: "Il y a encore beaucoup à découvrir sur la biodiversité !",
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Erreur de chargement</CardTitle>
              <CardDescription>{error || 'Aucune question disponible'}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (showResult) {
    const result = getResultMessage();
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">{result.title}</CardTitle>
              <CardDescription className="text-lg">{result.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score}/{quizQuestions.length}
                </div>
                <p className="text-muted-foreground">
                  Score : {Math.round((score / quizQuestions.length) * 100)}%
                </p>
              </div>
              
              <div className="space-y-2">
                {quizQuestions.map((q, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {answers[index] ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-muted-foreground">Question {index + 1}</span>
                  </div>
                ))}
              </div>

              <Button onClick={resetQuiz} className="w-full" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Recommencer le quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Quiz Nature - Biodiversité Angevine</h1>

          <Tabs defaultValue="quiz" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quiz">
                Faire le quiz ({quizQuestions.length} questions)
              </TabsTrigger>
              <TabsTrigger value="submit" disabled={!user}>
                Proposer une question {!user && <Lock className="ml-2 h-4 w-4" />}
              </TabsTrigger>
            </TabsList>

            {/* ONGLET QUIZ */}
            <TabsContent value="quiz">
              <div className="space-y-6">
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestion + 1} / {quizQuestions.length}</span>
                    <span>Score : {score}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl leading-relaxed">{question.question}</CardTitle>
                    {question.category && (
                      <CardDescription className="text-base">
                        Catégorie : {question.category} • Difficulté : {question.difficulty || 'Moyen'}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image si disponible */}
                    {question.image_url && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={question.image_url} 
                          alt="Illustration de la question"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    {/* Options de réponse */}
                    <div className="space-y-3">
                      {question.options.map((choice, index) => (
                        <Button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          disabled={selectedAnswer !== null}
                          variant="outline"
                          className={`w-full text-left p-4 h-auto justify-start ${
                            answered
                              ? index === question.correct_index
                                ? "border-green-500 bg-green-50 hover:bg-green-50"
                                : index === selectedAnswer
                                ? "border-red-500 bg-red-50 hover:bg-red-50"
                                : ""
                              : "hover:bg-muted"
                          }`}
                        >
                          <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                          <span>{choice}</span>
                          {answered && index === question.correct_index && (
                            <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                          )}
                          {answered && index === selectedAnswer && index !== question.correct_index && (
                            <XCircle className="ml-auto h-5 w-5 text-red-600" />
                          )}
                        </Button>
                      ))}
                    </div>

                    {/* Explication */}
                    {answered && question.explanation && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <p className="text-sm"><strong>💡 Explication :</strong> {question.explanation}</p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ONGLET PROPOSER UNE QUESTION */}
            <TabsContent value="submit">
              {!user ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground mb-4">
                      Vous devez être connecté pour proposer une question
                    </p>
                    <Button onClick={() => window.location.href = '/login'}>
                      Se connecter
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Proposer une nouvelle question</CardTitle>
                    <CardDescription>
                      Partagez vos connaissances sur la nature angevine ! Vos questions seront examinées avant publication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitQuestion} className="space-y-6">
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

                      {/* Bouton */}
                      <Button type="submit" disabled={submitting} size="lg">
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Soumettre la question
                      </Button>
                    </form>

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
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
