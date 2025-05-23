import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2.5 hover:bg-background-secondary"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
