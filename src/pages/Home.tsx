import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Calendar, ShoppingBag, Brain, Leaf, Map } from "lucide-react";
import Navigation from "@/components/Navigation";

const Home = () => {
  const sections = [
    {
      icon: Map,
      title: "Carte Interactive",
      description: "Explorez tous les espaces verts, parcs, jardins et plaines de jeux d'Angers sur une carte interactive.",
      to: "/carte-interactive",
      color: "text-blue-500"
    },
    {
      icon: MapPin,
      title: "Balades Durables",
      description: "Découvrez les parcours nature à Angers : balades urbaines, espaces naturels, parcs et jardins.",
      to: "/balades",
      color: "text-nature-green"
    },
    {
      icon: Leaf,
      title: "Jardins Partagés",
      description: "Explorez les espaces collaboratifs angevins et rejoignez la communauté des jardiniers urbains.",
      to: "/jardins-partages",
      color: "text-nature-sage"
    },
    {
      icon: Users,
      title: "Associations Locales",
      description: "Annuaire des associations nature et biodiversité engagées sur le territoire angevin.",
      to: "/associations",
      color: "text-accent"
    },
    {
      icon: Calendar,
      title: "Agenda Nature",
      description: "Sorties ornithologiques, ateliers, chantiers participatifs... Ne manquez aucun événement !",
      to: "/agenda",
      color: "text-nature-sky"
    },
    {
      icon: ShoppingBag,
      title: "Marchés Angevins",
      description: "Tous les marchés de plein air pour votre approvisionnement local et durable.",
      to: "/marches",
      color: "text-secondary"
    },
    {
      icon: Brain,
      title: "Quiz Nature",
      description: "Testez vos connaissances sur la biodiversité angevine avec notre quiz interactif !",
      to: "/quiz",
      color: "text-primary-light"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')"
          }}
        ></div>
        
        {/* Overlay gradient pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80"></div>
        
        {/* Pattern décoratif subtil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Angers Nature & Balades
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-95">
              Pour un tourisme durable et engagé
            </p>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Découvrez Angers autrement : balades nature, jardins partagés, événements éco-responsables et initiatives locales pour préserver notre biodiversité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/balades">Explorer les balades</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg">
                <Link to="/a-propos">Le projet PODD</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Intro */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Un tourisme qui respecte la nature
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Le projet PODD (Parcours Outdoor Durable et Décarboné) vise à promouvoir un tourisme respectueux de l'environnement à Angers. 
              Découvrez des itinéraires nature, participez à des événements locaux et rejoignez une communauté engagée pour la préservation de la biodiversité angevine.
            </p>
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Link key={index} to={section.to}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/50">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 ${section.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {section.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-accent/10 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Prêt à explorer Angers autrement ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez le mouvement pour un tourisme durable et découvrez la richesse naturelle de notre territoire.
            </p>
            <Button asChild size="lg" className="text-lg">
              <Link to="/agenda">Voir les prochains événements</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
