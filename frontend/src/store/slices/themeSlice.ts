import { StateCreator } from 'zustand';
import { ThemeState, ThemeStateSlice, ThemeMode, ThemeAccent } from '../types';

const initialTheme: ThemeState = {
  mode: 'dark',
  accent: 'purple',
};

export const createThemeSlice: StateCreator<ThemeStateSlice> = (set, get) => ({
  theme: initialTheme,

  setThemeMode: (mode: ThemeMode) => {
    const { theme } = get();
    set({ theme: { ...theme, mode } });
    
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  setThemeAccent: (accent: ThemeAccent) => {
    const { theme } = get();
    set({ theme: { ...theme, accent } });
  },

  toggleThemeMode: () => {
    const { theme, setThemeMode } = get();
    const newMode: ThemeMode = theme.mode === 'dark' ? 'light' : theme.mode === 'light' ? 'system' : 'dark';
    setThemeMode(newMode);
  },
});
