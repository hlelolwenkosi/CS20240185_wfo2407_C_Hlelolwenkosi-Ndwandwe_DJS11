import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function ThemeToggle() {
  // Use the custom useLocalStorage hook to persist the theme preference
  // The initial value is set to false (light mode)
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);

  // Toggle theme and update the 'dark' class on the HTML element
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                 text-gray-600 dark:text-gray-300"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Render the Sun icon when in dark mode, Moon icon when in light mode */}
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}