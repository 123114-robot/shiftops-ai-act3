import { useTheme } from '../features/theme/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return <button className="button button--quiet theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${next} mode`}>
    <span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span><span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
  </button>;
}
