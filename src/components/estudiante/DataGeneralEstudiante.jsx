import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaBookOpen, FaCheckCircle, FaCoins, FaGraduationCap, FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

export default function DataGeneralEstudiante() {
  const [loading, setLoading] = useState(true);
  const [misCursos, setMisCursos] = useState([]);
  const [disponibles, setDisponibles] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      try {
        // Mis cursos
        const resMis = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/mis-cursos?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let _mis = [];
        if (Array.isArray(resMis.data?.data)) _mis = resMis.data.data;
        else if (Array.isArray(resMis.data)) _mis = resMis.data;
        else if (resMis.data && typeof resMis.data === "object") {
          const a = Object.values(resMis.data).filter(Array.isArray);
          _mis = a[0] || [];
        }
        setMisCursos(_mis);

        // Disponibles (sugerencias)
        const resDisp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/disponibles`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let _disp = [];
        if (Array.isArray(resDisp.data?.data)) _disp = resDisp.data.data;
        else if (Array.isArray(resDisp.data)) _disp = resDisp.data;
        else if (resDisp.data && typeof resDisp.data === "object") {
          const a = Object.values(resDisp.data).filter(Array.isArray);
          _disp = a[0] || [];
        }
        setDisponibles(_disp);
      } catch (e) {
        console.error("Error dashboard estudiante:", e);
        setMisCursos([]);
        setDisponibles([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const kpis = useMemo(() => {
    const activos = misCursos.filter(c => c.activo && !isCourseExpired(c)).length;
    const finalizados = misCursos.filter(c => isCourseExpired(c)).length;
    const pagados = misCursos.filter(c => Number(c.precio) > 0).length;
    const gratuitos = misCursos.filter(c => Number(c.precio) === 0).length;
    return { activos, finalizados, pagados, gratuitos };
  }, [misCursos]);

  const proximos = useMemo(() => {
    const parseDate = (c) => new Date(`${c.fecha || ""}T${(c.hora || "00:00")}:00`);
    return misCursos
      .filter(c => c.activo && !isCourseExpired(c) && c.fecha)
      .filter(c => !Number.isNaN(parseDate(c).getTime()))
      .sort((a, b) => parseDate(a) - parseDate(b))
      .slice(0, 5);
  }, [misCursos]);

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-b-4 border-blue-500 animate-spin" />
          <div className="text-lg text-gray-700 font-medium">Cargando tu panel…</div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow">
        <h1 className="text-2xl md:text-3xl font-bold">Área del Estudiante</h1>
        <p className="text-blue-100 mt-1">Resumen de tus cursos y próximos eventos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Activos" value={kpis.activos} icon={<FaGraduationCap />} />
        <Kpi label="Finalizados" value={kpis.finalizados} icon={<FaCheckCircle />} tone="gray" />
        <Kpi label="Pagados" value={kpis.pagados} icon={<FaCoins />} tone="yellow" />
        <Kpi label="Gratuitos" value={kpis.gratuitos} icon={<FaBookOpen />} tone="sky" />
      </div>

      {/* Próximas clases + Accesos/Sugerencias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Próximas clases</h2>
            <Link to="/estudiante/mis-cursos" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm">
              Ver mis cursos <FaArrowRight />
            </Link>
          </div>

          {proximos.length === 0 ? (
            <div className="text-gray-500 text-sm bg-gray-50 p-6 rounded-xl text-center">
              No tienes clases próximas. Revisa los cursos disponibles para inscribirte.
            </div>
          ) : (
            <ul className="space-y-3">
              {proximos.map((c) => (
                <li key={`${c.id}-${c.fecha}-${c.hora}`} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><FaCalendarAlt /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3 className="font-semibold text-gray-900 truncate">{c.titulo || "Curso"}</h3>
                      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{c.fecha || "Por definir"} · {c.hora || "—"}</span>
                    </div>
                    <div className="mt-1 text-gray-600 text-sm line-clamp-2">{c.descripcion || "Sin descripción"}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {c.profesorNombre && <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">Prof: {c.profesorNombre}</span>}
                      <span className={`px-2 py-1 rounded-full ${Number(c.precio) > 0 ? "bg-yellow-50 text-yellow-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {Number(c.precio) > 0 ? "Pagado" : "Gratis"}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c.cupos || 0} cupos</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">Accesos rápidos</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-800 transition" to="/estudiante/cursos">
                Cursos disponibles
              </Link>
              <Link className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-800 transition" to="/estudiante/mis-cursos">
                Mis cursos
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">Te puede interesar</h2>
            {disponibles.length === 0 ? (
              <div className="text-gray-500 text-sm">Sin sugerencias por ahora.</div>
            ) : (
              <ul className="space-y-3">
                {disponibles.slice(0, 3).map((c) => (
                  <li key={c.id} className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
                    <div className="font-semibold text-gray-900">{c.titulo}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {c.fecha || "Por definir"} {c.hora ? `· ${c.hora}` : ""}
                    </div>
                    <Link to="/estudiante/cursos" className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      Ver detalles <FaArrowRight />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value, icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-100 text-gray-700",
    yellow: "bg-yellow-50 text-yellow-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${tones[tone]}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
