import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {theme === 'dark' ? (
          <FaSun className="w-5 h-5 text-yellow-400 animate-pulse" />
        ) : (
          <FaMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
