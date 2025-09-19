// src/components/estudiante/SidebarEstudiante.jsx
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";

export default function SidebarEstudiante({ onNavigate }) {
  const location = useLocation();
  const [userData, setUserData] = useState({ usuario: "Estudiante", nombres: "", rol: "STUDENT" });

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
    <aside className="h-full w-72 bg-white border-r border-gray-200 shadow-xl flex flex-col">
      {/* Logo y nombre */}
      <div className="flex flex-col items-center px-6 py-6">
        <div className="mb-4 p-2 bg-white rounded-full shadow-md border-2 border-blue-200">
          <img src="/logoadmin1.png" alt="Logo Educativo" className="h-16 w-16" />
        </div>
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">MAAT ACADEMY</h1>
        <p className="text-sm text-gray-500 mt-1 text-center select-none">Sistema de Gestión Educativa</p>
      </div>

      {/* Perfil del Estudiante */}
      <div className="px-6 py-4 bg-white mx-4 rounded-xl mb-4 border border-indigo-100 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-indigo-100 border-2 border-indigo-200 rounded-full">
            <FiUser className="text-indigo-600 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate text-lg mb-1">{userData.nombres || userData.usuario}</p>
            <p className="text-sm text-gray-500 mb-2">@{userData.usuario}</p>
            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-xs font-semibold border border-indigo-200 inline-flex items-center gap-1 mb-2">
              <span>🎓</span>
              <span>Estudiante</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Acceso a cursos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2">
        <SideLink to="/estudiante/dashboard" active={location.pathname === "/estudiante/dashboard"} onNavigate={onNavigate}>
          Dashboard
        </SideLink>
        <SideLink to="/estudiante/cursos" active={location.pathname === "/estudiante/cursos"} onNavigate={onNavigate}>
          Cursos Disponibles
        </SideLink>
        <SideLink to="/estudiante/mis-cursos" active={location.pathname === "/estudiante/mis-cursos"} onNavigate={onNavigate}>
          Mis Cursos
        </SideLink>
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition"
        >
          <FiLogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SideLink({ to, active, onNavigate, children }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`block px-4 py-3 rounded-xl font-medium transition
      ${active ? "bg-green-50 text-green-700 border border-green-300 shadow-inner"
          : "text-gray-700 hover:bg-green-50 hover:text-green-600"}`}
    >
      {children}
    </Link>
  );
}
