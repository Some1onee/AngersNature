import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, Users, MapPin, Trash2, Lock } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    duration: "",
    category: "sortie",
    description: "",
    location: "",
    organizer: "",
    audience: "Tout public"
  });

  useEffect(() => {
    // Charger les inscriptions
    const stored = localStorage.getItem("event_registrations");
    if (stored) {
      setRegistrations(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentification pour démo (mot de passe: admin)
    if (password === "admin") {
      setIsAuthenticated(true);
      toast.success("Connecté à l'administration");
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const handleDeleteRegistration = (id: number) => {
    const updated = registrations.filter(r => r.id !== id);
    setRegistrations(updated);
    localStorage.setItem("event_registrations", JSON.stringify(updated));
    toast.success("Inscription supprimée");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const events = JSON.parse(localStorage.getItem("custom_events") || "[]");
    events.push({ ...newEvent, id: Date.now() });
    localStorage.setItem("custom_events", JSON.stringify(events));
    toast.success("Événement ajouté avec succès");
    setNewEvent({
      title: "",
      date: "",
      time: "",
      duration: "",
      category: "sortie",
      description: "",
      location: "",
      organizer: "",
      audience: "Tout public"
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-6 w-6 text-primary" />
                <CardTitle>Administration</CardTitle>
              </div>
              <CardDescription>Connexion requise</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe admin"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Se connecter
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Démo: utilisez le mot de passe "admin"
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">Administration</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="registrations">Inscriptions</TabsTrigger>
            <TabsTrigger value="events">Gérer les événements</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>Inscriptions aux événements</CardTitle>
                <CardDescription>
                  {registrations.length} inscription(s) enregistrée(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucune inscription pour le moment
                    </p>
                  ) : (
                    registrations.map((reg) => (
                      <Card key={reg.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{reg.name}</CardTitle>
                              <CardDescription>{reg.eventTitle}</CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRegistration(reg.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{reg.email}</Badge>
                            {reg.phone && <Badge variant="outline">{reg.phone}</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{reg.participants} participant(s)</span>
                          </div>
                          {reg.message && (
                            <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
                              {reg.message}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un événement</CardTitle>
                <CardDescription>
                  Créez de nouveaux événements qui apparaîtront dans l'agenda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        required
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      <select
                        id="category"
                        required
                        value={newEvent.category}
                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="sortie">Sortie</option>
                        <option value="atelier">Atelier</option>
                        <option value="chantier">Chantier</option>
                        <option value="conférence">Conférence</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        required
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Heure *</Label>
                      <Input
                        id="time"
                        type="time"
                        required
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée</Label>
                      <Input
                        id="duration"
                        placeholder="2h"
                        value={newEvent.duration}
                        onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Lieu *</Label>
                      <Input
                        id="location"
                        required
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizer">Organisateur *</Label>
                      <Input
                        id="organizer"
                        required
                        value={newEvent.organizer}
                        onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Public</Label>
                    <Input
                      id="audience"
                      value={newEvent.audience}
                      onChange={(e) => setNewEvent({ ...newEvent, audience: e.target.value })}
                      placeholder="Tout public"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ajouter l'événement
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inscriptions totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{registrations.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">
                    {registrations.reduce((sum, r) => sum + parseInt(r.participants || "0"), 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Événements créés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">
                    {JSON.parse(localStorage.getItem("custom_events") || "[]").length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
