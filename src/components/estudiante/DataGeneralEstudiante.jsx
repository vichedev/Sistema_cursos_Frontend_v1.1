import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  FaTimes
} from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

// Función corregida para normalizar fechas
function normalizeDate(date) {
  // Crear fecha en formato UTC para evitar problemas de zona horaria
  const d = new Date(date);
  // Ajustar a la medianoche UTC
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Función para comparar si dos fechas son iguales (ignorando la zona horaria)
function areDatesEqual(date1, date2) {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate();
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
      const cursosDia = cursos.filter(curso => {
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
    const hoyNormalizado = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
    const fechaNormalizada = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    return hoyNormalizado.getTime() === fechaNormalizada.getTime();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 select-none">
          <FaCalendarAlt className="text-blue-600" />
          Próximas clases
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
            className="p-2 rounded-full bg-gray-200 hover:bg-blue-100 transition-colors text-blue-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="button"
          >
            <FaChevronLeft />
          </button>
          <span className="font-semibold text-gray-700 select-none min-w-[140px] text-center">
            {new Date(añoActual, mesActual).toLocaleDateString('es-ES', {
              month: 'long',
              year: 'numeric'
            }).toUpperCase()}
          </span>
          <button
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
            className="p-2 rounded-full bg-gray-200 hover:bg-blue-100 transition-colors text-blue-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="button"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-500 select-none">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
          <div key={dia} className="py-1">{dia}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {diasDelMes.map((dia, index) => {
          const tieneCursos = dia.cursos.length > 0;
          return (
            <button
              key={index}
              onClick={() => tieneCursos ? setDiaSeleccionado(dia) : null}
              className={`min-h-[50px] p-1 rounded-md flex flex-col justify-start items-center cursor-pointer
                ${dia.esDelMes ? 'bg-white border border-gray-200' : 'bg-gray-50 border border-gray-100 text-gray-400'}
                ${esHoy(dia.fecha) ? 'border-2 border-blue-500' : ''}
                hover:bg-blue-50
                relative
              `}
              title={tieneCursos ? `${dia.cursos.length} clase(s) este día` : undefined}
              type="button"
            >
              <div className="font-semibold mb-0.5">{dia.esDelMes ? dia.fecha.getDate() : ''}</div>
              {tieneCursos && dia.cursos.map((curso, i) => {
                const isExpired = isCourseExpired(curso);
                return (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full absolute top-1 right-${2 + i * 4} ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}
                    title={`${curso.titulo} - ${isExpired ? 'Inactivo' : 'Activo'}`}
                    style={{ right: `${6 + i * 10}px` }}
                  />
                );
              })}
            </button>
          );
        })}
      </div>

      {/* Mini modal para detalles del día seleccionado */}
      {diaSeleccionado && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setDiaSeleccionado(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Encabezado del modal */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h4 className="text-xl font-bold text-gray-800">
                Clases para el {diaSeleccionado.fecha.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
              <button
                onClick={() => setDiaSeleccionado(null)}
                className="p-2 rounded-full hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar modal"
                type="button"
              >
                <FaTimes size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Lista de cursos */}
            <div className="flex-1 overflow-y-auto p-5">
              {diaSeleccionado.cursos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay clases programadas para este día
                </div>
              ) : (
                <div className="space-y-4">
                  {diaSeleccionado.cursos.map(curso => {
                    const isExpired = isCourseExpired(curso);
                    return (
                      <div key={curso.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h5 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                          <FaVideo className="text-blue-500" />
                          {curso.titulo}
                        </h5>

                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            {curso.hora ? `Hora: ${curso.hora.substring(0, 5)}` : 'Hora no definida'}
                          </p>

                          <p className="flex items-center gap-2">
                            <FaUser className="text-gray-400" />
                            {curso.profesorNombre || curso.docente || 'Docente no especificado'}
                          </p>

                          {curso.modalidad && (
                            <p className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-gray-400" />
                              Modalidad: {curso.modalidad}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {isExpired ? (
                            <div className="flex items-center gap-2 text-red-600 font-medium">
                              <FaTimes className="text-red-500" />
                              Curso finalizado
                            </div>
                          ) : curso.activo ? (
                            curso.link ? (
                              <button
                                onClick={() => window.open(curso.link, '_blank', 'noopener,noreferrer')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                <FaLink size={14} />
                                Ir a la clase (nueva pestaña)
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <FaTimes className="text-gray-400" />
                                Enlace no disponible
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2 text-red-600 font-medium">
                              <FaTimes className="text-red-500" />
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

            {/* Pie del modal */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
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
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className={`p-3 rounded-full bg-gradient-to-r ${color} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
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
        const userRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(userRes.data);

        // Mis cursos
        const resMis = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/mis-cursos?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMisCursos(resMis.data?.data || resMis.data || []);

        // Cursos disponibles (sugerencias)
        const resDisp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/disponibles`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
    const activos = misCursos.filter(c => c.activo && !isCourseExpired(c)).length;
    const finalizados = misCursos.filter(c => isCourseExpired(c)).length;
    const pagados = misCursos.filter(c => Number(c.precio) > 0).length;
    const gratuitos = misCursos.filter(c => Number(c.precio) === 0).length;
    return { activos, finalizados, pagados, gratuitos, total: misCursos.length };
  }, [misCursos]);

  const cursosRecientes = useMemo(() => {
    return [...misCursos]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
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
    <section className="flex-1 p-6 space-y-6">
      {/* Header con información del estudiante */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bienvenido, {userData?.nombres || 'Estudiante'}</h1>
            <p className="text-blue-100 mt-1">Resumen de tu actividad académica</p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 p-3 rounded-lg">
            <FaUser className="text-white" />
            <span className="text-sm">{userData?.correo || ''}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendario compacto con mini modal */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <CalendarioCompacto cursos={misCursos.filter(c => c.fecha)} />
        </div>

        {/* Cursos Recientes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaClock className="text-blue-500" />
            Cursos recientes
          </h2>
          <div className="space-y-3">
            {cursosRecientes.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No tienes cursos inscritos
              </div>
            ) : (
              cursosRecientes.map((curso) => (
                <div key={curso.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                  <h3 className="font-medium text-gray-800 truncate">{curso.titulo}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${isCourseExpired(curso)
                      ? 'bg-red-100 text-red-800'
                      : curso.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {isCourseExpired(curso) ? 'Finalizado' : curso.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${curso.precio > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {curso.precio > 0 ? 'Pagado' : 'Gratuito'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sugerencias de Cursos */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
          Cursos disponibles que te pueden interesar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disponibles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No hay cursos disponibles en este momento
            </div>
          ) : (
            disponibles.slice(0, 6).map((curso) => (
              <div key={curso.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{curso.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{curso.descripcion}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded ${curso.precio > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {curso.precio > 0 ? `$${curso.precio}` : 'Gratuito'}
                  </span>
                  <Link
                    to="/estudiante/cursos"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    Ver más detalles →
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