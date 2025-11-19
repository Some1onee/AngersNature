import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('angers-nature-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = (stored as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('angers-nature-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return { theme, toggleTheme };
};
