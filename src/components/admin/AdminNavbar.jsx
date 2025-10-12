// src/components/admin/AdminNavbar.jsx - VERSIÓN CORREGIDA
import { useState, useEffect, useRef } from 'react';
import { 
  FaBell, 
  FaTimes, 
  FaEnvelope, 
  FaWhatsapp, 
  FaBook, 
  FaUser, 
  FaChevronDown, 
  FaSignOutAlt, 
  FaGraduationCap,
  FaUserShield // ✅ Usar FaUserShield en lugar de FaShield
} from 'react-icons/fa';
import ThemeSelector from '../ThemeSelector';

// Componente de Perfil Desplegable para Administrador - CORREGIDO
function PerfilDesplegableAdmin({ userData }) {
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
    localStorage.removeItem("userRol");
    window.location.href = "/login";
  };

  // ✅ DATOS SEGUROS - Solo mostrar información necesaria
  const safeUserData = userData ? {
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    correo: userData.correo,
    rol: userData.rol,
    asignatura: userData.asignatura,
    ciudad: userData.ciudad,
    empresa: userData.empresa,
    cargo: userData.cargo
    // ❌ NO incluir: cedula, celular, usuario, password, etc.
  } : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-gray-700 rounded-xl hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
        aria-label="Menú de perfil"
      >
        <FaUser className="text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
          {safeUserData?.nombres || 'Administrador'}
        </span>
        <FaChevronDown className={`text-blue-600 dark:text-blue-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Header del perfil */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {safeUserData?.nombres} {safeUserData?.apellidos}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {safeUserData?.correo}
            </p>
          </div>

          {/* Información del perfil SEGURA */}
          <div className="px-4 py-3 space-y-2">
            {safeUserData?.asignatura && (
              <div className="flex items-center gap-2 text-sm">
                <FaGraduationCap className="text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">{safeUserData.asignatura}</span>
              </div>
            )}
            
            {safeUserData?.ciudad && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Ciudad:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.ciudad}</span>
              </div>
            )}
            
            {safeUserData?.empresa && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Empresa:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.empresa}</span>
              </div>
            )}
            
            {safeUserData?.cargo && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Cargo:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{safeUserData.cargo}</span>
              </div>
            )}
          </div>

          {/* Badge de Administrador - CORREGIDO */}
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-y border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FaUserShield className="text-blue-600 dark:text-blue-400" /> {/* ✅ Cambiado a FaUserShield */}
              <span className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                {safeUserData?.rol === 'ADMIN' ? '👑 Administrador' : '🎓 Profesor'}
              </span>
            </div>
          </div>

          {/* Acciones */}
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

// El resto del código se mantiene igual...
export default function AdminNavbar({ notifications = [], onClearNotification, onMenuClick, onMarkAsRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Obtener datos del administrador
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!userId) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}`,
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
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const markAsRead = (id) => {
    onMarkAsRead?.(id);
  };

  const clearAllNotifications = () => {
    onClearNotification?.();
  };

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

        {/* Selector de Tema */}
        <ThemeSelector position="bottom" />

        {/* Notificaciones */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors"
            aria-haspopup="true"
            aria-expanded={showNotifications}
            aria-label="Notificaciones"
          >
            <FaBell className="text-gray-600 dark:text-gray-400 text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Notificaciones de Cursos</h3>
                <button 
                  onClick={() => setShowNotifications(false)} 
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
                  aria-label="Cerrar notificaciones"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">No hay notificaciones</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((n) => {
                      const completed = n.progress?.completed ?? 0;
                      const total = n.progress?.total ?? 0;
                      const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
                      return (
                        <div
                          key={n.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                            !n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getNotificationIconColor(n.type)}`}>
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">{n.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{n.message}</p>

                              {n.progress && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                      style={{ width: `${pct}%` }} 
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>
                                      {completed} de {total}
                                    </span>
                                    <span>{pct}%</span>
                                  </div>
                                </div>
                              )}

                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                {new Date(n.timestamp || Date.now()).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={clearAllNotifications} 
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-2 transition-colors"
                  >
                    Limpiar todas las notificaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Perfil del Administrador SEGURO */}
        <PerfilDesplegableAdmin userData={userData} />
      </div>
    </nav>
  );
}

function getNotificationIcon(type) {
  switch (type) {
    case 'email':
      return <FaEnvelope className="text-white text-sm" />;
    case 'whatsapp':
      return <FaWhatsapp className="text-white text-sm" />;
    case 'course':
    default:
      return <FaBook className="text-white text-sm" />;
  }
}

function getNotificationIconColor(type) {
  switch (type) {
    case 'email':
      return 'bg-blue-500';
    case 'whatsapp':
      return 'bg-green-500';
    case 'course':
    default:
      return 'bg-purple-500';
  }
}