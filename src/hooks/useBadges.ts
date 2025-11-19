import { useState, useEffect } from 'react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const allBadges: Badge[] = [
  {
    id: 'first-walk',
    name: 'Premier pas',
    description: 'Complétez votre première balade',
    icon: '🥾',
    unlocked: false,
  },
  {
    id: 'eco-warrior',
    name: 'Éco-guerrier',
    description: 'Économisez 10 kg de CO2',
    icon: '🌍',
    unlocked: false,
  },
  {
    id: 'nature-lover',
    name: 'Amoureux de la nature',
    description: 'Ajoutez 5 favoris',
    icon: '💚',
    unlocked: false,
  },
  {
    id: 'quiz-master',
    name: 'Expert biodiversité',
    description: 'Obtenez 80% ou plus au quiz',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Complétez 5 balades',
    icon: '🗺️',
    unlocked: false,
  },
  {
    id: 'green-hero',
    name: 'Héros vert',
    description: 'Économisez 50 kg de CO2',
    icon: '🦸',
    unlocked: false,
  },
];

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>(allBadges);

  useEffect(() => {
    const stored = localStorage.getItem('angers-nature-badges');
    if (stored) {
      setBadges(JSON.parse(stored));
    }
  }, []);

  const unlockBadge = (badgeId: string) => {
    const updated = badges.map((badge) =>
      badge.id === badgeId && !badge.unlocked
        ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() }
        : badge
    );
    setBadges(updated);
    localStorage.setItem('angers-nature-badges', JSON.stringify(updated));
    return updated.find(b => b.id === badgeId);
  };

  const checkAndUnlockBadges = (stats: { walksCompleted: number; co2Saved: number; favorites: number; quizScore?: number }) => {
    const newlyUnlocked: Badge[] = [];

    if (stats.walksCompleted >= 1 && !badges.find(b => b.id === 'first-walk')?.unlocked) {
      const badge = unlockBadge('first-walk');
      if (badge) newlyUnlocked.push(badge);
    }
    if (stats.walksCompleted >= 5 && !badges.find(b => b.id === 'explorer')?.unlocked) {
      const badge = unlockBadge('explorer');
      if (badge) newlyUnlocked.push(badge);
    }
    if (stats.co2Saved >= 10 && !badges.find(b => b.id === 'eco-warrior')?.unlocked) {
      const badge = unlockBadge('eco-warrior');
      if (badge) newlyUnlocked.push(badge);
    }
    if (stats.co2Saved >= 50 && !badges.find(b => b.id === 'green-hero')?.unlocked) {
      const badge = unlockBadge('green-hero');
      if (badge) newlyUnlocked.push(badge);
    }
    if (stats.favorites >= 5 && !badges.find(b => b.id === 'nature-lover')?.unlocked) {
      const badge = unlockBadge('nature-lover');
      if (badge) newlyUnlocked.push(badge);
    }
    if (stats.quizScore && stats.quizScore >= 80 && !badges.find(b => b.id === 'quiz-master')?.unlocked) {
      const badge = unlockBadge('quiz-master');
      if (badge) newlyUnlocked.push(badge);
    }

    return newlyUnlocked;
  };

  return { badges, unlockBadge, checkAndUnlockBadges };
};
