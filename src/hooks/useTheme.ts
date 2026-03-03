import { useState, useEffect } from 'react';

const THEME_KEY = 'pomotask-theme';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load theme from settings or localStorage
    const loadTheme = async () => {
      try {
        if (window.electronAPI) {
          const settings = await window.electronAPI.getAllSettings();
          const savedTheme = settings.dark_mode === 'true' ? 'dark' : 'light';
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          // Fallback for web development
          const stored = localStorage.getItem(THEME_KEY);
          if (stored) {
            setTheme(stored as 'light' | 'dark');
            document.documentElement.setAttribute('data-theme', stored);
          }
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.setSetting('dark_mode', newTheme === 'dark' ? 'true' : 'false');
      } else {
        localStorage.setItem(THEME_KEY, newTheme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return { theme, toggleTheme, isLoaded };
}
