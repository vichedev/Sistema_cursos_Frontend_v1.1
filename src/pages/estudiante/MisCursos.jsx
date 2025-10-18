// src/pages/estudiante/MisCursos.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaGraduationCap,
  FaEye,
  FaTimes,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaBolt,
  FaRocket,
  FaStar,
  FaHistory,
  FaHourglassHalf,
  FaCheck,
  FaCrown,
  FaGem,
} from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

import {
  getCourseLaunchInfo,
} from "./utils/courseSorting"; // ← ./utils/ porque están en la misma carpeta

// ✅ HOOK PERSONALIZADO PARA LA CARGA DE CURSOS
const useMisCursos = () => {
  const [state, setState] = useState({
    misCursos: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchCursos = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setState({ misCursos: [], loading: false, error: null });
        return;
      }

      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/courses/mis-cursos?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }
        );

        if (
          typeof res.data === "string" &&
          res.data.includes("<!DOCTYPE html>")
        ) {
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursos = [];
        if (res.data && Array.isArray(res.data.data)) {
          cursos = res.data.data;
        } else if (Array.isArray(res.data)) {
          cursos = res.data;
        } else if (res.data && typeof res.data === "object") {
          const possibleArrays = Object.values(res.data).filter(Array.isArray);
          cursos = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }

        // Ordenar por fecha de creación (más recientes primero)
        const cursosOrdenados = cursos.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setState({ misCursos: cursosOrdenados, loading: false, error: null });
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        setState({ misCursos: [], loading: false, error: error.message });
      }
    };

    fetchCursos();
  }, []);

  return state;
};

// ✅ FUNCIONES OPTIMIZADAS CON MEMOIZACIÓN
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  try {
    return dateStr.split("T")[0];
  } catch {
    return null;
  }
};

const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
};

// ✅ FUNCIONES PARA FECHAS OPTIMIZADAS
const isTodayCourse = (curso) => {
  const fechaStr = parseDateString(curso.fecha);
  return fechaStr === getTodayString();
};

const isTomorrowCourse = (curso) => {
  const fechaStr = parseDateString(curso.fecha);
  if (!fechaStr) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  return fechaStr === tomorrowStr;
};

const getDaysUntilCourse = (curso) => {
  const fechaStr = parseDateString(curso.fecha);
  if (!fechaStr) return null;

  const [year, month, day] = fechaStr.split("-").map(Number);
  const courseDate = new Date(year, month - 1, day);
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const daysDiff = Math.round((courseDate - todayDate) / (1000 * 60 * 60 * 24));
  return daysDiff >= 0 ? daysDiff : null;
};

const isUpcomingCourse = (curso) => {
  const daysUntil = getDaysUntilCourse(curso);
  return daysUntil !== null && daysUntil >= 2 && daysUntil <= 7;
};

// ✅ COMPONENTE MODAL MEMOIZADO
const DescriptionModal = React.memo(({ open, curso, onClose }) => {
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  const isExpired = isCourseExpired(curso);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 p-2 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden transition-colors duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal - MEJORADO PARA MÓVIL */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 text-white hover:text-gray-200 transition-colors bg-black/20 rounded-full p-1"
          >
            <FaTimes className="text-lg md:text-xl" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold mb-2 pr-10 md:pr-8 line-clamp-2">
            {curso.titulo || "Curso sin título"}
          </h2>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {curso.profesorNombre && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs md:text-sm">
                👨‍🏫 {curso.profesorNombre}
              </span>
            )}
            {curso.asignatura && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs md:text-sm">
                📚 {curso.asignatura}
              </span>
            )}
          </div>
        </div>

        {/* Contenido del Modal - MEJORADO PARA MÓVIL */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
              <FaEye className="text-blue-500 dark:text-blue-400 text-sm md:text-base" />
              Descripción Completa del Curso
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <div className="max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {curso.descripcion ||
                    "Este curso no tiene descripción disponible."}
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional - MEJORADA PARA MÓVIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700 transition-colors duration-200">
              <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                📅 Fecha del Curso
              </div>
              <div className="text-blue-700 dark:text-blue-400">
                {curso.fecha || "Por definir"}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700 transition-colors duration-200">
              <div className="font-semibold text-green-800 dark:text-green-300 mb-1">
                ⏰ Horario
              </div>
              <div className="text-green-700 dark:text-green-400">
                {curso.hora || "Por definir"}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700 transition-colors duration-200">
              <div className="font-semibold text-purple-800 dark:text-purple-300 mb-1">
                🎯 Cupos Disponibles
              </div>
              <div className="text-purple-700 dark:text-purple-400">
                {curso.cupos || 0} cupos
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-700 transition-colors duration-200">
              <div className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                💰 Precio
              </div>
              <div className="text-orange-700 dark:text-orange-400">
                {curso.precio > 0 ? `$${curso.precio} USD` : "Gratuito"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal - SIEMPRE VISIBLE */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 md:py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm md:text-base"
          >
            Cerrar Descripción
          </button>
        </div>
      </div>
    </div>
  );
});

// ✅ COMPONENTE CURSO CARD OPTIMIZADO
const CursoCard = React.memo(({ curso }) => {
  const [modalDesc, setModalDesc] = useState({ open: false, curso: null });

  // ✅ USAR useMemo PARA CÁLCULOS COSTOSOS
  const courseData = useMemo(() => {
    const isExpired = isCourseExpired(curso);
    const launchInfo = getCourseLaunchInfo(curso);
    const isToday = isTodayCourse(curso);
    const isTomorrow = isTomorrowCourse(curso);
    const isUpcoming = isUpcomingCourse(curso);
    const daysUntil = getDaysUntilCourse(curso);
    const hasFewSpots = curso.cupos > 0 && curso.cupos <= 3;
    const hasLimitedSpots = curso.cupos > 0 && curso.cupos <= 5;
    const LaunchIcon = launchInfo?.icon || FaStar;

    return {
      isExpired,
      launchInfo,
      isToday,
      isTomorrow,
      isUpcoming,
      daysUntil,
      hasFewSpots,
      hasLimitedSpots,
      LaunchIcon,
    };
  }, [curso]);

  // ✅ HANDLERS MEMOIZADOS
  const openDescriptionModal = useCallback(() => {
    setModalDesc({ open: true, curso });
  }, [curso]);

  const closeDescriptionModal = useCallback(() => {
    setModalDesc({ open: false, curso: null });
  }, []);

  const handleImageError = useCallback((e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
  }, []);

  const {
    launchInfo,
    isToday,
    isTomorrow,
    isUpcoming,
    daysUntil,
    hasFewSpots,
    hasLimitedSpots,
    LaunchIcon,
    isExpired,
  } = courseData;

  return (
    <>
      <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden">
        {/* ✅ ETIQUETA DINÁMICA DE LANZAMIENTO */}
        {launchInfo && (
          <div
            className={`absolute ${
              launchInfo.type === "just-launched"
                ? "-top-2 -left-2"
                : "top-2 right-2"
            } z-20`}
          >
            <div
              className={`bg-gradient-to-r ${
                launchInfo.color
              } text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 ${
                launchInfo.animate
              } ${
                launchInfo.borderColor
                  ? `border-2 ${launchInfo.borderColor}`
                  : ""
              }`}
            >
              <LaunchIcon
                className={
                  launchInfo.type === "just-launched"
                    ? "text-yellow-300 animate-bounce"
                    : ""
                }
              />
              {launchInfo.label}
              {launchInfo.type === "just-launched" && (
                <LaunchIcon className="text-yellow-300 animate-bounce" />
              )}
            </div>
          </div>
        )}

        <div className="relative">
          <img
            src={
              curso.imagen
                ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
                : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
            }
            alt={curso.titulo}
            className="w-full h-48 object-cover rounded-t-2xl group-hover:brightness-90 transition duration-300"
            onError={handleImageError}
            loading="lazy"
          />

          <div className="absolute top-12 left-2 flex flex-col gap-1">
            {/* ETIQUETA PRINCIPAL DE TIPO */}
            <span
              className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md ${
                curso.precio > 0
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  : "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
              }`}
            >
              {curso.precio > 0 ? "🔥 PREMIUM" : "🎓 GRATUITO"}
            </span>

            {/* ETIQUETAS DE FECHA */}
            {isToday && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-md flex items-center gap-1">
                <FaBolt className="text-yellow-300" />
                ¡COMIENZA HOY!
              </span>
            )}

            {isTomorrow && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md flex items-center gap-1">
                <FaCalendarAlt />
                ¡COMIENZA MAÑANA!
              </span>
            )}

            {isUpcoming &&
              daysUntil !== null &&
              daysUntil >= 2 &&
              daysUntil <= 7 &&
              !isToday &&
              !isTomorrow && (
                <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md flex items-center gap-1">
                  <FaCalendarAlt />
                  EN {daysUntil} DÍA{daysUntil !== 1 ? "S" : ""}
                </span>
              )}

            {/* ETIQUETAS DE CUPOS */}
            {hasFewSpots && !isExpired && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-purple-600 to-pink-700 text-white font-bold shadow-md flex items-center gap-1 animate-pulse">
                <FaHourglassHalf className="text-yellow-300" />
                ⚠️ ÚLTIMOS {curso.cupos} CUPOS!
              </span>
            )}

            {hasLimitedSpots && !hasFewSpots && !isExpired && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md flex items-center gap-1">
                <FaUsers />
                🚀 CUPOS LIMITADOS
              </span>
            )}

            {/* ETIQUETA DE FINALIZADO */}
            {isExpired && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold shadow-md">
                ⏰ FINALIZADO
              </span>
            )}
          </div>

          {/* CONTADOR DE CUPOS */}
          <span className="absolute top-2 right-2 px-4 py-2 rounded-full text-xs bg-black/70 text-white font-bold shadow-lg backdrop-blur-sm">
            🎯 {curso.cupos || 0} CUPOS
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between p-6">
          {/* TÍTULO */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {curso.titulo}
          </h3>

          {/* ✅ DESCRIPCIÓN CON BOTÓN "VER MÁS" */}
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
              {curso.descripcion || "Sin descripción disponible."}
            </p>
            <button
              onClick={openDescriptionModal}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors group"
            >
              <FaEye className="text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Ver descripción completa</span>
            </button>
          </div>

          {/* INFORMACIÓN DEL PROFESOR Y ASIGNATURA */}
          <div className="flex flex-wrap gap-2 mb-4">
            {curso.profesorNombre && (
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-700">
                👨‍🏫 Profesor: {curso.profesorNombre}
              </span>
            )}

            {curso.asignatura && (
              <span className="inline-block px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700">
                📚 {curso.asignatura}
              </span>
            )}

            {curso.tipo && (
              <span className="inline-block px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs font-semibold border border-green-200 dark:border-green-700">
                🎯 {curso.tipo.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {/* INFORMACIÓN DE FECHA Y PRECIO */}
          <div className="flex justify-between items-center mb-5">
            {curso.precio > 0 && (
              <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-800 dark:text-yellow-300 text-base font-bold border border-yellow-300 dark:border-yellow-600">
                💰 ${curso.precio}
              </span>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">
                📅 {curso.fecha || "Por definir"}
              </span>
              {" | "}
              <span className="font-medium">
                ⏰ {curso.hora || "Por definir"}
              </span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN ESPECÍFICOS PARA ESTUDIANTE */}
          <div className="flex flex-col gap-3">
            {/* Estado de inscripción */}
            <div
              className={`text-center px-4 py-2 rounded-xl font-bold text-sm ${
                isExpired
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  : curso.activo
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}
            >
              {isExpired
                ? "⏰ CURSO FINALIZADO"
                : curso.activo
                ? "✅ INSCRIPCIÓN ACTIVA"
                : "❌ CURSO ARCHIVADO"}
            </div>

            {/* Acceso al curso */}
            {isExpired ? (
              <div className="text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-xl font-semibold text-sm">
                Curso finalizado - Ya no disponible
              </div>
            ) : curso.activo ? (
              curso.link ? (
                <a
                  href={curso.link}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-bold text-center block hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {curso.tipo && curso.tipo.startsWith("ONLINE")
                    ? "🎓 IR A CLASE"
                    : "📍 VER UBICACIÓN"}
                </a>
              ) : (
                <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-3 rounded-xl font-semibold text-sm border border-yellow-200 dark:border-yellow-700">
                  ⚠️ Enlace no disponible temporalmente
                </div>
              )
            ) : (
              <div className="text-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-xl font-semibold text-sm border border-red-200 dark:border-red-700">
                🔒 Curso archivado por el administrador
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODAL PARA DESCRIPCIÓN COMPLETA */}
      <DescriptionModal
        open={modalDesc.open}
        curso={modalDesc.curso}
        onClose={closeDescriptionModal}
      />
    </>
  );
});

// ✅ COMPONENTES DE UI AUXILIARES
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
        Cargando tus cursos...
      </div>
    </div>
  </div>
);

const EmptyState = ({ activeTab, searchTerm, cursosCount }) => {
  const getEmptyMessage = () => {
    if (searchTerm) {
      return {
        title: "No se encontraron cursos",
        description: "Intenta con otros términos de búsqueda",
      };
    }

    if (cursosCount === 0) {
      return {
        title: "No tienes cursos inscritos",
        description: "Explora los cursos disponibles para inscribirte",
      };
    }

    const messages = {
      ACTIVOS: {
        title: "No tienes cursos activos",
        description: "Todos tus cursos están inactivos o archivados",
      },
      INACTIVOS: {
        title: "No tienes cursos inactivos",
        description: "Todos tus cursos están activos",
      },
      GRATIS: {
        title: "No tienes cursos gratuitos",
        description: "Solo tienes cursos premium",
      },
      PAGADOS: {
        title: "No tienes cursos pagados",
        description: "Solo tienes cursos gratuitos",
      },
    };

    return (
      messages[activeTab] || {
        title: "No hay cursos",
        description: "No se encontraron cursos",
      }
    );
  };

  const message = getEmptyMessage();

  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {message.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {message.description}
        </p>
      </div>
    </div>
  );
};

// ✅ COMPONENTE PRINCIPAL OPTIMIZADO
export default function MisCursos() {
  const { misCursos, loading, error } = useMisCursos();
  const [activeTab, setActiveTab] = useState("ACTIVOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // ✅ CALCULAR ESTADÍSTICAS CON useMemo
  const statistics = useMemo(() => {
    const cursosActivos = misCursos.filter(
      (c) => c.activo && !isCourseExpired(c)
    );
    const cursosInactivos = misCursos.filter(
      (c) => !c.activo || isCourseExpired(c)
    );
    const cursosGratis = misCursos.filter((c) => c.precio === 0);
    const cursosPagados = misCursos.filter((c) => c.precio > 0);

    return {
      cursosActivos,
      cursosInactivos,
      cursosGratis,
      cursosPagados,
      total: misCursos.length,
    };
  }, [misCursos]);

  // ✅ FILTRAR CURSOS CON useMemo
  const filteredCursos = useMemo(() => {
    let filtered = [];

    switch (activeTab) {
      case "ACTIVOS":
        filtered = statistics.cursosActivos;
        break;
      case "INACTIVOS":
        filtered = statistics.cursosInactivos;
        break;
      case "GRATIS":
        filtered = statistics.cursosGratis;
        break;
      case "PAGADOS":
        filtered = statistics.cursosPagados;
        break;
      default:
        filtered = misCursos;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (curso) =>
          curso.titulo.toLowerCase().includes(term) ||
          (curso.descripcion &&
            curso.descripcion.toLowerCase().includes(term)) ||
          (curso.profesorNombre &&
            curso.profesorNombre.toLowerCase().includes(term)) ||
          (curso.asignatura && curso.asignatura.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [misCursos, statistics, activeTab, searchTerm]);

  // ✅ HANDLERS OPTIMIZADOS
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Error al cargar los cursos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header con gradiente - Oculto en móvil */}
      <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">MIS CURSOS</h1>
            <p className="text-blue-100">
              Gestiona y accede a todos tus cursos inscritos
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS - VERSIÓN COMPLETA */}
      <div className="relative">
        {/* VERSIÓN DESKTOP */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {/* Barra de búsqueda */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar mis cursos por título, descripción o profesor..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Estadísticas - Solo desktop */}
            <div className="hidden md:flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 border border-blue-200 dark:border-blue-700 shadow-sm transition-colors duration-200">
              <div className="grid grid-cols-4 gap-2 w-full">
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Total
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {statistics.total}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Activos
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {statistics.cursosActivos.length}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Inactivos
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {statistics.cursosInactivos.length}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Pagados
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                    <div className="font-bold text-purple-600 dark:text-purple-400">
                      {statistics.cursosPagados.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros - Desktop */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                {
                  key: "ACTIVOS",
                  label: "Activos",
                  icon: FaGraduationCap,
                  count: statistics.cursosActivos.length,
                },
                {
                  key: "INACTIVOS",
                  label: "Inactivos",
                  icon: FaMoneyBillWave,
                  count: statistics.cursosInactivos.length,
                },
                {
                  key: "GRATIS",
                  label: "Gratis",
                  icon: FaFilter,
                  count: statistics.cursosGratis.length,
                },
                {
                  key: "PAGADOS",
                  label: "Pagados",
                  icon: FaMoneyBillWave,
                  count: statistics.cursosPagados.length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VERSIÓN MÓVIL - BOTÓN FLOTANTE */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          {/* Botón flotante */}
          {!isSearchExpanded && (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaSearch className="text-xl" />
            </button>
          )}

          {/* Panel expandido - VERSIÓN CORREGIDA */}
          {isSearchExpanded && (
            <div className="fixed bottom-20 right-4 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] flex flex-col">
              {/* Header fijo */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Buscar y filtrar
                </h3>
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              {/* Contenido con scroll */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Barra de búsqueda */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar mis cursos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
                    autoFocus
                  />
                </div>

                {/* Filtros móviles */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                    Filtrar por:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        key: "ACTIVOS",
                        label: "Activos",
                        icon: FaGraduationCap,
                        count: statistics.cursosActivos.length,
                      },
                      {
                        key: "INACTIVOS",
                        label: "Inactivos",
                        icon: FaMoneyBillWave,
                        count: statistics.cursosInactivos.length,
                      },
                      {
                        key: "GRATIS",
                        label: "Gratis",
                        icon: FaFilter,
                        count: statistics.cursosGratis.length,
                      },
                      {
                        key: "PAGADOS",
                        label: "Pagados",
                        icon: FaMoneyBillWave,
                        count: statistics.cursosPagados.length,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          handleTabChange(tab.key);
                          setIsSearchExpanded(false);
                        }}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl font-medium transition-all duration-300 text-xs ${
                          activeTab === tab.key
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <tab.icon className="text-xs" />
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs ${
                            activeTab === tab.key
                              ? "bg-white/20"
                              : "bg-black/10 dark:bg-white/10"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estadísticas móviles */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">
                    Tus Estadísticas
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {statistics.total}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {statistics.cursosActivos.length}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Activos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón fijo en la parte inferior */}
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheck className="text-sm" />
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Overlay corregido */}
        {isSearchExpanded && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsSearchExpanded(false)}
          />
        )}
      </div>

      {/* CONTENEDOR PRINCIPAL CON SCROLL INTERNO */}
      <div className="flex-1 overflow-hidden">
        {filteredCursos.length === 0 ? (
          <EmptyState
            activeTab={activeTab}
            searchTerm={searchTerm}
            cursosCount={misCursos.length}
          />
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {filteredCursos.map((curso) => (
                <CursoCard key={curso.id} curso={curso} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
