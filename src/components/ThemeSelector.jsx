// src/components/ThemeSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { FaSun, FaMoon, FaDesktop, FaChevronDown, FaCheck } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSelector({ position = 'bottom' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, resolvedTheme, setLightMode, setDarkMode, setSystemMode } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    {
      id: 'light',
      label: 'Claro',
      icon: FaSun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      darkBgColor: 'dark:bg-yellow-900/20',
      action: setLightMode
    },
    {
      id: 'dark',
      label: 'Oscuro',
      icon: FaMoon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900/20',
      action: setDarkMode
    },
    {
      id: 'system',
      label: 'Automático',
      icon: FaDesktop,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      darkBgColor: 'dark:bg-gray-900/20',
      action: setSystemMode
    }
  ];

  const currentTheme = themeOptions.find(opt => opt.id === theme) || themeOptions[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="Selector de tema"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <currentTheme.icon className={`text-lg ${currentTheme.color}`} />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
          Tema
        </span>
        <FaChevronDown className={`text-gray-500 text-xs transition-transform ${isOpen ? 'rotate-180' : ''} dark:text-gray-400`} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 dark:bg-gray-800 dark:border-gray-700`}>
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Elegir tema
            </h3>
          </div>
          
          <div className="py-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    theme === option.id 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${option.bgColor} ${option.darkBgColor}`}>
                    <Icon className={`text-base ${option.color}`} />
                  </div>
                  <span className="flex-1 text-left">{option.label}</span>
                  {theme === option.id && (
                    <FaCheck className="text-blue-500 text-xs" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Estado actual */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Actual: <span className="font-medium text-gray-700 dark:text-gray-300">{currentTheme.label}</span>
              {theme === 'system' && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ({resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'} del sistema)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}