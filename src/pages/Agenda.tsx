import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FavoriteButton } from "@/components/FavoriteButton";
import EventDetails from "@/components/EventDetails";
import { Calendar, MapPin, Clock, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  start_at: string;
  end_at?: string;
  location: string;
  organizer: string;
  is_free: boolean;
  price_info?: string;
  contact_email?: string;
  website?: string;
};

const categoryColors = {
  sortie: "bg-nature-sky/20 text-nature-sky border-nature-sky/30",
  atelier: "bg-secondary/20 text-secondary border-secondary/30",
  chantier: "bg-primary/20 text-primary border-primary/30",
  conférence: "bg-accent/20 text-accent border-accent/30"
};

const Agenda = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .order('start_at', { ascending: true });
        
        if (fetchError) throw fetchError;
        
        setEvents(data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError('Impossible de charger les événements. Veuillez réessayer plus tard.');
        toast.error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Chargement des événements...</p>
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
      <section className="bg-gradient-to-br from-nature-sky/10 via-background to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Agenda Nature
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Participez aux sorties, ateliers et chantiers nature organisés par les associations angevines. 
            Découvrez la biodiversité locale et agissez pour sa préservation.
          </p>
        </div>
      </section>

      {/* Liste des événements */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Prochains événements
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setSelectedCategory('all')}
              >
                Tous
              </Badge>
              <Badge 
                variant={selectedCategory === 'sortie' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setSelectedCategory('sortie')}
              >
                Sorties
              </Badge>
              <Badge 
                variant={selectedCategory === 'atelier' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setSelectedCategory('atelier')}
              >
                Ateliers
              </Badge>
              <Badge 
                variant={selectedCategory === 'chantier' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setSelectedCategory('chantier')}
              >
                Chantiers
              </Badge>
              <Badge 
                variant={selectedCategory === 'conference' ? 'default' : 'outline'} 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setSelectedCategory('conference')}
              >
                Conférences
              </Badge>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun événement disponible pour le moment.
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-6 max-w-4xl">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                      <CardDescription className="text-base">
                        {event.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${categoryColors[event.category as keyof typeof categoryColors]} capitalize shrink-0`}
                      >
                        {event.category}
                      </Badge>
                      <FavoriteButton 
                        id={event.id} 
                        type="event" 
                        name={event.title}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {new Date(event.start_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.start_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex-1">
                      Organisé par <span className="font-medium text-foreground">{event.organizer}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={event.is_free ? 'text-green-600 font-medium' : ''}>
                        {event.is_free ? 'Gratuit' : (event.price_info || 'Payant')}
                      </span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default">
                          <Users className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{event.title}</DialogTitle>
                        </DialogHeader>
                        <EventDetails eventId={event.id} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Info inscription */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Comment participer ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                La plupart des événements sont gratuits et ouverts à tous. Inscrivez-vous en un clic pour réserver votre place !
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Inscrivez-vous</h3>
                  <p className="text-sm text-muted-foreground">Connectez-vous et inscrivez-vous en un clic</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Voir les participants</h3>
                  <p className="text-sm text-muted-foreground">Découvrez qui participe à l'événement</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Posez vos questions</h3>
                  <p className="text-sm text-muted-foreground">Échangez avec les organisateurs et participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Agenda;
