import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

type Association = {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  category: string[];
  contact_email?: string;
  address?: string;
  website?: string;
};

const AssociationsManager = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    category: "",
    contact_email: "",
    address: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("associations")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setAssociations(data || []);
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
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description || null,
        category: formData.category.split(",").map((c) => c.trim()).filter(Boolean),
        contact_email: formData.contact_email || null,
        address: formData.address || null,
        website: formData.website || null,
      };

      if (editingAssociation) {
        const { error } = await supabase
          .from("associations")
          .update(dataToSubmit)
          .eq("id", editingAssociation.id);

        if (error) throw error;
        toast.success("Association modifiée !");
      } else {
        const { error } = await supabase.from("associations").insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Association créée !");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAssociations();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (association: Association) => {
    setEditingAssociation(association);
    setFormData({
      name: association.name,
      description: association.description,
      short_description: association.short_description || "",
      category: association.category.join(", "),
      contact_email: association.contact_email || "",
      address: association.address || "",
      website: association.website || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("associations").delete().eq("id", id);

      if (error) throw error;
      toast.success("Association supprimée");
      fetchAssociations();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingAssociation(null);
    setFormData({
      name: "",
      description: "",
      short_description: "",
      category: "",
      contact_email: "",
      address: "",
      website: "",
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
        <h3 className="text-lg font-semibold">Associations ({associations.length})</h3>
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
              Nouvelle association
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAssociation ? "Modifier l'association" : "Nouvelle association"}
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

                <div className="col-span-2">
                  <Label htmlFor="short_description">Description courte</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description complète *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="category">Catégories (séparées par des virgules)</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="environnement, biodiversité, nature"
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
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                    <>{editingAssociation ? "Modifier" : "Créer"}</>
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
              <TableHead>Catégories</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Site web</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {associations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucune association
                </TableCell>
              </TableRow>
            ) : (
              associations.map((association) => (
                <TableRow key={association.id}>
                  <TableCell className="font-medium">{association.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {association.category?.slice(0, 2).map((cat, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {association.category && association.category.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{association.category.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{association.contact_email || "-"}</TableCell>
                  <TableCell className="text-sm">
                    {association.website ? (
                      <a
                        href={association.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Lien
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(association)}>
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
                              Êtes-vous sûr de vouloir supprimer "{association.name}" ? Cette
                              action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(association.id)}
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

export default AssociationsManager;
