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
import { Plus, Edit, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  start_at: string;
  end_at?: string;
  location: string;
  organizer: string;
  is_free: boolean;
  price_info?: string;
  contact_email?: string;
  website?: string;
};

const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "sortie",
    start_at: "",
    end_at: "",
    location: "",
    organizer: "",
    is_free: true,
    price_info: "",
    contact_email: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
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
        end_at: formData.end_at || null,
        price_info: formData.price_info || null,
        contact_email: formData.contact_email || null,
        website: formData.website || null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(dataToSubmit)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Événement modifié !");
      } else {
        const { error } = await supabase.from("events").insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Événement créé !");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      start_at: event.start_at.slice(0, 16),
      end_at: event.end_at ? event.end_at.slice(0, 16) : "",
      location: event.location,
      organizer: event.organizer,
      is_free: event.is_free,
      price_info: event.price_info || "",
      contact_email: event.contact_email || "",
      website: event.website || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
      toast.success("Événement supprimé");
      fetchEvents();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      category: "sortie",
      start_at: "",
      end_at: "",
      location: "",
      organizer: "",
      is_free: true,
      price_info: "",
      contact_email: "",
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
        <h3 className="text-lg font-semibold">Événements ({events.length})</h3>
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
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Modifier l'événement" : "Nouvel événement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sortie">Sortie</SelectItem>
                      <SelectItem value="atelier">Atelier</SelectItem>
                      <SelectItem value="chantier">Chantier</SelectItem>
                      <SelectItem value="conference">Conférence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="organizer">Organisateur *</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_at">Date/heure début *</Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_at">Date/heure fin</Label>
                  <Input
                    id="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_free: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_free" className="cursor-pointer">
                    Gratuit
                  </Label>
                </div>

                {!formData.is_free && (
                  <div className="col-span-2">
                    <Label htmlFor="price_info">Informations tarifaires</Label>
                    <Input
                      id="price_info"
                      value={formData.price_info}
                      onChange={(e) => setFormData({ ...formData, price_info: e.target.value })}
                      placeholder="Ex: 5€ / gratuit -12 ans"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="contact_email">Email de contact</Label>
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
                    <>{editingEvent ? "Modifier" : "Créer"}</>
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
              <TableHead>Titre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Gratuit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucun événement
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.start_at).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{event.location}</TableCell>
                  <TableCell>
                    {event.is_free ? (
                      <Badge variant="default" className="bg-green-500">
                        Gratuit
                      </Badge>
                    ) : (
                      <Badge variant="outline">Payant</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
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
                              Êtes-vous sûr de vouloir supprimer "{event.title}" ? Cette action
                              est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event.id)}
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

export default EventsManager;
