import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="theme-toggle">
      <button 
        className="theme-toggle-button" 
        onClick={toggleDarkMode}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <span className="material-icons">light_mode</span>
        ) : (
          <span className="material-icons">dark_mode</span>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
