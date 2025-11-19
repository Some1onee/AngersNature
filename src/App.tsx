import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RatingPopup from "@/components/RatingPopup";
import Home from "./pages/Home";
import Balades from "./pages/Balades";
import JardinsPartages from "./pages/JardinsPartages";
import Associations from "./pages/Associations";
import Agenda from "./pages/Agenda";
import Marches from "./pages/Marches";
import Quiz from "./pages/Quiz";
import Profil from "./pages/Profil";
import APropos from "./pages/APropos";
import Admin from "./pages/Admin";
import AdminNew from "./pages/AdminNew";
import AdminRatings from "./pages/AdminRatings";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
import ProposerBalade from "./pages/ProposerBalade";
import Settings from "./pages/Settings";
import CarteInteractive from "./pages/CarteInteractive";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RatingPopup />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/balades" element={<Balades />} />
            <Route path="/jardins-partages" element={<JardinsPartages />} />
            <Route path="/associations" element={<Associations />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/marches" element={<Marches />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/carte-interactive" element={<CarteInteractive />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/ratings" element={
              <AdminRoute>
                <AdminRatings />
              </AdminRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Navigate to="/profil" replace />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/proposer-balade" element={<ProposerBalade />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
