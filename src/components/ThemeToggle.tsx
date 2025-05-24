import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div>
      <button
        onClick={() => handleThemeChange('light')}
        className="rounded-lg p-2.5 hover:bg-background-secondary"
      >
        Light
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className="rounded-lg p-2.5 hover:bg-background-secondary"
      >
        Dark
      </button>
    </div>
  );
}
