// src/pages/admin/GestionDiplomas.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosInstance";
import Swal from "sweetalert2";
import {
  FaGraduationCap,
  FaEnvelope,
  FaPaperPlane,
  FaUsers,
  FaChalkboardTeacher,
  FaSearch,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const isDark = () => document.documentElement.classList.contains("dark");

// ─── helpers ──────────────────────────────────────────────────────────────────

const TIPO_LABEL = {
  ONLINE_GRATIS: {
    label: "Online Gratis",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  ONLINE_PAGADO: {
    label: "Online Pagado",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  PRESENCIAL_GRATIS: {
    label: "Presencial Gratis",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  PRESENCIAL_PAGADO: {
    label: "Presencial Pagado",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
};

function Badge({ tipo }) {
  const t = TIPO_LABEL[tipo] || {
    label: tipo,
    color: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${t.color}`}
    >
      {t.label}
    </span>
  );
}

// ─── Vista: lista de cursos ───────────────────────────────────────────────────
function CursosList({ onSelect }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get(`/api/diplomas/cursos`)
      .then((r) => setCursos(r.data))
      .catch(() =>
        Swal.fire("Error", "No se pudieron cargar los cursos", "error"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = cursos.filter(
    (c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (c.profesor &&
        `${c.profesor.nombres} ${c.profesor.apellidos}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white shadow-xl mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FaGraduationCap className="text-2xl sm:text-3xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Gestión de Diplomas
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">
              Selecciona un curso para enviar diplomas a sus estudiantes
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-5 max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar curso o instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Grid de cursos */}
      {loading ? (
        <div className="flex justify-center items-center py-24 gap-3 text-gray-500">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          <span>Cargando cursos...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaGraduationCap className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No se encontraron cursos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((curso) => (
            <button
              key={curso.id}
              onClick={() => onSelect(curso)}
              className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 group active:scale-[0.98]"
            >
              {/* Imagen o placeholder */}
              <div className="w-full h-32 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                {curso.imagen ? (
                  <img
                    src={`${API}/uploads/${curso.imagen}`}
                    alt={curso.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <FaGraduationCap className="text-white/60 text-4xl" />
                )}
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {curso.titulo}
                </h3>
                <Badge tipo={curso.tipo} />
              </div>

              {curso.profesor && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                  <FaChalkboardTeacher className="flex-shrink-0" />
                  {curso.profesor.nombres} {curso.profesor.apellidos}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <FaUsers />
                  <span>
                    {curso.totalEstudiantes} estudiante
                    {curso.totalEstudiantes !== 1 ? "s" : ""}
                  </span>
                </div>
                {curso.fecha && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <FaCalendarAlt />
                    <span>
                      {new Date(curso.fecha).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vista: estudiantes del curso ─────────────────────────────────────────────
function EstudiantesDiploma({ curso, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({}); // { [estudianteId]: true/false }
  const [sendingAll, setSendingAll] = useState(false);
  const [sent, setSent] = useState(new Set());
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/api/diplomas/cursos/${curso.id}/estudiantes`)
      .then((r) => setData(r.data))
      .catch(() =>
        Swal.fire("Error", "No se pudieron cargar los estudiantes", "error"),
      )
      .finally(() => setLoading(false));
  }, [curso.id]);

  useEffect(() => {
    load();
  }, [load]);

  const enviarUno = async (estudiante) => {
    setSending((p) => ({ ...p, [estudiante.estudianteId]: true }));
    try {
      await api.post(
        `/api/diplomas/enviar/${curso.id}/${estudiante.estudianteId}`,
        {},
      );
      setSent((p) => new Set(p).add(estudiante.estudianteId));
      Swal.fire({
        icon: "success",
        title: "¡Diploma enviado!",
        html: `El diploma de <strong>${estudiante.nombres} ${estudiante.apellidos}</strong><br/>fue enviado a <em>${estudiante.correo}</em>`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: isDark() ? "#1f2937" : "#fff",
        color: isDark() ? "#f9fafb" : "#111827",
        iconColor: "#22c55e",
        customClass: { popup: "rounded-2xl" },
      });
    } catch (e) {
      Swal.fire(
        "Error",
        e.response?.data?.message || "No se pudo enviar el diploma",
        "error",
      );
    } finally {
      setSending((p) => ({ ...p, [estudiante.estudianteId]: false }));
    }
  };

  const enviarTodos = async () => {
    const total = data?.estudiantes?.length ?? 0;
    const confirm = await Swal.fire({
      title: "¿Enviar diplomas a todos?",
      html: `Se enviará un diploma a <strong>${total} estudiante${total !== 1 ? "s" : ""}</strong> del curso<br/><em>«${data?.curso?.titulo}»</em>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar a todos",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      background: isDark() ? "#1f2937" : "#fff",
      color: isDark() ? "#f9fafb" : "#111827",
      customClass: { popup: "rounded-2xl" },
    });
    if (!confirm.isConfirmed) return;

    setSendingAll(true);
    try {
      const res = await api.post(`/api/diplomas/enviar-todos/${curso.id}`, {});
      const { enviados, errores } = res.data;
      // Marcar todos como enviados
      setSent(new Set(data.estudiantes.map((e) => e.estudianteId)));

      Swal.fire({
        icon: errores === 0 ? "success" : "warning",
        title: errores === 0 ? "¡Diplomas enviados!" : "Envío con errores",
        html: `
          <div style="text-align:left;font-size:14px;line-height:2;">
            <p>✅ Enviados correctamente: <strong>${enviados}</strong></p>
            ${errores > 0 ? `<p>❌ Errores: <strong>${errores}</strong></p>` : ""}
          </div>`,
        confirmButtonText: "Entendido",
        background: isDark() ? "#1f2937" : "#fff",
        color: isDark() ? "#f9fafb" : "#111827",
        customClass: { popup: "rounded-2xl" },
      });
    } catch (e) {
      Swal.fire(
        "Error",
        e.response?.data?.message || "No se pudieron enviar los diplomas",
        "error",
      );
    } finally {
      setSendingAll(false);
    }
  };

  const filtered = (data?.estudiantes ?? []).filter((e) =>
    `${e.nombres} ${e.apellidos} ${e.correo}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white shadow-xl mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
        >
          <FaArrowLeft /> Volver a cursos
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <FaEnvelope className="text-2xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                {data?.curso?.titulo ?? curso.titulo}
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {loading
                  ? "Cargando..."
                  : `${data?.estudiantes?.length ?? 0} estudiante${data?.estudiantes?.length !== 1 ? "s" : ""} inscritos`}
              </p>
            </div>
          </div>

          {/* Botón enviar a todos */}
          {!loading && (data?.estudiantes?.length ?? 0) > 0 && (
            <button
              onClick={enviarTodos}
              disabled={sendingAll}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 flex-shrink-0
                ${
                  sendingAll
                    ? "bg-white/20 cursor-not-allowed opacity-70"
                    : "bg-white text-blue-700 hover:bg-blue-50 active:scale-[0.97]"
                }`}
            >
              {sendingAll ? (
                <>
                  <FaSpinner className="animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Enviar a todos
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-5 max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Lista de estudiantes */}
      {loading ? (
        <div className="flex justify-center items-center py-24 gap-3 text-gray-500">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          <span>Cargando estudiantes...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FaUsers className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay estudiantes inscritos</p>
          <p className="text-sm mt-1">
            Este curso aún no tiene estudiantes registrados
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Cabecera tabla */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <span className="hidden sm:block">#</span>
            <span>Estudiante</span>
            <span className="hidden sm:block">Correo</span>
            <span className="text-right">Diploma</span>
          </div>

          {/* Filas */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filtered.map((est, idx) => {
              const isSent = sent.has(est.estudianteId);
              const isSending = sending[est.estudianteId];

              return (
                <div
                  key={est.estudianteId}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors"
                >
                  {/* Número */}
                  <span className="hidden sm:flex w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* Nombre */}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {est.nombres} {est.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden truncate">
                      {est.correo}
                    </p>
                    {est.cedula && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        CI: {est.cedula}
                      </p>
                    )}
                  </div>

                  {/* Correo (desktop) */}
                  <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 truncate">
                    {est.correo}
                  </p>

                  {/* Botón */}
                  <div className="flex justify-end">
                    {isSent ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                        <FaCheckCircle /> Enviado
                      </span>
                    ) : (
                      <button
                        onClick={() => enviarUno(est)}
                        disabled={isSending || sendingAll}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                          ${
                            isSending || sendingAll
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95"
                          }`}
                      >
                        {isSending ? (
                          <>
                            <FaSpinner className="animate-spin" /> Enviando
                          </>
                        ) : (
                          <>
                            <FaPaperPlane /> Enviar diploma
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer con stats */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {filtered.length} estudiante{filtered.length !== 1 ? "s" : ""}
            </span>
            {sent.size > 0 && (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                <FaCheckCircle /> {sent.size} diploma
                {sent.size !== 1 ? "s" : ""} enviado{sent.size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function GestionDiplomas() {
  const [selectedCurso, setSelectedCurso] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 transition-colors duration-200">
      {selectedCurso ? (
        <EstudiantesDiploma
          curso={selectedCurso}
          onBack={() => setSelectedCurso(null)}
        />
      ) : (
        <CursosList onSelect={setSelectedCurso} />
      )}
    </div>
  );
}
