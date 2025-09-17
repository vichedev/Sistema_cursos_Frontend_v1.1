import { useState } from "react";
import { FaBookOpen, FaSignOutAlt, FaListAlt, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SidebarEstudiante({ selected, onSelect, onLogout }) {
  const [open, setOpen] = useState(false);

  const usuario = localStorage.getItem('usuario') || 'Estudiante';
  const nombres = localStorage.getItem('nombres') || '';
  const cargo = localStorage.getItem('cargo') || 'Estudiante';

  const menu = [
    { label: "Cursos Disponibles", key: "disponibles", icon: <FaListAlt className="text-blue-600" /> },
    { label: "Mis Cursos", key: "mis", icon: <FaBookOpen className="text-blue-600" /> },
  ];

  return (
    <>
      {/* Botón hamburguesa en forma de gota (mobile) */}
      <button
        className="md:hidden fixed top-1/2 -left-1 z-50 p-2 rounded-r-full bg-blue-300 shadow-lg text-white hover:bg-blue-400 transition-all"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        style={{ transform: "translateY(-50%)" }}
      >
        <FaBars size={18} />
      </button>

      {/* Sidebar (fixed en mobile para slide-in, static en md+) */}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-screen w-72 bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 shadow-xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
        // ya no uses style={{ position:'fixed' }} ni height inline
        role="navigation"
      >
        {/* Cerrar en mobile */}
        <button
          className="absolute md:hidden top-4 right-4 text-gray-400 hover:text-green-400 transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <FaTimes size={24} />
        </button>

        {/* Logo y nombre */}
        <div className="flex flex-col items-center px-6 py-6">
          <div className="mb-4 p-2 bg-white rounded-full shadow-md border-2 border-blue-200">
            <img src="/logoadmin1.png" alt="Logo Educativo" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Estudiante MAAT</h1>
          <p className="text-sm text-gray-500 mt-1 text-center select-none">Plataforma de Aprendizaje</p>
        </div>

        {/* Info usuario */}
        <div className="px-6 py-4 bg-blue-50 mx-4 rounded-xl mb-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUser className="text-blue-600 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-blue-800 truncate">{nombres || usuario}</p>
              <p className="text-sm text-blue-600 truncate">@{usuario}</p>
              <p className="text-xs text-blue-500 font-medium capitalize">{cargo.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col px-4 gap-2">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onSelect && onSelect(item.key);
                setOpen(false);
              }}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 gap-3 ${selected === item.key
                ? "bg-green-50 text-green-700 shadow-inner border border-green-300"
                : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              <div className="p-1.5 bg-green-100 rounded-lg">{item.icon}</div>
              <span className="select-none">{item.label}</span>
              {selected === item.key && <div className="ml-auto h-2 w-2 rounded-full bg-green-400" />}
            </button>
          ))}

          {/* Si prefieres Links React Router en vez de buttons:
              <Link to="/estudiante/cursos" ...>...</Link>
          */}
        </nav>

        {/* Footer / logout */}
        <div className="mt-auto px-6 py-6 border-t border-gray-200">
          <div className="mb-4 text-center">
            <p className="text-xs text-gray-400 select-none">Versión 1.0.0</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-[1.02]"
          >
            <FaSignOutAlt size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Fondo semitransparente sólo en mobile cuando open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}