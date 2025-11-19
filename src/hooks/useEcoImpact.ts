import { useState, useEffect } from 'react';

interface EcoStats {
  walksCompleted: number;
  kmTraveled: number;
  co2Saved: number; // en kg
  treesEquivalent: number;
}

export const useEcoImpact = () => {
  const [stats, setStats] = useState<EcoStats>({
    walksCompleted: 0,
    kmTraveled: 0,
    co2Saved: 0,
    treesEquivalent: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('angers-nature-eco-stats');
    if (stored) {
      setStats(JSON.parse(stored));
    }
  }, []);

  const addWalk = (kmDistance: number) => {
    // 1 km en voiture = ~0.12 kg CO2
    // 1 arbre absorbe ~20 kg CO2/an
    const co2SavedForThisWalk = kmDistance * 0.12;
    const newStats = {
      walksCompleted: stats.walksCompleted + 1,
      kmTraveled: stats.kmTraveled + kmDistance,
      co2Saved: stats.co2Saved + co2SavedForThisWalk,
      treesEquivalent: (stats.co2Saved + co2SavedForThisWalk) / 20,
    };
    
    setStats(newStats);
    localStorage.setItem('angers-nature-eco-stats', JSON.stringify(newStats));
  };

  const resetStats = () => {
    const emptyStats = {
      walksCompleted: 0,
      kmTraveled: 0,
      co2Saved: 0,
      treesEquivalent: 0,
    };
    setStats(emptyStats);
    localStorage.setItem('angers-nature-eco-stats', JSON.stringify(emptyStats));
  };

  return { stats, addWalk, resetStats };
};
