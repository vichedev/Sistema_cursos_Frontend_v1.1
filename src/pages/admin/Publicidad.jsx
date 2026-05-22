// src/pages/admin/Publicidad.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../../utils/axiosInstance";
import { swSuccess, swError, swConfirm } from "../../utils/swalConfig";
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
            <CampaignCard key={c.id} c={c} onAction={action} onRemove={remove} onDetail={() => setDetailId(c.id)} />
          ))}
        </div>
      )}

      {showForm && (
        <CampaignForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {detailId && <CampaignDetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function CampaignCard({ c, onAction, onRemove, onDetail }) {
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

// ─── Formulario de creación ──────────────────────────────────────────────────
function CampaignForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nombre: "",
    asunto: "",
    titulo: "",
    mensaje: "",
    canalEmail: true,
    canalWhatsapp: false,
    segmento: "TODOS",
    cursoId: "",
    programadaPara: "",
  });
  // Ajustes anti-baneo: las pausas se manejan en SEGUNDOS (más claro para el admin)
  const [adv, setAdv] = useState({ batchSize: "", delaySec: "", batchPauseSec: "" });
  const [showAdv, setShowAdv] = useState(false);
  const [images, setImages] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [defaults, setDefaults] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]); // [{id,nombre,correo,celular}]
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/api/courses/all").then((r) => setCursos(r.data || [])).catch(() => {});
    api.get("/api/settings").then((r) => setDefaults(r.data?.data || {})).catch(() => {});
  }, []);

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

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files.map((f) => ({ file: f, url: URL.createObjectURL(f) })));
  };

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

    setSubmitting(true);
    try {
      await api.post("/api/campaigns", fd);
      swSuccess(
        modo === "ahora" ? "Campaña creada y enviándose" : modo === "programar" ? "Campaña programada" : "Borrador guardado",
      );
      onCreated();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Nueva campaña</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
            <MessageComposer
              value={form.mensaje}
              onChange={(v) => set("mensaje", v)}
              titulo={form.titulo}
              images={images}
            />
            <Field label="Imágenes (hasta 5)">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-orange-400 w-fit">
                <FaImage size={13} /> Subir imágenes
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
              </label>
              {images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {images.map((im, i) => (
                    <img key={i} src={im.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                  ))}
                </div>
              )}
            </Field>
          </Section>

          {/* Sección: Envío */}
          <Section title="Programación y envío">
            <Field label="Programar para (opcional)">
              <input type="datetime-local" className={inputCls} value={form.programadaPara} onChange={(e) => set("programadaPara", e.target.value)} />
            </Field>
            <button type="button" onClick={() => setShowAdv((s) => !s)} className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {showAdv ? "▼" : "▶"} Ajustes anti-baneo (opcional)
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
                  <b>{fmtSeg(adv.delaySec || eff.delaySec)}</b>; tras{" "}
                  <b>{adv.batchSize || eff.batchSize}</b> mensajes, una pausa de{" "}
                  <b>{fmtSeg(adv.batchPauseSec || eff.batchPauseSec)}</b>.
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ej: 100 destinatarios ≈{" "}
                    {(() => {
                      const bs = Number(adv.batchSize || eff.batchSize);
                      const ds = Number(adv.delaySec || eff.delaySec);
                      const ps = Number(adv.batchPauseSec || eff.batchPauseSec);
                      const totalSeg = 100 * ds + Math.floor(100 / bs) * ps;
                      return fmtSeg(Math.round(totalSeg));
                    })()}{" "}
                    en completarse.
                  </span>
                </div>
              </div>
            )}
          </Section>
        </div>

        <div className="flex flex-wrap gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 justify-end sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-2xl">
          <button onClick={() => submit("borrador")} disabled={submitting} className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm disabled:opacity-60">
            Guardar borrador
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

// ─── Editor de mensaje con formato + vista previa ────────────────────────────
function MessageComposer({ value, onChange, titulo, images }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState("email"); // email | whatsapp | null

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
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Mensaje</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => setPreview("email")} className={`text-xs px-2.5 py-1 rounded-md font-medium ${preview === "email" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
            <FaEnvelope className="inline mr-1" size={11} /> Correo
          </button>
          <button type="button" onClick={() => setPreview("whatsapp")} className={`text-xs px-2.5 py-1 rounded-md font-medium ${preview === "whatsapp" ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
            <FaWhatsapp className="inline mr-1" size={11} /> WhatsApp
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border border-b-0 border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700/40">
        <Tool onClick={() => wrap("*")} title="Negrita (*texto*)"><FaBold size={12} /></Tool>
        <Tool onClick={() => wrap("_")} title="Cursiva (_texto_)"><FaItalic size={12} /></Tool>
        <Tool onClick={addBullets} title="Lista (- )"><FaListUl size={12} /></Tool>
        <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        {["🎓", "🔥", "✅", "🚀", "💰", "📅", "🎁"].map((e) => (
          <button key={e} type="button" onClick={() => onChange(value + e)} className="w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-base">{e}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-0 md:gap-4">
        <textarea
          ref={ref}
          className="w-full min-h-[170px] resize-y rounded-b-lg md:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"Escribe la promoción...\n\nUsa *negrita*, _cursiva_ y listas con - "}
        />
        {/* Vista previa */}
        <div className="mt-3 md:mt-0">
          {preview === "email" ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-2.5 text-center">
                <span className="text-white text-sm font-bold">MAAT Academy</span>
              </div>
              <div className="p-4">
                {images?.length > 0 && <img src={images[0].url} alt="" className="w-full rounded-lg mb-3" />}
                {titulo && <p className="font-bold text-gray-900 text-base mb-2">{titulo}</p>}
                <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: fmtToHtml(value) }} />
                <div className="text-center mt-3">
                  <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg">Ver nuestros cursos</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-3" style={{ background: "#e5ddd5" }}>
              <div className="bg-white rounded-lg rounded-tl-none shadow-sm p-3 max-w-[90%]">
                {images?.length > 0 && <img src={images[0].url} alt="" className="w-full rounded-md mb-2" />}
                {titulo && <p className="font-bold text-gray-900 text-sm mb-1">{titulo}</p>}
                <p className="text-sm text-gray-800 whitespace-pre-wrap" style={{ wordBreak: "break-word" }}>
                  {(value || "").replace(/^\s*-\s+/gm, "• ")}
                </p>
                <span className="block text-[10px] text-gray-400 text-right mt-1">12:00 ✓✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        Formato: <b>*negrita*</b>, <i>_cursiva_</i>, viñetas con <code>-</code>. Se ve bien en correo y WhatsApp.
      </p>
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
