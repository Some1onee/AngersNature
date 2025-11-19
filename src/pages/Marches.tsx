import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Market = {
  id: string;
  name: string;
  description: string;
  district: string;
  days_of_week: string[];
  opening_hours: string;
  type?: string;
};

const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const Marches = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('markets')
          .select('*')
          .order('name', { ascending: true });
        
        if (fetchError) throw fetchError;
        
        setMarkets(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des marchés:', err);
        setError('Impossible de charger les marchés. Veuillez réessayer plus tard.');
        toast.error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const filteredMarkets = selectedDay === 'all' 
    ? markets 
    : markets.filter(m => m.days_of_week?.some(d => d.toLowerCase() === selectedDay.toLowerCase()));

  // Réinitialiser l'affichage quand on change de filtre
  useEffect(() => {
    setShowAllMarkets(false);
  }, [selectedDay]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des marchés...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Erreur de chargement</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary/10 via-background to-nature-earth/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Marchés Angevins
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Découvrez les marchés de plein air d'Angers pour votre approvisionnement local et durable. 
            Producteurs locaux, fruits et légumes de saison, produits bio et artisanaux vous attendent 
            dans les différents quartiers de la ville.
          </p>
        </div>
      </section>

      {/* Filtre par jour */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Filtrer par jour</h2>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedDay === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => setSelectedDay('all')}
            >
              Tous les jours
            </Badge>
            {joursSemaine.map((jour) => (
              <Badge 
                key={jour}
                variant={selectedDay === jour ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setSelectedDay(jour)}
              >
                {jour}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des marchés */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredMarkets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun marché trouvé pour cette sélection.
              </CardContent>
            </Card>
          ) : (
          <>
          <div className="grid gap-6 max-w-4xl mb-6">
            {(showAllMarkets ? filteredMarkets : filteredMarkets.slice(0, 3)).map((marche) => (
              <Card key={marche.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{marche.name}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{marche.district}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{marche.description}</p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-medium">Jours d'ouverture</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {marche.days_of_week?.map((day, i) => (
                            <Badge key={i} variant="secondary">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-medium">Horaires</p>
                        <p className="text-sm text-muted-foreground mt-1">{marche.opening_hours}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const searchQuery = encodeURIComponent(`${marche.name}, ${marche.district}, Angers, France`);
                      window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Voir sur la carte
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMarkets.length > 3 && (
            <div className="flex justify-center max-w-4xl">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllMarkets(!showAllMarkets)}
              >
                {showAllMarkets ? (
                  <>Afficher moins</>
                ) : (
                  <>Afficher tout ({filteredMarkets.length} marchés)</>
                )}
              </Button>
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* Info complémentaire */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Pourquoi acheter au marché ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-primary">🌱 Circuits courts</h3>
                  <p className="text-sm text-muted-foreground">
                    Achetez directement auprès des producteurs locaux et réduisez l'empreinte carbone de votre alimentation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-primary">🥕 Produits de saison</h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez des fruits et légumes frais, cueillis à maturité, au rythme des saisons.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-primary">💬 Lien social</h3>
                  <p className="text-sm text-muted-foreground">
                    Échangez avec les producteurs, obtenez conseils et recettes, créez du lien dans votre quartier.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-primary">🏪 Économie locale</h3>
                  <p className="text-sm text-muted-foreground">
                    Soutenez l'agriculture locale et les artisans de votre territoire.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pt-4 border-t">
                Pour plus d'informations sur les marchés d'Angers, consultez le site officiel de la ville : 
                <a 
                  href="https://www.angers.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  angers.fr
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Marches;
