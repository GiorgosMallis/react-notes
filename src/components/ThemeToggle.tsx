import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, toggleTheme }) => {
  return (
    <div className="theme-toggle">
      <button 
        className="theme-toggle-button" 
        onClick={toggleTheme}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <i className="icon-light-mode"></i>
        ) : (
          <i className="icon-dark-mode"></i>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
