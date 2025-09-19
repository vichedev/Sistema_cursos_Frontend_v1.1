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
      {/* Header */}
      <div className="px-6 py-6">
        <div className="mb-4 p-2 bg-blue-50 rounded-full border-2 border-blue-200 inline-flex">
          <img src="/logoadmin1.png" alt="Logo" className="h-12 w-12" />
        </div>
        <h1 className="text-xl font-extrabold text-blue-600">Estudiante MAAT</h1>
        <p className="text-xs text-gray-500 mt-1">Plataforma de Aprendizaje</p>
      </div>

      {/* Perfil */}
      <div className="mx-4 mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <FiUser className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-blue-800 truncate">{userData.nombres || userData.usuario}</p>
            <p className="text-xs text-blue-600 truncate">@{userData.usuario}</p>
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
