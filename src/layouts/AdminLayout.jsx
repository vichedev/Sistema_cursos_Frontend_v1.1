// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom"; // ✅ IMPORTAR Outlet
import SidebarAdmin from "../components/admin/SidebarAdmin";
import AdminNavbar from "../components/admin/AdminNavbar";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";

export default function AdminLayout() { // ✅ Quitar {children}
  useAuth(["ADMIN"]);
  const { notifications, clearAllNotifications, markAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gradient-to-tr from-gray-100 to-gray-300 min-h-0">
      {/* drawer móvil */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} role="dialog" aria-modal="true">
        <div className="h-full shadow-xl bg-white">
          <SidebarAdmin onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-72 z-30 bg-white border-r">
        <SidebarAdmin />
      </aside>

      <div className="flex-1 flex flex-col md:ml-72 min-h-0">
        {/* Navbar */}
        <div className="sticky top-0 z-30">
          <AdminNavbar
            notifications={notifications}
            onClearNotification={clearAllNotifications}
            onMenuClick={() => setSidebarOpen(true)}
            onMarkAsRead={markAsRead}
          />
        </div>

        {/* CONTENIDO DE LA PÁGINA - Usar Outlet en lugar de children */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet /> {/* ✅ CAMBIAR children por Outlet */}
        </main>
      </div>
    </div>
  );
}