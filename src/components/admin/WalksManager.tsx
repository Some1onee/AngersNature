import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

type Walk = {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  type: string;
  lat: number;
  lng: number;
  highlights: string[];
  gmaps_url?: string;
};

const WalksManager = () => {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWalk, setEditingWalk] = useState<Walk | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    difficulty: "facile",
    type: "urbain",
    lat: 47.4738,
    lng: -0.5546,
    highlights: "",
    gmaps_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalks();
  }, []);

  const fetchWalks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("walks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWalks(data || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        duration: Number(formData.duration),
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        highlights: formData.highlights.split("\n").filter((h) => h.trim()),
      };

      if (editingWalk) {
        const { error } = await supabase
          .from("walks")
          .update(dataToSubmit)
          .eq("id", editingWalk.id);

        if (error) throw error;
        toast.success("Balade modifiée !");
      } else {
        const { error } = await supabase.from("walks").insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Balade créée !");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchWalks();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (walk: Walk) => {
    setEditingWalk(walk);
    setFormData({
      name: walk.name,
      description: walk.description,
      duration: walk.duration,
      difficulty: walk.difficulty,
      type: walk.type,
      lat: walk.lat,
      lng: walk.lng,
      highlights: walk.highlights?.join("\n") || "",
      gmaps_url: walk.gmaps_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("walks").delete().eq("id", id);

      if (error) throw error;
      toast.success("Balade supprimée");
      fetchWalks();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingWalk(null);
    setFormData({
      name: "",
      description: "",
      duration: 60,
      difficulty: "facile",
      type: "urbain",
      lat: 47.4738,
      lng: -0.5546,
      highlights: "",
      gmaps_url: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Balades ({walks.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle balade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWalk ? "Modifier la balade" : "Nouvelle balade"}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de la balade
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Durée (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulté *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urbain">Urbain</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lng">Longitude *</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="highlights">Points d'intérêt (un par ligne)</Label>
                  <Textarea
                    id="highlights"
                    value={formData.highlights}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    rows={4}
                    placeholder="Jardin du Mail&#10;Parc Balzac&#10;Bords de Maine"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="gmaps_url">URL Google Maps</Label>
                  <Input
                    id="gmaps_url"
                    value={formData.gmaps_url}
                    onChange={(e) => setFormData({ ...formData, gmaps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>{editingWalk ? "Modifier" : "Créer"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Difficulté</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {walks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucune balade
                </TableCell>
              </TableRow>
            ) : (
              walks.map((walk) => (
                <TableRow key={walk.id}>
                  <TableCell className="font-medium">{walk.name}</TableCell>
                  <TableCell>{walk.duration} min</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        walk.difficulty === "facile"
                          ? "default"
                          : walk.difficulty === "moyen"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {walk.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{walk.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {walk.lat.toFixed(4)}, {walk.lng.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(walk)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{walk.name}" ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(walk.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WalksManager;
