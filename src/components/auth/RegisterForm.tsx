import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.username,
      formData.fullName
    );

    if (error) {
      toast.error('Erreur lors de l\'inscription', {
        description: error.message,
      });
    } else {
      toast.success('Inscription réussie !', {
        description: 'Vérifiez votre email pour confirmer votre compte.',
      });
      onSuccess?.();
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          Créez un compte pour rejoindre la communauté
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur *</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet (optionnel)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            S'inscrire
          </Button>

          {onSwitchToLogin && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Déjà un compte ? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={onSwitchToLogin}
              >
                Se connecter
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
