// src/components/estudiante/EstudianteNavbar.jsx
import { useState, useEffect, useRef } from "react";
import { FaUser, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import ThemeSelector from "../ThemeSelector";

// Componente de Perfil Desplegable
function PerfilDesplegable({ userData }) {
  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        <FaUser className="text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
          {userData?.nombres || 'Usuario'}
        </span>
        <FaChevronDown className={`text-blue-600 transition-transform ${abierto ? 'rotate-180' : ''} dark:text-blue-400`} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 dark:bg-gray-800 dark:border-gray-700">
          {/* Header del perfil */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">{userData?.nombres} {userData?.apellidos}</h3>
            <p className="text-sm text-gray-600 truncate dark:text-gray-400">{userData?.correo}</p>
          </div>

          {/* Información del perfil */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Usuario:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userData?.usuario}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Cédula:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userData?.cedula}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Celular:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{userData?.celular}</span>
            </div>
            {userData?.ciudad && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Ciudad:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{userData.ciudad}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="border-t border-gray-100 pt-2 dark:border-gray-700">
            <button
              onClick={handleCerrarSesion}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <FaSignOutAlt />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EstudianteNavbar({ onMenuClick, userData }) {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-3 sm:px-4 py-3 flex items-center justify-between gap-3 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
          </svg>
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Selector de Tema */}
        <ThemeSelector position="bottom" />
        
        {/* Perfil */}
        <PerfilDesplegable userData={userData} />
      </div>
    </nav>
  );
}