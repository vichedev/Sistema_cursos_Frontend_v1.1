import SidebarAdmin from "../../components/admin/SidebarAdmin";
import CursoCardAdmin from "../../components/admin/CursoCardAdmin";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Vertodosloscursos() {
  useAuth(['ADMIN']);

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/courses/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      .then((res) => {
       

        // Verificar si la respuesta es HTML (error de ngrok)
        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          console.error("Se recibió HTML en lugar de JSON - problema con ngrok o servidor");
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursosData = [];
        
        // Manejar diferentes estructuras de respuesta
        if (res.data && Array.isArray(res.data.data)) {
          cursosData = res.data.data;
        } else if (Array.isArray(res.data)) {
          cursosData = res.data;
        } else if (res.data && typeof res.data === 'object') {
          // Si es un objeto, intentar extraer array de alguna propiedad
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          cursosData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        } else {
          cursosData = [];
        }

        setCursos(cursosData);
      })
      .catch((err) => {
        console.error("Error al cargar todos los cursos:", err);
        setCursos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300">
        <SidebarAdmin className="fixed top-0 left-0 h-screen w-72 overflow-y-auto" />
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 md:ml-72">
          <div className="flex items-center justify-center h-full">
            <div className="text-xl font-semibold text-gray-700">Cargando cursos...</div>
          </div>
        </main>
      </div>
    );
  }

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
          {!Array.isArray(cursos) || cursos.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 mt-32">
              <p className="text-2xl font-semibold">
                {!Array.isArray(cursos) ? "Error al cargar cursos" : "Aún no hay cursos creados."}
              </p>
              {!Array.isArray(cursos) && (
                <p className="text-sm mt-2 text-red-500">
                  Verifica la consola para más detalles del error
                </p>
              )}
            </div>
          ) : (
            cursos.map((curso) => (
              <CursoCardAdmin key={curso.id} curso={curso} setCursos={setCursos} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}