import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useEcoImpact } from "@/hooks/useEcoImpact";
import { useBadges } from "@/hooks/useBadges";
import { useFavorites } from "@/hooks/useFavorites";
import MapView from "@/components/MapView";
import ImageGallery from "@/components/ImageGallery";
import RouteNavigator from "@/components/RouteNavigator";
import { MapPin, Clock, TrendingUp, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import baladeVille from "@/assets/balade-ville.jpg";
import etangStNicolas from "@/assets/etang-saint-nicolas.jpg";
import ileSaintAubin from "@/assets/ile-saint-aubin.jpg";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { WalkComments } from "@/components/comments/WalkComments";

// Images par défaut pour les balades (fallback)
const defaultImages: Record<string, string> = {
  "Balade en ville": baladeVille,
  "Parcours de l'étang Saint-Nicolas": etangStNicolas,
  "Parcours de l'île Saint-Aubin": ileSaintAubin
};

type Walk = {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  duration: number;
  gmaps_url: string;
  highlights: string[];
  image_url?: string;
  lat: number;
  lng: number;
  path_coordinates?: [number, number][];
};

type NaturalSpace = {
  id: string;
  name: string;
  category: string;
  description: string;
};

type PointOfInterest = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order_index: number;
};

const Balades = () => {
  const { addWalk, stats } = useEcoImpact();
  const { checkAndUnlockBadges } = useBadges();
  const { favorites } = useFavorites();
  
  const [balades, setBalades] = useState<Walk[]>([]);
  const [espacesNaturels, setEspacesNaturels] = useState<NaturalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);
  const [showNavigator, setShowNavigator] = useState(false);
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  
  // États pour gérer l'affichage "Voir plus"
  const [showAllSpaces, setShowAllSpaces] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch walks
        const { data: walksData, error: walksError } = await supabase
          .from('walks')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (walksError) throw walksError;
        
        // Fetch natural spaces
        const { data: spacesData, error: spacesError } = await supabase
          .from('natural_spaces')
          .select('*')
          .order('name', { ascending: true });
        
        if (spacesError) throw spacesError;
        
        setBalades(walksData || []);
        setEspacesNaturels(spacesData || []);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        toast.error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompleteWalk = (balade: Walk) => {
    // Approximation: 1h = 4km à pied
    const estimatedKm = (balade.duration / 60) * 4;
    addWalk(estimatedKm);
    
    const newBadges = checkAndUnlockBadges({
      walksCompleted: stats.walksCompleted + 1,
      co2Saved: stats.co2Saved + (estimatedKm * 0.12),
      favorites: favorites.length,
    });

    toast.success(`Balade complétée ! +${estimatedKm.toFixed(1)} km, ${(estimatedKm * 0.12).toFixed(2)} kg CO₂ économisé`);
    
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast.success(`🎉 Badge débloqué : ${badge.icon} ${badge.name}`, { duration: 5000 });
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des balades...</p>
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
              <CardDescription>{error}</CardDescription>
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
      <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Balades Durables à Angers
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Explorez Angers à pied et découvrez ses trésors naturels : parcours urbains verdoyants, 
                balades champêtres et espaces naturels préservés. Tous nos itinéraires sont accessibles 
                gratuitement et favorisent une mobilité douce.
              </p>
            </div>
            <Link to="/proposer-balade">
              <Button size="lg" className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" />
                Proposer une balade
              </Button>
            </Link>
          </div>
          <Link to="/proposer-balade" className="md:hidden">
            <Button size="lg" className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Proposer une balade
            </Button>
          </Link>
        </div>
      </section>

      {/* Balades Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">Nos parcours recommandés</h2>
          {balades.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune balade disponible pour le moment.
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balades.map((balade) => (
              <Card key={balade.id} className="hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {balade.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                          balade.difficulty === 'facile' ? 'bg-green-50 text-green-700 border-green-200' :
                          balade.difficulty === 'moyen' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {balade.difficulty}
                        </span>
                      </div>
                    </div>
                    <FavoriteButton 
                      id={balade.id.toString()} 
                      type="balade" 
                      name={balade.name}
                    />
                  </div>
                  <CardDescription className="text-sm leading-relaxed">{balade.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{balade.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="capitalize font-medium text-muted-foreground">{balade.type}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2 text-primary uppercase tracking-wide">Points d'intérêt :</p>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      {balade.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="flex-1">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={async () => {
                        setSelectedWalk(balade);
                        
                        // Récupérer les points d'intérêt
                        const { data: poisData } = await supabase
                          .from('walk_points_of_interest')
                          .select('*')
                          .eq('walk_id', balade.id)
                          .order('order_index', { ascending: true });
                        
                        setPointsOfInterest(poisData || []);
                        setShowNavigator(true);
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Voir l'itinéraire
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCompleteWalk(balade)}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    >
                      ✅ J'ai fait cette balade
                    </Button>
                  </div>
                  
                  {/* Commentaires */}
                  <div className="pt-4 mt-4 border-t">
                    <WalkComments walkId={balade.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Espaces Naturels */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Espaces naturels angevins</h2>
              <p className="text-muted-foreground mt-2 max-w-3xl">
                Angers compte plus de 500 hectares d'espaces verts, des jardins de quartier aux grands parcs paysagers.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {(showAllSpaces ? espacesNaturels : espacesNaturels.slice(0, 6)).map((espace, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{espace.name}</CardTitle>
                  <CardDescription>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize mb-2">
                      {espace.category}
                    </span>
                    <br />
                    {espace.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {espacesNaturels.length > 6 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllSpaces(!showAllSpaces)}
              >
                {showAllSpaces ? (
                  <>Afficher moins</>
                ) : (
                  <>Afficher tout ({espacesNaturels.length} espaces)</>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Carte interactive des balades</CardTitle>
              <CardDescription>
                Explorez les parcours et espaces naturels d'Angers sur la carte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapView
                center={[47.4784, -0.5632]}
                zoom={12}
                markers={balades.map(b => ({
                  id: b.id,
                  name: b.name,
                  lat: b.lat,
                  lng: b.lng,
                  type: b.type,
                  description: b.description
                }))}
                height="600px"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Galerie photos */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-4">Galerie photos</h2>
          <p className="text-muted-foreground mb-8">
            Découvrez en images les plus belles balades d'Angers
          </p>
          <ImageGallery 
            images={[baladeVille, etangStNicolas, ileSaintAubin]}
            alts={[
              "Balade en ville le long de la Maine",
              "Étang Saint-Nicolas et ses oiseaux",
              "Île Saint-Aubin - Site Natura 2000"
            ]}
          />
        </div>
      </section>

      {/* Route Navigator Dialog */}
      {selectedWalk && (
        <RouteNavigator
          key={selectedWalk.id}
          open={showNavigator}
          onOpenChange={setShowNavigator}
          walkName={selectedWalk.name}
          startLat={selectedWalk.lat}
          startLng={selectedWalk.lng}
          pathCoordinates={selectedWalk.path_coordinates}
          pointsOfInterest={pointsOfInterest}
        />
      )}
    </div>
  );
};

export default Balades;
