import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../context/store';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-primary-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
