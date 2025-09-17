import { useEffect, useState } from "react";
import axios from "axios";

export default function MisCursos() {
  const [misCursos, setMisCursos] = useState([]);
  const [cursosActivos, setCursosActivos] = useState([]);
  const [cursosInactivos, setCursosInactivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setMisCursos([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/courses/mis-cursos?userId=${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

       

        // Verificar si la respuesta es HTML (error de ngrok)
        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          console.error("Se recibió HTML en lugar de JSON - problema con ngrok o servidor");
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursos = [];
        
        // Manejar diferentes estructuras de respuesta
        if (res.data && Array.isArray(res.data.data)) {
          cursos = res.data.data;
        } else if (Array.isArray(res.data)) {
          cursos = res.data;
        } else if (res.data && typeof res.data === 'object') {
          // Si es un objeto, intentar extraer array de alguna propiedad
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          cursos = possibleArrays.length > 0 ? possibleArrays[0] : [];
        } else {
          cursos = [];
        }

        setMisCursos(cursos);

        // Separar cursos activos e inactivos solo si cursos es un array válido
        if (Array.isArray(cursos)) {
          const activos = cursos.filter(curso => curso.activo);
          const inactivos = cursos.filter(curso => !curso.activo);

          setCursosActivos(activos);
          setCursosInactivos(inactivos);
        }
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        setMisCursos([]);
        setCursosActivos([]);
        setCursosInactivos([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Cargando tus cursos...</div>
      </div>
    );
  }

  if (!misCursos.length) {
    return (
      <div className="text-center text-gray-500 py-12">
        <h2 className="text-2xl font-bold mb-4">No tienes cursos inscritos</h2>
        <p>Aún no te has inscrito en ningún curso.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Cursos Activos */}
      {cursosActivos.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tus Cursos Activos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {cursosActivos.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
          </div>
        </>
      )}

      {/* Cursos Inactivos */}
      {cursosInactivos.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cursos Finalizados o Eliminados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cursosInactivos.map((curso) => (
              <CursoCard key={curso.id} curso={curso} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente de tarjeta de curso para reutilizar
function CursoCard({ curso }) {
  return (
    <div className="bg-white rounded-3xl shadow-md border border-orange-100 flex flex-col items-center p-7 relative">
      <img
        src={curso.imagen 
          ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}` 
          : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
        }
        alt={curso.titulo}
        className="rounded-xl w-32 h-32 object-cover mb-4"
        onError={(e) => {
          console.error("Error cargando imagen en mis cursos:", curso.titulo);
          e.target.src = "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
        }}
      />
      <h3 className="text-xl font-bold text-gray-900 mb-1">{curso.titulo || "Sin título"}</h3>
      <p className="text-gray-600 text-sm mb-2">{curso.descripcion || "Sin descripción"}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {curso.tipo && (
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
            {curso.tipo.replace(/_/g, " ")}
          </span>
        )}
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
          {curso.cupos || 0} cupos
        </span>
        {curso.precio > 0 && (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
            ${curso.precio}
          </span>
        )}
      </div>

      {/* Acceso o mensaje de inactivo */}
      {curso.activo ? (
        curso.link ? (
          <a
            href={curso.link}
            className="inline-block mt-2 text-orange-600 underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {curso.tipo && curso.tipo.startsWith("ONLINE") ? "Ir a clase" : "Ver ubicación"}
          </a>
        ) : null
      ) : (
        <div className="mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-lg font-semibold text-center text-sm">
          Acceso no disponible - Curso inactivo
        </div>
      )}

      {/* Leyenda para curso inactivo */}
      {!curso.activo && (
        <div className="mt-4 p-3 text-center bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
          Este curso fue eliminado por el administrador, pero se mantiene en tu historial de cursos, ya sea comprado o gratis.
        </div>
      )}

      <span className="mt-3 px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
        Inscrito
      </span>
    </div>
  );
}