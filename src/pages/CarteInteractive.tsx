import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Trees } from "lucide-react";
import { toast } from "sonner";

// Fix pour les icônes Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Types
type NaturalSpace = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
};

type Garden = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
};

// Couleurs par catégorie
const categoryColors: Record<string, string> = {
  // Espaces naturels
  parc: "#22c55e",
  jardin: "#84cc16",
  lac: "#3b82f6",
  île: "#06b6d4",
  prairie: "#a3e635",
  forêt: "#15803d",
  autre: "#6b7280",
  // Jardins partagés
  jardin_partage: "#f59e0b",
  jardin_collectif: "#f97316",
  friche: "#eab308",
  // Plaines de jeux
  plaine_jeux: "#ec4899",
};

// Icônes par catégorie
const categoryIcons: Record<string, string> = {
  parc: "🌳",
  jardin: "🌺",
  lac: "💧",
  île: "🏝️",
  prairie: "🌾",
  forêt: "🌲",
  jardin_partage: "🥕",
  jardin_collectif: "👨‍🌾",
  plaine_jeux: "🎠",
  autre: "📍",
};

// Fonction helper pour déterminer l'icône
const getSpaceIcon = (space: NaturalSpace): string => {
  if (space.category === "autre" && space.name.toLowerCase().includes("plaine")) {
    return categoryIcons.plaine_jeux;
  }
  return categoryIcons[space.category] || "📍";
};

const CarteInteractive = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const [naturalSpaces, setNaturalSpaces] = useState<NaturalSpace[]>([]);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [filters, setFilters] = useState({
    parc: true,
    jardin: true,
    lac: true,
    île: true,
    prairie: true,
    forêt: true,
    autre: true,
    jardin_partage: true,
    jardin_collectif: true,
  });

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Chargement des données...");

        // Récupérer les espaces naturels
        const { data: spacesData, error: spacesError } = await supabase
          .from("natural_spaces")
          .select("*")
          .not("lat", "is", null)
          .not("lng", "is", null);

        if (spacesError) {
          console.error("Erreur espaces:", spacesError);
          throw spacesError;
        }

        console.log(`${spacesData?.length || 0} espaces naturels chargés`);

        // Récupérer les jardins partagés
        const { data: gardensData, error: gardensError } = await supabase
          .from("gardens")
          .select("*")
          .not("lat", "is", null)
          .not("lng", "is", null);

        if (gardensError) {
          console.error("Erreur jardins:", gardensError);
          throw gardensError;
        }

        console.log(`${gardensData?.length || 0} jardins chargés`);

        setNaturalSpaces(spacesData || []);
        setGardens(gardensData || []);
        toast.success(`${(spacesData?.length || 0) + (gardensData?.length || 0)} lieux chargés`);
      } catch (error) {
        console.error("Erreur chargement données:", error);
        toast.error("Erreur lors du chargement de la carte");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || loading) return;

    try {
      const map = L.map(mapRef.current, {
        center: [47.4738, -0.5546],
        zoom: 13,
        scrollWheelZoom: true,
      });
      
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Forcer le redimensionnement
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error("Erreur initialisation carte:", error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  // Afficher les marqueurs
  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;

    console.log(`Affichage de ${naturalSpaces.length} espaces et ${gardens.length} jardins`);

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    let markersCount = 0;

    // Ajouter les espaces naturels
    naturalSpaces.forEach((space) => {
      if (!filters[space.category as keyof typeof filters]) return;

      const color = categoryColors[space.category] || "#6b7280";
      const icon = getSpaceIcon(space);
      const isPlaineJeux = space.category === "autre" && space.name.toLowerCase().includes("plaine");
      const displayCategory = isPlaineJeux ? "Plaine de jeux" : space.category;

      const marker = L.circleMarker([space.lat, space.lng], {
        radius: isPlaineJeux ? 10 : 12,
        fillColor: isPlaineJeux ? "#ec4899" : color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current!);

      const popupContent = `
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${icon}</span>
            <h3 class="font-bold text-lg">${space.name}</h3>
          </div>
          <p class="text-sm text-gray-600 mb-1"><strong>Type:</strong> ${displayCategory}</p>
          ${space.description ? `<p class="text-sm mb-2">${space.description}</p>` : ""}
          ${space.address ? `<p class="text-xs text-gray-500"><strong>📍</strong> ${space.address}</p>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      markersRef.current.push(marker);
      markersCount++;
    });

    // Ajouter les jardins partagés
    gardens.forEach((garden) => {
      if (!filters[garden.type as keyof typeof filters]) return;

      const color = categoryColors[garden.type] || "#f59e0b";
      const icon = categoryIcons[garden.type] || "🥕";

      const marker = L.circleMarker([garden.lat, garden.lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapInstanceRef.current!);

      const popupContent = `
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${icon}</span>
            <h3 class="font-bold text-lg">${garden.name}</h3>
          </div>
          <p class="text-sm text-gray-600 mb-1"><strong>Type:</strong> ${garden.type.replace("_", " ")}</p>
          ${garden.description ? `<p class="text-sm mb-2">${garden.description}</p>` : ""}
          ${garden.address ? `<p class="text-xs text-gray-500"><strong>📍</strong> ${garden.address}</p>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      markersRef.current.push(marker);
      markersCount++;
    });

    console.log(`${markersCount} marqueurs affichés sur la carte`);
  }, [naturalSpaces, gardens, filters, loading]);

  const toggleFilter = (category: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const totalVisible =
    naturalSpaces.filter((s) => filters[s.category as keyof typeof filters])
      .length +
    gardens.filter((g) => filters[g.type as keyof typeof filters]).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-nature-sky/20 to-background">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nature-sky/20 to-background pb-20">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-nature-green to-nature-sage bg-clip-text text-transparent">
            🗺️ Carte Interactive des Espaces Verts
          </h1>
          <p className="text-muted-foreground">
            Explorez les {naturalSpaces.length + gardens.length} espaces verts, parcs, jardins et plaines de jeux d'Angers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Trees className="h-5 w-5 text-nature-green" />
                Filtres ({totalVisible} visibles)
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    Espaces Naturels
                  </p>
                  <div className="space-y-2">
                    {Object.entries(filters)
                      .filter(([key]) => !key.includes("jardin_"))
                      .map(([category, checked]) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              toggleFilter(category as keyof typeof filters)
                            }
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: categoryColors[category],
                            }}
                          />
                          <span className="text-sm capitalize">
                            {categoryIcons[category]} {category}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    Jardins Partagés
                  </p>
                  <div className="space-y-2">
                    {Object.entries(filters)
                      .filter(([key]) => key.includes("jardin_"))
                      .map(([category, checked]) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              toggleFilter(category as keyof typeof filters)
                            }
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: categoryColors[category],
                            }}
                          />
                          <span className="text-sm">
                            {categoryIcons[category]}{" "}
                            {category.replace("_", " ")}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() =>
                  setFilters({
                    parc: true,
                    jardin: true,
                    lac: true,
                    île: true,
                    prairie: true,
                    forêt: true,
                    autre: true,
                    jardin_partage: true,
                    jardin_collectif: true,
                  })
                }
              >
                Tout afficher
              </Button>
            </CardContent>
          </Card>

          {/* Carte */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div
                  ref={mapRef}
                  className="w-full h-[calc(100vh-200px)] rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Légende */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Légende
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(categoryColors).map(([category, color]) => (
                    <div key={category} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm capitalize">
                        {categoryIcons[category]} {category.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarteInteractive;
