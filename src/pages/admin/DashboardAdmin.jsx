// src/pages/admin/DashboardAdmin.jsx
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import DataGeneralAdminCursos from "../../components/admin/DataGeneralAdminCursos";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardAdmin() {
  useAuth(['ADMIN']);

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300">
      {/* Sidebar: le pasamos overflow-y-auto; SidebarAdmin ya controla comportamiento mobile (slide-in) */}
      <SidebarAdmin className="overflow-y-auto" />

      {/* Contenido principal:
          - md:ml-72 aplica margen solo en md+ (evita margen en mobile)
          - min-h-screen + overflow-y-auto permite scroll independiente del main
      */}
      <main className="flex-1 min-h-screen overflow-y-auto p-4 md:p-8 md:ml-72">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Datos Generales</h1>
            <p className="text-lg text-gray-500">Resumen estadístico completo del sistema</p>
          </div>
          <a
            href="/admin/crear-curso"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold shadow hover:from-yellow-500 hover:to-orange-400 transition"
          >
            Crear nuevo curso
          </a>
        </div>

        <DataGeneralAdminCursos />
      </main>
    </div>
  );
}