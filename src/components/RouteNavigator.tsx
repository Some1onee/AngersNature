import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation as NavigationIcon, MapPin, Route, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Fix pour les icônes Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const StartIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCA0IDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiMyMmM1NWUiLz48L3N2Zz4=",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const UserIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCA0IDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiMzYjgyZjYiLz48L3N2Zz4=",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const POIIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCA0IDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiNmOTczMTYiLz48L3N2Zz4=",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface PointOfInterest {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order_index: number;
}

interface RouteNavigatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walkName: string;
  startLat: number;
  startLng: number;
  pathCoordinates?: [number, number][];
  pointsOfInterest?: PointOfInterest[];
}

const RouteNavigator = ({ 
  open, 
  onOpenChange, 
  walkName, 
  startLat, 
  startLng,
  pathCoordinates = [],
  pointsOfInterest = []
}: RouteNavigatorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<"to-start" | "walk-route">("to-start");
  const [routeToStart, setRouteToStart] = useState<L.Polyline | null>(null);
  const [walkRoute, setWalkRoute] = useState<L.Polyline | null>(null);
  const [distance, setDistance] = useState<{ toStart: number; walk: number }>({ toStart: 0, walk: 0 });

  // Demander la géolocalisation
  useEffect(() => {
    if (open && !userLocation) {
      setLoadingLocation(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserLocation(coords);
            setLoadingLocation(false);
            toast.success("Position détectée !");
          },
          (error) => {
            console.error("Erreur géolocalisation:", error);
            setLoadingLocation(false);
            toast.error("Impossible d'obtenir votre position", {
              description: "Veuillez activer la géolocalisation"
            });
            // Position par défaut (centre d'Angers)
            setUserLocation([47.4784, -0.5632]);
          }
        );
      } else {
        setLoadingLocation(false);
        toast.error("Géolocalisation non supportée");
        setUserLocation([47.4784, -0.5632]);
      }
    }
  }, [open, userLocation]);

  // Initialiser la carte
  useEffect(() => {
    if (!open || !mapRef.current || !userLocation) return;
    
    // Ne créer la carte que si elle n'existe pas
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(userLocation, 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Marqueur position utilisateur
    L.marker(userLocation, { icon: UserIcon })
      .addTo(map)
      .bindPopup("<b>Votre position</b>");

    // Marqueur point de départ
    L.marker([startLat, startLng], { icon: StartIcon })
      .addTo(map)
      .bindPopup(`<b>Départ : ${walkName}</b>`);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, userLocation, startLat, startLng, walkName]);

  // Tracer l'itinéraire vers le départ
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || activeTab !== "to-start") return;

    // Forcer le rafraîchissement de la carte
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    // Nettoyer l'ancien itinéraire
    if (routeToStart) {
      mapInstanceRef.current.removeLayer(routeToStart);
    }

    // Nettoyer les marqueurs POI quand on revient sur "Se rendre au départ"
    poiMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    poiMarkersRef.current = [];

    // Tracer une ligne droite (simulation de routing)
    const route = L.polyline([userLocation, [startLat, startLng]], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    setRouteToStart(route);

    // Calculer la distance
    const dist = mapInstanceRef.current.distance(userLocation, [startLat, startLng]);
    setDistance(prev => ({ ...prev, toStart: Math.round(dist) }));

    // Ajuster la vue
    mapInstanceRef.current.fitBounds([userLocation, [startLat, startLng]], { padding: [50, 50] });

  }, [activeTab, userLocation, startLat, startLng]);

  // Tracer le parcours de la balade
  useEffect(() => {
    if (!mapInstanceRef.current || activeTab !== "walk-route") return;

    // Forcer le rafraîchissement de la carte
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    // Nettoyer l'ancien parcours
    if (walkRoute) {
      mapInstanceRef.current.removeLayer(walkRoute);
    }

    // Nettoyer les anciens marqueurs POI
    poiMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    poiMarkersRef.current = [];

    // Ajouter les marqueurs des points d'intérêt
    pointsOfInterest.forEach((poi, index) => {
      if (mapInstanceRef.current) {
        const marker = L.marker([poi.lat, poi.lng], { icon: POIIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<div class="font-semibold">${index + 1}. ${poi.name}</div>`);
        poiMarkersRef.current.push(marker);
      }
    });

    if (pathCoordinates.length > 0) {
      // Utiliser les coordonnées du parcours
      const route = L.polyline(pathCoordinates, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapInstanceRef.current);

      setWalkRoute(route);

      // Calculer la distance totale du parcours
      let totalDist = 0;
      for (let i = 0; i < pathCoordinates.length - 1; i++) {
        totalDist += mapInstanceRef.current.distance(pathCoordinates[i], pathCoordinates[i + 1]);
      }
      setDistance(prev => ({ ...prev, walk: Math.round(totalDist) }));

      // Ajuster la vue
      mapInstanceRef.current.fitBounds(route.getBounds(), { padding: [50, 50] });
    } else {
      // Créer un parcours circulaire simple (fallback)
      const radius = 500; // 500m de rayon
      const points: [number, number][] = [];
      for (let i = 0; i <= 16; i++) {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const lat = startLat + (radius / 111320) * Math.cos(rad);
        const lng = startLng + (radius / (111320 * Math.cos(startLat * Math.PI / 180))) * Math.sin(rad);
        points.push([lat, lng]);
      }

      const route = L.polyline(points, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapInstanceRef.current);

      setWalkRoute(route);
      setDistance(prev => ({ ...prev, walk: Math.round(radius * 2 * Math.PI) }));

      mapInstanceRef.current.fitBounds(route.getBounds(), { padding: [50, 50] });
    }

  }, [activeTab, startLat, startLng, pathCoordinates, mapInstanceRef.current]);

  const openInGoogleMaps = () => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${startLat},${startLng}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NavigationIcon className="h-5 w-5" />
            Navigation - {walkName}
          </DialogTitle>
          <DialogDescription>
            Consultez l'itinéraire pour vous rendre au départ et le parcours de la balade
          </DialogDescription>
        </DialogHeader>

        {loadingLocation ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Détection de votre position...</p>
          </div>
        ) : !userLocation ? (
          <Card className="border-destructive">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Géolocalisation nécessaire</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Veuillez activer la géolocalisation pour afficher l'itinéraire
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="to-start" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Se rendre au départ
                </TabsTrigger>
                <TabsTrigger value="walk-route" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Parcours de la balade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="to-start" className="space-y-4 mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Distance approximative</p>
                        <p className="text-2xl font-bold text-primary">
                          {distance.toStart >= 1000 
                            ? `${(distance.toStart / 1000).toFixed(1)} km`
                            : `${distance.toStart} m`
                          }
                        </p>
                      </div>
                      <Button onClick={openInGoogleMaps} variant="outline">
                        <NavigationIcon className="mr-2 h-4 w-4" />
                        Ouvrir dans Google Maps
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Itinéraire en ligne droite de votre position au point de départ du parcours.
                      Pour un itinéraire détaillé avec les rues, utilisez Google Maps.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="walk-route" className="space-y-4 mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Distance du parcours</p>
                      <p className="text-2xl font-bold text-primary">
                        {distance.walk >= 1000 
                          ? `${(distance.walk / 1000).toFixed(1)} km`
                          : `${distance.walk} m`
                        }
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pathCoordinates.length > 0 
                        ? "Tracé exact du parcours de la balade."
                        : "Parcours circulaire approximatif autour du point de départ."
                      }
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Carte unique partagée entre les deux onglets */}
            <div ref={mapRef} className="h-[500px] rounded-lg border" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RouteNavigator;
