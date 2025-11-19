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
import { Plus, Edit, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

type Market = {
  id: string;
  name: string;
  description: string;
  address: string;
  district: string;
  days_of_week: string[];
  opening_hours: string;
  type?: string;
  lat: number;
  lng: number;
};

const MarketsManager = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    district: "",
    days_of_week: "",
    opening_hours: "",
    type: "mixte",
    lat: 47.4738,
    lng: -0.5546,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setMarkets(data || []);
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
        address: formData.address,
        district: formData.district,
        days_of_week: formData.days_of_week.split(",").map((d) => d.trim()).filter(Boolean),
        opening_hours: formData.opening_hours,
        type: formData.type,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      };

      if (editingMarket) {
        const { error } = await supabase
          .from("markets")
          .update(dataToSubmit)
          .eq("id", editingMarket.id);

        if (error) throw error;
        toast.success("Marché modifié !");
      } else {
        const { error } = await supabase.from("markets").insert([dataToSubmit]);

        if (error) throw error;
        toast.success("Marché créé !");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMarkets();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (market: Market) => {
    setEditingMarket(market);
    setFormData({
      name: market.name,
      description: market.description,
      address: market.address,
      district: market.district,
      days_of_week: market.days_of_week.join(", "),
      opening_hours: market.opening_hours,
      type: market.type || "mixte",
      lat: market.lat,
      lng: market.lng,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("markets").delete().eq("id", id);

      if (error) throw error;
      toast.success("Marché supprimé");
      fetchMarkets();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setEditingMarket(null);
    setFormData({
      name: "",
      description: "",
      address: "",
      district: "",
      days_of_week: "",
      opening_hours: "",
      type: "mixte",
      lat: 47.4738,
      lng: -0.5546,
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
        <h3 className="text-lg font-semibold">Marchés ({markets.length})</h3>
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
              Nouveau marché
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMarket ? "Modifier le marché" : "Nouveau marché"}
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
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
                      <SelectItem value="alimentaire">Alimentaire</SelectItem>
                      <SelectItem value="bio">Bio</SelectItem>
                      <SelectItem value="producteurs">Producteurs</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="days_of_week">Jours (séparés par des virgules) *</Label>
                  <Input
                    id="days_of_week"
                    value={formData.days_of_week}
                    onChange={(e) => setFormData({ ...formData, days_of_week: e.target.value })}
                    placeholder="Lundi, Mercredi, Samedi"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="opening_hours">Horaires *</Label>
                  <Input
                    id="opening_hours"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    placeholder="08:00-13:30"
                    required
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
                    <>{editingMarket ? "Modifier" : "Créer"}</>
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
              <TableHead>Quartier</TableHead>
              <TableHead>Jours</TableHead>
              <TableHead>Horaires</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucun marché
                </TableCell>
              </TableRow>
            ) : (
              markets.map((market) => (
                <TableRow key={market.id}>
                  <TableCell className="font-medium">{market.name}</TableCell>
                  <TableCell>{market.district}</TableCell>
                  <TableCell className="text-sm">{market.days_of_week?.join(", ")}</TableCell>
                  <TableCell className="text-sm">{market.opening_hours}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {market.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(market)}>
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
                              Êtes-vous sûr de vouloir supprimer "{market.name}" ? Cette action
                              est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(market.id)}
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

export default MarketsManager;
