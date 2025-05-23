import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <button
        onClick={() => setTheme('light')}
        className="rounded-lg p-2.5 hover:bg-background-secondary"
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className="rounded-lg p-2.5 hover:bg-background-secondary"
      >
        Dark
      </button>
    </div>
  );
}
