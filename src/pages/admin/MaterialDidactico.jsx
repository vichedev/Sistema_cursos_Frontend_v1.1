// src/pages/admin/MaterialDidactico.jsx
// Módulo dedicado: material didáctico por curso. Filtros por título, categoría y
// orden por fecha. Cada curso se despliega en su panel de recursos.
import React, { useState, useEffect, useMemo } from "react";
import api from "../../utils/axiosInstance";
import CursoRecursos from "../../components/admin/CursoRecursos";
import {
  FaBookOpen,
  FaSearch,
  FaChevronDown,
  FaSpinner,
  FaGraduationCap,
} from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function MaterialDidactico() {
  const [courses, setCourses] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [order, setOrder] = useState("recientes"); // recientes | antiguos | titulo
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api
      .get("/api/courses/all")
      .then((r) => setCourses(Array.isArray(r.data) ? r.data : r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    api
      .get("/api/categories")
      .then((r) => setCategorias(r.data?.data || []))
      .catch(() => setCategorias([]));
  }, []);

  const catMap = useMemo(() => {
    const m = {};
    categorias.forEach((c) => (m[c.id] = c));
    return m;
  }, [categorias]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = courses.filter((c) => {
      if (q && !(c.titulo || "").toLowerCase().includes(q)) return false;
      if (catFilter === "SIN" && c.categoriaId) return false;
      if (catFilter && catFilter !== "SIN" && c.categoriaId !== Number(catFilter)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (order === "titulo") return (a.titulo || "").localeCompare(b.titulo || "");
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return order === "antiguos" ? da - db : db - da;
    });
    return list;
  }, [courses, search, catFilter, order]);

  const imgUrl = (c) =>
    c.imagen ? (c.imagen.startsWith("http") ? c.imagen : `${BACKEND_URL}/uploads/${c.imagen}`) : null;

  // Solo categorías con al menos un curso
  const catsConCursos = categorias.filter((c) => courses.some((cu) => cu.categoriaId === c.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      {/* Header */}
      <div className="mb-6 rounded-2xl p-6 md:p-7 text-white shadow-lg bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaBookOpen /> Material didáctico
        </h1>
        <p className="text-orange-50 mt-1.5 text-sm">
          Gestiona los enlaces de material por curso y envíalos a los estudiantes inscritos.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Todas las categorías</option>
          {catsConCursos.map((c) => (
            <option key={c.id} value={c.id}>{c.icono ? `${c.icono} ` : ""}{c.nombre}</option>
          ))}
          <option value="SIN">Sin categoría</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
          <option value="titulo">Título (A-Z)</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <FaSpinner className="animate-spin mr-2" /> Cargando cursos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FaBookOpen className="mx-auto text-4xl mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {search || catFilter ? "Ningún curso coincide con los filtros." : "Aún no hay cursos creados."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const open = openId === c.id;
            const url = imgUrl(c);
            const cat = catMap[c.categoriaId];
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  {url ? (
                    <img src={url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <span className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center flex-shrink-0">
                      <FaGraduationCap />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Material didáctico del curso:</p>
                      {cat && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: (cat.color || "#2563eb") + "1a", color: cat.color || "#2563eb" }}
                        >
                          {cat.icono || "🏷️"} {cat.nombre}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{c.titulo}</h3>
                  </div>
                  <span className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                    <FaChevronDown />
                  </span>
                </button>

                {open && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 md:p-5 bg-gray-50/50 dark:bg-gray-900/30">
                    <CursoRecursos cursoId={c.id} compact />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
