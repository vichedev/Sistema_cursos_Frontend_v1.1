// src/components/admin/SidebarAdmin.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiChevronDown } from "react-icons/fi";

export default function SidebarAdmin({ className = "", onNavigate }) {
  const [userData, setUserData] = useState({
    usuario: "Administrador",
    nombres: "",
    rol: "ADMIN",
  });
  const location = useLocation();

  // Rutas que pertenecen al grupo desplegable "Cursos"
  const cursosRoutes = ["/admin/crear-curso", "/admin/ver-todo", "/admin/material-didactico", "/admin/categorias"];
  const cursosActive = cursosRoutes.includes(location.pathname);

  // Rutas del grupo desplegable "Usuarios"
  const usuariosRoutes = ["/admin/usuarios-inscritos", "/admin/verificacion"];
  const usuariosActive = usuariosRoutes.includes(location.pathname);

  useEffect(() => {
    const usuario = localStorage.getItem("usuario") || "Administrador";
    const nombres = localStorage.getItem("nombres") || "";
    const rol = localStorage.getItem("rol") || "ADMIN";
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
    <aside
      className={`
        w-72 h-full bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 shadow-xl
        flex flex-col transition-colors duration-200
        dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
        ${className}
      `}
      role="navigation"
    >
      {/* Logo y nombre */}
      <div className="flex flex-col items-center px-6 py-6">
        <div className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-md border-2 border-blue-200 dark:border-blue-600">
          <img
            src="/logo_render.png"
            alt="Logo Educativo"
            className="h-20 w-50 rounded-lg"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
          MAAT ACADEMY
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center select-none">
          Sistema de Gestión Educativa
        </p>
      </div>

      {/* Badge rol */}
      <div className="flex justify-center my-2">
        <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700">
          <span>🎓</span>
          <span>Docente Administrador</span>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-blue-600" />
      </div>

      {/* Navegación */}
      <nav className="flex-1 flex flex-col px-4 gap-1.5 overflow-y-auto">
        <SidebarLink
          to="/admin/dashboard"
          label="Dashboard"
          active={location.pathname === "/admin/dashboard"}
          icon={
            <img
              src="https://img.icons8.com/?size=100&id=iJzm3AFQCS4W&format=png&color=0077B6"
              className="w-6 h-6"
              alt=""
            />
          }
          onNavigate={onNavigate}
        />
        <SidebarGroup
          label="Cursos"
          defaultOpen={cursosActive}
          icon={
            <span className="text-xl leading-none" role="img" aria-label="cursos">
              📘
            </span>
          }
        >
          <SidebarLink
            to="/admin/crear-curso"
            label="Crear curso"
            active={location.pathname === "/admin/crear-curso"}
            icon={
              <img
                src="https://img.icons8.com/?size=100&id=oZAinaxvg8AD&format=png&color=0077B6"
                className="w-6 h-6"
                alt=""
              />
            }
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/admin/ver-todo"
            label="Todos los cursos"
            active={location.pathname === "/admin/ver-todo"}
            icon={
              <img
                src="https://img.icons8.com/?size=100&id=3N5nsXW7ytVx&format=png&color=0077B6"
                className="w-6 h-6"
                alt=""
              />
            }
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/admin/material-didactico"
            label="Material didáctico"
            active={location.pathname === "/admin/material-didactico"}
            icon={
              <span className="text-xl leading-none" role="img" aria-label="material">
                📚
              </span>
            }
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/admin/categorias"
            label="Categorías"
            active={location.pathname === "/admin/categorias"}
            icon={
              <span className="text-xl leading-none" role="img" aria-label="categorias">
                🏷️
              </span>
            }
            onNavigate={onNavigate}
          />
        </SidebarGroup>
        <SidebarGroup
          label="Usuarios"
          defaultOpen={usuariosActive}
          icon={
            <img
              src="https://img.icons8.com/?size=100&id=CiGKDwbd2k7v&format=png&color=0077B6"
              className="w-6 h-6"
              alt=""
            />
          }
        >
          <SidebarLink
            to="/admin/usuarios-inscritos"
            label="Usuarios Inscritos"
            active={location.pathname === "/admin/usuarios-inscritos"}
            icon={
              <span className="text-xl leading-none" role="img" aria-label="inscritos">
                👥
              </span>
            }
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/admin/verificacion"
            label="Verificación"
            active={location.pathname === "/admin/verificacion"}
            icon={
              <span className="text-xl leading-none" role="img" aria-label="verificacion">
                🛡️
              </span>
            }
            onNavigate={onNavigate}
          />
        </SidebarGroup>
        <SidebarLink
          to="/admin/gestionar-cupones"
          label="Gestión de Cupones"
          active={location.pathname === "/admin/gestionar-cupones"}
          icon={
            <img
              src="https://img.icons8.com/?size=100&id=59878&format=png&color=0077B6"
              className="w-6 h-6"
              alt=""
            />
          }
          onNavigate={onNavigate}
        />

        {/* ✅ NUEVO — Diplomas */}
        <div className="px-1 my-1">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
        </div>
        <SidebarLink
          to="/admin/diplomas"
          label="Diplomas"
          active={location.pathname === "/admin/diplomas"}
          icon={
            <span
              className="text-xl leading-none"
              role="img"
              aria-label="diploma"
            >
              🎓
            </span>
          }
          onNavigate={onNavigate}
          highlight
        />

        {/* ✅ NUEVO — Publicidad y Configuración */}
        <div className="px-1 my-1">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
        </div>
        <SidebarLink
          to="/admin/publicidad"
          label="Publicidad"
          active={location.pathname === "/admin/publicidad"}
          icon={
            <span className="text-xl leading-none" role="img" aria-label="publicidad">
              📣
            </span>
          }
          onNavigate={onNavigate}
        />
        <SidebarLink
          to="/admin/logs-acceso"
          label="Logs de acceso"
          active={location.pathname === "/admin/logs-acceso"}
          icon={
            <span className="text-xl leading-none" role="img" aria-label="logs">
              🔐
            </span>
          }
          onNavigate={onNavigate}
        />
        <SidebarLink
          to="/admin/configuracion"
          label="Configuración"
          active={location.pathname === "/admin/configuracion"}
          icon={
            <span className="text-xl leading-none" role="img" aria-label="configuracion">
              ⚙️
            </span>
          }
          onNavigate={onNavigate}
        />
      </nav>

      {/* Cerrar sesión */}
      <div className="mt-auto px-6 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-4 text-center">
          <p className="text-xs text-gray-400 select-none dark:text-gray-500">
            Versión 2.0.0
          </p>
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

function SidebarGroup({ label, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  // Mantener abierto si una ruta hija pasa a estar activa
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center px-4 py-3 rounded-xl font-medium gap-3 text-gray-700 dark:text-gray-300 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/10 dark:hover:text-green-400 transition-all duration-200"
      >
        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-gray-700">{icon}</div>
        <span className="select-none">{label}</span>
        <FiChevronDown
          className={`ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-3 border-l border-gray-200 dark:border-gray-700 flex flex-col gap-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  to,
  label,
  active,
  icon,
  onNavigate,
  highlight = false,
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`
        flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 gap-3
        ${
          active
            ? highlight
              ? "bg-amber-50 text-amber-700 shadow-inner border border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700"
              : "bg-green-50 text-green-700 shadow-inner border border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
            : highlight
              ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/10 dark:hover:text-amber-300"
              : "text-gray-700 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-900/10 dark:hover:text-green-400"
        }
      `}
    >
      <div
        className={`p-1.5 rounded-lg ${
          active
            ? highlight
              ? "bg-amber-100 dark:bg-amber-800/30"
              : "bg-green-100 dark:bg-green-800/30"
            : highlight
              ? "bg-amber-100 dark:bg-gray-700"
              : "bg-green-100 dark:bg-gray-700"
        }`}
      >
        {icon}
      </div>
      <span className="select-none">{label}</span>
      {active && (
        <div
          className={`ml-auto h-2 w-2 rounded-full ${highlight ? "bg-amber-400 dark:bg-amber-500" : "bg-green-400 dark:bg-green-500"}`}
        />
      )}
    </Link>
  );
}
