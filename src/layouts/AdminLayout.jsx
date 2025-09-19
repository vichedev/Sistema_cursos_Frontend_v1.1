// src/layouts/AdminLayout.jsx
import { useState } from "react";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import AdminNavbar from "../components/admin/AdminNavbar";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContext";

export default function AdminLayout({ children }) {
  useAuth(["ADMIN"]);
  const { notifications, clearAllNotifications } = useNotifications();

  // 👇 controla el drawer del sidebar en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-gradient-to-tr from-gray-100 to-gray-300">
      {/* Sidebar móvil como drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full shadow-xl bg-white">
          <SidebarAdmin onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Backdrop cuando el drawer está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar fijo en desktop */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-72 z-30 bg-white border-r">
        <SidebarAdmin />
      </aside>

      {/* Contenedor principal (desplazado solo en md+) */}
      <div className="flex-1 flex flex-col w-full md:ml-72">
        <AdminNavbar
          notifications={notifications}
          onClearNotification={clearAllNotifications}
          // 👇 pasamos un handler para el botón hamburguesa
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
