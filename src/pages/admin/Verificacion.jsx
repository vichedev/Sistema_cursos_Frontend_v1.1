// src/pages/admin/Verificacion.jsx
// Módulo de Verificación: gestiona los estudiantes "problemáticos" (sin verificar,
// con correo inválido/dudoso o suspendidos). Los correctos viven en Usuarios Inscritos.
// Diseño alineado con el resto de módulos (banner azul + cuerpo en tarjeta blanca).
import { useState, useEffect, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../utils/axiosInstance";
import {
  FaShieldAlt,
  FaArrowLeft,
  FaSearch,
  FaUserCheck,
  FaUserSlash,
  FaUserShield,
  FaEnvelopeOpenText,
  FaWhatsapp,
  FaEnvelope,
  FaTrash,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

const DIAS_LIMITE = 7; // días sin verificar antes de la eliminación automática

const isDarkMode = () => document.documentElement.classList.contains("dark");
const swalBase = () => ({
  background: isDarkMode() ? "#1f2937" : "#fff",
  color: isDarkMode() ? "#f9fafb" : "#111827",
});

// Clasifica el problema principal de un estudiante
function clasificar(u) {
  if (u.suspendido) return "suspendido";
  if (u.emailEstado === "invalido") return "correo_invalido";
  if (!u.emailVerified) return "sin_verificar";
  if (u.emailEstado === "riesgoso") return "correo_dudoso";
  return "ok";
}

// Días restantes antes de eliminación automática (solo sin verificar)
function diasRestantes(u) {
  if (!u.emailVerificationSentAt) return null;
  const enviado = new Date(u.emailVerificationSentAt).getTime();
  const limite = enviado + DIAS_LIMITE * 24 * 60 * 60 * 1000;
  const ms = limite - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function ProblemaBadge({ tipo }) {
  const map = {
    suspendido: { cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", label: "⛔ Suspendida" },
    correo_invalido: { cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400", label: "❌ Correo inválido" },
    sin_verificar: { cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400", label: "✉️ Sin verificar" },
    correo_dudoso: { cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", label: "⚠️ Correo dudoso" },
  };
  const m = map[tipo] || { cls: "bg-gray-100 text-gray-500", label: "—" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function Verificacion() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [verifyingBulk, setVerifyingBulk] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get("/api/users/usuarios-por-rol", { timeout: 12000 })
      .then((res) => {
        const arr = Array.isArray(res.data.estudiantes)
          ? res.data.estudiantes
          : Object.values(res.data.estudiantes || {});
        const problematicos = arr.filter(
          (u) => !(u.emailVerified && !u.suspendido && u.emailEstado !== "invalido"),
        );
        setEstudiantes(problematicos);
      })
      .catch(() => setEstudiantes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const s = { sin_verificar: 0, correo_invalido: 0, correo_dudoso: 0, suspendido: 0 };
    estudiantes.forEach((u) => {
      const t = clasificar(u);
      if (s[t] !== undefined) s[t]++;
    });
    return s;
  }, [estudiantes]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return estudiantes.filter((u) => {
      const t = clasificar(u);
      if (filtro !== "todos" && t !== filtro) return false;
      if (!q) return true;
      return (
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(q) ||
        (u.correo || "").toLowerCase().includes(q) ||
        (u.cedula || "").toLowerCase().includes(q)
      );
    });
  }, [estudiantes, search, filtro]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const verificarCuenta = async (u) => {
    const { isConfirmed } = await Swal.fire({
      icon: "question",
      title: "¿Verificar cuenta manualmente?",
      html: `<b>${u.nombres} ${u.apellidos}</b><br><span style="font-size:.85rem">${u.correo}</span>`,
      showCancelButton: true,
      confirmButtonText: "Sí, verificar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      ...swalBase(),
    });
    if (!isConfirmed) return;
    try {
      await api.post(`/api/auth/admin/verify-user/${u.id}`);
      Swal.fire({ icon: "success", title: "Cuenta verificada", timer: 1600, showConfirmButton: false, ...swalBase() });
      fetchData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudo verificar", ...swalBase() });
    }
  };

  const verificarTodos = async () => {
    const ids = estudiantes.filter((u) => !u.emailVerified).map((u) => u.id);
    if (ids.length === 0) return;
    const { isConfirmed } = await Swal.fire({
      icon: "question",
      title: `¿Verificar ${ids.length} cuenta${ids.length === 1 ? "" : "s"}?`,
      text: "Se marcarán como verificadas todas las cuentas pendientes.",
      showCancelButton: true,
      confirmButtonText: "Sí, verificar todas",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      ...swalBase(),
    });
    if (!isConfirmed) return;
    setVerifyingBulk(true);
    try {
      await api.post("/api/auth/admin/verify-users", { ids });
      Swal.fire({ icon: "success", title: "Cuentas verificadas", timer: 1800, showConfirmButton: false, ...swalBase() });
      fetchData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudieron verificar", ...swalBase() });
    } finally {
      setVerifyingBulk(false);
    }
  };

  const validarCorreo = async (u) => {
    Swal.fire({ title: "Verificando correo…", didOpen: () => Swal.showLoading(), allowOutsideClick: false, ...swalBase() });
    try {
      const { data } = await api.post(`/api/users/${u.id}/validate-email`);
      const r = data.data;
      const icon = r.estado === "valido" ? "success" : r.estado === "riesgoso" ? "warning" : "error";
      Swal.fire({
        icon,
        title: r.estado === "valido" ? "Correo real ✅" : r.estado === "riesgoso" ? "Correo dudoso ⚠️" : "Correo inválido ❌",
        html: `<p style="font-size:.9rem"><b>${u.correo}</b><br>${r.razon}</p>`,
        ...swalBase(),
      });
      fetchData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudo verificar", ...swalBase() });
    }
  };

  const suspender = async (u) => {
    const { value: motivo, isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Suspender cuenta",
      html: `<b>${u.nombres} ${u.apellidos}</b><br><span style="font-size:.85rem">${u.correo}</span>`,
      input: "text",
      inputLabel: "Motivo (lo verá el usuario al intentar entrar)",
      inputValue: "Datos pendientes de revalidación. Contacta a soporte.",
      showCancelButton: true,
      confirmButtonText: "Suspender",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f59e0b",
      ...swalBase(),
    });
    if (!isConfirmed) return;
    try {
      await api.post(`/api/users/${u.id}/suspender`, { motivo });
      Swal.fire({ icon: "success", title: "Cuenta suspendida", timer: 1600, showConfirmButton: false, ...swalBase() });
      fetchData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudo suspender", ...swalBase() });
    }
  };

  const reactivar = async (u) => {
    const { isConfirmed } = await Swal.fire({
      icon: "question",
      title: "¿Reactivar cuenta?",
      html: `<b>${u.nombres} ${u.apellidos}</b>`,
      showCancelButton: true,
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      ...swalBase(),
    });
    if (!isConfirmed) return;
    try {
      await api.post(`/api/users/${u.id}/reactivar`);
      Swal.fire({ icon: "success", title: "Cuenta reactivada", timer: 1600, showConfirmButton: false, ...swalBase() });
      fetchData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudo reactivar", ...swalBase() });
    }
  };

  const solicitarCorreo = async (u, canal) => {
    try {
      await api.post(`/api/users/${u.id}/solicitar-correo`, { canal });
      Swal.fire({
        icon: "success",
        title: canal === "whatsapp" ? "WhatsApp enviado" : "Correo enviado",
        text: "Se solicitó al estudiante actualizar su correo.",
        timer: 1900,
        showConfirmButton: false,
        ...swalBase(),
      });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudo contactar", ...swalBase() });
    }
  };

  const eliminar = async (u) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar estudiante?",
      html: `Se eliminará <b>${u.nombres} ${u.apellidos}</b> del sistema.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      ...swalBase(),
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/api/users/${u.id}`);
      Swal.fire({ icon: "success", title: "Eliminado", timer: 1500, showConfirmButton: false, ...swalBase() });
      fetchData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.response?.data?.message || "No se pudo eliminar", ...swalBase() });
    }
  };

  const filtros = [
    { key: "todos", label: "Todos", count: estudiantes.length },
    { key: "sin_verificar", label: "Sin verificar", count: stats.sin_verificar },
    { key: "correo_invalido", label: "Correo inválido", count: stats.correo_invalido },
    { key: "correo_dudoso", label: "Correo dudoso", count: stats.correo_dudoso },
    { key: "suspendido", label: "Suspendidas", count: stats.suspendido },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 transition-colors duration-200">
      {/* Header (banner azul, estilo del módulo) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-xl mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm flex-shrink-0">
              <FaShieldAlt className="text-lg sm:text-xl md:text-2xl lg:text-3xl" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">Verificación</h1>
              <p className="text-blue-100 text-xs sm:text-sm md:text-base">
                Estudiantes sin verificar, con correo inválido o suspendidos
              </p>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = "/admin/dashboard")}
            className="self-start lg:self-auto flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl transition backdrop-blur-sm text-xs sm:text-sm md:text-base font-medium"
          >
            <FaArrowLeft className="text-xs sm:text-sm md:text-base flex-shrink-0" />
            <span className="whitespace-nowrap">Volver al Dashboard</span>
          </button>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-200 min-h-[600px]">
        {/* Alerta: estudiantes sin verificar + verificar todos */}
        {stats.sin_verificar > 0 && (
          <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                <FaExclamationTriangle />
              </span>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                  Hay {stats.sin_verificar} estudiante{stats.sin_verificar === 1 ? "" : "s"} sin verificar
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  Verifícalos en un clic o revisa solo los pendientes.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltro(filtro === "sin_verificar" ? "todos" : "sin_verificar")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
              >
                {filtro === "sin_verificar" ? "Ver todos" : "Ver solo pendientes"}
              </button>
              <button
                onClick={verificarTodos}
                disabled={verifyingBulk}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-60"
              >
                {verifyingBulk ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaUserCheck />
                )}
                Verificar todos ({stats.sin_verificar})
              </button>
            </div>
          </div>
        )}

        {/* Aviso auto-eliminación */}
        <div className="mb-5 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <FaClock className="mt-0.5 flex-shrink-0" />
          <span>
            Las cuentas <b>sin verificar</b> se eliminan automáticamente (de forma lógica) a los <b>{DIAS_LIMITE} días</b> de su registro.
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard icon={<FaEnvelope />} label="Sin verificar" value={stats.sin_verificar} color="bg-orange-500" />
          <StatCard icon={<FaExclamationTriangle />} label="Correo inválido" value={stats.correo_invalido} color="bg-red-500" />
          <StatCard icon={<FaExclamationTriangle />} label="Correo dudoso" value={stats.correo_dudoso} color="bg-yellow-500" />
          <StatCard icon={<FaUserSlash />} label="Suspendidas" value={stats.suspendido} color="bg-amber-500" />
        </div>

        {/* Buscador + filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o cédula…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filtros.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  filtro === f.key
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">Cargando…</div>
        ) : visibles.length === 0 ? (
          <div className="text-center py-16">
            <FaShieldAlt className="mx-auto text-4xl text-green-500 mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-semibold">¡Todo en orden!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay estudiantes pendientes de verificación.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibles.map((u) => {
              const tipo = clasificar(u);
              const dias = tipo === "sin_verificar" ? diasRestantes(u) : null;
              return (
                <div
                  key={u.id}
                  className="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {u.nombres} {u.apellidos}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.correo}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {u.pais || "—"} · {u.celular || "sin celular"}
                      </p>
                    </div>
                    <ProblemaBadge tipo={tipo} />
                  </div>

                  {u.suspendido && u.motivoSuspension && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1">
                      Motivo: {u.motivoSuspension}
                    </p>
                  )}

                  {dias !== null && (
                    <p
                      className={`text-xs rounded-lg px-2 py-1 ${
                        dias <= 2
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                          : "bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {dias > 0
                        ? `Se elimina automáticamente en ${dias} día${dias === 1 ? "" : "s"}`
                        : "Pendiente de eliminación automática"}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {!u.emailVerified && (
                      <button
                        onClick={() => verificarCuenta(u)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/30"
                        title="Verificar cuenta manualmente"
                      >
                        <FaUserCheck /> Verificar
                      </button>
                    )}
                    <button
                      onClick={() => validarCorreo(u)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/30"
                      title="Verificar si el correo es real"
                    >
                      <FaEnvelopeOpenText /> Correo
                    </button>
                    {u.suspendido ? (
                      <button
                        onClick={() => reactivar(u)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30"
                        title="Reactivar cuenta"
                      >
                        <FaUserShield /> Reactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => suspender(u)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/30"
                        title="Suspender cuenta"
                      >
                        <FaUserSlash /> Suspender
                      </button>
                    )}
                    <button
                      onClick={() => solicitarCorreo(u, "email")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                      title="Pedir correo válido por email"
                    >
                      <FaEnvelope /> Pedir
                    </button>
                    <button
                      onClick={() => solicitarCorreo(u, "whatsapp")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30"
                      title="Pedir correo válido por WhatsApp"
                    >
                      <FaWhatsapp /> WhatsApp
                    </button>
                    <button
                      onClick={() => eliminar(u)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30"
                      title="Eliminar estudiante"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
