import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Loader2, UserPlus, UserMinus, Send } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Registration = {
  id: string;
  user_id: string;
  registered_at: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
};

type Question = {
  id: string;
  user_id: string;
  question: string;
  answer: string | null;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
};

type EventDetailsProps = {
  eventId: string;
};

const EventDetails = ({ eventId }: EventDetailsProps) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les inscriptions sans jointure
      const { data: regsData, error: regsError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("status", "confirmed");

      if (regsError) {
        console.error("Erreur inscriptions:", regsError);
        throw regsError;
      }

      // Récupérer les profils séparément si on a des inscriptions
      if (regsData && regsData.length > 0) {
        const userIds = regsData.map((r) => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds);

        // Associer les profils aux inscriptions
        const regsWithProfiles = regsData.map((reg) => ({
          ...reg,
          profiles: profilesData?.find((p) => p.id === reg.user_id),
        }));

        setRegistrations(regsWithProfiles);
      } else {
        setRegistrations([]);
      }

      // Vérifier si l'utilisateur est inscrit
      if (user) {
        const userReg = regsData?.find((r) => r.user_id === user.id);
        setIsRegistered(!!userReg);
      }

      // Récupérer les questions sans jointure
      const { data: questionsData, error: questionsError } = await supabase
        .from("event_questions")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (questionsError) {
        console.error("Erreur questions:", questionsError);
        throw questionsError;
      }

      // Récupérer les profils pour les questions
      if (questionsData && questionsData.length > 0) {
        const userIds = questionsData.map((q) => q.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);

        // Associer les profils aux questions
        const questionsWithProfiles = questionsData.map((q) => ({
          ...q,
          profiles: profilesData?.find((p) => p.id === q.user_id),
        }));

        setQuestions(questionsWithProfiles);
      } else {
        setQuestions([]);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur de chargement: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour vous inscrire");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: "confirmed",
        });

      if (error) {
        console.error("Erreur inscription:", error);
        throw error;
      }

      toast.success("Inscription confirmée ! 🎉");
      await fetchData();
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      if (error.code === "23505") {
        toast.error("Vous êtes déjà inscrit à cet événement");
      } else {
        toast.error("Erreur: " + (error.message || "Impossible de s'inscrire"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Inscription annulée");
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      toast.error("Erreur lors de l'annulation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour poser une question");
      return;
    }

    if (!newQuestion.trim()) {
      toast.error("Veuillez saisir une question");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("event_questions")
        .insert({
          event_id: eventId,
          user_id: user.id,
          question: newQuestion.trim(),
        });

      if (error) throw error;

      toast.success("Question envoyée !");
      setNewQuestion("");
      fetchData();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la question:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton d'inscription */}
      <Card>
        <CardContent className="pt-6">
          {!user ? (
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Connectez-vous pour vous inscrire à cet événement
              </p>
              <Link to="/login">
                <Button>Se connecter</Button>
              </Link>
            </div>
          ) : isRegistered ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">Vous êtes inscrit à cet événement</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUnregister}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserMinus className="h-4 w-4 mr-2" />
                )}
                Annuler mon inscription
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              S'inscrire
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Liste des participants */}
      {isRegistered && registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Participants ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {(reg.profiles?.full_name || reg.profiles?.username)?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {reg.profiles?.full_name || reg.profiles?.username || "Utilisateur"}
                  </span>
                  {reg.user_id === user?.id && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Vous
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions et réponses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Questions ({questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulaire de question */}
          {user ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Posez une question sur cet événement..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleSubmitQuestion}
                disabled={submitting || !newQuestion.trim()}
                size="sm"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer la question
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Connectez-vous pour poser une question
            </p>
          )}

          {/* Liste des questions */}
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune question pour le moment
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="border-l-2 border-primary pl-4 py-2">
                  <div className="flex items-start gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(q.profiles?.full_name || q.profiles?.username)?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {q.profiles?.full_name || q.profiles?.username || "Utilisateur"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{q.question}</p>
                    </div>
                  </div>
                  {q.answer && (
                    <div className="mt-2 ml-8 p-2 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-1">Réponse :</p>
                      <p className="text-sm">{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetails;
