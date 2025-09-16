// src/components/admin/SidebarAdmin.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiX, FiUser } from "react-icons/fi";

export default function SidebarAdmin({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({ usuario: 'Administrador', nombres: '', rol: 'ADMIN' });
  const location = useLocation();

  useEffect(() => {
    const usuario = localStorage.getItem('usuario') || 'Administrador';
    const nombres = localStorage.getItem('nombres') || '';
    const rol = localStorage.getItem('rol') || 'ADMIN';
    setUserData({ usuario, nombres, rol });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("userId");
    localStorage.removeItem("usuario");
    localStorage.removeItem("nombres");
    localStorage.removeItem("cargo");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        className="md:hidden fixed top-1/2 -left-1 z-50 p-2 rounded-r-full bg-blue-300 shadow-lg text-white hover:bg-blue-400 transition-all"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        style={{ transform: "translateY(-50%)" }}
      >
        <FiMenu size={20} />
      </button>

      {/* Sidebar fijo siempre, con slide-in en móvil */}
      <aside
        className={`
          fixed z-40 top-0 left-0 w-72 h-screen bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 shadow-xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${className}
        `}
        role="navigation"
      >
        {/* Botón cerrar en móvil */}
        <button
          className="absolute md:hidden top-4 right-4 text-gray-400 hover:text-green-400 transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <FiX size={28} />
        </button>

        {/* Logo y nombre */}
        <div className="flex flex-col items-center px-6 py-6">
          <div className="mb-4 p-2 bg-white rounded-full shadow-md border-2 border-blue-200">
            <img src="/logoadmin1.png" alt="Logo Educativo" className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">RNC ACADEMY</h1>
          <p className="text-sm text-gray-500 mt-1 text-center select-none">Sistema de Gestión Educativa</p>
        </div>

        {/* Info usuario */}
        <div className="px-6 py-4 bg-blue-50 mx-4 rounded-xl mb-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUser className="text-blue-600 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-blue-800 truncate">{userData.nombres || userData.usuario}</p>
              <p className="text-sm text-blue-600 truncate">@{userData.usuario}</p>
              <p className="text-xs text-blue-500 font-medium uppercase">{userData.rol}</p>
            </div>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
        </div>

        {/* Navegación */}
        <nav className="flex-1 flex flex-col px-4 gap-2">
          <SidebarLink to="/admin/dashboard" label="Dashboard" active={location.pathname === "/admin/dashboard"} icon={<img src="https://img.icons8.com/?size=100&id=iJzm3AFQCS4W&format=png&color=0077B6" className="w-6 h-6" alt="Dashboard" />} />
          <SidebarLink to="/admin/crear-curso" label="Crear curso" active={location.pathname === "/admin/crear-curso"} icon={<img src="https://img.icons8.com/?size=100&id=oZAinaxvg8AD&format=png&color=0077B6" className="w-6 h-6" alt="Crear curso" />} />
          <SidebarLink to="/admin/ver-todo" label="Todos los cursos" active={location.pathname === "/admin/ver-todo"} icon={<img src="https://img.icons8.com/?size=100&id=3N5nsXW7ytVx&format=png&color=0077B6" className="w-6 h-6" alt="Ver cursos" />} />
          <SidebarLink to="/admin/usuarios-inscritos" label="Usuarios Inscritos" active={location.pathname === "/admin/usuarios-inscritos"} icon={<img src="https://img.icons8.com/?size=100&id=CiGKDwbd2k7v&format=png&color=0077B6" className="w-6 h-6" alt="Usuarios" />} />
        </nav>

        {/* Cerrar sesión */}
        <div className="mt-auto px-6 py-6 border-t border-gray-200">
          <div className="mb-4 text-center">
            <p className="text-xs text-gray-400 select-none">Versión 1.0.0</p>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-transform transform hover:scale-[1.02]">
            <FiLogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay móvil */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}

function SidebarLink({ to, label, active, icon }) {
  return (
    <Link to={to} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 gap-3 ${active ? 'bg-green-50 text-green-700 shadow-inner border border-green-300' : 'text-gray-700 hover:bg-green-50 hover:text-green-600'}`}>
      <div className="p-1.5 bg-green-100 rounded-lg">{icon}</div>
      <span className="select-none">{label}</span>
      {active && <div className="ml-auto h-2 w-2 rounded-full bg-green-400" />}
    </Link>
  );
}