import SidebarAdmin from "../../components/admin/SidebarAdmin";
import CursoCardAdmin from "../../components/admin/CursoCardAdmin";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Vertodosloscursos() {
  useAuth(['ADMIN']);

  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/courses/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCursos(res.data));
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300">
      {/* Sidebar fijo con scroll */}
      <SidebarAdmin className="fixed top-0 left-0 h-screen w-72 overflow-y-auto" />

      {/* Contenido principal con margen para sidebar */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 md:ml-72">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">TODOS LOS CURSOS</h1>
            <p className="text-lg text-gray-500">Gestiona tus cursos y estudiantes aquí.</p>
          </div>
          <a
            href="/admin/crear-curso"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold shadow hover:from-yellow-500 hover:to-orange-400 transition"
          >
            Crear nuevo curso
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.length === 0 && (
            <div className="col-span-full text-center text-gray-400 mt-32">
              <p className="text-2xl font-semibold">Aún no hay cursos creados.</p>
            </div>
          )}
          {cursos.map((curso) => (
            <CursoCardAdmin key={curso.id} curso={curso} setCursos={setCursos} />
          ))}
        </div>
      </main>
    </div>
  );
}