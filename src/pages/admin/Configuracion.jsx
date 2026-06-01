// src/pages/admin/Configuracion.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../utils/axiosInstance";
import { swSuccess, swError, swInfo, swConfirm, Swal } from "../../utils/swalConfig";
import {
  FaEnvelope,
  FaWhatsapp,
  FaShieldAlt,
  FaServer,
  FaPlug,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaSignOutAlt,
  FaQrcode,
  FaTimes,
  FaMobileAlt,
  FaRobot,
  FaCreditCard,
  FaBell,
  FaKey,
  FaAddressBook,
  FaMapMarkerAlt,
} from "react-icons/fa";

const TABS = [
  { id: "smtp", label: "Servidor de Correo", desc: "Conexión SMTP", icon: <FaServer /> },
  { id: "mail", label: "Anti-baneo Correo", desc: "Velocidad de envío", icon: <FaShieldAlt /> },
  { id: "whatsapp", label: "WhatsApp", desc: "Conexión por QR", icon: <FaWhatsapp /> },
  { id: "ai", label: "Inteligencia Artificial", desc: "DeepSeek, Groq…", icon: <FaRobot /> },
  { id: "payphone", label: "Pagos (Payphone)", desc: "Pasarela de pago", icon: <FaCreditCard /> },
  { id: "notif", label: "Notificaciones", desc: "Correos y soporte", icon: <FaBell /> },
  { id: "contacto", label: "Contacto público", desc: "Datos de la landing", icon: <FaAddressBook /> },
];

function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition";

export default function Configuracion() {
  const [tab, setTab] = useState("smtp");
  const [cfg, setCfg] = useState(null);
  const [aiProviders, setAiProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/settings");
      setCfg(data.data);
      setAiProviders(data.aiProviders || {});
    } catch {
      swError("No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setVal = (k, v) => setCfg((p) => ({ ...p, [k]: v }));

  // Claves secretas: si vienen vacías se omiten (significa "no cambiar")
  const SECRET_KEYS = ["smtp_pass", "ai_api_key", "payphone_token"];

  const save = async (keys) => {
    setSaving(true);
    try {
      const payload = {};
      keys.forEach((k) => {
        if (SECRET_KEYS.includes(k) && !cfg[k]) return;
        payload[k] = cfg[k];
      });
      const { data } = await api.put("/api/settings", payload);
      setCfg(data.data);
      swSuccess("Configuración guardada");
    } catch (e) {
      swError("Error al guardar", e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <FaSpinner className="animate-spin mr-2" /> Cargando configuración...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500">
            <FaPlug />
          </span>
          Configuración del sistema
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Administra correo, WhatsApp, inteligencia artificial, pagos y notificaciones desde un solo lugar.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Navegación lateral */}
        <nav className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition whitespace-nowrap md:whitespace-normal flex-shrink-0 md:w-full ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                }`}
              >
                <span className={`text-lg ${active ? "text-white" : "text-blue-500"}`}>{t.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{t.label}</span>
                  <span className={`block text-xs ${active ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}>
                    {t.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Contenido */}
        <div className="flex-1 w-full min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-7">
          {tab === "smtp" && <SmtpTab cfg={cfg} setVal={setVal} save={save} saving={saving} />}
          {tab === "mail" && <MailThrottleTab cfg={cfg} setVal={setVal} save={save} saving={saving} />}
          {tab === "whatsapp" && <WhatsappTab cfg={cfg} setVal={setVal} save={save} saving={saving} />}
          {tab === "ai" && <AiTab cfg={cfg} setVal={setVal} save={save} saving={saving} providers={aiProviders} />}
          {tab === "payphone" && <PayphoneTab cfg={cfg} setVal={setVal} save={save} saving={saving} />}
          {tab === "notif" && <NotificationsTab cfg={cfg} setVal={setVal} save={save} saving={saving} />}
          {tab === "contacto" && <ContactoTab cfg={cfg} setVal={setVal} save={save} saving={saving} />}
        </div>
      </div>
    </div>
  );
}

// ─── SMTP ──────────────────────────────────────────────────────────────────────
function SmtpTab({ cfg, setVal, save, saving }) {
  const [testing, setTesting] = useState(false);

  const test = async () => {
    const res = await Swal.fire({
      icon: "question",
      title: "Probar conexión SMTP",
      html: "Opcional: escribe un correo para recibir un mensaje de prueba.",
      input: "email",
      inputPlaceholder: "correo@ejemplo.com (opcional)",
      showCancelButton: true,
      confirmButtonText: "Probar",
      cancelButtonText: "Cancelar",
      background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a",
    });
    if (!res.isConfirmed) return; // cancelado
    const testTo = res.value;
    setTesting(true);
    try {
      const { data } = await api.post("/api/settings/test-smtp", {
        smtp_host: cfg.smtp_host,
        smtp_port: cfg.smtp_port,
        smtp_secure: cfg.smtp_secure,
        smtp_user: cfg.smtp_user,
        smtp_pass: cfg.smtp_pass || undefined,
        smtp_from_name: cfg.smtp_from_name,
        testTo: testTo || undefined,
      });
      data.success ? swSuccess("Conexión OK", data.message) : swError("Falló la prueba", data.message);
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <SectionTitle icon={<FaServer />} title="Servidor de correo (SMTP)" />
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Servidor (host)" hint="Ej: mail.maat.ec">
          <input className={inputCls} value={cfg.smtp_host || ""} onChange={(e) => setVal("smtp_host", e.target.value)} />
        </Field>
        <Field label="Puerto" hint="587 (STARTTLS) recomendado. 465 = TLS implícito.">
          <input className={inputCls} type="number" value={cfg.smtp_port || ""} onChange={(e) => setVal("smtp_port", e.target.value)} />
        </Field>
        <Field label="Usuario / correo" hint="Ej: cursos@maat.ec">
          <input className={inputCls} value={cfg.smtp_user || ""} onChange={(e) => setVal("smtp_user", e.target.value)} />
        </Field>
        <Field
          label="Contraseña"
          hint={cfg.smtp_pass_set ? "✅ Hay una contraseña guardada. Déjalo vacío para no cambiarla." : "⚠️ Sin contraseña configurada."}
        >
          <input className={inputCls} type="password" placeholder="••••••••" value={cfg.smtp_pass || ""} onChange={(e) => setVal("smtp_pass", e.target.value)} />
        </Field>
        <Field label="Nombre del remitente" hint='Aparece como "Nombre <correo>"'>
          <input className={inputCls} value={cfg.smtp_from_name || ""} onChange={(e) => setVal("smtp_from_name", e.target.value)} />
        </Field>
        <Field label="Seguridad de conexión">
          <select
            className={inputCls}
            value={String(cfg.smtp_secure)}
            onChange={(e) => setVal("smtp_secure", e.target.value)}
          >
            <option value="false">STARTTLS (puerto 587) — recomendado</option>
            <option value="true">TLS implícito (puerto 465)</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={test}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm disabled:opacity-60"
        >
          {testing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} Probar conexión
        </button>
        <button
          onClick={() => save(["smtp_host", "smtp_port", "smtp_secure", "smtp_user", "smtp_pass", "smtp_from_name"])}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
        </button>
      </div>
    </div>
  );
}

// ─── Anti-baneo correo ───────────────────────────────────────────────────────
function MailThrottleTab({ cfg, setVal, save, saving }) {
  return (
    <div>
      <SectionTitle icon={<FaShieldAlt />} title="Envío inteligente de correo (anti-baneo)" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Estos valores espacian los envíos para que el servidor no te bloquee. Todos los correos
        pasan por una única conexión reutilizada y una cola con pausas.
      </p>
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Pausa entre correos (ms)" hint="Tiempo entre cada correo individual. Ej: 4000 = 4s">
          <input className={inputCls} type="number" value={cfg.mail_delay_ms || ""} onChange={(e) => setVal("mail_delay_ms", e.target.value)} />
        </Field>
        <Field label="Tamaño de lote" hint="Correos antes de una pausa larga">
          <input className={inputCls} type="number" value={cfg.mail_batch_size || ""} onChange={(e) => setVal("mail_batch_size", e.target.value)} />
        </Field>
        <Field label="Pausa entre lotes (ms)" hint="Ej: 60000 = 1 minuto">
          <input className={inputCls} type="number" value={cfg.mail_batch_pause_ms || ""} onChange={(e) => setVal("mail_batch_pause_ms", e.target.value)} />
        </Field>
        <Field label="Máx. correos por minuto" hint="Tope duro del pool">
          <input className={inputCls} type="number" value={cfg.mail_rate_per_minute || ""} onChange={(e) => setVal("mail_rate_per_minute", e.target.value)} />
        </Field>
        <Field label="Mensajes por conexión" hint="Renueva la conexión tras N envíos">
          <input className={inputCls} type="number" value={cfg.mail_max_per_connection || ""} onChange={(e) => setVal("mail_max_per_connection", e.target.value)} />
        </Field>
      </div>
      <button
        onClick={() => save(["mail_delay_ms", "mail_batch_size", "mail_batch_pause_ms", "mail_rate_per_minute", "mail_max_per_connection"])}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 mt-3"
      >
        {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
      </button>
    </div>
  );
}

// ─── WhatsApp ────────────────────────────────────────────────────────────────
function WhatsappTab({ cfg, setVal, save, saving }) {
  const [wa, setWa] = useState({ status: "DISCONNECTED", qr: null, me: null });
  const [busy, setBusy] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/api/whatsapp/status");
      setWa(data.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchStatus]);

  // Abrir el modal cuando hay QR; cerrarlo automáticamente al conectarse.
  useEffect(() => {
    if (wa.status === "QR" && wa.qr) setShowQr(true);
    if (wa.connected) setShowQr(false);
  }, [wa.status, wa.qr, wa.connected]);

  const connect = async () => {
    setBusy(true);
    try {
      await api.post("/api/whatsapp/connect");
      swInfo("Conectando...", "Escanea el QR con tu WhatsApp cuando aparezca.");
      fetchStatus();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    const r = await swConfirm({
      title: "¿Cerrar sesión de WhatsApp?",
      html: "Se borrará la sesión y deberás escanear el QR de nuevo.",
      confirmText: "Sí, cerrar",
      icon: "warning",
    });
    if (!r.isConfirmed) return;
    setBusy(true);
    try {
      await api.post("/api/whatsapp/logout");
      swSuccess("Sesión cerrada");
      fetchStatus();
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    const res = await Swal.fire({
      icon: "question",
      title: "Enviar WhatsApp de prueba",
      input: "text",
      inputPlaceholder: "Ej: 0991234567",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a",
    });
    const number = res.value;
    if (!res.isConfirmed || !number) return;
    try {
      const { data } = await api.post("/api/whatsapp/test", { number });
      data.success ? swSuccess("Enviado", data.message) : swError("No se pudo", data.message);
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    }
  };

  const statusMeta = {
    CONNECTED: { color: "text-green-600", icon: <FaCheckCircle />, label: "Conectado" },
    CONNECTING: { color: "text-amber-500", icon: <FaSpinner className="animate-spin" />, label: "Conectando..." },
    QR: { color: "text-blue-500", icon: <FaQrcode />, label: "Esperando escaneo de QR" },
    DISCONNECTED: { color: "text-gray-400", icon: <FaTimesCircle />, label: "Desconectado" },
  }[wa.status] || { color: "text-gray-400", icon: <FaTimesCircle />, label: wa.status };

  return (
    <div>
      <SectionTitle icon={<FaWhatsapp />} title="Conexión de WhatsApp" />

      <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
        {/* Estado + QR */}
        <div className="flex-1 w-full">
          <div className={`flex items-center gap-2 font-bold text-lg ${statusMeta.color}`}>
            {statusMeta.icon} {statusMeta.label}
          </div>
          {wa.connected && wa.me && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Número conectado: <b>{wa.me}</b>
            </p>
          )}
          {wa.error && <p className="text-sm text-red-500 mt-1">{wa.error}</p>}

          <div className="flex flex-wrap gap-3 mt-4">
            {!wa.connected && (
              <button onClick={connect} disabled={busy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm disabled:opacity-60">
                {busy ? <FaSpinner className="animate-spin" /> : <FaPlug />} Conectar
              </button>
            )}
            {wa.status === "QR" && wa.qr && (
              <button onClick={() => setShowQr(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
                <FaQrcode /> Ver QR
              </button>
            )}
            {wa.connected && (
              <>
                <button onClick={test} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm">
                  <FaPaperPlane /> Enviar prueba
                </button>
                <button onClick={logout} disabled={busy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm disabled:opacity-60">
                  <FaSignOutAlt /> Cerrar sesión
                </button>
              </>
            )}
            <button onClick={fetchStatus} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm">
              <FaSync /> Actualizar
            </button>
          </div>
        </div>

      </div>

      {showQr && <QrModal wa={wa} onClose={() => setShowQr(false)} />}

      <hr className="border-gray-200 dark:border-gray-700 my-5" />

      <SectionTitle icon={<FaShieldAlt />} title="Anti-baneo WhatsApp" />
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Retardo mínimo entre mensajes (ms)" hint="Ej: 4000 = 4s">
          <input className={inputCls} type="number" value={cfg.wa_delay_min_ms || ""} onChange={(e) => setVal("wa_delay_min_ms", e.target.value)} />
        </Field>
        <Field label="Retardo máximo entre mensajes (ms)" hint="Se usa un valor aleatorio entre mín y máx (humano)">
          <input className={inputCls} type="number" value={cfg.wa_delay_max_ms || ""} onChange={(e) => setVal("wa_delay_max_ms", e.target.value)} />
        </Field>
        <Field label="Tamaño de lote" hint="Mensajes antes de pausa larga">
          <input className={inputCls} type="number" value={cfg.wa_batch_size || ""} onChange={(e) => setVal("wa_batch_size", e.target.value)} />
        </Field>
        <Field label="Pausa entre lotes (ms)" hint="Ej: 120000 = 2 minutos">
          <input className={inputCls} type="number" value={cfg.wa_batch_pause_ms || ""} onChange={(e) => setVal("wa_batch_pause_ms", e.target.value)} />
        </Field>
      </div>
      <button
        onClick={() => save(["wa_delay_min_ms", "wa_delay_max_ms", "wa_batch_size", "wa_batch_pause_ms"])}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 mt-3"
      >
        {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
      </button>
    </div>
  );
}

// ─── Inteligencia Artificial ───────────────────────────────────────────────
function AiTab({ cfg, setVal, save, saving, providers }) {
  const [testing, setTesting] = useState(false);
  const provider = cfg.ai_provider || "deepseek";
  const meta = providers[provider] || {};
  const isCustom = provider === "custom";

  const test = async () => {
    setTesting(true);
    try {
      // Guardar la config de IA primero (la prueba usa la config almacenada)
      const payload = {
        ai_provider: provider,
        ai_model: cfg.ai_model || "",
        ai_base_url: cfg.ai_base_url || "",
      };
      if (cfg.ai_api_key) payload.ai_api_key = cfg.ai_api_key;
      await api.put("/api/settings", payload);

      const { data } = await api.post("/api/settings/test-ai");
      if (data.success) {
        swSuccess("IA conectada", `${data.message}${data.sample ? ` · Respuesta: "${data.sample}"` : ""}`);
      } else {
        swError("Falló la prueba", data.message);
      }
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    } finally {
      setTesting(false);
    }
  };

  const keyHelp = {
    deepseek: "Obtén tu API Key en platform.deepseek.com",
    groq: "Obtén tu API Key gratis en console.groq.com/keys",
    custom: "Usa cualquier endpoint compatible con la API de OpenAI",
  }[provider];

  return (
    <div>
      <SectionTitle icon={<FaRobot />} title="Inteligencia Artificial" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Se usa para generar descripciones de cursos automáticamente. Funciona con cualquier
        proveedor compatible con OpenAI.
      </p>

      {/* Selección de proveedor */}
      <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Proveedor</span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {Object.entries(providers).map(([id, m]) => {
          const active = provider === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setVal("ai_provider", id)}
              className={`text-left p-3.5 rounded-xl border-2 transition ${
                active
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{m.label}</span>
                {active && <FaCheckCircle className="text-blue-500" />}
              </div>
              {m.defaultModel && (
                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1">{m.defaultModel}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-x-5">
        <Field
          label="API Key"
          hint={cfg.ai_api_key_set ? `✅ Hay una API Key guardada. ${keyHelp}` : `⚠️ Sin API Key. ${keyHelp}`}
        >
          <div className="relative">
            <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              className={`${inputCls} pl-9`}
              type="password"
              placeholder="••••••••••••"
              value={cfg.ai_api_key || ""}
              onChange={(e) => setVal("ai_api_key", e.target.value)}
            />
          </div>
        </Field>
        <Field label="Modelo" hint={`Vacío = ${meta.defaultModel || "modelo por defecto"}`}>
          <input
            className={inputCls}
            placeholder={meta.defaultModel || "modelo"}
            value={cfg.ai_model || ""}
            onChange={(e) => setVal("ai_model", e.target.value)}
          />
        </Field>
        {isCustom && (
          <Field label="URL del endpoint" hint="Ej: https://tu-servidor/v1/chat/completions">
            <input
              className={inputCls}
              placeholder="https://.../v1/chat/completions"
              value={cfg.ai_base_url || ""}
              onChange={(e) => setVal("ai_base_url", e.target.value)}
            />
          </Field>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={test}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm disabled:opacity-60"
        >
          {testing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} Probar IA
        </button>
        <button
          onClick={() => save(["ai_provider", "ai_api_key", "ai_model", "ai_base_url"])}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
        </button>
      </div>
    </div>
  );
}

// ─── Pagos (Payphone) ───────────────────────────────────────────────────────
function PayphoneTab({ cfg, setVal, save, saving }) {
  return (
    <div>
      <SectionTitle icon={<FaCreditCard />} title="Pasarela de pagos (Payphone)" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Credenciales de Payphone para cobrar las inscripciones a cursos pagados.
      </p>
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="URL de la API" hint="Por defecto: https://pay.payphonetodoesposible.com">
          <input className={inputCls} value={cfg.payphone_api_url || ""} onChange={(e) => setVal("payphone_api_url", e.target.value)} />
        </Field>
        <Field label="Store ID">
          <input className={inputCls} value={cfg.payphone_store_id || ""} onChange={(e) => setVal("payphone_store_id", e.target.value)} />
        </Field>
        <Field
          label="Token"
          hint={cfg.payphone_token_set ? "✅ Hay un token guardado. Déjalo vacío para no cambiarlo." : "⚠️ Sin token configurado."}
        >
          <div className="relative">
            <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input className={`${inputCls} pl-9`} type="password" placeholder="••••••••••••" value={cfg.payphone_token || ""} onChange={(e) => setVal("payphone_token", e.target.value)} />
          </div>
        </Field>
        <Field label="Timeout (ms)" hint="Tiempo máximo de espera. Recomendado: 15000">
          <input className={inputCls} type="number" value={cfg.payphone_timeout || ""} onChange={(e) => setVal("payphone_timeout", e.target.value)} />
        </Field>
      </div>
      <button
        onClick={() => save(["payphone_api_url", "payphone_store_id", "payphone_token", "payphone_timeout"])}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 mt-3"
      >
        {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
      </button>
    </div>
  );
}

// ─── Notificaciones y soporte ───────────────────────────────────────────────
function NotificationsTab({ cfg, setVal, save, saving }) {
  return (
    <div>
      <SectionTitle icon={<FaBell />} title="Notificaciones y soporte" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Correos que reciben avisos del sistema y los datos de contacto que ven los estudiantes.
      </p>
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Correo para nuevas inscripciones" hint="Recibe aviso cuando alguien se inscribe">
          <input className={inputCls} type="email" value={cfg.notif_inscripciones || ""} onChange={(e) => setVal("notif_inscripciones", e.target.value)} />
        </Field>
        <Field label="Correo para alertas del sistema" hint="Pagos, errores, etc.">
          <input className={inputCls} type="email" value={cfg.notif_alertas || ""} onChange={(e) => setVal("notif_alertas", e.target.value)} />
        </Field>
        <Field label="Correo de soporte" hint="Se muestra a los estudiantes">
          <input className={inputCls} type="email" value={cfg.soporte_correo || ""} onChange={(e) => setVal("soporte_correo", e.target.value)} />
        </Field>
        <Field label="Teléfono de soporte" hint="Se muestra a los estudiantes">
          <input className={inputCls} value={cfg.soporte_telefono || ""} onChange={(e) => setVal("soporte_telefono", e.target.value)} />
        </Field>
        <Field label="Correos admin adicionales" hint="Separados por coma. Reciben copia de avisos">
          <input className={inputCls} value={cfg.correos_admin_extra || ""} onChange={(e) => setVal("correos_admin_extra", e.target.value)} placeholder="admin1@x.com, admin2@x.com" />
        </Field>
      </div>
      <button
        onClick={() => save(["notif_inscripciones", "notif_alertas", "soporte_correo", "soporte_telefono", "correos_admin_extra"])}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60 mt-3"
      >
        {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
      </button>
    </div>
  );
}

// ─── Contacto público (landing) ──────────────────────────────────────────────
function ContactoTab({ cfg, setVal, save, saving }) {
  const test = async () => {
    const res = await Swal.fire({
      icon: "question",
      title: "Probar formulario de contacto",
      html: "Se enviará un mensaje de prueba al correo de destino configurado.",
      showCancelButton: true,
      confirmButtonText: "Enviar prueba",
      cancelButtonText: "Cancelar",
      background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a",
    });
    if (!res.isConfirmed) return;
    try {
      const { data } = await api.post("/api/settings/contact", {
        nombre: "Prueba de contacto",
        correo: cfg.contacto_correo || "prueba@maat.ec",
        mensaje: "Este es un mensaje de prueba enviado desde la configuración.",
      });
      data.success ? swSuccess("Enviado", "Revisa el correo de destino.") : swError("No se pudo", data.message);
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <SectionTitle icon={<FaAddressBook />} title="Datos de contacto (landing pública)" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Esta información aparece en la sección <b>Contáctanos</b> de la página principal. Los mensajes del
        formulario llegan al correo de destino indicado abajo.
      </p>

      {/* WhatsApp */}
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
        <FaWhatsapp className="text-green-500" /> WhatsApp
      </h3>
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Número de WhatsApp" hint="Ej: +593979860095">
          <input className={inputCls} value={cfg.contacto_whatsapp || ""} onChange={(e) => setVal("contacto_whatsapp", e.target.value)} />
        </Field>
        <Field label="Nota / disponibilidad" hint='Ej: "Chat directo 24/7"'>
          <input className={inputCls} value={cfg.contacto_whatsapp_nota || ""} onChange={(e) => setVal("contacto_whatsapp_nota", e.target.value)} />
        </Field>
      </div>

      {/* Correo */}
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 mt-4">
        <FaEnvelope className="text-blue-500" /> Correo
      </h3>
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Correo de contacto" hint="Se muestra en la tarjeta de correo">
          <input className={inputCls} type="email" value={cfg.contacto_correo || ""} onChange={(e) => setVal("contacto_correo", e.target.value)} />
        </Field>
        <Field label="Nota de respuesta" hint='Ej: "Respuesta en 24h"'>
          <input className={inputCls} value={cfg.contacto_correo_nota || ""} onChange={(e) => setVal("contacto_correo_nota", e.target.value)} />
        </Field>
      </div>

      {/* Ubicación */}
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 mt-4">
        <FaMapMarkerAlt className="text-purple-500" /> Ubicación
      </h3>
      <div className="grid md:grid-cols-3 gap-x-5">
        <Field label="País">
          <input className={inputCls} value={cfg.contacto_pais || ""} onChange={(e) => setVal("contacto_pais", e.target.value)} />
        </Field>
        <Field label="Ciudad">
          <input className={inputCls} value={cfg.contacto_ciudad || ""} onChange={(e) => setVal("contacto_ciudad", e.target.value)} />
        </Field>
        <Field label="Grupo / lema" hint='Ej: "✨Grupo Maat✨"'>
          <input className={inputCls} value={cfg.contacto_grupo || ""} onChange={(e) => setVal("contacto_grupo", e.target.value)} />
        </Field>
      </div>

      {/* Destino del formulario */}
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 mt-4">
        <FaPaperPlane className="text-orange-500" /> Recepción de mensajes
      </h3>
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Correo que recibe los mensajes" hint="Si lo dejas vacío, se usa el correo de contacto / soporte">
          <input className={inputCls} type="email" placeholder={cfg.contacto_correo || "correo de contacto"} value={cfg.contacto_destino || ""} onChange={(e) => setVal("contacto_destino", e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={test}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm"
        >
          <FaPaperPlane /> Probar envío
        </button>
        <button
          onClick={() =>
            save([
              "contacto_whatsapp",
              "contacto_whatsapp_nota",
              "contacto_correo",
              "contacto_correo_nota",
              "contacto_pais",
              "contacto_ciudad",
              "contacto_grupo",
              "contacto_destino",
            ])
          }
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-60"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Guardar
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
      <span className="text-blue-500">{icon}</span> {title}
    </h2>
  );
}

// ─── Modal del QR de WhatsApp ────────────────────────────────────────────────
function QrModal({ wa, onClose }) {
  const connecting = wa.status === "CONNECTING" || wa.connected;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FaWhatsapp /> Vincular WhatsApp
          </h3>
          <button onClick={onClose} className="text-white/90 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {wa.connected ? (
            <div className="text-center py-8">
              <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-3" />
              <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">¡Conectado!</p>
              {wa.me && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{wa.me}</p>}
            </div>
          ) : (
            <>
              {/* QR */}
              <div className="flex justify-center">
                <div className="relative bg-white p-4 rounded-2xl border-2 border-green-200 shadow-inner">
                  {wa.qr ? (
                    <img src={wa.qr} alt="QR de WhatsApp" className="w-64 h-64" />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                      <FaSpinner className="animate-spin text-4xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                <FaSpinner className="animate-spin text-green-500" />
                {connecting ? "Conectando..." : "Esperando que escanees el código..."}
              </div>

              {/* Instrucciones */}
              <ol className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <Step n={1}>Abre <b>WhatsApp</b> en tu teléfono.</Step>
                <Step n={2}>
                  Toca <b>Menú</b> (⋮) o <b>Ajustes</b> → <b>Dispositivos vinculados</b>.
                </Step>
                <Step n={3}>Toca <b>Vincular un dispositivo</b>.</Step>
                <Step n={4}>Apunta la cámara a este código QR.</Step>
              </ol>

              <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                <FaMobileAlt /> El código se renueva automáticamente.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
