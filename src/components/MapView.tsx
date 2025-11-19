import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPoint {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  description?: string;
}

interface MapPath {
  id: string | number;
  name: string;
  coordinates: [number, number][];
  color?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapPoint[];
  paths?: MapPath[];
  height?: string;
}

const MapView = ({ 
  center = [47.4784, -0.5632], // Angers coordinates
  zoom = 13,
  markers = [],
  paths = [],
  height = "500px"
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialiser la carte
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Ajouter le layer de tiles OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Ajouter les marqueurs
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: DefaultIcon }).addTo(map);
      
      let popupContent = `<div class="text-sm"><h3 class="font-semibold mb-1">${marker.name}</h3>`;
      if (marker.type) {
        popupContent += `<p class="text-xs text-gray-600 mb-1">${marker.type}</p>`;
      }
      if (marker.description) {
        popupContent += `<p class="text-xs">${marker.description}</p>`;
      }
      popupContent += "</div>";
      
      leafletMarker.bindPopup(popupContent);
    });

    // Ajouter les chemins
    paths.forEach((path) => {
      const polyline = L.polyline(path.coordinates, {
        color: path.color || "#2a7c3f",
        weight: 4,
      }).addTo(map);
      
      polyline.bindPopup(`<div class="text-sm font-semibold">${path.name}</div>`);
    });

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom, markers, paths]);

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className="rounded-lg overflow-hidden border border-border shadow-sm"
    />
  );
};

export default MapView;
