import SidebarAdmin from "../../components/admin/SidebarAdmin";
import CursoCardAdmin from "../../components/admin/CursoCardAdmin";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaFilter, FaMoneyBillWave, FaGraduationCap, FaSearch } from "react-icons/fa";

export default function Vertodosloscursos() {
  useAuth(['ADMIN']);

  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODOS'); // 'PAGADO', 'GRATIS', 'TODOS'
  const [searchTerm, setSearchTerm] = useState('');

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

        // Ordenar cursos: primero los más recientes (por ID descendente)
        const cursosOrdenados = cursosData.sort((a, b) => b.id - a.id);
        setCursos(cursosOrdenados);
        setFilteredCursos(cursosOrdenados);
      })
      .catch((err) => {
        console.error("Error al cargar todos los cursos:", err);
        setCursos([]);
        setFilteredCursos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtrar cursos basado en la pestaña activa y término de búsqueda
  useEffect(() => {
    let filtered = cursos;

    // Filtrar por tipo (PAGADO/GRATIS)
    if (activeTab !== 'TODOS') {
      filtered = filtered.filter(curso =>
        activeTab === 'PAGADO' ? curso.tipo.endsWith('PAGADO') : curso.tipo.endsWith('GRATIS')
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(curso =>
        curso.titulo.toLowerCase().includes(term) ||
        (curso.descripcion && curso.descripcion.toLowerCase().includes(term)) ||
        (curso.profesor && (
          curso.profesor.nombres.toLowerCase().includes(term) ||
          curso.profesor.apellidos.toLowerCase().includes(term)
        ))
      );
    }

    setFilteredCursos(filtered);
  }, [cursos, activeTab, searchTerm]);

  const handleCursoCreated = (nuevoCurso) => {
    // Agregar el nuevo curso al principio de la lista
    setCursos(prevCursos => [nuevoCurso, ...prevCursos]);
  };

  const handleCursoDeleted = (cursoId) => {
    setCursos(prevCursos => prevCursos.filter(curso => curso.id !== cursoId));
  };

  const handleCursoUpdated = (cursoActualizado) => {
    setCursos(prevCursos =>
      prevCursos.map(curso =>
        curso.id === cursoActualizado.id ? cursoActualizado : curso
      )
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <SidebarAdmin className="fixed top-0 left-0 h-screen w-72 overflow-y-auto" />
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 md:ml-72">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <div className="text-xl font-semibold text-gray-700">Cargando cursos...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar fijo con scroll */}
      <SidebarAdmin className="fixed top-0 left-0 h-screen w-72 overflow-y-auto" />

      <main className="flex-1 h-screen md:ml-72 flex flex-col p-4 md:p-8">
        {/* Header con gradiente */}
        <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">TODOS LOS CURSOS</h1>
              <p className="text-blue-100">Gestiona tus cursos y estudiantes aquí</p>
            </div>
            <a
              href="/admin/crear-curso"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-bold shadow-md hover:bg-gray-100 transition"
            >
              <FaPlus />
              Crear nuevo curso
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 mb-6">
          {/* Contenedor principal: Búsqueda + Stats + Filtros en una sola línea en desktop */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {/* Barra de búsqueda - Ocupa más espacio */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Estadísticas - Compactas y bien distribuidas - Ocultas en móvil */}
            <div className="hidden md:flex items-center justify-center bg-blue-50 rounded-xl p-2 border border-blue-200 shadow-sm">
              <div className="grid grid-cols-4 gap-2 w-full">
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Total</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-blue-600">{cursos.length}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Pagados</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-green-600">{cursos.filter(c => c.tipo.endsWith('PAGADO')).length}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Gratuitos</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-blue-600">{cursos.filter(c => c.tipo.endsWith('GRATIS')).length}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 mb-1">Online</div>
                  <div className="bg-white p-1 rounded-lg text-center w-full">
                    <div className="font-bold text-purple-600">{cursos.filter(c => c.tipo.startsWith('ONLINE')).length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contador de resultados - Se integra en la misma línea */}
            <div className="flex items-center justify-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 whitespace-nowrap min-w-[120px]">
              <span className="text-blue-700 font-medium">
                {filteredCursos.length} curso{filteredCursos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filtros - Debajo en móvil, integrados en desktop */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Tabs de filtrado */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => setActiveTab('PAGADO')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'PAGADO'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaMoneyBillWave />
                <span>Pagados</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursos.filter(c => c.tipo.endsWith('PAGADO')).length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('GRATIS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'GRATIS'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaGraduationCap />
                <span>Gratuitos</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursos.filter(c => c.tipo.endsWith('GRATIS')).length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('TODOS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'TODOS'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaFilter />
                <span>Todos</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {cursos.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor scrollable para cursos */}
        <div className="flex-1 overflow-y-auto">
          {/* Grid de cursos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCursos.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : activeTab === 'PAGADO'
                      ? 'No hay cursos pagados creados aún'
                      : activeTab === 'GRATIS'
                        ? 'No hay cursos gratuitos creados aún'
                        : 'No hay cursos creados aún'}
                </p>
                {!searchTerm && (
                  <a
                    href="/admin/crear-curso"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                  >
                    <FaPlus />
                    Crear primer curso
                  </a>
                )}
              </div>
            ) : (
              filteredCursos.map((curso) => (
                <CursoCardAdmin
                  key={curso.id}
                  curso={curso}
                  setCursos={setCursos}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}