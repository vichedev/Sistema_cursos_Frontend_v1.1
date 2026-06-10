// src/components/admin/CursoRecursos.jsx
// Panel de material didáctico de un curso: enlaces externos (MEGA, Drive, etc.),
// que el admin asocia al curso y decide cuándo y a quién enviarlos.
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../utils/axiosInstance";
import { swSuccess, swError, swConfirm } from "../../utils/swalConfig";
import {
  FaLink,
  FaTrash,
  FaPaperPlane,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaSearch,
  FaCheck,
  FaUsers,
  FaExternalLinkAlt,
  FaCloud,
} from "react-icons/fa";

// Detecta el proveedor del enlace para mostrar un nombre amigable.
const linkProvider = (url = "") => {
  const u = url.toLowerCase();
  if (u.includes("mega.nz") || u.includes("mega.io")) return "MEGA";
  if (u.includes("drive.google") || u.includes("docs.google")) return "Google Drive";
  if (u.includes("dropbox")) return "Dropbox";
  if (u.includes("onedrive") || u.includes("1drv.ms")) return "OneDrive";
  if (u.includes("we.tl") || u.includes("wetransfer")) return "WeTransfer";
  return "Enlace";
};

export default function CursoRecursos({ cursoId, compact = false }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [showSend, setShowSend] = useState(false);

  const load = useCallback(async () => {
    if (!cursoId) return;
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get(`/api/courses/${cursoId}/resources`);
      setResources(data.data || []);
    } catch (err) {
      // Aviso en línea (no un modal bloqueante)
      setLoadError(
        err.response?.status === 404
          ? "El módulo de materiales no está disponible. Reinicia el servidor backend para activarlo."
          : err.response?.data?.message || "No se pudieron cargar los materiales.",
      );
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    load();
  }, [load]);

  const addLink = async (e) => {
    e?.preventDefault?.();
    const u = url.trim();
    if (!u) return swError("Escribe el enlace del material");
    if (!/^https?:\/\/.+/i.test(u)) return swError("El enlace debe empezar con http:// o https://");
    setAdding(true);
    try {
      const { data } = await api.post(`/api/courses/${cursoId}/resources`, {
        titulo: titulo.trim(),
        url: u,
      });
      setResources((prev) => [data.data, ...prev]);
      setTitulo("");
      setUrl("");
      swSuccess("Enlace agregado");
    } catch (err) {
      swError("Error al agregar", err.response?.data?.message || err.message);
    } finally {
      setAdding(false);
    }
  };

  const removeResource = async (r) => {
    const res = await swConfirm({
      title: "¿Eliminar material?",
      html: `Se eliminará <b>${r.titulo}</b>.`,
      confirmText: "Sí, eliminar",
      icon: "warning",
    });
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/api/courses/${cursoId}/resources/${r.id}`);
      setResources((prev) => prev.filter((x) => x.id !== r.id));
      swSuccess("Material eliminado");
    } catch (err) {
      swError("Error", err.response?.data?.message || err.message);
    }
  };

  return (
    <div className={compact ? "" : "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 md:p-6"}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FaCloud className="text-orange-500" /> Material didáctico
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Asocia enlaces (MEGA, Drive, etc.). Tú decides cuándo y a quién enviarlos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSend(true)}
          disabled={resources.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50"
        >
          <FaPaperPlane size={13} /> Enviar a alumnos
        </button>
      </div>

      {/* Formulario para agregar enlace */}
      <form onSubmit={addLink} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nombre del material (opcional)"
          className="sm:w-52 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
        />
        <div className="relative flex-1">
          <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://mega.nz/..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm disabled:opacity-60 whitespace-nowrap"
        >
          {adding ? <FaSpinner className="animate-spin" /> : <FaPlus size={12} />} Agregar
        </button>
      </form>

      <div className="text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-start gap-1.5">
        💡 Sube los archivos a tu nube (MEGA, Drive…), copia el enlace y pégalo aquí. Al enviarlo, al
        estudiante se le indicará que el enlace estará disponible por <b className="text-amber-600 dark:text-amber-400">7 días</b>.
      </div>

      {loadError ? (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-amber-800 dark:text-amber-300">⚠️ {loadError}</p>
          <button
            type="button"
            onClick={load}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400">
          <FaSpinner className="animate-spin mr-2" /> Cargando materiales...
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FaCloud className="mx-auto text-3xl mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Aún no hay enlaces. Agrega el primero arriba.</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg text-orange-500 bg-orange-50 dark:bg-orange-900/20">
                <FaCloud />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate" title={r.titulo}>
                  {r.titulo}
                </p>
                <p className="text-xs text-gray-400 truncate">{linkProvider(r.url)} · {r.url}</p>
              </div>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                title="Abrir enlace"
              >
                <FaExternalLinkAlt size={12} />
              </a>
              <button
                type="button"
                onClick={() => removeResource(r)}
                className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title="Eliminar"
              >
                <FaTrash size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showSend && (
        <EnviarMaterialModal cursoId={cursoId} resources={resources} onClose={() => setShowSend(false)} />
      )}
    </div>
  );
}

// ─── Modal: enviar material a estudiantes inscritos ──────────────────────────
function EnviarMaterialModal({ cursoId, resources, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selRes, setSelRes] = useState(() => new Set(resources.map((r) => r.id)));
  const [selStu, setSelStu] = useState(() => new Set()); // vacío = todos
  const [sending, setSending] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null); // progreso en vivo

  useEffect(() => {
    api
      .get(`/api/courses/${cursoId}/estudiantes`)
      .then((r) => setStudents(Array.isArray(r.data) ? r.data : []))
      .catch(() => swError("No se pudieron cargar los inscritos"))
      .finally(() => setLoading(false));
  }, [cursoId]);

  // Polling del progreso del envío (anti-baneo)
  useEffect(() => {
    if (!jobId) return;
    let stop = false;
    const tick = async () => {
      try {
        const { data } = await api.get(`/api/courses/${cursoId}/resources/send-status/${jobId}`);
        if (data.found && !stop) {
          setJob((prev) => ({ ...prev, ...data }));
          if (data.estado === "COMPLETADO") stop = true;
        }
      } catch {
        /* reintenta en el próximo tick */
      }
    };
    tick();
    const iv = setInterval(() => {
      if (stop) {
        clearInterval(iv);
        return;
      }
      tick();
    }, 1500);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [jobId, cursoId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => `${s.nombres} ${s.apellidos}`.toLowerCase().includes(q));
  }, [students, search]);

  const toggle = (set, setter, id) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const enviarATodos = selStu.size === 0;

  const submit = async () => {
    if (selRes.size === 0) return swError("Selecciona al menos un material");
    setSending(true);
    try {
      const body = {
        resourceIds: [...selRes],
        studentIds: enviarATodos ? "all" : [...selStu],
      };
      const { data } = await api.post(`/api/courses/${cursoId}/resources/send`, body);
      // Cambia a la vista de progreso en vivo
      setJob({
        total: data.total,
        enviados: 0,
        fallidos: 0,
        estado: "ENVIANDO",
        plan: data.plan,
        recursos: data.recursos,
      });
      setJobId(data.jobId);
    } catch (err) {
      swError("Error al enviar", err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FaPaperPlane className="text-blue-500" /> Enviar material
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={18} />
          </button>
        </div>

        {job ? (
          <EnvioProgreso job={job} onClose={onClose} />
        ) : (
        <>
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Materiales */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Enlaces a enviar ({selRes.size}/{resources.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {resources.map((r) => {
                const active = selRes.has(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggle(selRes, setSelRes, r.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      active
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {active ? <FaCheck size={10} /> : <FaCloud size={10} />} {r.titulo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destinatarios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Destinatarios{" "}
                <span className="text-gray-400 font-normal">
                  {enviarATodos ? `(todos: ${students.length})` : `(${selStu.size} elegidos)`}
                </span>
              </p>
              {selStu.size > 0 && (
                <button onClick={() => setSelStu(new Set())} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Enviar a todos
                </button>
              )}
            </div>

            <div className="relative mb-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar estudiante..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-56 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <FaSpinner className="animate-spin mr-2" /> Cargando inscritos...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400 flex flex-col items-center gap-2">
                  <FaUsers className="text-2xl opacity-50" />
                  No hay estudiantes inscritos en este curso.
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">Sin coincidencias.</div>
              ) : (
                filtered.map((s) => {
                  const active = selStu.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(selStu, setSelStu, s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${
                        active ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${active ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 dark:border-gray-500"}`}>
                        {active && <FaCheck size={10} />}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                        {s.nombres} {s.apellidos}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Si no eliges a nadie, el material se enviará a <b>todos los inscritos</b>. El correo indica que los
              enlaces estarán disponibles por <b>7 días</b>.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={sending || selRes.size === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60"
          >
            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={13} />} Enviar por correo
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

// ─── Vista de progreso en vivo del envío (anti-baneo) ────────────────────────
function EnvioProgreso({ job, onClose }) {
  const total = job.total || 0;
  const enviados = job.enviados || 0;
  const fallidos = job.fallidos || 0;
  const procesados = enviados + fallidos;
  const pct = total ? Math.round((procesados / total) * 100) : 0;
  const pendientes = Math.max(0, total - procesados);
  const completado = job.estado === "COMPLETADO";
  const plan = job.plan || {};

  const fmtSeg = (s) => {
    s = Number(s);
    if (!Number.isFinite(s) || s <= 0) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m}m ${r}s` : `${m}m`;
  };

  return (
    <>
      <div className="p-6 space-y-5 overflow-y-auto">
        {/* Estado */}
        <div className="flex items-center justify-center">
          {completado ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <FaCheck /> Envío completado
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <FaSpinner className="animate-spin" /> Enviando…
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">
              {procesados} de {total} procesados
            </span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${completado ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{enviados}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enviados</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendientes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">En cola</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{fallidos}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fallidos</p>
          </div>
        </div>

        {/* Info anti-baneo */}
        <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
          🛡️ <b>Envío anti-baneo:</b> 1 correo cada <b>{fmtSeg(plan.delaySeg)}</b>, en lotes de{" "}
          <b>{plan.batchSize}</b> con pausa de <b>{fmtSeg(plan.batchPauseSeg)}</b>.
          {!completado && (
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tiempo estimado total: ~{fmtSeg(plan.etaSeg)}. Puedes cerrar esta ventana; el envío continúa en segundo plano.
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onClose}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm text-white ${
            completado ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
          }`}
        >
          {completado ? "Finalizar" : "Cerrar (sigue en segundo plano)"}
        </button>
      </div>
    </>
  );
}
