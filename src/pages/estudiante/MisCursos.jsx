import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaFilter, FaMoneyBillWave, FaGraduationCap } from "react-icons/fa";

export default function MisCursos() {
  const [misCursos, setMisCursos] = useState([]);
  const [cursosActivos, setCursosActivos] = useState([]);
  const [cursosInactivos, setCursosInactivos] = useState([]);
  const [cursosGratis, setCursosGratis] = useState([]);
  const [cursosPagados, setCursosPagados] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVOS'); // 'ACTIVOS', 'INACTIVOS', 'GRATIS', 'PAGADOS'
  const [searchTerm, setSearchTerm] = useState('');

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

        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          console.error("Se recibió HTML en lugar de JSON - problema con ngrok o servidor");
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursos = [];
        if (res.data && Array.isArray(res.data.data)) {
          cursos = res.data.data;
        } else if (Array.isArray(res.data)) {
          cursos = res.data;
        } else if (res.data && typeof res.data === 'object') {
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          cursos = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }

        setMisCursos(cursos);

        // Separar cursos por estado y tipo
        setCursosActivos(cursos.filter(c => c.activo));
        setCursosInactivos(cursos.filter(c => !c.activo));
        setCursosGratis(cursos.filter(c => c.precio === 0));
        setCursosPagados(cursos.filter(c => c.precio > 0));

        // Por defecto mostrar activos
        setFilteredCursos(cursos.filter(c => c.activo));
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        setMisCursos([]);
        setCursosActivos([]);
        setCursosInactivos([]);
        setCursosGratis([]);
        setCursosPagados([]);
        setFilteredCursos([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Filtrar cursos basado en la pestaña activa y término de búsqueda
  useEffect(() => {
    let filtered = [];

    switch (activeTab) {
      case 'ACTIVOS':
        filtered = cursosActivos;
        break;
      case 'INACTIVOS':
        filtered = cursosInactivos;
        break;
      case 'GRATIS':
        filtered = cursosGratis;
        break;
      case 'PAGADOS':
        filtered = cursosPagados;
        break;
      default:
        filtered = misCursos;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(curso =>
        curso.titulo.toLowerCase().includes(term) ||
        (curso.descripcion && curso.descripcion.toLowerCase().includes(term)) ||
        (curso.profesorNombre && curso.profesorNombre.toLowerCase().includes(term)) ||
        (curso.asignatura && curso.asignatura.toLowerCase().includes(term))
      );
    }

    setFilteredCursos(filtered);
  }, [misCursos, cursosActivos, cursosInactivos, cursosGratis, cursosPagados, activeTab, searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <div className="text-xl font-semibold text-gray-700">Cargando tus cursos...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="flex-1 h-screen flex flex-col p-4 md:p-8">
        {/* Header con gradiente - Oculto en móvil */}
        <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">MIS CURSOS</h1>
              <p className="text-blue-100">Gestiona y accede a todos tus cursos inscritos</p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 mb-6">
          {/* Contenedor principal: Búsqueda + Stats + Filtros */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {/* Barra de búsqueda */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mis cursos por título, descripción o profesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Estadísticas - Ocultas en móvil */}
            <div className="hidden md:flex items-center justify-center bg-blue-50 rounded-xl p-2 border border-blue-200 shadow-sm">
              <div className="grid grid-cols-4 gap-2 w-full">
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Total</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-blue-600">{misCursos.length}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Activos</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-green-600">{cursosActivos.length}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Inactivos</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-blue-600">{cursosInactivos.length}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Pagados</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-purple-600">{cursosPagados.length}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Filtros */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Tabs de filtrado */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => setActiveTab('ACTIVOS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'ACTIVOS'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaGraduationCap />
                <span>Activos</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursosActivos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('INACTIVOS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'INACTIVOS'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaMoneyBillWave />
                <span>Inactivos</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursosInactivos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('GRATIS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'GRATIS'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaFilter />
                <span>Gratis</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursosGratis.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('PAGADOS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'PAGADOS'
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaMoneyBillWave />
                <span>Pagados</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursosPagados.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor scrollable para cursos */}
        <div className="flex-1 overflow-y-auto">
          {filteredCursos.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? 'No se encontraron cursos' : 'No tienes cursos inscritos'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : activeTab === 'ACTIVOS'
                    ? 'No tienes cursos activos'
                    : activeTab === 'INACTIVOS'
                      ? 'No tienes cursos inactivos'
                      : activeTab === 'GRATIS'
                        ? 'No tienes cursos gratuitos'
                        : 'No tienes cursos pagados'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCursos.map((curso) => (
                <CursoCard key={curso.id} curso={curso} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Componente de tarjeta de curso para reutilizar
function CursoCard({ curso }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative">
        <img
          src={curso.imagen 
            ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}` 
            : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
          }
          alt={curso.titulo}
          className="w-full h-48 object-cover rounded-t-3xl"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
          }}
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow ${
          curso.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {curso.activo ? 'ACTIVO' : 'INACTIVO'}
        </span>
        {curso.precio > 0 && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold shadow">
            ${curso.precio}
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{curso.titulo || "Sin título"}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{curso.descripcion || "Sin descripción"}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {curso.tipo && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
                {curso.tipo.replace(/_/g, " ")}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
              {curso.cupos || 0} cupos
            </span>
          </div>

          {curso.profesorNombre && (
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Profesor:</span> {curso.profesorNombre}
            </p>
          )}

          {curso.asignatura && (
            <p className="text-sm text-gray-500">
              <span className="font-medium">Asignatura:</span> {curso.asignatura}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Acceso o mensaje de inactivo */}
          {curso.activo ? (
            curso.link ? (
              <a
                href={curso.link}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-center block hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                target="_blank"
                rel="noopener noreferrer"
              >
                {curso.tipo && curso.tipo.startsWith("ONLINE") ? "Ir a clase" : "Ver ubicación"}
              </a>
            ) : (
              <div className="text-center text-gray-500 text-sm">
                Enlace no disponible temporalmente
              </div>
            )
          ) : (
            <div className="text-center bg-red-50 text-red-700 p-3 rounded-lg font-semibold text-sm">
              Acceso no disponible - Curso inactivo
            </div>
          )}

          {/* Leyenda para curso inactivo */}
          {!curso.activo && (
            <div className="mt-3 p-3 text-center bg-gray-100 text-gray-600 rounded-lg text-xs">
              Este curso fue eliminado pero se mantiene en tu historial
            </div>
          )}

          <div className="mt-3 text-center">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              Inscrito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}