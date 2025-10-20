// src/components/estudiante/EstudianteNavbar.jsx - SIN CIUDAD
import { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaTimes,
  FaEnvelope,
  FaWhatsapp,
  FaBook,
  FaUser,
  FaChevronDown,
  FaSignOutAlt,
  FaGraduationCap,
  FaUserGraduate,
} from "react-icons/fa";
import ThemeSelector from "../ThemeSelector";

// Componente de Perfil Desplegable para Estudiante - SIN CIUDAD
function PerfilDesplegableEstudiante({ userData }) {
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
    localStorage.removeItem("userRol");
    window.location.href = "/login";
  };

  // ✅ DATOS SEGUROS - Sin ciudad
  const safeUserData = userData
    ? {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        correo: userData.correo,
        usuario: userData.usuario,
        cedula: userData.cedula,
        celular: userData.celular,
        // ❌ CIUDAD ELIMINADA
        empresa: userData.empresa,
        curso: userData.curso,
        progreso: userData.progreso,
      }
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-gray-700 rounded-xl hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
        aria-label="Menú de perfil"
      >
        <FaUser className="text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
          {safeUserData?.nombres || "Estudiante"}
        </span>
        <FaChevronDown
          className={`text-blue-600 dark:text-blue-400 transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Header del perfil */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {safeUserData?.nombres} {safeUserData?.apellidos}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {safeUserData?.correo}
            </p>
          </div>

          {/* Información del perfil - SIN CIUDAD */}
          <div className="px-4 py-3 space-y-2">
            {safeUserData?.usuario && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Usuario:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {safeUserData.usuario}
                </span>
              </div>
            )}

            {safeUserData?.cedula && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Cédula:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {safeUserData.cedula}
                </span>
              </div>
            )}

            {safeUserData?.celular && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Celular:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {safeUserData.celular}
                </span>
              </div>
            )}

            {/* ❌ SECCIÓN DE CIUDAD ELIMINADA */}

            {safeUserData?.empresa && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Empresa:
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {safeUserData.empresa}
                </span>
              </div>
            )}

            {safeUserData?.curso && (
              <div className="flex items-center gap-2 text-sm">
                <FaGraduationCap className="text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">
                  {safeUserData.curso}
                </span>
              </div>
            )}

            {safeUserData?.progreso !== undefined && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progreso del curso</span>
                  <span>{safeUserData.progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${safeUserData.progreso}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Badge de Estudiante */}
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-y border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FaUserGraduate className="text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 text-xs font-semibold">
                🎓 Estudiante
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-2">
            <button
              onClick={handleCerrarSesion}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

// El resto del código se mantiene igual...
export default function EstudianteNavbar({
  onMenuClick,
  userData,
}) {
  return (
    <nav className="relative z-40 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path
              fill="currentColor"
              d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
            />
          </svg>
        </button>

        <div className="ml-auto" />

        {/* Selector de Tema */}
        <ThemeSelector position="bottom" />


        {/* Perfil del Estudiante SIN CIUDAD */}
        <PerfilDesplegableEstudiante userData={userData} />
      </div>
    </nav>
  );
}

// Funciones auxiliares para notificaciones
function getNotificationIcon(type) {
  switch (type) {
    case "email":
      return <FaEnvelope className="text-white text-sm" />;
    case "whatsapp":
      return <FaWhatsapp className="text-white text-sm" />;
    case "course":
    default:
      return <FaBook className="text-white text-sm" />;
  }
}

function getNotificationIconColor(type) {
  switch (type) {
    case "email":
      return "bg-blue-500";
    case "whatsapp":
      return "bg-green-500";
    case "course":
    default:
      return "bg-purple-500";
  }
}
