import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Garden = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  is_open_to_public: boolean;
  district: string;
};

const GardensManager = () => {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "jardin_partage",
    description: "",
    lat: 47.4738,
    lng: -0.5546,
    address: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    is_open_to_public: true,
    district: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGardens();
  }, []);

  const fetchGardens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gardens")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setGardens(data || []);
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
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        website: formData.website || null,
      };

      if (editingGarden) {
        const { error } = await supabase
          .from("gardens")
          .update(dataToSubmit)
          .eq("id", editingGarden.id);

        if (error) throw error;
        toast.success("Jardin modifié !");
      } else {
        const { error } = await supabase.from("gardens").insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Jardin créé !");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchGardens();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (garden: Garden) => {
    setEditingGarden(garden);
    setFormData({
      name: garden.name,
      type: garden.type,
      description: garden.description || "",
      lat: garden.lat,
      lng: garden.lng,
      address: garden.address || "",
      contact_email: garden.contact_email || "",
      contact_phone: garden.contact_phone || "",
      website: garden.website || "",
      is_open_to_public: garden.is_open_to_public,
      district: garden.district,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("gardens").delete().eq("id", id);

      if (error) throw error;
      toast.success("Jardin supprimé");
      fetchGardens();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingGarden(null);
    setFormData({
      name: "",
      type: "jardin_partage",
      description: "",
      lat: 47.4738,
      lng: -0.5546,
      address: "",
      contact_email: "",
      contact_phone: "",
      website: "",
      is_open_to_public: true,
      district: "",
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
        <h3 className="text-lg font-semibold">Jardins partagés ({gardens.length})</h3>
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
              Nouveau jardin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGarden ? "Modifier le jardin" : "Nouveau jardin partagé"}
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
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jardin_partage">Jardin partagé</SelectItem>
                      <SelectItem value="jardin_collectif">Jardin collectif</SelectItem>
                      <SelectItem value="friche">Friche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="district">Quartier *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
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

                <div className="col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Téléphone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id="is_open_to_public"
                    checked={formData.is_open_to_public}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_open_to_public: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_open_to_public" className="cursor-pointer">
                    Ouvert au public
                  </Label>
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
                    <>{editingGarden ? "Modifier" : "Créer"}</>
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
              <TableHead>Type</TableHead>
              <TableHead>Quartier</TableHead>
              <TableHead>Accès</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gardens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun jardin partagé
                </TableCell>
              </TableRow>
            ) : (
              gardens.map((garden) => (
                <TableRow key={garden.id}>
                  <TableCell className="font-medium">{garden.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {garden.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{garden.district}</TableCell>
                  <TableCell>
                    {garden.is_open_to_public ? (
                      <Badge variant="default" className="bg-green-500">
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sur inscription</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(garden)}>
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
                              Êtes-vous sûr de vouloir supprimer "{garden.name}" ? Cette
                              action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(garden.id)}
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

export default GardensManager;
