import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/carte-interactive", label: "🗺️ Carte Interactive" },
    { to: "/balades", label: "Balades" },
    { to: "/jardins-partages", label: "Jardins Partagés" },
    { to: "/associations", label: "Associations" },
    { to: "/agenda", label: "Agenda" },
    { to: "/marches", label: "Marchés" },
    { to: "/quiz", label: "Quiz Nature" },
    { to: "/a-propos", label: "À propos" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary-light transition-colors">
            <span className="text-2xl">🌿</span>
            <span>Angers Nature</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                activeClassName="text-primary bg-muted"
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted flex items-center gap-1"
                activeClassName="text-primary bg-muted"
              >
                <Shield className="h-4 w-4" />
                Admin
              </NavLink>
            )}
            <ThemeToggle />
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="ml-2">
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                activeClassName="text-primary bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                activeClassName="text-primary bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
