import { useEffect, useState, useCallback } from "react";
import api from "../../utils/axiosInstance";
import {
  FaDollarSign,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBillWave,
  FaUserCheck,
  FaUserFriends,
  FaMedal,
  FaTrophy,
  FaChartBar,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const medal = (i) => {
  if (i === 0) return { icon: "🥇", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" };
  if (i === 1) return { icon: "🥈", bg: "bg-gray-50 dark:bg-gray-700/40", border: "border-gray-200 dark:border-gray-600" };
  if (i === 2) return { icon: "🥉", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" };
  return { icon: `#${i + 1}`, bg: "bg-gray-50 dark:bg-gray-700/30", border: "border-gray-200 dark:border-gray-700" };
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const avatarColor = (name = "") => {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-green-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-500",
    "from-teal-400 to-cyan-600",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return colors[Math.abs(h) % colors.length];
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${gradient}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-75 mb-1 truncate">{title}</p>
          <p className="text-3xl font-black leading-none truncate">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
    </div>
  );
}

// ─── AnimatedBar ──────────────────────────────────────────────────────────────
function AnimatedBar({ label, count, total, color, bg, icon }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold flex items-center gap-1.5 ${color}`}>
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="tabular-nums font-bold text-gray-700 dark:text-gray-200">
          {count}
          <span className="font-normal opacity-50 ml-1 text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="relative h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── TypeBadge ────────────────────────────────────────────────────────────────
function TypeBadge({ label, count, emoji, bg, border, text }) {
  return (
    <div className={`rounded-xl p-4 border ${bg} ${border} flex items-center gap-3`}>
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div className="min-w-0">
        <p className={`text-xs font-bold uppercase tracking-wide ${text} truncate`}>{label}</p>
        <p className={`text-2xl font-black ${text}`}>{count}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardAdminCursos() {
  const [stats, setStats] = useState(null);
  const [allCursos, setAllCursos] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ totalRecaudado: 0, totalPagados: 0, totalGratis: 0 });
  const [loading, setLoading] = useState(true);

  const fetchWithTimeout = useCallback(async (url, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const r = await api({ url, ...options, signal: controller.signal });
      clearTimeout(id);
      return r;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }, []);

  const fetchCourseStudents = useCallback(async (courseId) => {
    try {
      const r = await fetchWithTimeout(`/api/courses/${courseId}/estudiantes`, {}, 5000);
      return r.data.length || 0;
    } catch { return 0; }
  }, [fetchWithTimeout]);

  const fetchCoursePayments = useCallback(async (course) => {
    try {
      const r = await fetchWithTimeout(`/api/courses/${course.id}/estudiantes-con-pagos`, {}, 5000);
      if (r.data?.estudiantes) {
        const est = r.data.estudiantes;
        return {
          payments: est
            .filter((e) => e.montoPagado > 0)
            .map((e) => ({ ...e, cursoId: course.id, cursoTitulo: course.titulo, fechaPago: e.fechaInscripcion || new Date() })),
          stats: {
            cursoRecaudado: est.reduce((s, e) => s + e.montoPagado, 0),
            cursoPagados: est.filter((e) => e.montoPagado > 0).length,
            cursoGratis: est.filter((e) => e.montoPagado === 0).length,
          },
        };
      }
    } catch {}
    return { payments: [], stats: { cursoRecaudado: 0, cursoPagados: 0, cursoGratis: 0 } };
  }, [fetchWithTimeout]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.allSettled([
          fetchWithTimeout("/api/stats/general"),
          fetchWithTimeout("/api/courses/all"),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);

        let courses = [];
        if (coursesRes.status === "fulfilled") {
          const d = coursesRes.value.data;
          courses = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
        }
        setAllCursos(courses);

        if (courses.length > 0) {
          const [payRes, stuRes] = await Promise.allSettled([
            Promise.all(courses.map((c) => fetchCoursePayments(c))),
            Promise.all(courses.map((c) => fetchCourseStudents(c.id))),
          ]);

          let totalRecaudado = 0, totalPagados = 0, totalGratis = 0, all = [];
          if (payRes.status === "fulfilled") {
            payRes.value.forEach((r) => {
              if (r) {
                all = [...all, ...r.payments];
                totalRecaudado += r.stats.cursoRecaudado;
                totalPagados += r.stats.cursoPagados;
                totalGratis += r.stats.cursoGratis;
              }
            });
          }
          setPaymentStats({ totalRecaudado, totalPagados, totalGratis });
          setRecentPayments(all.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago)).slice(0, 5));

          if (stuRes.status === "fulfilled") {
            setTopCourses(
              courses
                .map((c, i) => ({ ...c, totalEstudiantes: stuRes.value[i] || 0 }))
                .sort((a, b) => b.totalEstudiantes - a.totalEstudiantes)
                .slice(0, 5),
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchWithTimeout, fetchCoursePayments, fetchCourseStudents]);

  const cursosGratis       = allCursos.filter((c) => c.tipo?.endsWith("GRATIS"));
  const cursosPagados      = allCursos.filter((c) => c.tipo?.endsWith("PAGADO"));
  const cursosPresenciales = allCursos.filter((c) => c.tipo?.startsWith("PRESENCIAL"));
  const cursosOnline       = allCursos.filter((c) => c.tipo?.startsWith("ONLINE"));
  const total = allCursos.length;

  const summaryCards = [
    { title: "Total Cursos",      value: total,                                        icon: <FaBook className="text-xl" />,              gradient: "bg-gradient-to-br from-blue-500 to-indigo-700" },
    { title: "Estudiantes",       value: stats?.totalEstudiantes ?? 0,                 icon: <FaUsers className="text-xl" />,             gradient: "bg-gradient-to-br from-emerald-500 to-teal-700" },
    { title: "Profesores",        value: stats?.totalProfesores ?? 0,                  icon: <FaChalkboardTeacher className="text-xl" />, gradient: "bg-gradient-to-br from-violet-500 to-purple-700" },
    { title: "Ingresos Totales",  value: `$${paymentStats.totalRecaudado.toFixed(2)}`, icon: <FaMoneyBillWave className="text-xl" />,    gradient: "bg-gradient-to-br from-orange-500 to-rose-600" },
    { title: "Pagados",           value: paymentStats.totalPagados,                    icon: <FaUserCheck className="text-xl" />,         gradient: "bg-gradient-to-br from-teal-500 to-cyan-700" },
    { title: "Gratuitos",         value: paymentStats.totalGratis,                     icon: <FaUserFriends className="text-xl" />,       gradient: "bg-gradient-to-br from-sky-500 to-blue-700" },
  ];

  const typeItems = [
    { label: "Gratuitos",     count: cursosGratis.length,       emoji: "📘", bg: "bg-blue-50 dark:bg-blue-900/20",     border: "border-blue-200 dark:border-blue-800",     text: "text-blue-700 dark:text-blue-300" },
    { label: "Pagados",       count: cursosPagados.length,      emoji: "💰", bg: "bg-green-50 dark:bg-green-900/20",   border: "border-green-200 dark:border-green-800",   text: "text-green-700 dark:text-green-300" },
    { label: "Presenciales",  count: cursosPresenciales.length, emoji: "🏢", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300" },
    { label: "Online",        count: cursosOnline.length,       emoji: "💻", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-10 w-40 h-40 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-20 w-56 h-56 rounded-full bg-purple-400/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dashboard Administrativo
            </h1>
            <p className="text-indigo-200 mt-1 text-sm font-medium">
              Resumen en tiempo real del sistema de cursos
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 self-start sm:self-auto">
            <FaChartBar className="text-indigo-300 text-sm" />
            <span className="text-white text-sm font-semibold">Panel de control</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {summaryCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* ── Revenue Banner ──────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-5 sm:p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* Left: total */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaTrophy className="text-3xl text-yellow-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
                  Ingresos Totales Generados
                </p>
                <p className="text-4xl sm:text-5xl font-black mt-0.5">
                  ${paymentStats.totalRecaudado.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Right: breakdown */}
            <div className="flex gap-6 sm:gap-10 md:mr-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black">{paymentStats.totalPagados}</p>
                <p className="text-emerald-100 text-xs font-medium mt-0.5 uppercase tracking-wide">Inscripciones pagadas</p>
              </div>
              <div className="w-px bg-white/30 hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black">{paymentStats.totalGratis}</p>
                <p className="text-emerald-100 text-xs font-medium mt-0.5 uppercase tracking-wide">Inscripciones gratuitas</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Distribution + Type Summary ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

          {/* Distribution bars */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4 transition-colors duration-200">
            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaChartBar className="text-indigo-500" />
              Distribución de Cursos
            </h2>
            <AnimatedBar label="Gratuitos"    count={cursosGratis.length}       total={total} color="text-blue-600 dark:text-blue-400"   bg="bg-blue-500"   icon="📘" />
            <AnimatedBar label="Pagados"      count={cursosPagados.length}      total={total} color="text-green-600 dark:text-green-400" bg="bg-green-500"  icon="💰" />
            <AnimatedBar label="Presenciales" count={cursosPresenciales.length} total={total} color="text-purple-600 dark:text-purple-400" bg="bg-purple-500" icon="🏢" />
            <AnimatedBar label="Online"       count={cursosOnline.length}       total={total} color="text-orange-600 dark:text-orange-400" bg="bg-orange-500" icon="💻" />
          </div>

          {/* Type summary — fixed: removed h-full that caused misalignment */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <FaStar className="text-yellow-500" />
              Resumen por Tipo
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {typeItems.map((item) => (
                <TypeBadge key={item.label} {...item} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Top Courses + Recent Payments ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

          {/* Top courses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-5">
              <FaMedal className="text-yellow-500" />
              Cursos Más Populares
            </h2>
            {topCourses.length > 0 ? (
              <div className="space-y-2.5">
                {topCourses.map((course, i) => {
                  const m = medal(i);
                  return (
                    <div
                      key={course.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${m.bg} ${m.border} hover:shadow-sm transition-all duration-200`}
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-full text-lg flex-shrink-0">
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white truncate text-sm">
                          {course.titulo}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <FaGraduationCap className="text-indigo-400" />
                          {course.totalEstudiantes} inscritos
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                        course.tipo?.includes("PAGADO")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {course.tipo?.includes("PAGADO") ? "💵 Pagado" : "🆓 Gratis"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                <FaUsers className="text-4xl mb-2" />
                <p className="text-sm">No hay datos de popularidad aún</p>
              </div>
            )}
          </div>

          {/* Recent payments */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-5">
              <FaDollarSign className="text-emerald-500" />
              Pagos Recientes
            </h2>

            {recentPayments.length > 0 ? (
              <div className="space-y-2.5">
                {recentPayments.map((payment, i) => {
                  const fullName = `${payment.nombres || ""} ${payment.apellidos || ""}`.trim();
                  const ini = initials(fullName) || "?";
                  const grad = avatarColor(fullName);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-200"
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                        {ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white truncate text-sm">
                          {fullName || "—"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {payment.cursoTitulo} · {new Date(payment.fechaPago).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          +${parseFloat(payment.montoPagado).toFixed(2)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                          Pagado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                <FaMoneyBillWave className="text-4xl mb-2" />
                <p className="text-sm">Sin pagos recientes</p>
              </div>
            )}

            {/* Summary footer */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Total recaudado
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ${paymentStats.totalRecaudado.toFixed(2)}
                  </p>
                </div>
                <div className="text-right text-sm space-y-0.5">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-gray-800 dark:text-white">{paymentStats.totalPagados}</span> pagos
                  </p>
                  <p className="text-gray-500 dark:text-gray-500">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{paymentStats.totalGratis}</span> gratuitos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
