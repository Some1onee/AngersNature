import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2, Send, MapPin, Plus, X, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ProposerBalade = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'urbain',
    difficulty: 'facile',
    duration: 60,
    lat: 47.4784,
    lng: -0.5632,
  });

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([formData.lat, formData.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Marqueur de départ
    const marker = L.marker([formData.lat, formData.lng], { 
      icon: DefaultIcon,
      draggable: true 
    }).addTo(map);

    marker.bindPopup("<b>Point de départ</b><br>Déplacez-moi !");
    markerRef.current = marker;

    // Mettre à jour les coordonnées quand on déplace le marqueur
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setFormData(prev => ({
        ...prev,
        lat: Number(position.lat.toFixed(6)),
        lng: Number(position.lng.toFixed(6)),
      }));
    });

    // Clic sur la carte pour placer le marqueur
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setFormData(prev => ({
        ...prev,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      }));
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour proposer une balade');
      navigate('/login');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Le nom de la balade est obligatoire');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('La description est obligatoire');
      return;
    }

    if (formData.duration < 10) {
      toast.error('La durée doit être d\'au moins 10 minutes');
      return;
    }

    // Filtrer les points d'intérêt vides
    const filteredHighlights = highlights.filter(h => h.trim() !== '');

    if (filteredHighlights.length === 0) {
      toast.error('Ajoutez au moins un point d\'intérêt');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('user_walk_submissions').insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        difficulty: formData.difficulty,
        duration: formData.duration,
        highlights: filteredHighlights,
        lat: formData.lat,
        lng: formData.lng,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Balade proposée avec succès !', {
        description: 'Elle sera examinée par un modérateur avant publication.',
      });

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        type: 'urbain',
        difficulty: 'facile',
        duration: 60,
        lat: 47.4784,
        lng: -0.5632,
      });
      setHighlights(['']);

      // Réinitialiser le marqueur
      if (markerRef.current) {
        markerRef.current.setLatLng([47.4784, -0.5632]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([47.4784, -0.5632], 13);
      }

    } catch (error) {
      console.error('Error submitting walk:', error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                Vous devez être connecté pour proposer une balade
              </p>
              <Button onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Proposer une balade
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Partagez vos parcours préférés avec la communauté ! Vos balades seront examinées avant publication.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Décrivez votre balade de manière claire et attractive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la balade *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Balade le long de la Maine"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez le parcours, ses caractéristiques, ce qu'on peut y voir..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type de parcours *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urbain">Urbain</SelectItem>
                          <SelectItem value="nature">Nature</SelectItem>
                          <SelectItem value="mixte">Mixte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulté *</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facile">Facile</SelectItem>
                          <SelectItem value="moyen">Moyen</SelectItem>
                          <SelectItem value="difficile">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="10"
                        max="480"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Points d'intérêt */}
              <Card>
                <CardHeader>
                  <CardTitle>Points d'intérêt</CardTitle>
                  <CardDescription>
                    Listez les lieux remarquables du parcours (parcs, monuments, points de vue...)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        placeholder={`Point d'intérêt ${index + 1}`}
                      />
                      {highlights.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeHighlight(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addHighlight}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un point d'intérêt
                  </Button>
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Point de départ
                  </CardTitle>
                  <CardDescription>
                    Cliquez sur la carte ou déplacez le marqueur pour définir le point de départ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={formData.lat}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          setFormData({ ...formData, lat });
                          if (markerRef.current) {
                            markerRef.current.setLatLng([lat, formData.lng]);
                          }
                        }}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={formData.lng}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          setFormData({ ...formData, lng });
                          if (markerRef.current) {
                            markerRef.current.setLatLng([formData.lat, lng]);
                          }
                        }}
                        readOnly
                      />
                    </div>
                  </div>
                  <div ref={mapRef} className="h-[400px] rounded-lg border" />
                  <p className="text-sm text-muted-foreground">
                    💡 Conseil : Zoomez sur la carte et cliquez pour placer précisément le point de départ
                  </p>
                </CardContent>
              </Card>

              {/* Conseils */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">💡 Conseils pour une bonne soumission</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Soyez précis dans votre description</li>
                    <li>• Indiquez les particularités du parcours (accessibilité, dénivelé...)</li>
                    <li>• Listez tous les points d'intérêt remarquables</li>
                    <li>• Vérifiez que le point de départ est bien placé sur la carte</li>
                    <li>• Estimez correctement la durée du parcours</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Bouton de soumission */}
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting} size="lg">
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Proposer cette balade
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProposerBalade;
