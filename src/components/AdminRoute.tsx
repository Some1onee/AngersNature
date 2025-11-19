import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground mb-6">
                Vous devez être connecté pour accéder à cette page
              </p>
              <Link to="/login">
                <Button>Se connecter</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardContent className="py-12 text-center">
              <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2 text-destructive">Accès interdit</h2>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas les permissions nécessaires pour accéder au panel administrateur.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Cette section est réservée aux administrateurs uniquement.
              </p>
              <Link to="/">
                <Button variant="outline">Retour à l'accueil</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
