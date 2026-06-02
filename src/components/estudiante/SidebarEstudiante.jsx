// src/components/estudiante/SidebarEstudiante.jsx
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNotifications } from "../../context/NotificationContext";

export default function SidebarEstudiante({ onNavigate }) {
  const location = useLocation();
  const { diplomaNotifications } = useNotifications();
  const [userData, setUserData] = useState({ usuario: "Estudiante", nombres: "" });

  useEffect(() => {
    const usuario = localStorage.getItem("usuario") || "Estudiante";
    const nombres = localStorage.getItem("nombres") || "";
    setUserData({ usuario, nombres });
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside
      className="w-72 h-full bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 shadow-xl flex flex-col transition-colors duration-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700"
      role="navigation"
    >
      {/* Logo y nombre */}
      <div className="flex flex-col items-center px-6 py-6">
        <div className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-md border-2 border-blue-200 dark:border-blue-600">
          <img src="/logo_render.png" alt="Logo Educativo" className="h-20 w-50 rounded-lg" />
        </div>
        <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
          MAAT ACADEMY
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center select-none">
          Sistema de Gestión Educativa
        </p>
      </div>

      {/* Perfil + badge de rol */}
      <div className="flex flex-col items-center gap-2 my-1 px-6">
        <div className="text-center">
          <p className="font-bold text-gray-800 dark:text-white text-base truncate max-w-[200px]">
            {userData.nombres || userData.usuario}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{userData.usuario}</p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
          <span>🎓</span>
          <span>Estudiante</span>
        </div>
      </div>

      <div className="px-4 my-4">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-blue-600" />
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-col px-4 gap-1.5 overflow-y-auto">
        <SidebarLink
          to="/estudiante/dashboard"
          label="Dashboard"
          icon="📊"
          active={location.pathname === "/estudiante/dashboard"}
          onNavigate={onNavigate}
        />
        <SidebarLink
          to="/estudiante/cursos"
          label="Cursos Disponibles"
          icon="📚"
          active={location.pathname === "/estudiante/cursos"}
          onNavigate={onNavigate}
        />
        <SidebarLink
          to="/estudiante/mis-cursos"
          label="Mis Cursos"
          icon="🎯"
          active={location.pathname === "/estudiante/mis-cursos"}
          onNavigate={onNavigate}
        />
        <SidebarLink
          to="/estudiante/mis-diplomas"
          label="Mis Diplomas"
          icon="🏅"
          active={location.pathname === "/estudiante/mis-diplomas"}
          onNavigate={onNavigate}
          badge={diplomaNotifications.length > 0 ? diplomaNotifications.length : null}
        />
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-4 text-center">
          <p className="text-xs text-gray-400 select-none dark:text-gray-500">Versión 2.0.0</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800"
        >
          <FiLogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, label, active, icon, onNavigate, badge }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 gap-3 ${
        active
          ? "bg-emerald-50 text-emerald-700 shadow-inner border border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700"
          : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-900/10 dark:hover:text-emerald-400"
      }`}
    >
      <div
        className={`p-1.5 rounded-lg text-xl leading-none flex items-center justify-center ${
          active ? "bg-emerald-100 dark:bg-emerald-800/30" : "bg-emerald-100 dark:bg-gray-700"
        }`}
      >
        {icon}
      </div>
      <span className="select-none flex-1">{label}</span>
      {badge ? (
        <span className="ml-auto min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge}
        </span>
      ) : active ? (
        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-500" />
      ) : null}
    </Link>
  );
}
