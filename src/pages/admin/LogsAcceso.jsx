// src/pages/admin/LogsAcceso.jsx
// Monitoreo de intentos de inicio de sesión (éxitos y problemas de acceso).
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosInstance";
import { swError, swSuccess } from "../../utils/swalConfig";
import { useDebounce } from "use-debounce";
import {
  FaSignInAlt,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaUserShield,
  FaUserGraduate,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";

const MOTIVO_META = {
  "Ingreso correcto": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Contraseña incorrecta": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Usuario no encontrado": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Cuenta no verificada": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

const fmtFecha = (d) => {
  try {
    return new Date(d).toLocaleString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export default function LogsAcceso() {
  const [logs, setLogs] = useState([]);
  const [resumen, setResumen] = useState({ totalIntentos: 0, fallidos: 0, exitosos: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 350);
  const [estado, setEstado] = useState("todos");
  const [rol, setRol] = useState("");
  const [contacting, setContacting] = useState(null); // `${id}-${canal}`

  const contactar = async (log, canal) => {
    setContacting(`${log.id}-${canal}`);
    try {
      const { data } = await api.post(`/api/auth/access-logs/${log.id}/contact`, { canal });
      swSuccess(
        canal === "whatsapp" ? "WhatsApp enviado" : "Correo enviado",
        data.message,
      );
    } catch (e) {
      swError("No se pudo contactar", e.response?.data?.message || e.message);
    } finally {
      setContacting(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/auth/access-logs", {
        params: { page, limit: 20, search: debouncedSearch, estado, rol },
      });
      setLogs(data.data || []);
      setTotalPages(data.totalPages || 1);
      setResumen(data.resumen || { totalIntentos: 0, fallidos: 0, exitosos: 0 });
    } catch (e) {
      swError("No se pudieron cargar los logs", e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, estado, rol]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estado, rol]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      {/* Header */}
      <div className="mb-6 rounded-2xl p-6 md:p-7 text-white shadow-lg bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaSignInAlt /> Logs de acceso
          </h1>
          <p className="text-slate-300 mt-1.5 text-sm">
            Monitorea ingresos y detecta quién tiene problemas para entrar (contraseña, verificación…).
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold text-sm"
        >
          <FaSync /> Actualizar
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard icon={<FaSignInAlt />} label="Intentos totales" value={resumen.totalIntentos} tone="blue" />
        <StatCard icon={<FaCheckCircle />} label="Exitosos" value={resumen.exitosos} tone="green" />
        <StatCard icon={<FaTimesCircle />} label="Con problemas" value={resumen.fallidos} tone="rose" />
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, correo o nombre..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="todos">Todos</option>
          <option value="exito">Solo exitosos</option>
          <option value="fallido">Solo con problemas</option>
        </select>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="ESTUDIANTE">Estudiantes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <FaSpinner className="animate-spin mr-2" /> Cargando logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaSignInAlt className="mx-auto text-4xl mb-3 opacity-40" />
            <p>No hay registros con esos filtros.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Usuario</th>
                    <th className="text-left font-semibold px-4 py-3">Rol</th>
                    <th className="text-left font-semibold px-4 py-3">Resultado</th>
                    <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">IP</th>
                    <th className="text-left font-semibold px-4 py-3">Fecha</th>
                    <th className="text-left font-semibold px-4 py-3">Ayuda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              l.exito
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
                            }`}
                          >
                            {l.exito ? <FaCheckCircle /> : <FaTimesCircle />}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                              {l.nombres || l.identificador}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{l.identificador}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {l.rol ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {l.rol === "ADMIN" ? (
                              <FaUserShield className="text-blue-500" />
                            ) : (
                              <FaUserGraduate className="text-emerald-500" />
                            )}
                            {l.rol}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            MOTIVO_META[l.motivo] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {l.motivo}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 font-mono text-xs">
                        {l.ip || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                        {fmtFecha(l.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {l.exito ? (
                          <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => contactar(l, "email")}
                              disabled={!l.correo || contacting === `${l.id}-email`}
                              title={l.correo ? `Enviar correo de ayuda a ${l.correo}` : "Sin correo registrado"}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {contacting === `${l.id}-email` ? (
                                <FaSpinner className="animate-spin" size={12} />
                              ) : (
                                <FaEnvelope size={12} />
                              )}
                            </button>
                            <button
                              onClick={() => contactar(l, "whatsapp")}
                              disabled={!l.celular || contacting === `${l.id}-whatsapp`}
                              title={l.celular ? `Escribir por WhatsApp a ${l.celular}` : "Sin WhatsApp registrado"}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {contacting === `${l.id}-whatsapp` ? (
                                <FaSpinner className="animate-spin" size={12} />
                              ) : (
                                <FaWhatsapp size={13} />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400">Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        💡 Si un estudiante aparece varias veces con "Contraseña incorrecta" o "Cuenta no verificada",
        probablemente necesita ayuda — puedes contactarlo o reenviarle la verificación.
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, tone }) {
  const map = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-3">
      <span className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg ${map[tone]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </div>
  );
}
