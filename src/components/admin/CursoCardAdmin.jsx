import React from "react";
import { Link } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { isCourseExpired } from "../../utils/dateUtils";
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
  FaArchive,
  FaUndo,
  FaTrash,
} from "react-icons/fa";

// ✅ FUNCIONES OPTIMIZADAS (sin cambios)
const getCourseLaunchInfo = (curso) => {
  if (!curso.createdAt) return null;

  const courseDate = new Date(curso.createdAt);
  const now = new Date();
  const hoursDiff = (now - courseDate) / (1000 * 60 * 60);
  const daysDiff = Math.floor(hoursDiff / 24);

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

  if (daysDiff >= 8 && daysDiff <= 14) {
    const weeks = Math.floor(daysDiff / 7);
    return {
      type: "weeks",
      label:
        weeks === 1 ? "Lanzado hace 1 semana" : `Lanzado hace ${weeks} semanas`,
      icon: FaHistory,
      color: "from-gray-500 to-slate-600",
      borderColor: "border-gray-300",
      animate: "",
      days: daysDiff,
    };
  }

  if (daysDiff > 14) {
    const weeks = Math.floor(daysDiff / 7);
    return {
      type: "old",
      label: `Lanzado hace ${weeks} semanas`,
      icon: FaHistory,
      color: "from-gray-400 to-gray-500",
      borderColor: "border-gray-200",
      animate: "",
      days: daysDiff,
    };
  }

  return null;
};

// ✅ FUNCIONES DE FECHA OPTIMIZADAS (sin cambios)
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

// MODAL MEMOIZADO
const DescriptionModal = React.memo(({ open, curso, onClose }) => {
  if (!open) return null;

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200"
        onClick={handleContentClick}
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
            {curso.activo === false && (
              <span className="bg-red-500/20 px-3 py-1 rounded-full text-sm text-red-200">
                📁 INACTIVO
              </span>
            )}
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
});

// ✅ COMPONENTE PRINCIPAL OPTIMIZADO
function CursoCardAdmin({ curso, setCursos, showInactive = false }) {
  const token = localStorage.getItem("token");
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

  // ✅ MEMOIZAR HANDLERS
  const eliminarCurso = useCallback(async () => {
    const confirm = await Swal.fire({
      title: "¿Archivar curso?",
      text: "El curso se moverá a la sección de inactivos y los estudiantes no podrán verlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, archivar",
      cancelButtonText: "Cancelar",
      background: "#fff",
      color: "#333",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${
          curso.id
        }/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCursos((prev) => prev.filter((c) => c.id !== curso.id));
      Swal.fire(
        "Archivado",
        "Curso movido a inactivos correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error al archivar curso:", error);
      Swal.fire("Error", "No se pudo archivar el curso", "error");
    }
  }, [curso.id, token, setCursos]);

  const restaurarCurso = useCallback(async () => {
    const confirm = await Swal.fire({
      title: "¿Restaurar curso?",
      text: "El curso volverá a estar activo y visible para los estudiantes.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      background: "#fff",
      color: "#333",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${curso.id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCursos((prev) => prev.filter((c) => c.id !== curso.id));
      Swal.fire("Restaurado", "Curso activado correctamente", "success");
    } catch (error) {
      console.error("Error al restaurar curso:", error);
      Swal.fire("Error", "No se pudo restaurar el curso", "error");
    }
  }, [curso.id, token, setCursos]);

  const openDescriptionModal = useCallback(() => {
    setModalDesc({ open: true, curso });
  }, [curso]);

  const closeDescriptionModal = useCallback(() => {
    setModalDesc({ open: false, curso: null });
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

  // En CursoCardAdmin.jsx - agregar esta función
  const eliminarDefinitivamente = useCallback(async () => {
    const confirm = await Swal.fire({
      title: "¿ELIMINAR DEFINITIVAMENTE?",
      html: `
      <div class="text-left">
        <p class="text-red-600 font-bold mb-3">⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER</p>
        <p class="mb-2">Se eliminará permanentemente:</p>
        <ul class="list-disc list-inside text-sm space-y-1">
          <li>El curso: <strong>"${curso.titulo}"</strong></li>
          <li>Todos los cupones asociados al curso</li>
          <li>Las inscripciones de estudiantes</li>
          <li>Los registros de pagos relacionados</li>
        </ul>
        <p class="mt-3 text-red-600 font-semibold">¿Estás completamente seguro?</p>
      </div>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "SÍ, ELIMINAR DEFINITIVAMENTE",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      background: "#fff",
      color: "#333",
      customClass: {
        confirmButton: "swal2-confirm-danger",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${curso.id}/permanent`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCursos((prev) => prev.filter((c) => c.id !== curso.id));
        Swal.fire({
          title: "✅ ELIMINADO",
          text: response.data.message,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", response.data.message, "error");
      }
    } catch (error) {
      console.error("Error al eliminar curso definitivamente:", error);
      const errorMessage =
        error.response?.data?.message || "No se pudo eliminar el curso";
      Swal.fire("Error", errorMessage, "error");
    }
  }, [curso.id, curso.titulo, token, setCursos]);

  // ✅ IMAGE ERROR HANDLER MEMOIZADO
  const handleImageError = useCallback((e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
  }, []);

  return (
    <>
      <div
        className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 ${
          curso.activo === false
            ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
            : "border-gray-200 dark:border-gray-700"
        } hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden`}
      >
        {/* ✅ ETIQUETA DE CURSO INACTIVO */}
        {curso.activo === false && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 border-2 border-red-300">
              <FaArchive className="text-white" />
              INACTIVO
            </div>
          </div>
        )}

        {/* ✅ ETIQUETA DINÁMICA DE LANZAMIENTO */}
        {launchInfo && curso.activo !== false && (
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
            className={`w-full h-48 object-cover rounded-t-2xl transition duration-300 ${
              curso.activo === false
                ? "grayscale opacity-70"
                : "group-hover:brightness-90"
            }`}
            onError={handleImageError}
            loading="lazy"
          />

          {curso.activo !== false && (
            <div className="absolute top-12 left-2 flex flex-col gap-1">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md ${
                  curso.precio > 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                    : "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                }`}
              >
                {curso.precio > 0 ? "🔥 PREMIUM" : "🎓 GRATUITO"}
              </span>

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

              {isExpired && (
                <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold shadow-md">
                  ⏰ FINALIZADO
                </span>
              )}
            </div>
          )}

          <span className="absolute top-2 right-2 px-4 py-2 rounded-full text-xs bg-black/70 text-white font-bold shadow-lg backdrop-blur-sm">
            🎯 {curso.cupos || 0} CUPOS
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between p-6">
          <h3
            className={`text-xl font-bold mb-3 ${
              curso.activo === false
                ? "text-gray-500 dark:text-gray-400 line-through"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {curso.titulo}
          </h3>
          <div className="mb-4">
            <p
              className={`line-clamp-3 mb-3 ${
                curso.activo === false
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
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
          {curso.profesor && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-700">
                👨‍🏫 Profesor: {curso.profesor.nombres} {curso.profesor.apellidos}
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700">
                📚 {curso.tipo.replace(/_/g, " ")}
              </span>
            </div>
          )}
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

          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full">
            {curso.activo === false ? (
              <>
                <button
                  onClick={restaurarCurso}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex-1 min-w-0 text-sm sm:text-base"
                >
                  <FaUndo className="text-xs sm:text-sm" />
                  <span className="truncate">Restaurar</span>
                </button>
                <Link
                  to={`/admin/estudiantes-curso/${curso.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex-1 min-w-0 text-sm sm:text-base"
                >
                  <span className="text-xs sm:text-sm">👥</span>
                  <span className="truncate">Ver Inscritos</span>
                </Link>
                {/* ✅ NUEVO BOTÓN ELIMINAR DEFINITIVAMENTE */}
                <button
                  onClick={eliminarDefinitivamente}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold shadow-lg hover:from-red-800 hover:to-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex-1 min-w-0 text-sm sm:text-base border-2 border-red-500"
                >
                  <FaTrash className="text-xs sm:text-sm" />
                  <span className="truncate">Eliminar Definitivamente</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/admin/editar-curso/${curso.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex-1 min-w-0 text-sm sm:text-base"
                >
                  <span className="text-xs sm:text-sm">✏️</span>
                  <span className="truncate">Editar</span>
                </Link>
                <Link
                  to={`/admin/estudiantes-curso/${curso.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex-1 min-w-0 text-sm sm:text-base"
                >
                  <span className="text-xs sm:text-sm">👥</span>
                  <span className="truncate">Estudiantes</span>
                </Link>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex-1 min-w-0 text-sm sm:text-base"
                  onClick={eliminarCurso}
                >
                  <FaArchive className="text-xs sm:text-sm" />
                  <span className="truncate">Archivar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <DescriptionModal
        open={modalDesc.open}
        curso={modalDesc.curso}
        onClose={closeDescriptionModal}
      />
    </>
  );
}

// ✅ EXPORTAR CON MEMO
export default React.memo(CursoCardAdmin);
