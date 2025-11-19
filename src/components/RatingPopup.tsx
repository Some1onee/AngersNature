import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";

const RatingPopup = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà noté
    const checkExistingRating = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("site_ratings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setHasRated(true);
        setRating(data.rating);
        setMessage(data.message || "");
      }
    };

    checkExistingRating();
  }, [user]);

  useEffect(() => {
    // Afficher la popup après 5 secondes si pas encore noté
    if (!hasRated) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasRated]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour noter le site");
      return;
    }

    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("site_ratings").upsert(
        {
          user_id: user.id,
          rating,
          message: message.trim() || null,
          page_url: location.pathname,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast.success("Merci pour votre note ! 🌟");
      setHasRated(true);
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la note:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || hasRated) return null;

  const renderStar = (index: number) => {
    const starValue = index + 0.5;
    const fullStarValue = index + 1;
    const isHalfFilled =
      (hoverRating > 0 ? hoverRating : rating) >= starValue &&
      (hoverRating > 0 ? hoverRating : rating) < fullStarValue;
    const isFilled = (hoverRating > 0 ? hoverRating : rating) >= fullStarValue;

    return (
      <div key={index} className="relative inline-block">
        {/* Étoile de fond (vide) */}
        <Star
          className="h-8 w-8 text-gray-300 cursor-pointer"
          strokeWidth={1.5}
        />
        
        {/* Demi-étoile gauche */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full overflow-hidden cursor-pointer"
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isHalfFilled || isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            strokeWidth={1.5}
          />
        </div>

        {/* Étoile complète droite */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full overflow-hidden cursor-pointer"
          onMouseEnter={() => setHoverRating(fullStarValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(fullStarValue)}
        >
          <Star
            className={`h-8 w-8 -ml-4 transition-colors ${
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            strokeWidth={1.5}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg pr-8">Notez notre site ! ⭐</CardTitle>
          <CardDescription className="text-sm">
            Votre avis compte pour nous
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour noter le site
              </p>
              <Link to="/login">
                <Button className="w-full">Se connecter</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Étoiles */}
              <div className="flex justify-center gap-1 py-2">
                {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
              </div>

              {/* Affichage de la note */}
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">
                  {rating > 0 ? rating.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm text-muted-foreground ml-1">/ 5</span>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Textarea
                  placeholder="N'hésitez pas à nous envoyer un message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Pour toute autre demande, veuillez retrouver le{" "}
                  <Link to="/a-propos" className="text-primary hover:underline">
                    formulaire de contact en bas de la page À propos
                  </Link>
                </p>
              </div>

              {/* Bouton */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer ma note
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingPopup;
