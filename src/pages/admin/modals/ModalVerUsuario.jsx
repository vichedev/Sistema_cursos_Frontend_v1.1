// src/pages/admin/modals/ModalVerUsuario.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaBook,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";

// ─── helpers ──────────────────────────────────────────────────────────────────
const COUNTRY_FLAGS = {
  EC: "🇪🇨",
  CO: "🇨🇴",
  AR: "🇦🇷",
  PE: "🇵🇪",
  CL: "🇨🇱",
  BO: "🇧🇴",
  PY: "🇵🇾",
  UY: "🇺🇾",
  VE: "🇻🇪",
  MX: "🇲🇽",
  GT: "🇬🇹",
  HN: "🇭🇳",
  SV: "🇸🇻",
  NI: "🇳🇮",
  CR: "🇨🇷",
  PA: "🇵🇦",
  DO: "🇩🇴",
  CU: "🇨🇺",
  BR: "🇧🇷",
  PR: "🇵🇷",
  US: "🇺🇸",
  ES: "🇪🇸",
};
const COUNTRY_NAMES = {
  EC: "Ecuador",
  CO: "Colombia",
  AR: "Argentina",
  PE: "Perú",
  CL: "Chile",
  BO: "Bolivia",
  PY: "Paraguay",
  UY: "Uruguay",
  VE: "Venezuela",
  MX: "México",
  GT: "Guatemala",
  HN: "Honduras",
  SV: "El Salvador",
  NI: "Nicaragua",
  CR: "Costa Rica",
  PA: "Panamá",
  DO: "República Dominicana",
  CU: "Cuba",
  BR: "Brasil",
  PR: "Puerto Rico",
  US: "Estados Unidos",
  ES: "España",
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// ─── Modal base — sin cierre por backdrop ─────────────────────────────────────
function ModalBase({ children, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xl font-bold leading-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Fila de dato ─────────────────────────────────────────────────────────────
function DataRow({ icon, label, value, full = false }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 ${full ? "sm:col-span-2" : ""}`}
    >
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ ok, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${
        ok
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      }`}
    >
      {ok ? (
        <FaCheckCircle className="text-xs" />
      ) : (
        <FaTimesCircle className="text-xs" />
      )}
      {label}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ModalVerUsuario({
  user,
  onClose,
  loading,
  error,
  onVerifyAccount,
}) {
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [isVerified, setIsVerified] = useState(user?.emailVerified ?? false);

  if (loading)
    return (
      <ModalBase onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">
            Cargando usuario...
          </p>
        </div>
      </ModalBase>
    );

  if (error || !user?.id)
    return (
      <ModalBase onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FaTimesCircle className="text-red-500 text-4xl" />
          <p className="text-red-600 dark:text-red-400 font-medium">
            {error || "Usuario no encontrado"}
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>
      </ModalBase>
    );

  const isAdmin = user.rol === "ADMIN";

  const handleVerify = async () => {
    if (!onVerifyAccount) return;
    setVerifying(true);
    setVerifyMsg("");
    try {
      await onVerifyAccount(user.id);
      setIsVerified(true);
      setVerifyMsg("✅ Cuenta verificada exitosamente");
    } catch (e) {
      setVerifyMsg(`❌ ${e.message}`);
    } finally {
      setVerifying(false);
    }
  };

  // Avatar iniciales
  const initials =
    `${user.nombres?.[0] ?? ""}${user.apellidos?.[0] ?? ""}`.toUpperCase();
  const roleColor = isAdmin
    ? "from-blue-600 to-blue-700"
    : "from-emerald-500 to-emerald-600";

  return (
    <ModalBase onClose={onClose}>
      {/* ── Header con avatar ── */}
      <div
        className={`px-6 pt-6 pb-5 bg-gradient-to-r ${roleColor} rounded-t-2xl flex items-center gap-4 flex-shrink-0`}
      >
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white leading-tight truncate">
            {user.nombres} {user.apellidos}
            {user.id === 1 && (
              <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold align-middle">
                MASTER
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
              {user.rol}
            </span>
            <Badge
              ok={user.activo}
              label={user.activo ? "Activo" : "Inactivo"}
            />
            <Badge
              ok={isVerified}
              label={isVerified ? "Verificado" : "Sin verificar"}
            />
          </div>
        </div>
      </div>

      {/* ── Datos scrolleables ── */}
      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {/* Datos personales */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Datos personales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DataRow icon={<FaIdCard />} label="ID" value={String(user.id)} />
            <DataRow icon={<FaUser />} label="Cédula" value={user.cedula} />
            <DataRow icon={<FaUser />} label="Nombres" value={user.nombres} />
            <DataRow
              icon={<FaUser />}
              label="Apellidos"
              value={user.apellidos}
            />
            <DataRow
              icon={<FaGlobe />}
              label="País"
              value={
                user.pais ? (
                  <span className="flex items-center gap-2">
                    {COUNTRY_FLAGS[user.pais] || "🌎"}{" "}
                    {COUNTRY_NAMES[user.pais] || user.pais}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <DataRow
              icon={<FaMapMarkerAlt />}
              label="Ciudad"
              value={user.ciudad}
            />
          </div>
        </section>

        {/* Contacto */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Contacto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DataRow
              icon={<FaEnvelope />}
              label="Correo"
              value={user.correo}
              full
            />
            <DataRow icon={<FaPhone />} label="Celular" value={user.celular} />
            <DataRow icon={<FaUser />} label="Usuario" value={user.usuario} />
          </div>
        </section>

        {/* Laboral */}
        {(user.empresa || user.cargo || user.asignatura) && (
          <section>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Información laboral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.empresa && (
                <DataRow
                  icon={<FaBuilding />}
                  label="Empresa"
                  value={user.empresa}
                />
              )}
              {user.cargo && (
                <DataRow
                  icon={<FaBriefcase />}
                  label="Cargo"
                  value={user.cargo}
                />
              )}
              {user.asignatura && (
                <DataRow
                  icon={<FaBook />}
                  label="Asignatura"
                  value={user.asignatura}
                />
              )}
            </div>
          </section>
        )}

        {/* Estado de cuenta */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Estado de cuenta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DataRow
              icon={<FaShieldAlt />}
              label="Verificación de correo"
              value={
                <Badge
                  ok={isVerified}
                  label={isVerified ? "Verificado" : "No verificado"}
                />
              }
            />
            <DataRow
              icon={<FaShieldAlt />}
              label="Estado cuenta"
              value={
                <Badge
                  ok={user.activo}
                  label={user.activo ? "Activa" : "Inactiva"}
                />
              }
            />
            <DataRow
              icon={<FaClock />}
              label="Verificación enviada"
              value={formatDate(user.emailVerificationSentAt)}
            />
            <DataRow
              icon={<FaCalendarAlt />}
              label="Creado el"
              value={formatDate(user.createdAt)}
            />
            <DataRow
              icon={<FaCalendarAlt />}
              label="Última actualización"
              value={formatDate(user.updatedAt)}
              full
            />
          </div>
        </section>

        {/* Verificación manual */}
        {!isVerified && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-yellow-200 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300 mt-0.5">
                ⚠️
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  Cuenta sin verificar
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                  Puedes verificar la cuenta del usuario manualmente.
                </p>
              </div>
            </div>
            {verifyMsg && (
              <div
                className={`mb-3 p-2 rounded-lg text-xs font-medium ${verifyMsg.includes("✅") ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}
              >
                {verifyMsg}
              </div>
            )}
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {verifying ? (
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />{" "}
                  Verificando...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Verificar cuenta automáticamente
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-colors"
        >
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}
