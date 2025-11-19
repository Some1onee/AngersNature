import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Loader2, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Association = {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  category: string[];
  contact_email?: string;
  website?: string;
};

const Associations = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAssociations, setShowAllAssociations] = useState(false);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('associations')
          .select('*')
          .order('name', { ascending: true });
        
        if (fetchError) throw fetchError;
        
        setAssociations(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des associations:', err);
        setError('Impossible de charger les associations. Veuillez réessayer plus tard.');
        toast.error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAssociations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des associations...</p>
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
      <section className="bg-gradient-to-br from-accent/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Associations Locales
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Découvrez les associations angevines engagées pour la protection de la nature, 
            la biodiversité et la transition écologique. Rejoignez leurs actions et participez 
            à la vie associative locale.
          </p>
        </div>
      </section>

      {/* Liste des associations */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Annuaire des associations
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale - Liste des associations */}
            <div className="lg:col-span-2">
              {associations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Aucune association disponible pour le moment.
                  </CardContent>
                </Card>
              ) : (
              <>
              <div className="grid gap-6 mb-6">
            {(showAllAssociations ? associations : associations.slice(0, 3)).map((asso) => (
              <Card key={asso.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl mb-3">{asso.name}</CardTitle>
                  <p className="text-muted-foreground leading-relaxed">
                    {asso.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {asso.category && asso.category.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Thématiques</h4>
                      <div className="flex flex-wrap gap-2">
                        {asso.category.map((theme, i) => (
                          <Badge key={i} variant="secondary" className="capitalize">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {asso.website && (
                      <Button asChild variant="outline" size="sm">
                        <a href={asso.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Site web
                        </a>
                      </Button>
                    )}
                    {asso.contact_email && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`mailto:${asso.contact_email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

              {associations.length > 3 && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAllAssociations(!showAllAssociations)}
                  >
                    {showAllAssociations ? (
                      <>Afficher moins</>
                    ) : (
                      <>Afficher tout ({associations.length} associations)</>
                    )}
                  </Button>
                </div>
              )}
              </>
              )}
            </div>

            {/* Colonne de droite - Lien vers le site d'Angers */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative h-48 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform">
                      <Building2 className="h-8 w-8 text-blue-700" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-2xl drop-shadow-lg">
                        Ville d'Angers
                      </h3>
                      <p className="text-blue-100 text-sm">Site officiel</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Retrouvez toutes les informations officielles sur les services, démarches et actualités de la ville d'Angers.
                    </p>
                    <a
                      href="https://www.angers.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:scale-105 transition-transform">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visiter angers.fr
                      </Button>
                    </a>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          Officiel
                        </Badge>
                        <span>•</span>
                        <span>Services municipaux</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Votre association n'est pas listée ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Si vous représentez une association locale œuvrant pour la nature et la biodiversité à Angers, 
                nous serions ravis de vous ajouter à notre annuaire.
              </p>
              <p className="text-sm text-muted-foreground">
                Pour plus d'informations sur le projet PODD et comment participer, consultez notre page 
                <a href="/a-propos" className="text-primary hover:underline ml-1">À propos</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Associations;
