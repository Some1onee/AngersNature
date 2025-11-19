import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ImageGallery from "@/components/ImageGallery";
import { Leaf, Users, Calendar, Loader2 } from "lucide-react";
import jardinPartage from "@/assets/jardin-partage.jpg";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Garden = {
  id: string;
  name: string;
  district: string;
  type: string;
  description: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  is_open_to_public: boolean;
};

const JardinsPartages = () => {
  const [jardins, setJardins] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllGardens, setShowAllGardens] = useState(false);

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('gardens')
          .select('*')
          .order('name', { ascending: true });
        
        if (fetchError) throw fetchError;
        
        setJardins(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des jardins:', err);
        setError('Impossible de charger les jardins. Veuillez réessayer plus tard.');
        toast.error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchGardens();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des jardins...</p>
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
      <section className="bg-gradient-to-br from-nature-sage/20 via-nature-cream to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Jardins Partagés & Espaces Collaboratifs
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            À Angers, plus de 1000 jardins familiaux et de nombreux espaces collectifs permettent 
            aux habitants de cultiver, d'échanger et de créer du lien autour du jardinage urbain écologique.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader>
              <CardTitle className="text-2xl">Pourquoi rejoindre un jardin partagé ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex gap-3">
                  <Leaf className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Cultiver local et bio</h3>
                    <p className="text-sm text-muted-foreground">
                      Produisez vos propres légumes en respectant l'environnement et la biodiversité.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="h-6 w-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Créer du lien social</h3>
                    <p className="text-sm text-muted-foreground">
                      Rencontrez vos voisins et partagez savoir-faire et moments conviviaux.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="h-6 w-6 text-secondary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Apprendre et transmettre</h3>
                    <p className="text-sm text-muted-foreground">
                      Participez à des ateliers et découvrez les techniques de jardinage durable.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Liste des jardins */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Jardins partagés à Angers
          </h2>
          {jardins.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun jardin disponible pour le moment.
              </CardContent>
            </Card>
          ) : (
          <>
          <div className="grid gap-6 mb-6">
            {(showAllGardens ? jardins : jardins.slice(0, 3)).map((jardin) => (
              <Card key={jardin.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">{jardin.name}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{jardin.district}</Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 capitalize">
                          {jardin.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{jardin.description}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Accès
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {jardin.is_open_to_public ? 'Ouvert au public' : 'Sur inscription'}
                    </p>
                  </div>

                  {(jardin.contact_email || jardin.contact_phone || jardin.website) && (
                    <div>
                      <h4 className="font-semibold mb-2">Contact</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {jardin.contact_email && <p>Email: {jardin.contact_email}</p>}
                        {jardin.contact_phone && <p>Tél: {jardin.contact_phone}</p>}
                        {jardin.website && (
                          <p>
                            <a href={jardin.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Site web
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {jardins.length > 3 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllGardens(!showAllGardens)}
              >
                {showAllGardens ? (
                  <>Afficher moins</>
                ) : (
                  <>Afficher tout ({jardins.length} jardins)</>
                )}
              </Button>
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* Comment participer */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Comment participer ?</CardTitle>
              <CardDescription>
                Rejoindre un jardin partagé est simple et ouvert à tous
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold">Renseignez-vous</h4>
                    <p className="text-sm text-muted-foreground">
                      Contactez la mairie d'Angers ou l'association de quartier pour connaître les jardins disponibles.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold">Inscrivez-vous</h4>
                    <p className="text-sm text-muted-foreground">
                      Certains jardins ont des listes d'attente, d'autres sont ouverts immédiatement.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold">Participez</h4>
                    <p className="text-sm text-muted-foreground">
                      Assistez aux réunions, ateliers et moments conviviaux organisés par le jardin.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Galerie photos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Galerie photos des jardins partagés
          </h2>
          <p className="text-muted-foreground mb-8">
            Découvrez en images la vie des jardins partagés angevins
          </p>
          <ImageGallery 
            images={[jardinPartage, jardinPartage, jardinPartage]}
            alts={[
              "Jardinage collectif dans un jardin partagé",
              "Atelier de permaculture",
              "Récolte de légumes frais"
            ]}
          />
        </div>
      </section>
    </div>
  );
};

export default JardinsPartages;
