// src/components/admin/CursoFormUI.jsx
// Componentes de UI reutilizables para los formularios de Crear/Editar curso.
// Solo presentación — la lógica vive en cada página.
import { useState, useRef, useEffect } from "react";
import { FiClock, FiChevronDown } from "react-icons/fi";

// Input base consistente y profesional
export const inputCls = (error) =>
  `w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border text-sm text-gray-800 dark:text-gray-100 shadow-sm transition placeholder-gray-400 focus:outline-none focus:ring-2 ${
    error
      ? "border-red-400 focus:ring-red-300"
      : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400"
  }`;

const ACCENTS = {
  blue: { ring: "from-blue-500/10 to-indigo-500/10", icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" },
  amber: { ring: "from-amber-500/10 to-orange-500/10", icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300" },
  purple: { ring: "from-purple-500/10 to-pink-500/10", icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300" },
  green: { ring: "from-emerald-500/10 to-teal-500/10", icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300" },
  indigo: { ring: "from-indigo-500/10 to-blue-500/10", icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300" },
};

// Tarjeta de sección con encabezado e icono
export function FormCard({ icon, title, subtitle, accent = "blue", children, action }) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <header className={`flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r ${a.ring}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-9 h-9 flex items-center justify-center rounded-xl ${a.icon}`}>{icon}</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  );
}

// Etiqueta + control + error + ayuda
export function Field({ label, icon, error, hint, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-center gap-2 mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">⚠️ {error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

// Toggle profesional (switch)
export function Toggle({ checked, onChange, label, desc, color = "blue" }) {
  const on = { blue: "bg-blue-500", green: "bg-green-500" }[color] || "bg-blue-500";
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition text-left"
    >
      <span className={`relative w-11 h-6 rounded-full flex-shrink-0 transition ${checked ? on : "bg-gray-300 dark:bg-gray-600"}`}>
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        {desc && <span className="block text-xs text-gray-400 dark:text-gray-500">{desc}</span>}
      </span>
    </button>
  );
}

// Selector de hora (popover con horas y minutos) — autónomo
export function TimeField({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const [h, m] = value ? value.split(":") : ["", ""];
  const setH = (hh) => onChange(`${hh}:${m || "00"}`);
  const setM = (mm) => onChange(`${h || "00"}:${mm}`);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`${inputCls(error)} flex items-center justify-between`}
      >
        <span className={value ? "" : "text-gray-400"}>
          <FiClock className="inline mr-2 -mt-0.5 text-gray-400" />
          {value || "Seleccionar hora"}
        </span>
        <FiChevronDown className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Horas</label>
              <select
                value={h || "00"}
                onChange={(e) => setH(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const v = String(i).padStart(2, "0");
                  return <option key={v} value={v}>{v}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutos</label>
              <select
                value={m || "00"}
                onChange={(e) => setM(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
              >
                {["00", "15", "30", "45"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => { onChange(""); }} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Limpiar
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos estáticos por tipo de cupón (evita clases dinámicas que Tailwind purga)
export function cuponStyle(tipo) {
  return (
    {
      PORCENTAJE_10: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      PORCENTAJE_15: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      PORCENTAJE_30: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      PORCENTAJE_50: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      GRATIS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    }[tipo] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
  );
}

// Modal compartido para crear un cupón (presentación)
export function CuponModal({
  nuevoCupon,
  setNuevoCupon,
  generarCodigoCupon,
  getTipoCuponTexto,
  calcularPrecioConDescuento,
  precio,
  onClose,
  onCreate,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Crear cupón — {getTipoCuponTexto(nuevoCupon.tipo)}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Código del cupón</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoCupon.codigo}
                onChange={(e) => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value.toUpperCase() })}
                className={inputCls(false)}
                placeholder="EJEMPLO123"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setNuevoCupon({ ...nuevoCupon, codigo: generarCodigoCupon() })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Generar nuevo código"
              >
                🔄
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">¿Cuántas personas pueden usarlo?</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={nuevoCupon.usosMaximos}
              onChange={(e) => setNuevoCupon({ ...nuevoCupon, usosMaximos: parseInt(e.target.value) || 1 })}
              className={inputCls(false)}
              placeholder="Ej: 5, 10, 50..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Fecha de expiración (opcional)</label>
            <input
              type="date"
              value={nuevoCupon.fechaExpiracion}
              onChange={(e) => setNuevoCupon({ ...nuevoCupon, fechaExpiracion: e.target.value })}
              className={inputCls(false)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Precio original:</span><span className="font-medium">${precio?.toFixed(2) || "0.00"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Con descuento:</span><span className="font-medium text-green-600 dark:text-green-400">${calcularPrecioConDescuento(nuevoCupon.tipo).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span className="text-gray-700 dark:text-gray-200">Ahorro:</span><span className="text-green-600 dark:text-green-400">${((precio || 0) - calcularPrecioConDescuento(nuevoCupon.tipo)).toFixed(2)}</span></div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
              Cancelar
            </button>
            <button type="button" onClick={onCreate} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">
              Crear cupón
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
