import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../utils/axiosInstance";
import CursoCardAdmin from "../../components/admin/CursoCardAdmin";
import {
  FaPlus,
  FaFilter,
  FaMoneyBillWave,
  FaGraduationCap,
  FaSearch,
  FaArchive,
  FaEye,
  FaSync,
} from "react-icons/fa";

// ✅ CONSTANTES PARA URLs
const API_URLS = {
  ACTIVOS: `/api/courses/all`,
  INACTIVOS: `/api/courses/admin/inactivos`,
  TODOS: `/api/courses/admin/todos`,
};

// ✅ HOOK PERSONALIZADO PARA LA CARGA DE CURSOS
const useCursos = (activeTab) => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarCursos = useCallback(
    async (tab = activeTab) => {
      setLoading(true);

      try {
        const url = API_URLS[tab] || API_URLS.ACTIVOS;

        const response = await api.get(url);

        let cursosData = [];
        if (response.data && Array.isArray(response.data.data)) {
          cursosData = response.data.data;
        } else if (Array.isArray(response.data)) {
          cursosData = response.data;
        } else if (response.data && typeof response.data === "object") {
          const arrays = Object.values(response.data).filter(Array.isArray);
          cursosData = arrays.length > 0 ? arrays[0] : [];
        }

        // Ordenar por ID descendente
        const ordenados = cursosData.sort((a, b) => b.id - a.id);
        setCursos(ordenados);
      } catch (err) {
        console.error("❌ [FRONTEND] Error al cargar cursos:", err);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    cargarCursos();
  }, [cargarCursos]);

  return { cursos, loading, recargarCursos: cargarCursos };
};

// ✅ COMPONENTE DE LOADING
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
        Cargando cursos...
      </div>
    </div>
  </div>
);

// ✅ COMPONENTE DE ESTADO VACÍO
const EmptyState = ({ activeTab, searchTerm }) => (
  <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200">
    <div
      className={`text-6xl mb-4 ${
        activeTab === "INACTIVOS" ? "text-red-400" : "text-gray-400"
      }`}
    >
      {activeTab === "INACTIVOS" ? "📁" : "📚"}
    </div>
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {searchTerm
        ? "No se encontraron cursos"
        : activeTab === "INACTIVOS"
          ? "No hay cursos inactivos"
          : "No hay cursos disponibles"}
    </h3>
    <p className="text-gray-500 dark:text-gray-400">
      {searchTerm
        ? "Intenta con otros términos de búsqueda"
        : activeTab === "INACTIVOS"
          ? "Los cursos que archives aparecerán aquí"
          : "Crea tu primer curso"}
    </p>
    {!searchTerm && activeTab !== "INACTIVOS" && (
      <a
        href="/admin/crear-curso"
        className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
      >
        <FaPlus /> Crear curso
      </a>
    )}
  </div>
);

// ✅ COMPONENTE PRINCIPAL OPTIMIZADO
export default function VerTodosLosCursos() {
  useAuth(["ADMIN"]);

  const [activeTab, setActiveTab] = useState("ACTIVOS");
  const [searchTerm, setSearchTerm] = useState("");

  const { cursos, loading, recargarCursos } = useCursos(activeTab);

  // ✅ MEMOIZAR FILTRADO DE CURSOS
  const filteredCursos = useMemo(() => {
    let filtered = cursos;

    // Aplicar filtros según la pestaña activa
    switch (activeTab) {
      case "ACTIVOS":
        filtered = filtered.filter((c) => c.activo !== false);
        break;
      case "INACTIVOS":
        filtered = filtered.filter((c) => c.activo === false);
        break;
      case "PAGADO":
        filtered = filtered.filter((c) => c.precio > 0 && c.activo !== false);
        break;
      case "GRATIS":
        filtered = filtered.filter((c) => c.precio === 0 && c.activo !== false);
        break;
      default:
        break;
    }

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.titulo.toLowerCase().includes(term) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(term)) ||
          (c.profesor &&
            `${c.profesor.nombres} ${c.profesor.apellidos}`
              .toLowerCase()
              .includes(term)),
      );
    }

    return filtered;
  }, [cursos, activeTab, searchTerm]);

  // ✅ HANDLERS MEMOIZADOS
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchTerm(""); // Limpiar búsqueda al cambiar pestaña
  }, []);

  const handleRecargar = useCallback(() => {
    recargarCursos(activeTab);
  }, [recargarCursos, activeTab]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-200">
      {/* Barra búsqueda + filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-5 mb-6 transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {activeTab === "INACTIVOS"
                  ? "CURSOS INACTIVOS"
                  : activeTab === "TODOS"
                    ? "TODOS LOS CURSOS"
                    : "CURSOS ACTIVOS"}
              </h1>
              <p className="text-blue-100">
                {activeTab === "INACTIVOS"
                  ? "Gestiona los cursos archivados"
                  : activeTab === "TODOS"
                    ? "Vista completa de todos los cursos"
                    : "Gestiona y administra todos los cursos activos"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRecargar}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors duration-200 backdrop-blur-sm"
              >
                <FaSync className="text-sm" />
                Recargar
              </button>
              <a
                href="/admin/crear-curso"
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-semibold transition-colors duration-200"
              >
                <FaPlus className="text-sm" />
                Crear Curso
              </a>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar cursos por título, descripción o profesor..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Pestañas de filtro */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleTabChange("ACTIVOS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "ACTIVOS"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <FaEye className="text-sm" />
            Activos ({cursos.filter((c) => c.activo !== false).length})
          </button>
          <button
            onClick={() => handleTabChange("INACTIVOS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "INACTIVOS"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <FaArchive className="text-sm" />
            Inactivos ({cursos.filter((c) => c.activo === false).length})
          </button>
          <button
            onClick={() => handleTabChange("PAGADO")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "PAGADO"
                ? "bg-yellow-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <FaMoneyBillWave className="text-sm" />
            Premium
          </button>
          <button
            onClick={() => handleTabChange("GRATIS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "GRATIS"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <FaGraduationCap className="text-sm" />
            Gratuitos
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando
                </span>
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                  {filteredCursos.length}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  de {cursos.length} cursos
                </span>
              </div>
              {searchTerm && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg px-4 py-2 border border-yellow-200 dark:border-yellow-700">
                  <span className="text-sm text-yellow-800 dark:text-yellow-300">
                    Filtrado por: "{searchTerm}"
                  </span>
                </div>
              )}
            </div>
            {filteredCursos.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ordenado por: <strong>Más recientes primero</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de cursos */}
      {filteredCursos.length === 0 ? (
        <EmptyState activeTab={activeTab} searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCursos.map((curso) => (
            <CursoCardAdmin
              key={curso.id}
              curso={curso}
              setCursos={() => recargarCursos(activeTab)}
              showInactive={activeTab === "INACTIVOS"}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
