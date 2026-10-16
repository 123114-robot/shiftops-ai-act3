import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-context';

const storageKey = 'shiftops_theme';
const preferredTheme = (): Theme => {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(preferredTheme);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const value = useMemo(() => ({
    theme,
    setTheme(next: Theme) { localStorage.setItem(storageKey, next); setThemeState(next); },
    toggleTheme() {
      setThemeState(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(storageKey, next);
        return next;
      });
    },
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
