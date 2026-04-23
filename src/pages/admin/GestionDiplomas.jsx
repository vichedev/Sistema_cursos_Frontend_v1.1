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
  FaAward,
  FaChartBar,
  FaClock,
} from "react-icons/fa";

const isDark = () => document.documentElement.classList.contains("dark");

const TIPO_LABEL = {
  ONLINE_GRATIS: { label: "Online Gratis", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  ONLINE_PAGADO: { label: "Online Pagado", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  PRESENCIAL_GRATIS: { label: "Presencial Gratis", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  PRESENCIAL_PAGADO: { label: "Presencial Pagado", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
};

function Badge({ tipo }) {
  const t = TIPO_LABEL[tipo] || { label: tipo, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${t.color}`}>
      {t.label}
    </span>
  );
}

function DiplomaProgress({ sent, total }) {
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
  const all = sent === total && total > 0;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`font-medium ${all ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
          {all ? "✅ Todos enviados" : `${sent} de ${total} diplomas enviados`}
        </span>
        <span className={`font-bold ${all ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${all ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Vista: lista de cursos ───────────────────────────────────────────────────
function CursosList({ onSelect }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(`/api/diplomas/cursos`)
      .then((r) => setCursos(r.data))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los cursos", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cursos.filter(
    (c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (c.profesor && `${c.profesor.nombres} ${c.profesor.apellidos}`.toLowerCase().includes(search.toLowerCase())),
  );

  const totalEstudiantes = cursos.reduce((s, c) => s + (c.totalEstudiantes ?? 0), 0);
  const totalDiplomas = cursos.reduce((s, c) => s + (c.diplomasEnviados ?? 0), 0);
  const cursosCompletos = cursos.filter((c) => c.totalEstudiantes > 0 && c.diplomasEnviados === c.totalEstudiantes).length;

  return (
    <div>
      {/* Hero header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FaGraduationCap className="text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Diplomas</h1>
            <p className="text-blue-100 text-sm mt-0.5">Emite y envía diplomas a los estudiantes</p>
          </div>
        </div>

        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <p className="text-2xl font-bold">{cursos.length}</p>
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5"><FaChalkboardTeacher /> Cursos activos</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <p className="text-2xl font-bold">{totalEstudiantes}</p>
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5"><FaUsers /> Estudiantes</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <p className="text-2xl font-bold">{totalDiplomas}</p>
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5"><FaAward /> Diplomas emitidos</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <p className="text-2xl font-bold">{cursosCompletos}</p>
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5"><FaCheckCircle /> Cursos completos</p>
            </div>
          </div>
        )}
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
          {filtered.map((curso) => {
            const allSent = curso.totalEstudiantes > 0 && curso.diplomasEnviados === curso.totalEstudiantes;
            return (
              <button
                key={curso.id}
                onClick={() => onSelect(curso)}
                className={`text-left bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 group active:scale-[0.98] overflow-hidden
                  ${allSent
                    ? "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg hover:shadow-green-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
                  }`}
              >
                {/* Course image */}
                <div className="w-full h-32 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center relative">
                  {curso.imagen ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`}
                      alt={curso.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <FaGraduationCap className="text-white/40 text-5xl" />
                  )}
                  {/* Completion badge */}
                  {allSent && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <FaCheckCircle className="text-[8px]" /> Completo
                    </div>
                  )}
                  {/* Diplomas sent badge */}
                  {(curso.diplomasEnviados ?? 0) > 0 && !allSent && (
                    <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <FaAward className="text-[8px]" /> {curso.diplomasEnviados} enviados
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold text-sm leading-tight line-clamp-2 transition-colors
                      ${allSent
                        ? "text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400"
                        : "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      }`}>
                      {curso.titulo}
                    </h3>
                    <Badge tipo={curso.tipo} />
                  </div>

                  {curso.profesor && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                      <FaChalkboardTeacher className="flex-shrink-0" />
                      {curso.profesor.nombres} {curso.profesor.apellidos}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <FaUsers />
                      <span>{curso.totalEstudiantes} estudiante{curso.totalEstudiantes !== 1 ? "s" : ""}</span>
                    </div>
                    {curso.fecha && (
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt />
                        <span>{new Date(curso.fecha).toLocaleDateString("es-ES")}</span>
                      </div>
                    )}
                  </div>

                  <DiplomaProgress sent={curso.diplomasEnviados ?? 0} total={curso.totalEstudiantes ?? 0} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Vista: estudiantes del curso ─────────────────────────────────────────────
function EstudiantesDiploma({ curso, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});
  const [sendingAll, setSendingAll] = useState(false);
  const [sent, setSent] = useState(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | sent | pending

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/api/diplomas/cursos/${curso.id}/estudiantes`)
      .then((r) => {
        setData(r.data);
        const yaEnviados = new Set(
          (r.data.estudiantes || []).filter((e) => e.diplomaEnviado).map((e) => e.estudianteId),
        );
        setSent(yaEnviados);
      })
      .catch(() => Swal.fire("Error", "No se pudieron cargar los estudiantes", "error"))
      .finally(() => setLoading(false));
  }, [curso.id]);

  useEffect(() => { load(); }, [load]);

  const enviarUno = async (estudiante) => {
    setSending((p) => ({ ...p, [estudiante.estudianteId]: true }));
    try {
      await api.post(`/api/diplomas/enviar/${curso.id}/${estudiante.estudianteId}`, {});
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
      Swal.fire("Error", e.response?.data?.message || "No se pudo enviar el diploma", "error");
    } finally {
      setSending((p) => ({ ...p, [estudiante.estudianteId]: false }));
    }
  };

  const enviarTodos = async () => {
    const pendientes = (data?.estudiantes ?? []).filter((e) => !sent.has(e.estudianteId));
    const total = data?.estudiantes?.length ?? 0;
    const confirm = await Swal.fire({
      title: "¿Enviar diplomas a todos?",
      html: `Se enviará un diploma a <strong>${total} estudiante${total !== 1 ? "s" : ""}</strong> del curso<br/><em>«${data?.curso?.titulo}»</em><br/><br/><small style="color:#888">${pendientes.length} pendiente${pendientes.length !== 1 ? "s" : ""} de envío</small>`,
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
      Swal.fire("Error", e.response?.data?.message || "No se pudieron enviar los diplomas", "error");
    } finally {
      setSendingAll(false);
    }
  };

  const allStudents = data?.estudiantes ?? [];
  const sentCount = sent.size;
  const totalCount = allStudents.length;
  const pendingCount = totalCount - sentCount;
  const pct = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  const afterSearch = allStudents.filter((e) =>
    `${e.nombres} ${e.apellidos} ${e.correo}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filtered = afterSearch.filter((e) => {
    if (filter === "sent") return sent.has(e.estudianteId);
    if (filter === "pending") return !sent.has(e.estudianteId);
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
        >
          <FaArrowLeft /> Volver a cursos
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0 mt-0.5">
              <FaEnvelope className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{data?.curso?.titulo ?? curso.titulo}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-blue-200">
                {data?.curso?.profesor && (
                  <span className="flex items-center gap-1.5">
                    <FaChalkboardTeacher className="text-xs" />
                    {data.curso.profesor.nombres} {data.curso.profesor.apellidos}
                  </span>
                )}
                {data?.curso?.fecha && (
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-xs" />
                    {new Date(data.curso.fecha).toLocaleDateString("es-ES")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!loading && totalCount > 0 && (
            <button
              onClick={enviarTodos}
              disabled={sendingAll}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 flex-shrink-0
                ${sendingAll ? "bg-white/20 cursor-not-allowed opacity-70" : "bg-white text-blue-700 hover:bg-blue-50 active:scale-[0.97]"}`}
            >
              {sendingAll ? <><FaSpinner className="animate-spin" /> Enviando...</> : <><FaPaperPlane /> Enviar a todos</>}
            </button>
          )}
        </div>

        {/* Progress */}
        {!loading && totalCount > 0 && (
          <div className="bg-white/10 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-xs text-blue-200">Estudiantes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">{sentCount}</p>
                <p className="text-xs text-blue-200">Diplomas enviados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-300">{pendingCount}</p>
                <p className="text-xs text-blue-200">Pendientes</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-green-400" : "bg-amber-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-center text-blue-200 mt-1.5">{pct}% completado</p>
          </div>
        )}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800 text-sm flex-shrink-0">
          {[["all", "Todos", totalCount], ["sent", "Enviados", sentCount], ["pending", "Pendientes", pendingCount]].map(([val, label, count]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-2 font-medium transition-colors border-r last:border-r-0 border-gray-200 dark:border-gray-600
                ${filter === val
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              {label} <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center items-center py-24 gap-3 text-gray-500">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          <span>Cargando estudiantes...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FaUsers className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay estudiantes{filter !== "all" ? " en este filtro" : " inscritos"}</p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="text-sm text-blue-500 hover:underline mt-2">Ver todos</button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <span className="hidden sm:block">#</span>
            <span>Estudiante</span>
            <span className="hidden sm:block">Correo</span>
            <span className="text-right">Diploma</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filtered.map((est, idx) => {
              const isSent = sent.has(est.estudianteId);
              const isSending = sending[est.estudianteId];

              return (
                <div
                  key={est.estudianteId}
                  className={`grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-4 items-center transition-colors
                    ${isSent ? "bg-green-50/40 dark:bg-green-900/5 hover:bg-green-50/70 dark:hover:bg-green-900/10" : "hover:bg-gray-50/60 dark:hover:bg-gray-700/30"}`}
                >
                  <span className="hidden sm:flex w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {est.nombres} {est.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden truncate">{est.correo}</p>
                    {est.cedula && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">CI: {est.cedula}</p>
                    )}
                  </div>

                  <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 truncate">{est.correo}</p>

                  <div className="flex justify-end items-center gap-2">
                    {isSent ? (
                      <>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                          <FaCheckCircle /> Enviado
                        </span>
                        <button
                          onClick={() => enviarUno(est)}
                          disabled={isSending || sendingAll}
                          title="Reenviar diploma"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                            ${isSending || sendingAll
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
                            }`}
                        >
                          {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                          Reenviar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => enviarUno(est)}
                        disabled={isSending || sendingAll}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                          ${isSending || sendingAll
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95"
                          }`}
                      >
                        {isSending ? <><FaSpinner className="animate-spin" /> Enviando</> : <><FaPaperPlane /> Enviar diploma</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer stats */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{filtered.length} estudiante{filtered.length !== 1 ? "s" : ""}</span>
            {sentCount > 0 && (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                <FaCheckCircle /> {sentCount} diploma{sentCount !== 1 ? "s" : ""} enviado{sentCount !== 1 ? "s" : ""}
                {sentCount === totalCount && <span className="text-green-500"> ✓ Todos</span>}
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
        <EstudiantesDiploma curso={selectedCurso} onBack={() => setSelectedCurso(null)} />
      ) : (
        <CursosList onSelect={setSelectedCurso} />
      )}
    </div>
  );
}
