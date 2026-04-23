import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { useNotifications } from "../../context/NotificationContext";
import {
  FaGraduationCap,
  FaCheckCircle,
  FaCoins,
  FaBookOpen,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaChartLine,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
  FaLink,
  FaTimes,
  FaBell,
  FaRocket,
  FaFire,
  FaArrowRight,
  FaAward,
} from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

// ─── Date helpers ─────────────────────────────────────────────────────────────
function normalizeDate(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function areDatesEqual(d1, d2) {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${gradient}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-75 truncate">{label}</p>
          <p className="text-3xl font-black mt-1 leading-none">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          {React.cloneElement(icon, { className: "text-lg text-white" })}
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
    </div>
  );
}

// ─── Calendario compacto ──────────────────────────────────────────────────────
function CalendarioCompacto({ cursos }) {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const diasDelMes = useMemo(() => {
    const primerDia = new Date(añoActual, mesActual, 1);
    const ultimoDia = new Date(añoActual, mesActual + 1, 0);
    const dias = [];
    let diaInicio = primerDia.getDay();
    diaInicio = diaInicio === 0 ? 7 : diaInicio;
    for (let i = diaInicio - 1; i > 0; i--) {
      dias.push({ fecha: new Date(añoActual, mesActual, 1 - i), esDelMes: false, cursos: [] });
    }
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fecha = new Date(añoActual, mesActual, i);
      dias.push({
        fecha,
        esDelMes: true,
        cursos: cursos.filter((c) => c.fecha && areDatesEqual(normalizeDate(c.fecha), fecha)),
      });
    }
    while (dias.length % 7 !== 0) {
      const last = dias[dias.length - 1].fecha;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      dias.push({ fecha: next, esDelMes: false, cursos: [] });
    }
    return dias;
  }, [mesActual, añoActual, cursos]);

  const esHoy = (fecha) => {
    const hoy = new Date();
    return (
      new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())).getTime() ===
      new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())).getTime()
    );
  };

  const prevMonth = () => {
    const d = new Date(añoActual, mesActual - 1, 1);
    setMesActual(d.getMonth());
    setAñoActual(d.getFullYear());
    setDiaSeleccionado(null);
  };
  const nextMonth = () => {
    const d = new Date(añoActual, mesActual + 1, 1);
    setMesActual(d.getMonth());
    setAñoActual(d.getFullYear());
    setDiaSeleccionado(null);
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500" />
          Próximas clases
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors">
            <FaChevronLeft className="text-xs" />
          </button>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
            {new Date(añoActual, mesActual).toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()}
          </span>
          <button onClick={nextMonth}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors">
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {diasDelMes.map((dia, i) => (
          <button
            key={i}
            onClick={() => dia.cursos.length > 0 && setDiaSeleccionado(dia)}
            type="button"
            className={`min-h-[38px] p-0.5 rounded-lg flex flex-col justify-start items-center transition-all duration-150
              ${dia.esDelMes
                ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                : "bg-transparent border border-transparent text-gray-300 dark:text-gray-600"}
              ${esHoy(dia.fecha) ? "!border-2 !border-blue-500 dark:!border-blue-400 shadow-sm" : ""}
              ${dia.cursos.length > 0 ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer" : "cursor-default"}
            `}
          >
            <span className={`text-[11px] font-bold leading-tight pt-0.5 ${
              esHoy(dia.fecha) ? "text-blue-600 dark:text-blue-400" :
              dia.esDelMes ? "text-gray-700 dark:text-gray-300" : ""
            }`}>
              {dia.esDelMes ? dia.fecha.getDate() : ""}
            </span>
            {dia.cursos.length > 0 && (
              <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                {dia.cursos.slice(0, 2).map((c, j) => (
                  <span key={j} className={`w-1 h-1 rounded-full ${isCourseExpired(c) ? "bg-red-400" : "bg-green-500"}`} />
                ))}
                {dia.cursos.length > 2 && <span className="w-1 h-1 rounded-full bg-blue-400" />}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Day detail modal */}
      {diaSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDiaSeleccionado(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold capitalize">
                    {diaSeleccionado.fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                  </h4>
                  <p className="text-blue-100 text-sm">{diaSeleccionado.cursos.length} clase(s) programada(s)</p>
                </div>
                <button onClick={() => setDiaSeleccionado(null)} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {diaSeleccionado.cursos.map((curso) => {
                const expired = isCourseExpired(curso);
                return (
                  <div key={curso.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                    <h5 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 text-sm">
                      <FaVideo className="flex-shrink-0" />{curso.titulo}
                    </h5>
                    <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <p className="flex items-center gap-2"><FaClock className="flex-shrink-0" />{curso.hora ? curso.hora.substring(0, 5) : "Hora no definida"}</p>
                      <p className="flex items-center gap-2"><FaUser className="flex-shrink-0" />{curso.profesorNombre || "Docente no especificado"}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                      {expired ? (
                        <span className="text-xs text-red-500 font-semibold">⏱ Curso finalizado</span>
                      ) : curso.link ? (
                        <button onClick={() => window.open(curso.link, "_blank", "noopener,noreferrer")}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
                          <FaLink size={10} />Ir a la clase
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Enlace próximamente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DataGeneralEstudiante() {
  const [loading, setLoading] = useState(true);
  const [misCursos, setMisCursos] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [userData, setUserData] = useState(null);

  const { newCourseNotifications, markAsRead, markAllRead } = useNotifications();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      try {
        const [userRes, misRes, dispRes] = await Promise.allSettled([
          api.get(`/api/users/${userId}`),
          api.get(`/api/courses/mis-cursos`),
          api.get(`/api/courses/disponibles`),
        ]);
        if (userRes.status === "fulfilled") setUserData(userRes.value.data);
        if (misRes.status === "fulfilled") setMisCursos(misRes.value.data?.data || misRes.value.data || []);
        if (dispRes.status === "fulfilled") setDisponibles(dispRes.value.data?.data || dispRes.value.data || []);
      } catch (e) {
        console.error("Error dashboard estudiante:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpis = useMemo(() => {
    const activos     = misCursos.filter((c) => c.activo && !isCourseExpired(c)).length;
    const finalizados = misCursos.filter((c) => isCourseExpired(c)).length;
    const pagados     = misCursos.filter((c) => Number(c.precio) > 0).length;
    const gratuitos   = misCursos.filter((c) => Number(c.precio) === 0).length;
    const diplomas    = misCursos.filter((c) => c.diplomaCodigo).length;
    return { activos, finalizados, pagados, gratuitos, diplomas, total: misCursos.length };
  }, [misCursos]);

  const cursosRecientes = useMemo(
    () => [...misCursos].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    [misCursos],
  );

  const newCourseIds = useMemo(
    () => new Set(newCourseNotifications.map((n) => n.courseId)),
    [newCourseNotifications],
  );

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando tu panel…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">

      {/* ── New Course Notification Banner ──────────────────────────────── */}
      {newCourseNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <FaBell className="text-white text-sm animate-bounce" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  🎉 {newCourseNotifications.length === 1
                    ? `Nuevo curso: "${newCourseNotifications[0].message}"`
                    : `${newCourseNotifications.length} nuevos cursos disponibles`}
                </p>
                <p className="text-purple-200 text-xs hidden sm:block">Inscríbete antes de que se agoten los cupos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/estudiante/cursos"
                onClick={() => markAllRead()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors"
              >
                Ver cursos <FaArrowRight className="text-xs" />
              </Link>
              <button
                onClick={() => newCourseNotifications.forEach((n) => markAsRead(n.id))}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                title="Cerrar"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 text-white shadow-lg">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 blur-3xl translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-10 w-40 h-40 rounded-full bg-purple-300/10 blur-2xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-inner">
                {(userData?.nombres || "E")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Bienvenido de vuelta</p>
                <h1 className="text-xl sm:text-2xl font-black">{userData?.nombres || "Estudiante"}</h1>
                <p className="text-indigo-200 text-xs mt-0.5 truncate max-w-[220px]">{userData?.correo}</p>
              </div>
            </div>
            {/* Quick stats */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
                <p className="text-xl sm:text-2xl font-black">{kpis.total}</p>
                <p className="text-indigo-200 text-[10px] uppercase tracking-wide">Cursos</p>
              </div>
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
                <p className="text-xl sm:text-2xl font-black">{kpis.activos}</p>
                <p className="text-indigo-200 text-[10px] uppercase tracking-wide">Activos</p>
              </div>
              {kpis.diplomas > 0 && (
                <div className="text-center bg-amber-400/30 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
                  <p className="text-xl sm:text-2xl font-black">{kpis.diplomas}</p>
                  <p className="text-amber-200 text-[10px] uppercase tracking-wide">Diplomas</p>
                </div>
              )}
              <Link
                to="/estudiante/cursos"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors self-center flex-shrink-0"
              >
                <FaRocket className="text-xs" /> Explorar
              </Link>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard label="Total"       value={kpis.total}       icon={<FaGraduationCap />} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
          <KpiCard label="Activos"     value={kpis.activos}     icon={<FaChartLine />}     gradient="bg-gradient-to-br from-emerald-500 to-teal-700" />
          <KpiCard label="Finalizados" value={kpis.finalizados} icon={<FaCheckCircle />}   gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
          <KpiCard label="Pagados"     value={kpis.pagados}     icon={<FaCoins />}         gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
          <KpiCard label="Gratuitos"   value={kpis.gratuitos}   icon={<FaBookOpen />}      gradient="bg-gradient-to-br from-sky-400 to-cyan-600" />
        </div>

        {/* ── Calendar + Recent Courses ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-200">
            <CalendarioCompacto cursos={misCursos.filter((c) => c.fecha)} />
          </div>

          {/* Recent courses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FaClock className="text-blue-500" />
                Mis cursos recientes
              </h2>
              <Link to="/estudiante/mis-cursos" className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                Ver todos <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
            <div className="space-y-2">
              {cursosRecientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <FaGraduationCap className="text-4xl mb-2" />
                  <p className="text-sm">No tienes cursos inscritos aún</p>
                  <Link to="/estudiante/cursos" className="mt-2 text-xs text-blue-500 hover:underline">
                    Explorar cursos disponibles →
                  </Link>
                </div>
              ) : (
                cursosRecientes.map((curso) => {
                  const expired = isCourseExpired(curso);
                  return (
                    <div
                      key={curso.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-200"
                    >
                      <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${expired ? "bg-red-400" : curso.activo ? "bg-green-500" : "bg-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white truncate text-sm">{curso.titulo}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            expired
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : curso.activo
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                          }`}>
                            {expired ? "Finalizado" : curso.activo ? "Activo" : "Inactivo"}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            Number(curso.precio) > 0
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          }`}>
                            {Number(curso.precio) > 0 ? `$${parseFloat(curso.precio).toFixed(2)}` : "Gratis"}
                          </span>
                          {curso.diplomaCodigo && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              🏅 Diploma
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick links */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
              <Link
                to="/estudiante/mis-diplomas"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
              >
                <FaAward className="text-xs" /> Mis Diplomas
              </Link>
              <Link
                to="/estudiante/cursos"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                <FaRocket className="text-xs" /> Explorar cursos
              </Link>
            </div>
          </div>
        </div>

        {/* ── Available Courses (Suggestions) ─────────────────────────────── */}
        {disponibles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Cursos que te pueden interesar
              </h2>
              <Link to="/estudiante/cursos" className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 transition-colors">
                Ver todos <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {disponibles.slice(0, 6).map((curso) => {
                const isNew = newCourseIds.has(curso.id);
                return (
                  <div
                    key={curso.id}
                    className={`relative flex flex-col border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                      isNew
                        ? "border-purple-300 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-900/10"
                        : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                    }`}
                  >
                    {isNew && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        ✨ NUEVO
                      </span>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 dark:text-white line-clamp-2 text-sm mb-1">{curso.titulo}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{curso.descripcion}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        Number(curso.precio) > 0
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                          : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      }`}>
                        {Number(curso.precio) > 0 ? `$${parseFloat(curso.precio).toFixed(2)}` : "🆓 Gratis"}
                      </span>
                      <Link
                        to="/estudiante/cursos"
                        className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
                      >
                        Ver <FaArrowRight className="text-[10px]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
