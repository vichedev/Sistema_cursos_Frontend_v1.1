// src/components/estudiante/SidebarEstudiante.jsx
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useNotifications } from "../../context/NotificationContext";

export default function SidebarEstudiante({ onNavigate }) {
  const location = useLocation();
  const { diplomaNotifications } = useNotifications();
  const [userData, setUserData] = useState({
    usuario: "Estudiante",
    nombres: "",
    rol: "STUDENT",
  });

  useEffect(() => {
    const usuario = localStorage.getItem("usuario") || "Estudiante";
    const nombres = localStorage.getItem("nombres") || "";
    setUserData({ usuario, nombres, rol: "STUDENT" });
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className="h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl flex flex-col transition-colors duration-200">
      {/* Logo y nombre - Espaciado superior reducido */}
      <div className="flex flex-col items-center pt-4 pb-2 px-6">
        <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-md border-2 border-blue-200 dark:border-blue-600">
          <img
            src="/logo_render.png"
            alt="Logo Educativo"
            className="h-16 w-40 rounded-lg"
          />
        </div>
        <h1 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mt-3">
          MAAT ACADEMY
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-center select-none">
          Sistema de Gestión Educativa
        </p>
      </div>

      {/* Perfil del Estudiante - Mejor espaciado */}
      <div className="flex flex-col items-center px-6 py-3 bg-gradient-to-b from-transparent to-indigo-50/30 dark:to-indigo-900/10 mx-3 rounded-xl">
        <div className="text-center mb-2">
          <p className="font-bold text-gray-800 dark:text-white text-base truncate max-w-[180px]">
            {userData.nombres || userData.usuario}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{userData.usuario}
          </p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-700">
          <span>🎓</span>
          <span>Estudiante</span>
        </div>
      </div>

      {/* Separador sutil */}
      <div className="px-6 my-3">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
      </div>

      {/* Navegación - Espaciado mejorado */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <SideLink
          to="/estudiante/dashboard"
          active={location.pathname === "/estudiante/dashboard"}
          onNavigate={onNavigate}
          icon="📊"
        >
          Dashboard
        </SideLink>
        <SideLink
          to="/estudiante/cursos"
          active={location.pathname === "/estudiante/cursos"}
          onNavigate={onNavigate}
          icon="📚"
        >
          Cursos Disponibles
        </SideLink>
        <SideLink
          to="/estudiante/mis-cursos"
          active={location.pathname === "/estudiante/mis-cursos"}
          onNavigate={onNavigate}
          icon="🎯"
        >
          Mis Cursos
        </SideLink>
        <SideLink
          to="/estudiante/mis-diplomas"
          active={location.pathname === "/estudiante/mis-diplomas"}
          onNavigate={onNavigate}
          icon="🏅"
          badge={diplomaNotifications.length > 0 ? diplomaNotifications.length : null}
        >
          Mis Diplomas
        </SideLink>
      </nav>

      {/* Footer - Cerrar sesión */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-3 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 select-none">
            Versión 2.0.0
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm"
        >
          <FiLogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SideLink({ to, active, onNavigate, icon, badge, children }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
      ${
        active
          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
          : "text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{children}</span>
      {badge ? (
        <span className="ml-auto min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge}
        </span>
      ) : active ? (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500"></span>
      ) : null}
    </Link>
  );
}