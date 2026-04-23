// src/components/estudiante/EstudianteNavbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaGraduationCap,
  FaUser,
  FaChevronDown,
  FaSignOutAlt,
  FaUserGraduate,
  FaTimes,
  FaBook,
  FaAward,
} from "react-icons/fa";
import ThemeSelector from "../ThemeSelector";
import { useNotifications } from "../../context/NotificationContext";

function PerfilDesplegableEstudiante({ userData }) {
  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  const safeUserData = userData
    ? {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        correo: userData.correo,
        usuario: userData.usuario,
        cedula: userData.cedula,
        celular: userData.celular,
        empresa: userData.empresa,
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
          className={`text-blue-600 dark:text-blue-400 transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {safeUserData?.nombres} {safeUserData?.apellidos}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {safeUserData?.correo}
            </p>
          </div>

          <div className="px-4 py-3 space-y-2">
            {safeUserData?.usuario && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Usuario:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.usuario}</span>
              </div>
            )}
            {safeUserData?.cedula && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Cédula:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.cedula}</span>
              </div>
            )}
            {safeUserData?.celular && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Celular:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.celular}</span>
              </div>
            )}
            {safeUserData?.empresa && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Empresa:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.empresa}</span>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-y border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FaUserGraduate className="text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 text-xs font-semibold">🎓 Estudiante</span>
            </div>
          </div>

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

function NotificationBell() {
  const { notifications, markAsRead, markAllRead, newCourseNotifications, diplomaNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const studentNotifications = notifications.filter(
    (n) => n.kind === 'new_course' || n.kind === 'diploma'
  );
  const studentUnread = studentNotifications.filter((n) => !n.read).length;

  const formatTime = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-label="Notificaciones"
      >
        <FaBell className={`text-gray-600 dark:text-gray-300 text-lg ${studentUnread > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`} />
        {studentUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow">
            {studentUnread > 9 ? '9+' : studentUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center gap-2">
              <FaBell className="text-white text-sm" />
              <span className="text-white font-semibold text-sm">Notificaciones</span>
              {studentUnread > 0 && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{studentUnread}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {studentUnread > 0 && (
                <button
                  onClick={() => { markAllRead(); }}
                  className="text-white/80 hover:text-white text-xs underline"
                >
                  Marcar todas
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {studentNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <FaBell className="text-gray-300 dark:text-gray-600 text-3xl mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Sin notificaciones</p>
              </div>
            ) : (
              studentNotifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.kind === 'new_course') { setOpen(false); navigate('/estudiante/cursos'); }
                    else if (n.kind === 'diploma') { setOpen(false); navigate('/estudiante/mis-diplomas'); }
                  }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    !n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    n.kind === 'diploma'
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                      : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                  }`}>
                    {n.kind === 'diploma'
                      ? <FaAward className="text-white text-sm" />
                      : <FaBook className="text-white text-sm" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-sm font-medium leading-tight ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(n.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.message}</p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${n.kind === 'diploma' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {n.kind === 'diploma' ? '🏅 Ver mis diplomas →' : '📚 Ver cursos disponibles →'}
                    </p>
                  </div>

                  {!n.read && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {studentNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <Link
                to="/estudiante/mis-diplomas"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                <FaAward className="text-xs" />
                Ver mis diplomas
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EstudianteNavbar({ onMenuClick, userData }) {
  return (
    <nav className="relative z-40 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>

        <div className="ml-auto" />

        <ThemeSelector position="bottom" />
        <NotificationBell />
        <PerfilDesplegableEstudiante userData={userData} />
      </div>
    </nav>
  );
}
