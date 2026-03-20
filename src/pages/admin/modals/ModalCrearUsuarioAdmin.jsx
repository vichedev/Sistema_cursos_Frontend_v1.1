// src/pages/admin/modals/ModalCrearUsuarioAdmin.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  FaUserPlus,
  FaEnvelope,
  FaUser,
  FaIdCard,
  FaPhone,
  FaLock,
  FaBook,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeName,
  sanitizeUsername,
} from "../../../utils/sanitize";

// ─── Constantes Ecuador ───────────────────────────────────────────────────────
const EC_DIAL = "+593";
const EC_DIGITS = 9; // dígitos SIN el 0 inicial (ej: 991234567)
const EC_FLAG = "🇪🇨";

// ─── Modal base — NO cierra al clickear el fondo ──────────────────────────────
function ModalBase({ children, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm">
      {/* ✅ Sin onClick en el backdrop — nunca cierra por accidente */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-xl font-bold leading-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Field wrapper con label, error y hint ────────────────────────────────────
function Field({ label, required, error, success, hint, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500">*</span>}
        {success && <FaCheckCircle className="text-green-500 text-xs ml-0.5" />}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <FaTimesCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (error) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
   bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
   ${
     error
       ? "border-red-400 dark:border-red-500"
       : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
   }`;

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ModalCrearUsuarioAdmin({
  onClose,
  onCreate,
  loading,
  error,
}) {
  const emptyForm = {
    nombres: "",
    apellidos: "",
    correo: "",
    usuario: "",
    cedula: "",
    celular: "",
    password: "",
    rol: "ADMIN",
    pais: "EC",
    asignatura: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const firstInputRef = useRef(null);

  // Foco al abrir
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Propagar errores del backend a campos
  useEffect(() => {
    if (!error) return;
    const e = error.toLowerCase();
    if (e.includes("correo"))
      setFieldErrors((p) => ({
        ...p,
        correo: "Este correo ya está registrado",
      }));
    else if (e.includes("usuario"))
      setFieldErrors((p) => ({ ...p, usuario: "Este usuario ya está en uso" }));
    else if (e.includes("cédula") || e.includes("cedula"))
      setFieldErrors((p) => ({
        ...p,
        cedula: "Esta cédula ya está registrada",
      }));
    else if (e.includes("celular") || e.includes("teléfono"))
      setFieldErrors((p) => ({
        ...p,
        celular: "Este número ya está registrado",
      }));
    else setGeneralError(error);
  }, [error]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    switch (name) {
      case "nombres":
      case "apellidos":
        v = sanitizeName(value);
        break;
      case "correo":
        v = sanitizeEmail(value);
        break;
      case "usuario":
        v = sanitizeUsername(value);
        break;
      case "cedula":
        v = sanitizeNumber(value);
        break;
      case "celular":
        v = value.replace(/\D/g, "").slice(0, EC_DIGITS);
        break;
      default:
        v = sanitizeInput(value);
    }
    setForm((f) => ({ ...f, [name]: v }));
    setTouched((t) => ({ ...t, [name]: true }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    if (generalError) setGeneralError("");
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    validateField(name, form[name]);
  };

  // ── Validación por campo ──────────────────────────────────────────────────
  const validateField = (name, value) => {
    let err = "";
    switch (name) {
      case "nombres":
        if (!value.trim()) err = "Los nombres son obligatorios";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value))
          err = "Solo letras y espacios";
        break;
      case "apellidos":
        if (!value.trim()) err = "Los apellidos son obligatorios";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value))
          err = "Solo letras y espacios";
        break;
      case "correo":
        if (!value.trim()) err = "El correo es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          err = "Correo electrónico inválido";
        break;
      case "usuario":
        if (!value.trim()) err = "El usuario es obligatorio";
        else if (value.length < 3) err = "Mínimo 3 caracteres";
        break;
      case "cedula":
        if (!value.trim()) err = "La cédula es obligatoria";
        else if (value.length !== 10) err = "Debe tener exactamente 10 dígitos";
        break;
      case "celular":
        if (!value.trim()) err = "El celular es obligatorio";
        else if (value.length !== EC_DIGITS)
          err = `Debe tener ${EC_DIGITS} dígitos (sin el 0 inicial)`;
        break;
      case "password":
        if (!value.trim()) err = "La contraseña es obligatoria";
        else if (value.length < 6) err = "Mínimo 6 caracteres";
        break;
    }
    if (err) setFieldErrors((p) => ({ ...p, [name]: err }));
    return err;
  };

  const validateAll = () => {
    const required = [
      "nombres",
      "apellidos",
      "correo",
      "usuario",
      "cedula",
      "celular",
      "password",
    ];
    const errors = {};
    required.forEach((f) => {
      const e = validateField(f, form[f]);
      if (e) errors[f] = e;
    });
    setTouched(Object.fromEntries(required.map((f) => [f, true])));
    setFieldErrors((p) => ({ ...p, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateAll()) return;

    const celularCompleto = `${EC_DIAL}${form.celular}`;

    try {
      await onCreate({ ...form, celular: celularCompleto });
      onClose();
      Swal.fire({
        icon: "success",
        title: "¡Creado!",
        text: `${form.nombres} ${form.apellidos} fue agregado correctamente`,
        timer: 2000,
        showConfirmButton: false,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#111827",
      });
    } catch {
      // El error llega por la prop `error` → useEffect lo distribuye
    }
  };

  // ── Cerrar con confirmación si hay datos escritos ─────────────────────────
  const handleClose = () => {
    const dirty = Object.entries(form).some(
      ([k, v]) => !["rol", "pais"].includes(k) && v !== "",
    );
    if (dirty) {
      Swal.fire({
        title: "¿Descartar cambios?",
        text: "Hay información sin guardar. ¿Quieres cerrar de todas formas?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "Seguir editando",
        confirmButtonColor: "#ef4444",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#111827",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) onClose();
      });
    } else {
      onClose();
    }
  };

  // ── Indicador de fortaleza de contraseña ──────────────────────────────────
  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: "Débil", color: "bg-red-500", w: "w-1/4" };
    if (s <= 2) return { label: "Regular", color: "bg-yellow-500", w: "w-2/4" };
    if (s <= 3) return { label: "Buena", color: "bg-blue-500", w: "w-3/4" };
    return { label: "Fuerte", color: "bg-green-500", w: "w-full" };
  })();

  const ok = (name) => touched[name] && !fieldErrors[name] && form[name];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ModalBase onClose={handleClose}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
          <FaUserPlus className="text-white text-xl" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Agregar Administrador / Docente
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Los campos marcados con{" "}
            <span className="text-red-500 font-bold">*</span> son obligatorios
          </p>
        </div>
      </div>

      {/* Error general del backend */}
      {generalError && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-2 text-sm text-red-700 dark:text-red-300 flex-shrink-0">
          <FaTimesCircle className="mt-0.5 flex-shrink-0" />
          {generalError}
        </div>
      )}

      {/* Formulario scrolleable */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="overflow-y-auto flex-1 px-6 py-5 space-y-4"
      >
        {/* ── Nombres y Apellidos ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nombres"
            required
            error={fieldErrors.nombres}
            success={ok("nombres")}
          >
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                ref={firstInputRef}
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                onBlur={() => handleBlur("nombres")}
                placeholder="Ej: Juan Carlos"
                className={`${inputCls(fieldErrors.nombres)} pl-9`}
              />
            </div>
          </Field>
          <Field
            label="Apellidos"
            required
            error={fieldErrors.apellidos}
            success={ok("apellidos")}
          >
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                onBlur={() => handleBlur("apellidos")}
                placeholder="Ej: Pérez García"
                className={`${inputCls(fieldErrors.apellidos)} pl-9`}
              />
            </div>
          </Field>
        </div>

        {/* ── Correo ── */}
        <Field
          label="Correo electrónico"
          required
          error={fieldErrors.correo}
          success={ok("correo")}
        >
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              onBlur={() => handleBlur("correo")}
              placeholder="correo@ejemplo.com"
              className={`${inputCls(fieldErrors.correo)} pl-9`}
            />
          </div>
        </Field>

        {/* ── Usuario y Contraseña ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Usuario"
            required
            error={fieldErrors.usuario}
            success={ok("usuario")}
            hint="Mín. 3 caracteres. Letras, números, @.-_"
          >
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
                onBlur={() => handleBlur("usuario")}
                placeholder="usuario123"
                className={`${inputCls(fieldErrors.usuario)} pl-9`}
              />
            </div>
          </Field>

          <Field label="Contraseña" required error={fieldErrors.password}>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="Mín. 6 caracteres"
                className={`${inputCls(fieldErrors.password)} pl-9 pr-10`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* Barra de fortaleza */}
            {passwordStrength && (
              <div className="mt-1.5 space-y-0.5">
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.w}`}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Seguridad:{" "}
                  <span className="font-semibold">
                    {passwordStrength.label}
                  </span>
                </p>
              </div>
            )}
          </Field>
        </div>

        {/* ── Cédula ── */}
        <Field
          label="Cédula"
          required
          error={fieldErrors.cedula}
          success={ok("cedula") && form.cedula.length === 10}
          hint="10 dígitos — solo números"
        >
          <div className="relative">
            <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              name="cedula"
              value={form.cedula}
              onChange={handleChange}
              onBlur={() => handleBlur("cedula")}
              placeholder="1234567890"
              maxLength={10}
              inputMode="numeric"
              className={`${inputCls(fieldErrors.cedula)} pl-9 pr-14`}
            />
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums
              ${form.cedula.length === 10 ? "text-green-500" : "text-gray-400"}`}
            >
              {form.cedula.length}/10
            </span>
          </div>
        </Field>

        {/* ── Celular Ecuador ── */}
        <Field
          label="Celular"
          required
          error={fieldErrors.celular}
          success={ok("celular") && form.celular.length === EC_DIGITS}
          hint={`${EC_DIGITS} dígitos sin el 0 inicial — ej: 991234567`}
        >
          <div className="flex">
            {/* Prefijo fijo Ecuador */}
            <div className="flex items-center gap-2 px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-xl bg-gray-50 dark:bg-gray-700/60 select-none flex-shrink-0">
              <span className="text-base leading-none">{EC_FLAG}</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                {EC_DIAL}
              </span>
            </div>
            {/* Input dígitos */}
            <div className="relative flex-1">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                name="celular"
                value={form.celular}
                onChange={handleChange}
                onBlur={() => handleBlur("celular")}
                placeholder="991234567"
                maxLength={EC_DIGITS}
                inputMode="numeric"
                className={`w-full pl-9 pr-14 py-2.5 text-sm border rounded-r-xl rounded-l-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400
                  ${
                    fieldErrors.celular
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
              />
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums
                ${form.celular.length === EC_DIGITS ? "text-green-500" : "text-gray-400"}`}
              >
                {form.celular.length}/{EC_DIGITS}
              </span>
            </div>
          </div>
          {/* Preview número completo */}
          {form.celular.length > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Número completo:{" "}
              <span
                className={`font-mono font-medium ${form.celular.length === EC_DIGITS ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-300"}`}
              >
                {EC_DIAL}
                {form.celular}
              </span>
            </p>
          )}
        </Field>

        {/* ── Asignatura (opcional) ── */}
        <Field
          label="Asignatura que imparte"
          hint="Opcional — puedes completarlo después"
        >
          <div className="relative">
            <FaBook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              name="asignatura"
              value={form.asignatura}
              onChange={handleChange}
              placeholder="Ej: Matemáticas, Seguridad Industrial…"
              className={`${inputCls("")} pl-9`}
            />
          </div>
        </Field>

        {/* ── Botones ── */}
        <div className="flex gap-3 pt-2 pb-1">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-blue-300/40 active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creando...
              </>
            ) : (
              <>
                <FaUserPlus />
                Crear Administrador
              </>
            )}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
