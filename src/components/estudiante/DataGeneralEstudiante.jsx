import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axiosInstance";
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
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaLink,
  FaTimes,
} from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

// Función corregida para normalizar fechas
function normalizeDate(date) {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

// Función para comparar si dos fechas son iguales (ignorando la zona horaria)
function areDatesEqual(date1, date2) {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

function CalendarioCompacto({ cursos }) {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Generar días del mes con relleno para semanas completas
  const diasDelMes = useMemo(() => {
    const primerDia = new Date(añoActual, mesActual, 1);
    const ultimoDia = new Date(añoActual, mesActual + 1, 0);
    const dias = [];

    // Días del mes anterior para completar la semana (lunes inicio)
    let diaInicio = primerDia.getDay();
    diaInicio = diaInicio === 0 ? 7 : diaInicio; // Domingo como 7
    for (let i = diaInicio - 1; i > 0; i--) {
      const fecha = new Date(añoActual, mesActual, 1 - i);
      dias.push({ fecha, esDelMes: false, cursos: [] });
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fecha = new Date(añoActual, mesActual, i);
      const cursosDia = cursos.filter((curso) => {
        if (!curso.fecha) return false;
        const cursoDate = normalizeDate(curso.fecha);
        return areDatesEqual(cursoDate, fecha);
      });
      dias.push({ fecha, esDelMes: true, cursos: cursosDia });
    }

    // Completar última semana con días del siguiente mes
    while (dias.length % 7 !== 0) {
      const lastDate = dias[dias.length - 1].fecha;
      const fecha = new Date(lastDate);
      fecha.setDate(fecha.getDate() + 1);
      dias.push({ fecha, esDelMes: false, cursos: [] });
    }

    return dias;
  }, [mesActual, añoActual, cursos]);

  const cambiarMes = (incremento) => {
    const nuevaFecha = new Date(añoActual, mesActual + incremento, 1);
    setMesActual(nuevaFecha.getMonth());
    setAñoActual(nuevaFecha.getFullYear());
    setDiaSeleccionado(null);
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    const hoyNormalizado = new Date(
      Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
    );
    const fechaNormalizada = new Date(
      Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()),
    );
    return hoyNormalizado.getTime() === fechaNormalizada.getTime();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 select-none">
          <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Próximas clases</span>
          <span className="sm:hidden">Clases</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="button"
          >
            <FaChevronLeft className="text-sm" />
          </button>
          <span className="font-semibold text-gray-700 dark:text-gray-300 select-none min-w-[120px] sm:min-w-[140px] text-center text-sm sm:text-base">
            {new Date(añoActual, mesActual)
              .toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </span>
          <button
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="button"
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* Días de la semana - Mejorado para móvil */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 select-none">
        {["L", "M", "X", "J", "V", "S", "D"].map((dia, index) => (
          <div key={index} className="py-1 text-xs sm:text-xs">
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes - Mejorado para móvil */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {diasDelMes.map((dia, index) => {
          const tieneCursos = dia.cursos.length > 0;
          return (
            <button
              key={index}
              onClick={() => (tieneCursos ? setDiaSeleccionado(dia) : null)}
              className={`min-h-[40px] sm:min-h-[50px] p-1 rounded-md flex flex-col justify-start items-center cursor-pointer transition-colors duration-200
                ${
                  dia.esDelMes
                    ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                    : "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                }
                ${
                  esHoy(dia.fecha)
                    ? "border-2 border-blue-500 dark:border-blue-400"
                    : ""
                }
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                relative
              `}
              title={
                tieneCursos
                  ? `${dia.cursos.length} clase(s) este día`
                  : undefined
              }
              type="button"
            >
              <div
                className={`font-semibold mb-0.5 dark:text-gray-300 text-xs sm:text-sm ${
                  esHoy(dia.fecha)
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : ""
                }`}
              >
                {dia.esDelMes ? dia.fecha.getDate() : ""}
              </div>

              {/* Indicadores de cursos - Mejorados para móvil */}
              {tieneCursos && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                  {dia.cursos.slice(0, 2).map((curso, i) => {
                    const isExpired = isCourseExpired(curso);
                    return (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          isExpired ? "bg-red-500" : "bg-green-500"
                        }`}
                        title={`${curso.titulo} - ${
                          isExpired ? "Inactivo" : "Activo"
                        }`}
                      />
                    );
                  })}
                  {dia.cursos.length > 2 && (
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500"
                      title={`+${dia.cursos.length - 2} más`}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini modal para detalles del día seleccionado - Mejorado para móvil */}
      {diaSeleccionado && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setDiaSeleccionado(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado del modal - Mejorado para móvil */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white pr-2">
                Clases del{" "}
                {diaSeleccionado.fecha.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <button
                onClick={() => setDiaSeleccionado(null)}
                className="p-1 sm:p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                aria-label="Cerrar modal"
                type="button"
              >
                <FaTimes
                  size={16}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
            </div>

            {/* Lista de cursos - Mejorado para móvil */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {diaSeleccionado.cursos.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                  No hay clases programadas para este día
                </div>
              ) : (
                <div className="space-y-3">
                  {diaSeleccionado.cursos.map((curso) => {
                    const isExpired = isCourseExpired(curso);
                    return (
                      <div
                        key={curso.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                      >
                        <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <FaVideo className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                          <span className="line-clamp-2">{curso.titulo}</span>
                        </h5>

                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <p className="flex items-center gap-2">
                            <FaClock className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            {curso.hora
                              ? `Hora: ${curso.hora.substring(0, 5)}`
                              : "Hora no definida"}
                          </p>

                          <p className="flex items-center gap-2">
                            <FaUser className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {curso.profesorNombre ||
                                curso.docente ||
                                "Docente no especificado"}
                            </span>
                          </p>

                          {curso.modalidad && (
                            <p className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                              <span className="line-clamp-1">
                                Modalidad: {curso.modalidad}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-600">
                          {isExpired ? (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm">
                              <FaTimes className="text-red-500 dark:text-red-400 flex-shrink-0" />
                              Curso finalizado
                            </div>
                          ) : curso.activo ? (
                            curso.link ? (
                              <button
                                onClick={() =>
                                  window.open(
                                    curso.link,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-xs sm:text-sm"
                              >
                                <FaLink size={12} />
                                Ir a la clase
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                <FaTimes className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                Enlace no disponible
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm">
                              <FaTimes className="text-red-500 dark:text-red-400 flex-shrink-0" />
                              Curso inactivo
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pie del modal - Mejorado para móvil */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {diaSeleccionado.cursos.length} clase(s) programada(s)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4 flex items-center gap-3 hover:shadow-lg transition-shadow duration-200">
      <div
        className={`p-2 sm:p-3 rounded-full bg-gradient-to-r ${color} text-white flex-shrink-0`}
      >
        {React.cloneElement(icon, { className: "text-sm sm:text-base" })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function DataGeneralEstudiante() {
  const [loading, setLoading] = useState(true);
  const [misCursos, setMisCursos] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      try {
        // Obtener datos del usuario
        const userRes = await api.get(`/api/users/${userId}`);
        setUserData(userRes.data);

        // Mis cursos
        const resMis = await api.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/courses/mis-cursos?userId=${userId}`,
        );
        setMisCursos(resMis.data?.data || resMis.data || []);

        // Cursos disponibles (sugerencias)
        const resDisp = await api.get(`/api/courses/disponibles`);
        setDisponibles(resDisp.data?.data || resDisp.data || []);
      } catch (e) {
        console.error("Error dashboard estudiante:", e);
        setMisCursos([]);
        setDisponibles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = useMemo(() => {
    const activos = misCursos.filter(
      (c) => c.activo && !isCourseExpired(c),
    ).length;
    const finalizados = misCursos.filter((c) => isCourseExpired(c)).length;
    const pagados = misCursos.filter((c) => Number(c.precio) > 0).length;
    const gratuitos = misCursos.filter((c) => Number(c.precio) === 0).length;
    return {
      activos,
      finalizados,
      pagados,
      gratuitos,
      total: misCursos.length,
    };
  }, [misCursos]);

  const cursosRecientes = useMemo(() => {
    return [...misCursos]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
  }, [misCursos]);

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-b-4 border-blue-500 animate-spin" />
          <div className="text-lg text-gray-700 dark:text-gray-300 font-medium">
            Cargando tu panel…
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header con información del estudiante - Mejorado para móvil */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Bienvenido, {userData?.nombres || "Estudiante"}
            </h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              Resumen de tu actividad académica
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm flex-shrink-0">
            <FaUser className="text-white text-sm sm:text-base" />
            <span className="text-xs sm:text-sm truncate">
              {userData?.correo || ""}
            </span>
          </div>
        </div>
      </div>

      {/* KPIs - Mejorado para móvil */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Kpi
          label="Total Cursos"
          value={kpis.total}
          icon={<FaGraduationCap />}
          color="from-indigo-500 to-indigo-600"
        />
        <Kpi
          label="Activos"
          value={kpis.activos}
          icon={<FaChartLine />}
          color="from-green-500 to-green-600"
        />
        <Kpi
          label="Finalizados"
          value={kpis.finalizados}
          icon={<FaCheckCircle />}
          color="from-gray-500 to-gray-600"
        />
        <Kpi
          label="Pagados"
          value={kpis.pagados}
          icon={<FaCoins />}
          color="from-yellow-500 to-yellow-600"
        />
        <Kpi
          label="Gratuitos"
          value={kpis.gratuitos}
          icon={<FaBookOpen />}
          color="from-sky-400 to-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Calendario compacto con mini modal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 transition-colors duration-200">
          <CalendarioCompacto cursos={misCursos.filter((c) => c.fecha)} />
        </div>

        {/* Cursos Recientes - Mejorado para móvil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <FaClock className="text-blue-500 dark:text-blue-400" />
            <span className="hidden sm:inline">Cursos recientes</span>
            <span className="sm:hidden">Recientes</span>
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {cursosRecientes.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                No tienes cursos inscritos
              </div>
            ) : (
              cursosRecientes.map((curso) => (
                <div
                  key={curso.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <h3 className="font-medium text-gray-800 dark:text-white truncate text-sm sm:text-base">
                    {curso.titulo}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isCourseExpired(curso)
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          : curso.activo
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {isCourseExpired(curso)
                        ? "Finalizado"
                        : curso.activo
                          ? "Activo"
                          : "Inactivo"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        curso.precio > 0
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {curso.precio > 0 ? "Pagado" : "Gratuito"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sugerencias de Cursos - Mejorado para móvil */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 transition-colors duration-200">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
          Cursos disponibles que te pueden interesar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {disponibles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
              No hay cursos disponibles en este momento
            </div>
          ) : (
            disponibles.slice(0, 6).map((curso) => (
              <div
                key={curso.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between bg-white dark:bg-gray-700"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 text-sm sm:text-base">
                    {curso.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {curso.descripcion}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      curso.precio > 0
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    }`}
                  >
                    {curso.precio > 0 ? `$${curso.precio}` : "Gratuito"}
                  </span>
                  <Link
                    to="/estudiante/cursos"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors duration-200"
                  >
                    Ver más →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
