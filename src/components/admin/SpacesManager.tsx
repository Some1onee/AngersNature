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
import { Plus, Edit, Trash2, Loader2, Leaf } from "lucide-react";
import { toast } from "sonner";

type NaturalSpace = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
};

const SpacesManager = () => {
  const [spaces, setSpaces] = useState<NaturalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<NaturalSpace | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "parc",
    description: "",
    lat: 47.4738,
    lng: -0.5546,
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("natural_spaces")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setSpaces(data || []);
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
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        description: formData.description || null,
        address: formData.address || null,
      };

      if (editingSpace) {
        const { error } = await supabase
          .from("natural_spaces")
          .update(dataToSubmit)
          .eq("id", editingSpace.id);

        if (error) throw error;
        toast.success("Espace modifié !");
      } else {
        const { error } = await supabase.from("natural_spaces").insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Espace créé !");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSpaces();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (space: NaturalSpace) => {
    setEditingSpace(space);
    setFormData({
      name: space.name,
      category: space.category,
      description: space.description || "",
      lat: space.lat,
      lng: space.lng,
      address: space.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("natural_spaces").delete().eq("id", id);

      if (error) throw error;
      toast.success("Espace supprimé");
      fetchSpaces();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingSpace(null);
    setFormData({
      name: "",
      category: "parc",
      description: "",
      lat: 47.4738,
      lng: -0.5546,
      address: "",
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
        <h3 className="text-lg font-semibold">Espaces naturels ({spaces.length})</h3>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel espace
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSpace ? "Modifier l'espace" : "Nouvel espace naturel"}
              </DialogTitle>
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

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parc">Parc</SelectItem>
                      <SelectItem value="jardin">Jardin</SelectItem>
                      <SelectItem value="lac">Lac</SelectItem>
                      <SelectItem value="île">Île</SelectItem>
                      <SelectItem value="prairie">Prairie</SelectItem>
                      <SelectItem value="forêt">Forêt</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
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
                    <>{editingSpace ? "Modifier" : "Créer"}</>
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
              <TableHead>Catégorie</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Coordonnées</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun espace naturel
                </TableCell>
              </TableRow>
            ) : (
              spaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell className="font-medium">{space.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {space.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{space.address || "-"}</TableCell>
                  <TableCell className="text-xs">
                    {space.lat.toFixed(4)}, {space.lng.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(space)}>
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
                              Êtes-vous sûr de vouloir supprimer "{space.name}" ? Cette action
                              est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(space.id)}
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

export default SpacesManager;
