// src/pages/estudiante/DashboardEstudiante.jsx
import { useState } from "react";
import SidebarEstudiante from "../../components/SidebarEstudiante";
import CursosDisponibles from "./CursosEstudiante";
import MisCursos from "./MisCursos";

export default function DashboardEstudiante() {
  const [selected, setSelected] = useState("disponibles");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-tr from-gray-100 to-gray-300">
      {/* Sidebar fijo */}
      <SidebarEstudiante
        selected={selected}
        onSelect={setSelected}
        onLogout={handleLogout}
        className="overflow-y-auto w-72"
      />

      {/* Contenido principal sin margen */}
      <main className="flex-1 h-screen overflow-y-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-7">
          {selected === "mis" ? "Mis Cursos" : "Cursos Disponibles"}
        </h1>
        <div className="max-w-7xl mx-auto">
          {selected === "mis" ? <MisCursos /> : <CursosDisponibles />}
        </div>
      </main>
    </div>
  );
}