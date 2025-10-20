import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  FaCrown,
  FaGem,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
} from "react-icons/fa";

// ✅ FUNCIONES MEJORADAS PARA DETECCIÓN DE CURSOS NUEVOS
const getCourseLaunchInfo = (curso) => {
  if (!curso.createdAt) return null;

  try {
    const courseDate = new Date(curso.createdAt);
    const now = new Date();
    const hoursDiff = (now - courseDate) / (1000 * 60 * 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    // Menos de 6 horas
    if (hoursDiff < 6) {
      return {
        type: "just-launched",
        label: "¡RECIÉN LANZADO!",
        icon: FaBolt,
        color: "from-green-500 to-emerald-600",
        borderColor: "border-yellow-300",
        animate: "animate-pulse",
        hours: Math.floor(hoursDiff),
      };
    }

    // Menos de 24 horas
    if (hoursDiff < 24) {
      return {
        type: "today",
        label: `Lanzado hace ${Math.floor(hoursDiff)}h`,
        icon: FaRocket,
        color: "from-blue-500 to-cyan-600",
        borderColor: "border-blue-300",
        animate: "",
        hours: Math.floor(hoursDiff),
      };
    }

    // 1 día
    if (daysDiff === 1) {
      return {
        type: "yesterday",
        label: "Lanzado hace 1 día",
        icon: FaStar,
        color: "from-purple-500 to-indigo-600",
        borderColor: "border-purple-300",
        animate: "",
        days: 1,
      };
    }

    // 2-3 días
    if (daysDiff >= 2 && daysDiff <= 3) {
      return {
        type: "recent",
        label: `Lanzado hace ${daysDiff} días`,
        icon: FaStar,
        color: "from-indigo-500 to-purple-600",
        borderColor: "border-indigo-300",
        animate: "",
        days: daysDiff,
      };
    }

    // 4-7 días (una semana)
    if (daysDiff >= 4 && daysDiff <= 7) {
      return {
        type: "week",
        label: `Lanzado hace ${daysDiff} días`,
        icon: FaCalendarAlt,
        color: "from-orange-500 to-amber-600",
        borderColor: "border-orange-300",
        animate: "",
        days: daysDiff,
      };
    }

    return null;
  } catch {
    return null;
  }
};

// ✅ FUNCIONES PARA FECHAS DEL CURSO
const isTodayCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fechaStr === todayStr;
  } catch {
    return false;
  }
};

const isTomorrowCourse = (curso) => {
  if (!curso.fecha) return false;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    return fechaStr === tomorrowStr;
  } catch {
    return false;
  }
};

const getDaysUntilCourse = (curso) => {
  if (!curso.fecha) return null;
  try {
    const fechaStr = curso.fecha.split("T")[0];
    const [year, month, day] = fechaStr.split("-").map(Number);
    const courseDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const daysDiff = Math.round(
      (courseDate - todayDate) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= 0 ? daysDiff : null;
  } catch {
    return null;
  }
};

// ✅ MODAL PARA DESCRIPCIÓN COMPLETA
function DescriptionModal({ open, curso, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold mb-2 pr-8">
            {curso.titulo || "Curso sin título"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {curso.profesor && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                👨‍🏫 {curso.profesor.nombres} {curso.profesor.apellidos}
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                curso.precio > 0
                  ? "bg-yellow-500/20 text-yellow-200"
                  : "bg-blue-500/20 text-blue-200"
              }`}
            >
              {curso.precio > 0 ? "💰 PREMIUM" : "🎓 GRATUITO"}
            </span>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <FaEye className="text-blue-500" />
              Descripción Completa del Curso
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {curso.descripcion ||
                  "Este curso no tiene descripción disponible."}
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700 transition-colors duration-200">
              <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                📅 Fecha del Curso
              </div>
              <div className="text-blue-700 dark:text-blue-400">
                {curso.fecha || "Por definir"}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700 transition-colors duration-200">
              <div className="font-semibold text-green-800 dark:text-green-300 mb-1">
                ⏰ Horario
              </div>
              <div className="text-green-700 dark:text-green-400">
                {curso.hora || "Por definir"}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700 transition-colors duration-200">
              <div className="font-semibold text-purple-800 dark:text-purple-300 mb-1">
                🎯 Cupos Disponibles
              </div>
              <div className="text-purple-700 dark:text-purple-400">
                {curso.cupos || 0} cupos
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700 transition-colors duration-200">
              <div className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                💰 Precio
              </div>
              <div className="text-orange-700 dark:text-orange-400">
                {curso.precio > 0 ? `$${curso.precio} USD` : "Gratuito"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            Cerrar Descripción
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ MODAL PARA VER IMAGEN EN GRANDE
function ImageModal({ open, imageUrl, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <FaTimes className="text-2xl" />
        </button>
        <img
          src={imageUrl}
          alt="Imagen del curso"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

// ✅ COMPONENTE CURSO CARD MEJORADO
function CursoCard({ curso, onAccessClick }) {
  const [modalDesc, setModalDesc] = useState({ open: false, curso: null });
  const [modalImage, setModalImage] = useState({ open: false, imageUrl: "" });

  // ✅ USAR LAS MISMAS FUNCIONES MEJORADAS
  const launchInfo = getCourseLaunchInfo(curso);
  const isToday = isTodayCourse(curso);
  const isTomorrow = isTomorrowCourse(curso);
  const daysUntil = getDaysUntilCourse(curso);
  const hasFewSpots = curso.cupos > 0 && curso.cupos <= 3;
  const hasLimitedSpots = curso.cupos > 0 && curso.cupos <= 5;

  const LaunchIcon = launchInfo?.icon || FaStar;

  // ✅ FUNCIÓN PARA ABRIR MODAL DE DESCRIPCIÓN
  const openDescriptionModal = () => {
    setModalDesc({ open: true, curso });
  };

  // ✅ FUNCIÓN PARA ABRIR IMAGEN EN GRANDE
  const openImageModal = () => {
    const imageUrl = curso.imagen
      ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
      : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
    setModalImage({ open: true, imageUrl });
  };

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden h-full">
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
          <div className="relative cursor-pointer" onClick={openImageModal}>
            <img
              src={
                curso.imagen
                  ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${
                      curso.imagen
                    }`
                  : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
              }
              alt={curso.titulo}
              className="w-full h-48 object-cover rounded-t-2xl group-hover:brightness-90 transition duration-300"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
              }}
            />
            {/* Botón para expandir imagen */}
            <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaExpand className="w-3 h-3" />
            </div>
          </div>

          <div className="absolute top-12 left-12 flex flex-col gap-1">
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

            {daysUntil !== null &&
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
            {hasFewSpots && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-purple-600 to-pink-700 text-white font-bold shadow-md flex items-center gap-1 animate-pulse">
                <FaHourglassHalf className="text-yellow-300" />
                ⚠️ ÚLTIMOS {curso.cupos} CUPOS!
              </span>
            )}

            {hasLimitedSpots && !hasFewSpots && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md flex items-center gap-1">
                <FaUsers />
                🚀 CUPOS LIMITADOS
              </span>
            )}
          </div>

          {/* CONTADOR DE CUPOS */}
          <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/80 text-white font-bold shadow-lg backdrop-blur-sm z-10">
            🎯 {curso.cupos || 0} Cupos
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between p-6">
          {/* TÍTULO */}
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {curso.titulo}
          </h3>

          {/* ✅ DESCRIPCIÓN CON BOTÓN "VER MÁS" */}
          <div className="mb-4">
            <p className="text-gray-700 line-clamp-3 mb-3">
              {curso.descripcion || "Sin descripción disponible."}
            </p>
            <button
              onClick={openDescriptionModal}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
            >
              <FaEye className="text-blue-500 group-hover:scale-110 transition-transform" />
              <span>Ver descripción completa</span>
            </button>
          </div>

          {/* INFORMACIÓN DEL PROFESOR */}
          {curso.profesor && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                👨‍🏫 Profesor: {curso.profesor.nombres} {curso.profesor.apellidos}
              </span>

              <span className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                📚 {curso.tipo.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* INFORMACIÓN DE FECHA Y PRECIO */}
          <div className="flex justify-between items-center mb-5">
            {curso.precio > 0 && (
              <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-base font-bold border border-yellow-300">
                💰 ${curso.precio}
              </span>
            )}
            <div className="text-xs text-gray-500">
              <span className="font-medium">
                📅 {curso.fecha || "Por definir"}
              </span>
              {" | "}
              <span className="font-medium">
                ⏰ {curso.hora || "Por definir"}
              </span>
            </div>
          </div>

          {/* BOTÓN DE ACCESO */}
          <button
            onClick={onAccessClick}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 rounded-xl font-bold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <FaGraduationCap className="text-lg" />
            INGRESAR AL SISTEMA
          </button>
        </div>
      </div>

      {/* ✅ MODAL PARA DESCRIPCIÓN COMPLETA */}
      <DescriptionModal
        open={modalDesc.open}
        curso={modalDesc.curso}
        onClose={() => setModalDesc({ open: false, curso: null })}
      />

      {/* ✅ MODAL PARA IMAGEN EN GRANDE */}
      <ImageModal
        open={modalImage.open}
        imageUrl={modalImage.imageUrl}
        onClose={() => setModalImage({ open: false, imageUrl: "" })}
      />
    </>
  );
}

// ✅ COMPONENTE PAGINACIÓN
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <FaChevronLeft className="w-4 h-4" />
        Anterior
      </button>

      {/* Primera página */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}

      {/* Páginas numeradas */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            currentPage === page
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Última página */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Siguiente
        <FaChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL
const CursosDisponibles = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const cursosPerPage = 9; // 3 columnas × 3 filas = 9 cursos por página

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/all`
        );
        const data = await res.json();

        // ✅ ORDENAR CURSOS: Los más recientes primero
        const cursosOrdenados = data.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          const timestampA = new Date(a.createdAt).getTime();
          const timestampB = new Date(b.createdAt).getTime();
          return timestampB - timestampA;
        });

        setCursos(cursosOrdenados);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  // ✅ Calcular cursos para la página actual
  const indexOfLastCurso = currentPage * cursosPerPage;
  const indexOfFirstCurso = indexOfLastCurso - cursosPerPage;
  const currentCursos = cursos.slice(indexOfFirstCurso, indexOfLastCurso);
  const totalPages = Math.ceil(cursos.length / cursosPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll suave hacia arriba cuando cambia de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">
            Cargando cursos...
          </div>
        </div>
      </div>
    );

  if (!cursos.length)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-gray-500">
            Pronto tendremos nuevos cursos para ti.
          </p>
        </div>
      </div>
    );

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Mejorado */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cursos Disponibles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Explora todos los cursos que tenemos para ti en{" "}
            <span className="font-semibold text-blue-600">MAAT ACADEMY</span>.
            Para acceder al contenido completo, regístrate o inicia sesión.
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <p className="text-gray-700 font-medium">
              🎓 <span className="text-blue-600">+{cursos.length} cursos</span>{" "}
              disponibles en diferentes modalidades
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Página {currentPage} de {totalPages} - Mostrando{" "}
              {currentCursos.length} cursos
            </p>
          </div>
        </div>

        {/* Grid de Cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentCursos.map((curso) => (
            <CursoCard
              key={curso.id}
              curso={curso}
              onAccessClick={() => navigate("/login")}
            />
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-gray-600 mb-6">
              Regístrate ahora y accede a todos nuestros cursos, materiales
              exclusivos y comunidad de aprendizaje.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Crear Cuenta Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CursosDisponibles;
