import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, Users, Calendar as CalendarIcon, Lightbulb, Send, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const APropos = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
          },
        ]);

      if (error) throw error;

      // Succès
      toast.success('Message envoyé !', {
        description: 'Merci pour votre message, je le lirai dès que possible 🙂'
      });
      
      setIsSuccess(true);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        message: '',
      });

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Une erreur est survenue', {
        description: 'Merci de réessayer plus tard.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2560')"
          }}
        ></div>
        
        {/* Overlay gradient pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80"></div>
        
        {/* Pattern décoratif subtil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center text-primary-foreground relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Le Projet PODD
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
            Parcours Outdoor Durable et Décarboné
          </p>
        </div>
      </section>

      {/* Contexte */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Contexte du projet</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Face aux enjeux climatiques et à la nécessité de repenser nos modes de tourisme, 
                le projet PODD (Parcours Outdoor Durable et Décarboné) vise à promouvoir un tourisme 
                local, respectueux de l'environnement et accessible à tous sur le territoire angevin.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Angers dispose d'un patrimoine naturel exceptionnel : plus de 500 hectares d'espaces verts, 
                des sites classés Natura 2000, une biodiversité riche et des initiatives citoyennes dynamiques. 
                Pourtant, ces ressources restent méconnues du grand public et des visiteurs.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                PODD ambitionne de valoriser ces atouts en créant une plateforme numérique centralisée, 
                regroupant balades nature, jardins partagés, associations locales, événements et lieux 
                d'approvisionnement durable.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Objectifs */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Objectifs</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Valoriser le patrimoine naturel local</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Faire découvrir les richesses naturelles d'Angers à travers des parcours 
                  pédestres et cyclables, accessibles et balisés.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-accent mb-3" />
                <CardTitle>Renforcer le lien social</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mettre en avant les jardins partagés et les initiatives citoyennes qui favorisent 
                  l'entraide et la cohésion sociale autour de la nature.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lightbulb className="h-10 w-10 text-secondary mb-3" />
                <CardTitle>Sensibiliser à la biodiversité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Proposer des contenus éducatifs (quiz, événements) pour éveiller les consciences 
                  sur la protection de l'environnement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CalendarIcon className="h-10 w-10 text-nature-sky mb-3" />
                <CardTitle>Faciliter l'engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Centraliser l'information sur les événements nature et permettre aux citoyens 
                  de s'impliquer facilement dans la vie associative locale.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planning */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Planning du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-lg mb-1">Phase 1 : Recherche et conception</h3>
                    <p className="text-sm text-muted-foreground mb-2">Novembre 2025</p>
                    <p className="text-muted-foreground">
                      Recensement des ressources, rencontre avec les associations, définition du cahier des charges 
                      technique et création des maquettes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-lg mb-1">Phase 2 : Développement</h3>
                    <p className="text-sm text-muted-foreground mb-2">Novembre - Décembre 2025</p>
                    <p className="text-muted-foreground">
                      Développement de la plateforme web avec intégration des données, création des parcours 
                      interactifs et mise en place du système d'événements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-lg mb-1">Phase 3 : Tests et ajustements</h3>
                    <p className="text-sm text-muted-foreground mb-2">Décembre 2025</p>
                    <p className="text-muted-foreground">
                      Tests utilisateurs avec des associations partenaires, collecte de retours et 
                      optimisations de l'interface et des fonctionnalités.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phase 4 : Lancement</h3>
                    <p className="text-sm text-muted-foreground mb-2">Janvier 2026</p>
                    <p className="text-muted-foreground">
                      Mise en ligne officielle, campagne de communication locale et organisation 
                      d'événements de lancement avec les partenaires.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partenaires */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Partenaires envisagés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Collectivités</h3>
                  <p className="text-muted-foreground">
                    Ville d'Angers, Angers Loire Métropole pour le soutien institutionnel et la mise 
                    à disposition de données.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Associations</h3>
                  <p className="text-muted-foreground">
                    LPO Anjou, Maine Anjou Nature Environnement, Les Incroyables Comestibles, et autres 
                    acteurs locaux de l'environnement.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Établissements d'enseignement</h3>
                  <p className="text-muted-foreground">
                    Universités et écoles pour la sensibilisation des étudiants et l'organisation 
                    d'événements nature.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Acteurs du tourisme</h3>
                  <p className="text-muted-foreground">
                    Office de tourisme, structures d'hébergement et de restauration engagées dans 
                    le tourisme durable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl">Vous souhaitez participer ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Le projet PODD est ouvert aux contributions : associations, citoyens engagés, 
                institutions... Si vous souhaitez participer ou simplement en savoir plus, 
                n'hésitez pas à nous contacter via le formulaire ci-dessous.
              </p>

              {isSuccess && (
                <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Message envoyé avec succès !</p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Merci pour votre message, je le lirai dès que possible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.fr"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Votre message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default APropos;
