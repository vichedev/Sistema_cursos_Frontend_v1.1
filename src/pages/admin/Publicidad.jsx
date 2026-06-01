// src/pages/admin/Publicidad.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../../utils/axiosInstance";
import { swSuccess, swError, swConfirm } from "../../utils/swalConfig";
import { compressImages } from "../../utils/compressImage";
import {
  FaBullhorn,
  FaPlus,
  FaImage,
  FaPaperPlane,
  FaSpinner,
  FaTimes,
  FaSearch,
  FaCheck,
  FaUsers,
  FaBold,
  FaItalic,
  FaListUl,
  FaEnvelope,
  FaWhatsapp,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

// ── Formateadores cliente (espejo del backend) para la vista previa ──
const fmtInlineHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#ff6b35">$1</a>');

function fmtToHtml(text) {
  const lines = (text || "").split("\n");
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("- ") || line.startsWith("• ")) {
      if (!inList) {
        html += '<ul style="margin:8px 0;padding-left:20px">';
        inList = true;
      }
      html += `<li style="margin:4px 0">${fmtInlineHtml(line.replace(/^[-•]\s+/, ""))}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (line === "") html += '<div style="height:8px"></div>';
      else html += `<p style="margin:8px 0;line-height:1.55">${fmtInlineHtml(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

const ESTADO_META = {
  BORRADOR: { label: "Borrador", cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  PROGRAMADA: { label: "Programada", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  ENVIANDO: { label: "Enviando", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  PAUSADA: { label: "Pausada", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  COMPLETADA: { label: "Completada", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  CANCELADA: { label: "Cancelada", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
  FALLIDA: { label: "Fallida", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

const inputCls =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition";

export default function Publicidad() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // campaña en edición
  const [detailId, setDetailId] = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/campaigns");
      setCampaigns(data.data || []);
    } catch {
      swError("No se pudieron cargar las campañas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const action = async (id, verb, label) => {
    try {
      await api.post(`/api/campaigns/${id}/${verb}`);
      swSuccess(label);
      load();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    }
  };

  const remove = async (id) => {
    const r = await swConfirm({ title: "¿Eliminar campaña?", confirmText: "Sí, eliminar", icon: "warning" });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/api/campaigns/${id}`);
      swSuccess("Campaña eliminada");
      load();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
              <FaBullhorn />
            </span>
            Publicidad y Campañas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Promociona tus cursos por correo y WhatsApp, con envío por lotes para evitar baneos.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm transition"
        >
          <FaPlus size={13} /> Nueva campaña
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <FaSpinner className="animate-spin mr-2" /> Cargando...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FaBullhorn className="mx-auto text-4xl mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aún no hay campañas. Crea la primera.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              c={c}
              onAction={action}
              onRemove={remove}
              onDetail={() => setDetailId(c.id)}
              onEdit={() => setEditing(c)}
            />
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <CampaignForm
          editing={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCreated={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
        />
      )}

      {detailId && <CampaignDetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function CampaignCard({ c, onAction, onRemove, onDetail, onEdit }) {
  const editable = ["BORRADOR", "PROGRAMADA", "CANCELADA", "FALLIDA"].includes(c.estado);
  const meta = ESTADO_META[c.estado] || ESTADO_META.BORRADOR;
  const channels = (c.canalEmail ? 1 : 0) + (c.canalWhatsapp ? 1 : 0);
  const expected = Math.max(1, c.total * channels);
  const done = c.enviadosEmail + c.enviadosWhatsapp;
  const pct = Math.min(100, Math.round((done / expected) * 100));
  const showProgress = c.estado === "ENVIANDO" || c.estado === "COMPLETADA" || c.estado === "PAUSADA" || done > 0;

  const canales = [c.canalEmail && "Correo", c.canalWhatsapp && "WhatsApp"].filter(Boolean).join(" · ");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base truncate">{c.nombre}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            {canales} · {c.total} destinatario{c.total === 1 ? "" : "s"}
            {c.imagenes?.length > 0 && ` · ${c.imagenes.length} imagen${c.imagenes.length === 1 ? "" : "es"}`}
            {c.programadaPara && ` · programada ${new Date(c.programadaPara).toLocaleString()}`}
          </p>
        </div>
      </div>

      {showProgress && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5 text-gray-500 dark:text-gray-400">
            <span>
              Correo: <b className="text-gray-700 dark:text-gray-200">{c.enviadosEmail}</b> · WhatsApp:{" "}
              <b className="text-gray-700 dark:text-gray-200">{c.enviadosWhatsapp}</b>
              {c.fallidos > 0 && <span className="text-red-500"> · Fallidos: {c.fallidos}</span>}
            </span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${c.estado === "ENVIANDO" ? "bg-blue-500" : "bg-green-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <Btn tone="soft" onClick={onDetail}>Ver detalles</Btn>
        {editable && (
          <Btn tone="soft" onClick={onEdit}>Editar</Btn>
        )}
        {(c.estado === "BORRADOR" || c.estado === "FALLIDA" || c.estado === "CANCELADA") && (
          <Btn tone="primary" onClick={() => onAction(c.id, "send", "Envío iniciado")}>Enviar ahora</Btn>
        )}
        {c.estado === "PROGRAMADA" && (
          <Btn tone="primary" onClick={() => onAction(c.id, "send", "Envío iniciado")}>Enviar ya</Btn>
        )}
        {c.estado === "ENVIANDO" && (
          <>
            <Btn tone="warning" onClick={() => onAction(c.id, "pause", "Pausada")}>Pausar</Btn>
            <Btn tone="danger" onClick={() => onAction(c.id, "cancel", "Cancelada")}>Cancelar</Btn>
          </>
        )}
        {c.estado === "PAUSADA" && (
          <>
            <Btn tone="primary" onClick={() => onAction(c.id, "resume", "Reanudada")}>Reanudar</Btn>
            <Btn tone="danger" onClick={() => onAction(c.id, "cancel", "Cancelada")}>Cancelar</Btn>
          </>
        )}
        {c.estado !== "ENVIANDO" && (
          <Btn tone="ghost" onClick={() => onRemove(c.id)}>Eliminar</Btn>
        )}
      </div>
    </div>
  );
}

function Btn({ tone, onClick, children }) {
  const map = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
    soft: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
    ghost: "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
  };
  return (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${map[tone]}`}>
      {children}
    </button>
  );
}

// Convierte una fecha ISO a valor de <input type="datetime-local"> en hora local
const toLocalDatetime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

// ─── Formulario de creación / edición ────────────────────────────────────────
function CampaignForm({ editing, onClose, onCreated }) {
  const isEdit = Boolean(editing);
  const [form, setForm] = useState(() => ({
    nombre: editing?.nombre || "",
    asunto: editing?.asunto || "",
    titulo: editing?.titulo || "",
    mensaje: editing?.mensaje || "",
    canalEmail: editing ? !!editing.canalEmail : true,
    canalWhatsapp: editing ? !!editing.canalWhatsapp : false,
    segmento: editing?.segmento || "TODOS",
    cursoId: editing?.cursoId ? String(editing.cursoId) : "",
    programadaPara: toLocalDatetime(editing?.programadaPara),
  }));
  // Ajustes anti-baneo: las pausas se manejan en SEGUNDOS (más claro para el admin)
  const [adv, setAdv] = useState(() => ({
    batchSize: editing?.batchSize ? String(editing.batchSize) : "",
    delaySec: editing?.delayMs ? String(Math.round(editing.delayMs / 1000)) : "",
    batchPauseSec: editing?.batchPauseMs ? String(Math.round(editing.batchPauseMs / 1000)) : "",
  }));
  const [showAdv, setShowAdv] = useState(false);
  const [images, setImages] = useState([]); // imágenes nuevas {file,url}
  const [existingImages, setExistingImages] = useState(() => editing?.imagenes || []); // nombres ya subidos
  const [cursos, setCursos] = useState([]);
  const [defaults, setDefaults] = useState(null);
  const [seleccionados, setSeleccionados] = useState(() =>
    editing?.segmento === "MANUAL" && Array.isArray(editing?.destinatariosManual)
      ? editing.destinatariosManual.map((d, i) => ({ id: `m${i}`, nombre: d.nombre, correo: d.correo, celular: d.celular }))
      : [],
  );
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Audiencia calculada en vivo por el backend {total, conCorreo, conWhatsapp, plan}
  const [audience, setAudience] = useState(null);
  const [audLoading, setAudLoading] = useState(false);

  useEffect(() => {
    api.get("/api/courses/all").then((r) => setCursos(r.data || [])).catch(() => {});
    api.get("/api/settings").then((r) => setDefaults(r.data?.data || {})).catch(() => {});
  }, []);

  // Recalcula la audiencia (y el plan de envío) cuando cambian segmento/canales/curso.
  useEffect(() => {
    if (!form.canalEmail && !form.canalWhatsapp) {
      setAudience(null);
      return;
    }
    if (form.segmento === "CURSO" && !form.cursoId) {
      setAudience(null);
      return;
    }
    if (form.segmento === "MANUAL" && seleccionados.length === 0) {
      setAudience({ total: 0, conCorreo: 0, conWhatsapp: 0, plan: null });
      return;
    }
    let cancelled = false;
    setAudLoading(true);
    const t = setTimeout(async () => {
      try {
        const params = {
          segmento: form.segmento,
          canalEmail: form.canalEmail,
          canalWhatsapp: form.canalWhatsapp,
        };
        if (form.segmento === "CURSO") params.cursoId = form.cursoId;
        if (form.segmento === "MANUAL") {
          params.destinatariosManual = JSON.stringify(
            seleccionados.map((s) => ({ nombre: s.nombre, correo: s.correo, celular: s.celular })),
          );
        }
        const { data } = await api.get("/api/campaigns/audience", { params });
        if (!cancelled) setAudience(data.data);
      } catch {
        if (!cancelled) setAudience(null);
      } finally {
        if (!cancelled) setAudLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [form.segmento, form.cursoId, form.canalEmail, form.canalWhatsapp, seleccionados]);

  // Valores por defecto efectivos según el canal (WhatsApp suele ir más lento)
  const eff = useMemo(() => {
    const d = defaults || {};
    const wa = form.canalWhatsapp;
    const num = (v, fb) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : fb;
    };
    return {
      batchSize: wa ? num(d.wa_batch_size, 15) : num(d.mail_batch_size, 20),
      delaySec: wa ? Math.round(num(d.wa_delay_min_ms, 4000) / 1000) : Math.round(num(d.mail_delay_ms, 4000) / 1000),
      batchPauseSec: wa ? Math.round(num(d.wa_batch_pause_ms, 120000) / 1000) : Math.round(num(d.mail_batch_pause_ms, 60000) / 1000),
    };
  }, [defaults, form.canalWhatsapp]);

  // Formatea segundos a texto legible (ej: 120 -> "2 min")
  const fmtSeg = (s) => {
    s = Number(s);
    if (!Number.isFinite(s)) return "—";
    if (s < 60) return `${s} s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m} min ${r} s` : `${m} min`;
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onFiles = async (e) => {
    const picked = Array.from(e.target.files || []).slice(0, 5);
    // Comprime/redimensiona en el navegador antes de subir (menos peso, más rápido).
    const files = await compressImages(picked, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 });
    setImages(files.map((f) => ({ file: f, url: URL.createObjectURL(f) })));
  };

  // Imágenes mostradas en la vista previa (existentes + nuevas).
  const previewImages = useMemo(
    () => [
      ...existingImages.map((f) => ({ url: `${BACKEND_URL}/uploads/${f}` })),
      ...images.map((im) => ({ url: im.url })),
    ],
    [existingImages, images],
  );

  // Plan de envío efectivo: parte del cálculo automático del backend y aplica
  // los ajustes manuales si el admin los puso. Decide cuántos lotes y el tiempo.
  const displayPlan = useMemo(() => {
    const total = audience?.total ?? 0;
    const auto = audience?.plan;
    const batchSize = Number(adv.batchSize) || auto?.batchSize || eff.batchSize;
    const delaySec = Number(adv.delaySec) || (auto ? Math.round(auto.delayMs / 1000) : eff.delaySec);
    const batchPauseSec = Number(adv.batchPauseSec) || (auto ? Math.round(auto.batchPauseMs / 1000) : eff.batchPauseSec);
    const totalBatches = total > 0 ? Math.ceil(total / batchSize) : 0;
    const etaSec = total > 0 ? total * delaySec + Math.max(0, totalBatches - 1) * batchPauseSec : 0;
    return { total, batchSize, delaySec, batchPauseSec, totalBatches, etaSec };
  }, [audience, adv, eff]);

  const submit = async (modo) => {
    if (!form.nombre.trim()) return swError("Falta el nombre de la campaña");
    if (!form.canalEmail && !form.canalWhatsapp) return swError("Selecciona al menos un canal");
    if (!form.mensaje.trim()) return swError("Escribe el mensaje");
    if (form.canalEmail && !form.asunto.trim()) return swError("El correo necesita un asunto");
    if (form.segmento === "CURSO" && !form.cursoId) return swError("Selecciona un curso");
    if (form.segmento === "MANUAL" && seleccionados.length === 0)
      return swError("Selecciona al menos un estudiante");
    if (modo === "programar" && !form.programadaPara) return swError("Elige fecha y hora");

    // Validación de ajustes anti-baneo (evita valores inválidos como negativos)
    if (adv.batchSize !== "" && Number(adv.batchSize) < 1)
      return swError("El tamaño de lote debe ser al menos 1");
    if (adv.delaySec !== "" && Number(adv.delaySec) < 0)
      return swError("La pausa entre mensajes no puede ser negativa");
    if (adv.batchPauseSec !== "" && Number(adv.batchPauseSec) < 0)
      return swError("La pausa entre lotes no puede ser negativa");

    const fd = new FormData();
    fd.append("nombre", form.nombre);
    fd.append("asunto", form.asunto);
    fd.append("titulo", form.titulo);
    fd.append("mensaje", form.mensaje);
    fd.append("canalEmail", String(form.canalEmail));
    fd.append("canalWhatsapp", String(form.canalWhatsapp));
    fd.append("segmento", form.segmento);
    if (form.segmento === "CURSO") fd.append("cursoId", form.cursoId);
    if (form.segmento === "MANUAL") {
      fd.append(
        "destinatariosManual",
        JSON.stringify(seleccionados.map((s) => ({ nombre: s.nombre, correo: s.correo, celular: s.celular }))),
      );
    }
    if (modo === "programar") fd.append("programadaPara", new Date(form.programadaPara).toISOString());
    if (modo === "ahora") fd.append("enviarAhora", "true");
    if (adv.batchSize) fd.append("batchSize", String(Math.round(Number(adv.batchSize))));
    if (adv.delaySec) fd.append("delayMs", String(Math.round(Number(adv.delaySec) * 1000)));
    if (adv.batchPauseSec) fd.append("batchPauseMs", String(Math.round(Number(adv.batchPauseSec) * 1000)));
    images.forEach((im) => fd.append("imagenes", im.file));
    if (isEdit) fd.append("imagenesExistentes", JSON.stringify(existingImages));

    setSubmitting(true);
    try {
      if (isEdit) await api.put(`/api/campaigns/${editing.id}`, fd);
      else await api.post("/api/campaigns", fd);
      swSuccess(
        modo === "ahora"
          ? isEdit ? "Campaña actualizada y enviándose" : "Campaña creada y enviándose"
          : modo === "programar"
            ? "Campaña programada"
            : isEdit ? "Cambios guardados" : "Borrador guardado",
      );
      onCreated();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/50 p-0 md:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 md:rounded-2xl shadow-2xl w-full max-w-6xl md:my-6 flex flex-col" style={{ maxHeight: "94vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
              <FaBullhorn size={15} />
            </span>
            <div>
              <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 leading-tight">{isEdit ? "Editar campaña" : "Nueva campaña"}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Configura a la izquierda · previsualiza a la derecha</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Cuerpo dividido: configuración (izq) · vista previa (der) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* ───── IZQUIERDA · Configuración ───── */}
          <div className="flex-1 md:flex-none md:w-[460px] min-h-0 overflow-y-auto px-6 py-6 space-y-6 md:border-r border-gray-100 dark:border-gray-700">
          {/* Sección: Información */}
          <Section title="Información">
            <Field label="Nombre de la campaña">
              <input className={inputCls} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Lanzamiento curso de Excel" />
            </Field>
            <Field label="Canales de envío">
              <div className="flex gap-3">
                <Chip active={form.canalEmail} onClick={() => set("canalEmail", !form.canalEmail)}>Correo</Chip>
                <Chip active={form.canalWhatsapp} onClick={() => set("canalWhatsapp", !form.canalWhatsapp)}>WhatsApp</Chip>
              </div>
            </Field>
          </Section>

          {/* Sección: Destinatarios */}
          <Section title="Destinatarios">
            <Field label="Enviar a">
              <select className={inputCls} value={form.segmento} onChange={(e) => set("segmento", e.target.value)}>
                <option value="TODOS">Todos los estudiantes</option>
                <option value="CURSO">Estudiantes de un curso</option>
                <option value="MANUAL">Estudiantes específicos (elegir)</option>
              </select>
            </Field>

            {form.segmento === "CURSO" && (
              <Field label="Curso">
                <select className={inputCls} value={form.cursoId} onChange={(e) => set("cursoId", e.target.value)}>
                  <option value="">Selecciona un curso</option>
                  {cursos.map((cu) => (
                    <option key={cu.id} value={cu.id}>{cu.titulo}</option>
                  ))}
                </select>
              </Field>
            )}

            {form.segmento === "MANUAL" && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {seleccionados.length > 0 ? (
                    <span><b className="text-orange-600 dark:text-orange-400">{seleccionados.length}</b> estudiante{seleccionados.length === 1 ? "" : "s"} seleccionado{seleccionados.length === 1 ? "" : "s"}</span>
                  ) : (
                    <span className="text-gray-400">Ningún estudiante seleccionado todavía</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium whitespace-nowrap"
                >
                  <FaUsers size={13} /> {seleccionados.length > 0 ? "Editar selección" : "Seleccionar"}
                </button>
              </div>
            )}

            {/* Audiencia calculada en vivo */}
            <AudienceCard audience={audience} loading={audLoading} channels={{ email: form.canalEmail, whatsapp: form.canalWhatsapp }} />
          </Section>

          {/* Sección: Contenido */}
          <Section title="Contenido">
            {form.canalEmail && (
              <Field label="Asunto del correo">
                <input className={inputCls} value={form.asunto} onChange={(e) => set("asunto", e.target.value)} placeholder="Ej: ¡Nuevo curso disponible!" />
              </Field>
            )}
            <Field label="Título destacado (opcional)">
              <input className={inputCls} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ej: 🎓 Curso de Excel Avanzado" />
            </Field>
            <MessageComposer value={form.mensaje} onChange={(v) => set("mensaje", v)} />
            <Field label="Imágenes (hasta 5)">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-orange-400 w-fit">
                <FaImage size={13} /> {images.length > 0 ? "Reemplazar imágenes" : "Subir imágenes"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
              </label>
              {(existingImages.length > 0 || images.length > 0) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {existingImages.map((f) => (
                    <Thumb key={f} src={`${BACKEND_URL}/uploads/${f}`} onRemove={() => setExistingImages((p) => p.filter((x) => x !== f))} />
                  ))}
                  {images.map((im, i) => (
                    <Thumb key={i} src={im.url} onRemove={() => setImages((p) => p.filter((_, j) => j !== i))} />
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1.5">Las imágenes se comprimen automáticamente antes de subir.</p>
            </Field>
          </Section>

          {/* Sección: Envío */}
          <Section title="Programación y envío">
            <Field label="Programar para (opcional)">
              <input type="datetime-local" className={inputCls} value={form.programadaPara} onChange={(e) => set("programadaPara", e.target.value)} />
            </Field>

            {/* Plan de envío automático (siempre visible) */}
            <PlanCard plan={displayPlan} loading={audLoading} fmtSeg={fmtSeg} manual={adv.batchSize || adv.delaySec || adv.batchPauseSec} />

            <button type="button" onClick={() => setShowAdv((s) => !s)} className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {showAdv ? "▼" : "▶"} Ajustar manualmente la velocidad (opcional)
            </button>
            {showAdv && (
              <div className="mt-2 space-y-4 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Controlan la <b>velocidad de envío</b> para no saturar el servidor de correo / WhatsApp y
                  evitar bloqueos. Si los dejas vacíos, se usan los valores recomendados de la
                  configuración global. <b>A más lento, más seguro.</b>
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <AdvField
                    label="Tamaño de lote"
                    hint="Cuántos mensajes se envían antes de una pausa larga."
                    recommended="Recomendado: 15 – 25"
                    placeholder={`auto (${eff.batchSize})`}
                    min={1}
                    value={adv.batchSize}
                    onChange={(v) => setAdv((p) => ({ ...p, batchSize: v }))}
                  />
                  <AdvField
                    label="Pausa entre mensajes"
                    unit="segundos"
                    hint="Espera entre cada envío individual."
                    recommended="Recomendado: 4 – 8 seg"
                    placeholder={`auto (${eff.delaySec} s)`}
                    min={0}
                    value={adv.delaySec}
                    onChange={(v) => setAdv((p) => ({ ...p, delaySec: v }))}
                  />
                  <AdvField
                    label="Pausa entre lotes"
                    unit="segundos"
                    hint="Descanso al terminar cada lote."
                    recommended="Recomendado: 60 – 180 seg"
                    placeholder={`auto (${eff.batchPauseSec} s)`}
                    min={0}
                    value={adv.batchPauseSec}
                    onChange={(v) => setAdv((p) => ({ ...p, batchPauseSec: v }))}
                  />
                </div>

                {/* Resumen en lenguaje claro */}
                <div className="text-sm text-gray-700 dark:text-gray-200 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg px-3 py-2.5">
                  📋 <b>Resumen:</b> se enviará 1 mensaje cada{" "}
                  <b>{fmtSeg(displayPlan.delaySec)}</b>; tras{" "}
                  <b>{displayPlan.batchSize}</b> mensajes, una pausa de{" "}
                  <b>{fmtSeg(displayPlan.batchPauseSec)}</b>.
                  {displayPlan.total > 0 && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {displayPlan.total} destinatario{displayPlan.total === 1 ? "" : "s"} →{" "}
                      <b>{displayPlan.totalBatches}</b> lote{displayPlan.totalBatches === 1 ? "" : "s"} ≈{" "}
                      <b>{fmtSeg(displayPlan.etaSec)}</b> en completarse.
                    </span>
                  )}
                </div>
              </div>
            )}
          </Section>
          </div>{/* fin columna izquierda */}

          {/* ───── DERECHA · Vista previa en vivo (contenedor de scroll) ───── */}
          <div className="hidden md:block md:flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/60 px-6 py-6">
            <LivePreview
              asunto={form.asunto}
              titulo={form.titulo}
              mensaje={form.mensaje}
              images={previewImages}
              channels={{ email: form.canalEmail, whatsapp: form.canalWhatsapp }}
            />
          </div>
        </div>{/* fin cuerpo dividido */}

        <div className="flex flex-wrap gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 justify-end bg-white dark:bg-gray-800 rounded-b-2xl">
          <button onClick={() => submit("borrador")} disabled={submitting} className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm disabled:opacity-60">
            {isEdit ? "Guardar cambios" : "Guardar borrador"}
          </button>
          <button onClick={() => submit("programar")} disabled={submitting} className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-60">
            Programar
          </button>
          <button onClick={() => submit("ahora")} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm disabled:opacity-60">
            {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={13} />} Enviar ahora
          </button>
        </div>
      </div>

      {showPicker && (
        <StudentPicker
          channels={{ email: form.canalEmail, whatsapp: form.canalWhatsapp }}
          initial={seleccionados}
          onClose={() => setShowPicker(false)}
          onConfirm={(list) => {
            setSeleccionados(list);
            setShowPicker(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Modal: selección inteligente de estudiantes ────────────────────────────
function StudentPicker({ channels, initial, onClose, onConfirm }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fCiudad, setFCiudad] = useState("");
  const [fEmpresa, setFEmpresa] = useState("");
  const [fCurso, setFCurso] = useState("");
  const [selected, setSelected] = useState(() => new Map(initial.map((s) => [s.id, s])));

  useEffect(() => {
    api
      .get("/api/users/usuarios-por-rol")
      .then((r) => setStudents(r.data?.estudiantes || []))
      .catch(() => swError("No se pudieron cargar los estudiantes"))
      .finally(() => setLoading(false));
  }, []);

  // Opciones únicas para los filtros
  const ciudades = useMemo(
    () => [...new Set(students.map((s) => s.ciudad).filter(Boolean))].sort(),
    [students],
  );
  const empresas = useMemo(
    () => [...new Set(students.map((s) => s.empresa).filter(Boolean))].sort(),
    [students],
  );
  const cursos = useMemo(() => {
    const map = new Map();
    students.forEach((s) => (s.cursos || []).forEach((c) => c?.titulo && map.set(c.id, c.titulo)));
    return [...map.entries()].map(([id, titulo]) => ({ id, titulo }));
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (fCiudad && s.ciudad !== fCiudad) return false;
      if (fEmpresa && s.empresa !== fEmpresa) return false;
      if (fCurso && !(s.cursos || []).some((c) => String(c.id) === String(fCurso))) return false;
      if (q) {
        const hay = `${s.nombres} ${s.apellidos} ${s.correo} ${s.cedula || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [students, search, fCiudad, fEmpresa, fCurso]);

  const toggle = (s) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(s.id)) next.delete(s.id);
      else next.set(s.id, { id: s.id, nombre: `${s.nombres} ${s.apellidos}`.trim(), correo: s.correo, celular: s.celular });
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const toggleAllFiltered = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allFilteredSelected) {
        filtered.forEach((s) => next.delete(s.id));
      } else {
        filtered.forEach((s) =>
          next.set(s.id, { id: s.id, nombre: `${s.nombres} ${s.apellidos}`.trim(), correo: s.correo, celular: s.celular }),
        );
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFCiudad("");
    setFEmpresa("");
    setFCurso("");
  };

  // Cobertura de canales sobre la selección
  const selArr = [...selected.values()];
  const conCorreo = selArr.filter((s) => s.correo).length;
  const conWhats = selArr.filter((s) => s.celular).length;

  const fSelect = "rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2.5 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Seleccionar estudiantes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 space-y-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o cédula..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select className={fSelect} value={fCiudad} onChange={(e) => setFCiudad(e.target.value)}>
              <option value="">Toda ciudad</option>
              {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className={fSelect} value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)}>
              <option value="">Toda organización</option>
              {empresas.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className={fSelect} value={fCurso} onChange={(e) => setFCurso(e.target.value)}>
              <option value="">Todo curso</option>
              {cursos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
            {(search || fCiudad || fEmpresa || fCurso) && (
              <button onClick={clearFilters} className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                Limpiar
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} className="w-4 h-4 accent-orange-500" />
              Seleccionar los {filtered.length} resultados
            </label>
            <span className="text-gray-400">{filtered.length} de {students.length}</span>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <FaSpinner className="animate-spin mr-2" /> Cargando estudiantes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No hay estudiantes con esos filtros.</div>
          ) : (
            filtered.map((s) => {
              const isSel = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition mb-1 ${
                    isSel ? "bg-orange-50 dark:bg-orange-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${isSel ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 dark:border-gray-500"}`}>
                    {isSel && <FaCheck size={10} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {s.nombres} {s.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {s.correo}
                      {s.ciudad && ` · ${s.ciudad}`}
                      {s.empresa && ` · ${s.empresa}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-1">
                    {channels.email && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.correo ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" : "bg-gray-100 text-gray-400 dark:bg-gray-700"}`}>
                        {s.correo ? "✉" : "sin correo"}
                      </span>
                    )}
                    {channels.whatsapp && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.celular ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-400 dark:bg-gray-700"}`}>
                        {s.celular ? "WA" : "sin tel."}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <b className="text-gray-800 dark:text-gray-100">{selected.size}</b> seleccionado{selected.size === 1 ? "" : "s"}
            {selected.size > 0 && (
              <span className="text-xs">
                {channels.email && ` · ${conCorreo} con correo`}
                {channels.whatsapp && ` · ${conWhats} con WhatsApp`}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancelar
            </button>
            <button
              onClick={() => onConfirm([...selected.values()])}
              disabled={selected.size === 0}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              Confirmar ({selected.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editor de mensaje con formato ───────────────────────────────────────────
function MessageComposer({ value, onChange }) {
  const ref = useRef(null);

  const wrap = (marker) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || "texto";
    const next = value.slice(0, start) + marker + sel + marker + value.slice(end);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + marker.length;
      ta.selectionEnd = start + marker.length + sel.length;
    }, 0);
  };

  const addBullets = () => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const prefix = value.slice(0, start);
    const needsNl = prefix && !prefix.endsWith("\n");
    const next = prefix + (needsNl ? "\n" : "") + "- " + value.slice(start);
    onChange(next);
    setTimeout(() => ta.focus(), 0);
  };

  const Tool = ({ onClick, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {children}
    </button>
  );

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Mensaje</span>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border border-b-0 border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700/40 flex-wrap">
        <Tool onClick={() => wrap("*")} title="Negrita (*texto*)"><FaBold size={12} /></Tool>
        <Tool onClick={() => wrap("_")} title="Cursiva (_texto_)"><FaItalic size={12} /></Tool>
        <Tool onClick={addBullets} title="Lista (- )"><FaListUl size={12} /></Tool>
        <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        {["🎓", "🔥", "✅", "🚀", "💰", "📅", "🎁"].map((e) => (
          <button key={e} type="button" onClick={() => onChange(value + e)} className="w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-base">{e}</button>
        ))}
      </div>

      <textarea
        ref={ref}
        className="w-full min-h-[200px] resize-y rounded-b-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Escribe la promoción...\n\nUsa *negrita*, _cursiva_ y listas con - "}
      />
      <p className="text-xs text-gray-400 mt-1.5">
        Formato: <b>*negrita*</b>, <i>_cursiva_</i>, viñetas con <code>-</code>. Mira el resultado en la vista previa de la derecha →
      </p>
    </div>
  );
}

// ─── Vista previa en vivo (panel derecho) ────────────────────────────────────
function LivePreview({ asunto, titulo, mensaje, images, channels }) {
  const available = [channels.email && "email", channels.whatsapp && "whatsapp"].filter(Boolean);
  const [tab, setTab] = useState("email");

  // Mantiene la pestaña activa válida si cambian los canales seleccionados
  useEffect(() => {
    if (available.length && !available.includes(tab)) setTab(available[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels.email, channels.whatsapp]);

  const hasContent = Boolean((mensaje || "").trim() || titulo || images?.length);

  const PillBtn = ({ value, color, icon, label }) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`text-xs px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
        tab === value ? `bg-white dark:bg-gray-800 shadow-sm ${color}` : "text-gray-500 dark:text-gray-400"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Vista previa
        </h3>
        {available.length > 1 && (
          <div className="flex gap-1 p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700/60">
            <PillBtn value="email" color="text-blue-600 dark:text-blue-300" icon={<FaEnvelope size={11} />} label="Correo" />
            <PillBtn value="whatsapp" color="text-green-600 dark:text-green-300" icon={<FaWhatsapp size={11} />} label="WhatsApp" />
          </div>
        )}
      </div>

      {available.length === 0 ? (
        <div className="min-h-[340px] flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8">
          <FaBullhorn className="text-3xl mb-3 opacity-40" />
          <p className="text-sm">Selecciona un canal de envío<br />para ver la vista previa.</p>
        </div>
      ) : tab === "email" ? (
        <EmailPreview asunto={asunto} titulo={titulo} mensaje={mensaje} images={images} empty={!hasContent} />
      ) : (
        <WhatsappPreview titulo={titulo} mensaje={mensaje} images={images} empty={!hasContent} />
      )}
    </div>
  );
}

function EmailPreview({ asunto, titulo, mensaje, images, empty }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white shadow-xl overflow-hidden">
      {/* Barra del cliente de correo */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-[11px] text-gray-400 truncate">Bandeja de entrada</span>
      </div>
      {/* Metadatos del correo */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {asunto || <span className="text-gray-300 font-normal">(Sin asunto)</span>}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">M</span>
          <div className="leading-tight">
            <p className="text-xs font-medium text-gray-700">MAAT Academy</p>
            <p className="text-[11px] text-gray-400">para mí</p>
          </div>
        </div>
      </div>
      {/* Cuerpo con marca */}
      <div className="bg-gray-50 p-4">
        <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-3 text-center">
            <span className="text-white text-sm font-bold tracking-wide">MAAT Academy</span>
          </div>
          <div className="p-4">
            {images?.length > 0 && <img src={images[0].url} alt="" className="w-full rounded-lg mb-3" />}
            {titulo && <p className="font-bold text-gray-900 text-base mb-2">{titulo}</p>}
            {empty ? (
              <p className="text-sm text-gray-300 italic">Tu mensaje aparecerá aquí…</p>
            ) : (
              <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: fmtToHtml(mensaje) }} />
            )}
            <div className="text-center mt-4">
              <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm">Ver nuestros cursos</span>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">© MAAT Academy · Recibes este correo por estar inscrito.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsappPreview({ titulo, mensaje, images, empty }) {
  const text = (mensaje || "").replace(/^\s*-\s+/gm, "• ");
  return (
    <div className="rounded-[2rem] border-[6px] border-gray-800 dark:border-gray-900 shadow-xl overflow-hidden bg-black max-w-[320px] mx-auto w-full">
      {/* Cabecera de WhatsApp */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54]">
        <span className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">M</span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">MAAT Academy</p>
          <p className="text-[11px] text-white/70">en línea</p>
        </div>
      </div>
      {/* Chat */}
      <div className="px-3 py-4 min-h-[280px]" style={{ background: "#e5ddd5" }}>
        <div className="bg-white rounded-lg rounded-tl-none shadow-sm p-2.5 max-w-[92%]">
          {images?.length > 0 && <img src={images[0].url} alt="" className="w-full rounded-md mb-2" />}
          {titulo && <p className="font-bold text-gray-900 text-sm mb-1">{titulo}</p>}
          {empty ? (
            <p className="text-sm text-gray-300 italic">Tu mensaje aparecerá aquí…</p>
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap" style={{ wordBreak: "break-word" }}>{text}</p>
          )}
          <span className="block text-[10px] text-gray-400 text-right mt-1">12:00 ✓✓</span>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de detalle / reporte de campaña ───────────────────────────────────
function CampaignDetailModal({ id, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/api/campaigns/${id}`);
      setData(r.data.data);
    } catch {
      swError("No se pudo cargar el detalle");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const recips = data?.recipients || [];
  const filtered = recips.filter((r) => {
    if (filtro === "enviados") return r.emailEstado === "ENVIADO" || r.whatsappEstado === "ENVIADO";
    if (filtro === "fallidos") return r.emailEstado === "FALLIDO" || r.whatsappEstado === "FALLIDO";
    if (filtro === "pendientes") return r.emailEstado === "PENDIENTE" || r.whatsappEstado === "PENDIENTE";
    return true;
  });

  const alcanzados = recips.filter((r) => r.emailEstado === "ENVIADO" || r.whatsappEstado === "ENVIADO").length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">{data?.nombre || "Campaña"}</h3>
            {data && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(ESTADO_META[data.estado] || ESTADO_META.BORRADOR).cls}`}>{(ESTADO_META[data.estado] || ESTADO_META.BORRADOR).label}</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><FaTimes size={18} /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400"><FaSpinner className="animate-spin mr-2" /> Cargando...</div>
        ) : (
          <>
            {/* Métricas */}
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-100 dark:border-gray-700">
              <Stat label="Destinatarios" value={data.total} color="text-gray-700 dark:text-gray-200" />
              <Stat label="Alcanzados" value={`${alcanzados}/${data.total}`} color="text-green-600" sub={data.total ? `${Math.round((alcanzados / data.total) * 100)}%` : "0%"} />
              <Stat label="Correos enviados" value={data.enviadosEmail} color="text-blue-600" />
              <Stat label="WhatsApp enviados" value={data.enviadosWhatsapp} color="text-emerald-600" />
            </div>

            {/* Filtros */}
            <div className="px-6 py-2.5 flex gap-2 border-b border-gray-100 dark:border-gray-700 text-sm">
              {[["todos", "Todos"], ["enviados", "Enviados"], ["fallidos", "Fallidos"], ["pendientes", "Pendientes"]].map(([k, l]) => (
                <button key={k} onClick={() => setFiltro(k)} className={`px-3 py-1 rounded-lg font-medium ${filtro === k ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  {l}
                </button>
              ))}
              {data.fallidos > 0 && <span className="ml-auto self-center text-xs text-red-500">{data.fallidos} con fallo</span>}
            </div>

            {/* Lista de destinatarios */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Sin destinatarios en este filtro.</div>
              ) : (
                filtered.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{r.nombre || r.correo || r.celular}</p>
                      <p className="text-xs text-gray-400 truncate">{[r.correo, r.celular].filter(Boolean).join(" · ")}</p>
                      {r.error && <p className="text-xs text-red-500 truncate">{r.error}</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {r.emailEstado !== "OMITIDO" && <EstadoPill label="✉" estado={r.emailEstado} />}
                      {r.whatsappEstado !== "OMITIDO" && <EstadoPill label="WA" estado={r.whatsappEstado} />}
                    </div>
                  </div>
                ))
              )}
            </div>
            {recips.length >= 500 && (
              <p className="px-6 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">Mostrando los primeros 500 destinatarios.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color, sub }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}{sub && <span className="text-gray-400"> · {sub}</span>}</p>
    </div>
  );
}

function EstadoPill({ label, estado }) {
  const map = {
    ENVIADO: { cls: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300", icon: <FaCheckCircle size={9} /> },
    FALLIDO: { cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300", icon: <FaTimesCircle size={9} /> },
    PENDIENTE: { cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300", icon: <FaClock size={9} /> },
  }[estado] || { cls: "bg-gray-100 text-gray-400", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${map.cls}`}>
      {map.icon} {label}
    </span>
  );
}

// ─── Helpers de UI ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function AdvField({ label, unit, hint, recommended, placeholder, min = 0, value, onChange }) {
  const handle = (e) => {
    const raw = e.target.value;
    if (raw === "") return onChange("");
    let n = Number(raw);
    if (!Number.isFinite(n)) return; // ignorar lo no numérico
    if (n < min) n = min; // impide negativos / valores fuera de rango
    onChange(String(n));
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label} {unit && <span className="text-gray-400 font-normal">({unit})</span>}
      </label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={handle}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
      />
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
      {recommended && <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">{recommended}</p>}
    </div>
  );
}

// Miniatura de imagen con botón para quitarla
function Thumb({ src, onRemove }) {
  return (
    <div className="relative group">
      <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
      <button
        type="button"
        onClick={onRemove}
        title="Quitar"
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow hover:bg-rose-600"
      >
        <FaTimes size={9} />
      </button>
    </div>
  );
}

// Tarjeta de audiencia calculada en vivo
function AudienceCard({ audience, loading, channels }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <FaUsers className="text-orange-500" size={13} />
        {loading ? (
          <span className="text-gray-400 flex items-center gap-1.5"><FaSpinner className="animate-spin" size={11} /> Calculando audiencia…</span>
        ) : audience ? (
          <span className="text-gray-700 dark:text-gray-200">
            <b className="text-orange-600 dark:text-orange-400">{audience.total}</b> destinatario{audience.total === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-gray-400">Selecciona canal y segmento para calcular</span>
        )}
      </div>
      {audience && audience.total > 0 && (
        <div className="flex gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {channels.email && (
            <span className="inline-flex items-center gap-1"><FaEnvelope size={10} className="text-blue-500" /> {audience.conCorreo} con correo</span>
          )}
          {channels.whatsapp && (
            <span className="inline-flex items-center gap-1"><FaWhatsapp size={10} className="text-green-500" /> {audience.conWhatsapp} con WhatsApp</span>
          )}
        </div>
      )}
    </div>
  );
}

// Tarjeta del plan de envío automático (lotes + tiempo estimado)
function PlanCard({ plan, loading, fmtSeg, manual }) {
  return (
    <div className="rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
        <FaClock size={12} /> Plan de envío {manual ? "(ajustado a mano)" : "automático"}
      </div>
      {loading ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
          <FaSpinner className="animate-spin" size={10} /> Recalculando…
        </p>
      ) : plan.total > 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-200 mt-1.5 leading-relaxed">
          El sistema enviará en <b>{plan.totalBatches}</b> lote{plan.totalBatches === 1 ? "" : "s"} de hasta{" "}
          <b>{plan.batchSize}</b> mensajes, con pausas para evitar bloqueos.
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tiempo estimado total: <b>{fmtSeg(plan.etaSec)}</b>.
          </span>
        </p>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          Cuando haya destinatarios, aquí verás cuántos lotes y cuánto tardará.
        </p>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400"
      }`}
    >
      {children}
    </button>
  );
}
