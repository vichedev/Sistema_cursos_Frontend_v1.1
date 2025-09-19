// src/layouts/EstudianteLayout.jsx
import { useState, useEffect, useRef } from "react";
import SidebarEstudiante from "../components/estudiante/SidebarEstudiante";
import { FaUser, FaChevronDown, FaSignOutAlt, FaCog } from "react-icons/fa";

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
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
      >
        <FaUser className="text-blue-600" />
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {userData?.nombres || 'Usuario'}
        </span>
        <FaChevronDown className={`text-blue-600 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* Header del perfil */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">{userData?.nombres} {userData?.apellidos}</h3>
            <p className="text-sm text-gray-600 truncate">{userData?.correo}</p>
          </div>

          {/* Información del perfil */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Usuario:</span>
              <span className="font-medium">{userData?.usuario}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cédula:</span>
              <span className="font-medium">{userData?.cedula}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Celular:</span>
              <span className="font-medium">{userData?.celular}</span>
            </div>
            {userData?.ciudad && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ciudad:</span>
                <span className="font-medium">{userData.ciudad}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleCerrarSesion}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

export default function EstudianteLayout({ children, className = "" }) {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!userId) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
        {/* Navbar: ahora sticky con perfil */}
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
           
          </div>
          
          <PerfilDesplegable userData={userData} />
        </nav>

        {/* Solo esta zona scrollea */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}