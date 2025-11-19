import { useState, useEffect } from 'react';

export type FavoriteType = 'balade' | 'event' | 'garden' | 'association';

interface Favorite {
  id: string;
  type: FavoriteType;
  name: string;
  addedAt: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('angers-nature-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const addFavorite = (id: string, type: FavoriteType, name: string) => {
    const newFavorite: Favorite = {
      id,
      type,
      name,
      addedAt: new Date().toISOString(),
    };
    const updated = [...favorites, newFavorite];
    setFavorites(updated);
    localStorage.setItem('angers-nature-favorites', JSON.stringify(updated));
  };

  const removeFavorite = (id: string, type: FavoriteType) => {
    const updated = favorites.filter((fav) => !(fav.id === id && fav.type === type));
    setFavorites(updated);
    localStorage.setItem('angers-nature-favorites', JSON.stringify(updated));
  };

  const isFavorite = (id: string, type: FavoriteType) => {
    return favorites.some((fav) => fav.id === id && fav.type === type);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
