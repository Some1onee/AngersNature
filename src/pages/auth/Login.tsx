import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Rediriger si déjà connecté
  if (user) {
    navigate('/profile');
    return null;
  }

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Bienvenue !</h1>
            <p className="text-muted-foreground">
              Connectez-vous ou créez un compte pour accéder aux fonctionnalités sociales
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            </TabsContent>
          </Tabs>

          <Card className="mt-6 bg-muted/30">
            <CardContent className="pt-6 text-sm text-center text-muted-foreground">
              En vous connectant, vous pourrez :
              <ul className="mt-3 space-y-1 text-left max-w-xs mx-auto">
                <li>✅ Commenter les balades et lieux</li>
                <li>✅ Ajouter des amis et créer des groupes</li>
                <li>✅ Proposer des questions de quiz</li>
                <li>✅ Laisser des avis et notes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
