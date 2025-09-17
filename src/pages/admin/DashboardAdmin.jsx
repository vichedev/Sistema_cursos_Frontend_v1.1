// src/pages/admin/DashboardAdmin.jsx
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import DataGeneralAdminCursos from "../../components/admin/DataGeneralAdminCursos";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardAdmin() {
  useAuth(['ADMIN']);

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300">
      <SidebarAdmin className="overflow-y-auto" />
      <main className="flex-1 min-h-screen overflow-y-auto p-4 md:p-8 md:ml-72">
        <DataGeneralAdminCursos />
      </main>
    </div>
  );
}