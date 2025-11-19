import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  onClose?: () => void;
}

const EventRegistrationForm = ({ eventId, eventTitle, onClose }: EventRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    participants: "1",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Stocker l'inscription en localStorage
    const registrations = JSON.parse(localStorage.getItem("event_registrations") || "[]");
    const newRegistration = {
      id: Date.now(),
      eventId,
      eventTitle,
      ...formData,
      date: new Date().toISOString()
    };
    
    registrations.push(newRegistration);
    localStorage.setItem("event_registrations", JSON.stringify(registrations));
    
    toast.success("Inscription confirmée !", {
      description: `Vous êtes inscrit(e) à "${eventTitle}". Un email de confirmation vous sera envoyé.`
    });
    
    setFormData({
      name: "",
      email: "",
      phone: "",
      participants: "1",
      message: ""
    });
    
    if (onClose) onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>S'inscrire à l'événement</CardTitle>
        <CardDescription>{eventTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom et prénom *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">Nombre de participants *</Label>
            <Input
              id="participants"
              type="number"
              min="1"
              max="10"
              required
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Questions ou informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Confirmer l'inscription
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventRegistrationForm;
