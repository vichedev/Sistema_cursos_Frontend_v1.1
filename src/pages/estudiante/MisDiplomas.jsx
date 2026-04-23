// src/pages/estudiante/MisDiplomas.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosInstance";
import {
  FaAward,
  FaDownload,
  FaGraduationCap,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaSpinner,
  FaExternalLinkAlt,
  FaHashtag,
  FaBookOpen,
} from "react-icons/fa";
import { useNotifications } from "../../context/NotificationContext";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

function DiplomaCard({ curso }) {
  const [imgError, setImgError] = useState(false);

  const fechaEmision = curso.diplomaEmitidoEn
    ? new Date(curso.diplomaEmitidoEn).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const fechaCurso = curso.fecha
    ? new Date(curso.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-600">
      {/* Gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

      {/* Course thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-amber-500 to-yellow-600">
        {curso.imagen && !imgError ? (
          <>
            <img
              src={`${BACKEND_URL}/uploads/${curso.imagen}`}
              alt={curso.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaAward className="text-white/30 text-6xl" />
          </div>
        )}

        {/* Diploma issued badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <FaAward className="text-[9px]" /> Diploma emitido
          </span>
          {fechaEmision && (
            <span className="text-white/80 text-[10px] bg-black/40 px-2 py-0.5 rounded-full">
              {fechaEmision}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {curso.titulo}
        </h3>

        {fechaCurso && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <FaCalendarAlt className="text-indigo-400 flex-shrink-0" />
            <span>Fecha del curso: {fechaCurso}</span>
          </div>
        )}

        {/* Diploma code block */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2.5 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FaHashtag className="text-amber-500 text-[10px]" />
            <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-semibold">Código de diploma</p>
          </div>
          <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all leading-relaxed">{curso.diplomaCodigo}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={`${BACKEND_URL}/api/diplomas/pdf/${curso.diplomaCodigo}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold text-xs rounded-xl shadow transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <FaDownload className="text-[11px]" />
            Descargar PDF
          </a>
          <a
            href={`${BACKEND_URL}/api/diplomas/pdf/${curso.diplomaCodigo}`}
            target="_blank"
            rel="noreferrer"
            title="Abrir en nueva pestaña"
            className="flex items-center justify-center w-10 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-colors active:scale-95"
          >
            <FaExternalLinkAlt className="text-[11px]" />
          </a>
        </div>
      </div>
    </div>
  );
}

function PendingCard({ curso }) {
  const fechaCurso = curso.fecha
    ? new Date(curso.fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <FaClock className="text-gray-400 text-base" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm truncate">{curso.titulo}</p>
        {fechaCurso && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <FaCalendarAlt className="text-[10px]" /> {fechaCurso}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">Diploma pendiente de emisión por el administrador</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-2 py-1 rounded-full">Pendiente</span>
      </div>
    </div>
  );
}

export default function MisDiplomas() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { markAllRead } = useNotifications();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCursos = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const res = await api.get(`/api/courses/mis-cursos?userId=${userId}`);
        setCursos(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
    // Mark diploma notifications as read
    markAllRead();
  }, []);

  const conDiploma = cursos.filter(
    (c) => c.diplomaCodigo && (!search || c.titulo.toLowerCase().includes(search.toLowerCase()))
  );
  const sinDiploma = cursos.filter(
    (c) => !c.diplomaCodigo && (!search || c.titulo.toLowerCase().includes(search.toLowerCase()))
  );
  const totalDiplomas = cursos.filter((c) => c.diplomaCodigo).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-3">
          <FaSpinner className="text-4xl text-amber-500 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando diplomas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 px-6 py-8 sm:py-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-inner">
              <FaAward className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Mis Diplomas</h1>
              <p className="text-amber-100 text-sm mt-0.5">
                {totalDiplomas > 0
                  ? `Tienes ${totalDiplomas} diploma${totalDiplomas !== 1 ? "s" : ""} — ¡felicitaciones!`
                  : "Aquí aparecerán tus diplomas cuando el administrador los emita"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{totalDiplomas}</p>
              <p className="text-xs text-amber-100 mt-0.5 flex items-center justify-center gap-1"><FaAward className="text-[10px]" /> Diplomas</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{cursos.length}</p>
              <p className="text-xs text-amber-100 mt-0.5 flex items-center justify-center gap-1"><FaBookOpen className="text-[10px]" /> Cursos</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{cursos.length - totalDiplomas}</p>
              <p className="text-xs text-amber-100 mt-0.5 flex items-center justify-center gap-1"><FaClock className="text-[10px]" /> Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Empty state — no courses at all */}
        {cursos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-5">
              <FaGraduationCap className="text-5xl text-amber-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Sin cursos inscritos</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Inscríbete en un curso para comenzar a obtener diplomas que certifiquen tu aprendizaje.
            </p>
            <Link
              to="/estudiante/cursos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow transition-colors"
            >
              <FaBookOpen /> Explorar cursos disponibles
            </Link>
          </div>
        )}

        {/* Search */}
        {cursos.length > 0 && (
          <div className="relative mb-6">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre del curso..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
          </div>
        )}

        {/* Search no results */}
        {cursos.length > 0 && conDiploma.length === 0 && sinDiploma.length === 0 && search && (
          <div className="text-center py-14">
            <FaSearch className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron cursos para <strong>"{search}"</strong></p>
            <button onClick={() => setSearch("")} className="text-sm text-amber-500 hover:underline mt-2">Limpiar búsqueda</button>
          </div>
        )}

        {/* Diplomas obtenidos */}
        {conDiploma.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FaAward className="text-amber-500 text-sm" />
              </div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Diplomas Obtenidos</h2>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {conDiploma.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {conDiploma.map((c) => (
                <DiplomaCard key={c.id} curso={c} />
              ))}
            </div>
          </section>
        )}

        {/* Sin diploma aún */}
        {sinDiploma.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FaClock className="text-gray-400 text-sm" />
              </div>
              <h2 className="text-base font-bold text-gray-600 dark:text-gray-400">Cursos sin diploma aún</h2>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {sinDiploma.length}
              </span>
            </div>
            <div className="space-y-2">
              {sinDiploma.map((c) => (
                <PendingCard key={c.id} curso={c} />
              ))}
            </div>
          </section>
        )}

        {/* CTA when courses exist but no diplomas yet */}
        {cursos.length > 0 && totalDiplomas === 0 && !search && (
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6 text-center">
            <FaAward className="text-4xl text-amber-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Aún no tienes diplomas</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Los diplomas serán emitidos por el administrador cuando completes los cursos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
