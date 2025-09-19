// src/components/admin/AdminNavbar.jsx
import { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaEnvelope, FaWhatsapp, FaBook } from 'react-icons/fa';

export default function AdminNavbar({ notifications = [], onClearNotification, onMenuClick, onMarkAsRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id) => {
    onMarkAsRead?.(id);
  };

  return (
    <nav className="relative z-10 bg-white shadow-md border-b border-gray-200 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-3">
        <button type="button" className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200" onClick={onMenuClick} aria-label="Abrir menú">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>

        <div className="text-lg sm:text-xl font-bold text-blue-700 truncate">
          Panel Administrativo
        </div>

        <div className="ml-auto" />

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
