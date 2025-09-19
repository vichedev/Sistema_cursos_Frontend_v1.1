import { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaEnvelope, FaWhatsapp, FaBook, FaUser, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';

// Componente de Perfil Desplegable para Administrador
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
          {userData?.nombres || 'Administrador'}
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
            {userData?.cedula && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cédula:</span>
                <span className="font-medium">{userData.cedula}</span>
              </div>
            )}
            {userData?.celular && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Celular:</span>
                <span className="font-medium">{userData.celular}</span>
              </div>
            )}
            {userData?.ciudad && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ciudad:</span>
                <span className="font-medium">{userData.ciudad}</span>
              </div>
            )}
          </div>

          {/* Badge de Administrador */}
          <div className="px-4 py-2 bg-blue-50 border-y border-gray-100">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              👑 Administrador
            </span>
          </div>

          {/* Acciones */}
          <div className="pt-2">
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

export default function AdminNavbar({ notifications = [], onClearNotification, onMenuClick, onMarkAsRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Obtener datos del administrador
  useEffect(() => {
    const fetchAdminData = async () => {
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
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const markAsRead = (id) => {
    onMarkAsRead?.(id);
  };

  return (
    <nav className="relative z-10 bg-white shadow-md border-b border-gray-200 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-3">
        <button 
          type="button" 
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200" 
          onClick={onMenuClick} 
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>

        <div className="ml-auto" />

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="p-2 rounded-full hover:bg-gray-100 relative"
            aria-haspopup="true"
            aria-expanded={showNotifications}
            aria-label="Notificaciones"
          >
            <FaBell className="text-gray-600 text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Notificaciones de Cursos</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar notificaciones">
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No hay notificaciones</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((n) => {
                      const completed = n.progress?.completed ?? 0;
                      const total = n.progress?.total ?? 0;
                      const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
                      return (
                        <div
                          key={n.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getNotificationIconColor(n.type)}`}>
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{n.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                              {n.progress && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>
                                      {completed} de {total}
                                    </span>
                                    <span>{pct}%</span>
                                  </div>
                                </div>
                              )}

                              <div className="text-xs text-gray-400 mt-2">
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
                <div className="p-2 border-t border-gray-200">
                  <button onClick={onClearNotification} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2">
                    Limpiar todas las notificaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Perfil del Administrador */}
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