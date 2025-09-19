import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import CursoCardAdmin from "../../components/admin/CursoCardAdmin";
import {
  FaPlus,
  FaFilter,
  FaMoneyBillWave,
  FaGraduationCap,
  FaSearch,
} from "react-icons/fa";
import AdminLayout from "../../layouts/AdminLayout";

export default function VerTodosLosCursos() {
  useAuth(["ADMIN"]);

  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/courses/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => {
        let cursosData = [];
        if (res.data && Array.isArray(res.data.data)) cursosData = res.data.data;
        else if (Array.isArray(res.data)) cursosData = res.data;
        else if (res.data && typeof res.data === "object") {
          const arrays = Object.values(res.data).filter(Array.isArray);
          cursosData = arrays.length > 0 ? arrays[0] : [];
        }
        const ordenados = cursosData.sort((a, b) => b.id - a.id);
        setCursos(ordenados);
        setFilteredCursos(ordenados);
      })
      .catch((err) => {
        console.error("Error al cargar cursos:", err);
        setCursos([]);
        setFilteredCursos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = cursos;
    if (activeTab !== "TODOS") {
      filtered = filtered.filter((c) =>
        activeTab === "PAGADO"
          ? c.tipo.endsWith("PAGADO")
          : c.tipo.endsWith("GRATIS")
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.titulo.toLowerCase().includes(term) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(term)) ||
          (c.profesor &&
            (`${c.profesor.nombres} ${c.profesor.apellidos}`.toLowerCase().includes(term)))
      );
    }
    setFilteredCursos(filtered);
  }, [cursos, activeTab, searchTerm]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            <div className="text-xl font-semibold text-gray-700">
              Cargando cursos...
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Barra búsqueda + filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">TODOS LOS CURSOS</h1>
              <p className="text-blue-100">
                Gestiona tus cursos y estudiantes aquí
              </p>
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
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          {/* Search */}
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

          {/* Contador */}
          <div className="flex items-center justify-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 whitespace-nowrap min-w-[120px]">
            <span className="text-blue-700 font-medium">
              {filteredCursos.length} curso
              {filteredCursos.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab("PAGADO")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === "PAGADO"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <FaMoneyBillWave /> Pagados
          </button>

          <button
            onClick={() => setActiveTab("GRATIS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === "GRATIS"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <FaGraduationCap /> Gratuitos
          </button>

          <button
            onClick={() => setActiveTab("TODOS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === "TODOS"
                ? "bg-gray-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            <FaFilter /> Todos
          </button>
        </div>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCursos.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm
                ? "No se encontraron cursos"
                : "No hay cursos disponibles"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primer curso"}
            </p>
            {!searchTerm && (
              <a
                href="/admin/crear-curso"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                <FaPlus /> Crear curso
              </a>
            )}
          </div>
        ) : (
          filteredCursos.map((curso) => (
            <CursoCardAdmin key={curso.id} curso={curso} setCursos={setCursos} />
          ))
        )}
      </div>
      
    </AdminLayout>
  );
}
