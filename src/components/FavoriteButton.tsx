import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useFavorites, FavoriteType } from "@/hooks/useFavorites";
import { toast } from "sonner";

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  name: string;
  variant?: "default" | "ghost";
}

export const FavoriteButton = ({ id, type, name, variant = "ghost" }: FavoriteButtonProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(id, type);

  const handleToggle = () => {
    if (favorite) {
      removeFavorite(id, type);
      toast.info(`Retiré des favoris`);
    } else {
      addFavorite(id, type, name);
      toast.success(`Ajouté aux favoris !`);
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleToggle}
      className="transition-transform hover:scale-110"
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          favorite ? "fill-red-500 text-red-500" : ""
        }`}
      />
    </Button>
  );
};
