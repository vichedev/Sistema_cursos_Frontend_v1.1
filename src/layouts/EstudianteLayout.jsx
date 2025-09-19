// src/layouts/EstudianteLayout.jsx
import { useState } from "react";
import SidebarEstudiante from "../components/estudiante/SidebarEstudiante";

export default function EstudianteLayout({ children, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`h-screen flex bg-gradient-to-tr from-gray-100 to-gray-300 ${className}`}>
      {/* Drawer/Sidebar */}
      <div
        className={`
          fixed z-40 top-0 left-0 h-screen w-72
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        aria-hidden={!open}
      >
        <SidebarEstudiante onNavigate={() => setOpen(false)} />
      </div>

      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col md:ml-72 min-h-0">
        {/* Navbar: ahora sticky */}
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-3 sm:px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
            </svg>
          </button>
          <div className="text-lg sm:text-xl font-bold text-blue-700">Área del Estudiante</div>
        </nav>

        {/* Solo esta zona scrollea */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
