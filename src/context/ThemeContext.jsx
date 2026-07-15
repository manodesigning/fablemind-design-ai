import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, THEME } from '../config/constants';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return stored || THEME.DARK;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === THEME.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => (t === THEME.DARK ? THEME.LIGHT : THEME.DARK));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === THEME.DARK }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
