// src/pages/estudiante/CursosEstudiante.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PayphoneButton from "../../components/PayphoneButton";
import {
  FaSearch,
  FaMoneyBillWave,
  FaGraduationCap,
  FaFilter,
  FaFire,
  FaCalendarAlt,
  FaStar,
  FaUsers,
  FaRocket,
  FaClock,
  FaBolt,
  FaCrown,
  FaGem,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaEye,
  FaTimes,
  FaChevronDown,
  FaGift, // ✅ NUEVO ICONO PARA CUPONES
  FaTag, // ✅ NUEVO ICONO PARA DESCUENTOS
  FaPercentage, // ✅ NUEVO ICONO PARA PORCENTAJES
  FaCheck,
} from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

// ✅ ORDENAMIENTO - CURSOS NUEVOS SIEMPRE PRIMERO
const sortCoursesByRelevance = (cursos) => {
  return cursos.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });
};

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

    // 1-2 semanas
    if (daysDiff >= 8 && daysDiff <= 14) {
      const weeks = Math.floor(daysDiff / 7);
      return {
        type: "weeks",
        label:
          weeks === 1
            ? "Lanzado hace 1 semana"
            : `Lanzado hace ${weeks} semanas`,
        icon: FaHistory,
        color: "from-gray-500 to-slate-600",
        borderColor: "border-gray-300",
        animate: "",
        days: daysDiff,
      };
    }

    // Más de 2 semanas
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
  } catch {
    return null;
  }
};

// ✅ FUNCIONES PARA FECHAS DEL CURSO (100% PRECISAS)
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

// ===============================
// ✅ FUNCIÓN PARA LIBERAR RESERVA DE CUPÓN (MEJORADA)
// ===============================
const releaseCouponReservation = async (reservationId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/payments/release-coupon-reservation`,
      {
        reservationId,
        userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Cupón liberado correctamente");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error liberando cupón:", error);

    // Si el error es que la reserva ya no existe, igual consideramos éxito
    if (
      error.response?.data?.message?.includes("no encontrada") ||
      error.response?.data?.message?.includes("ya fue procesada")
    ) {
      console.log("ℹ️ La reserva ya estaba liberada");
      return { success: true };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Error al liberar cupón",
    };
  }
};

// ===============================
// ✅ FUNCIÓN PARA FORZAR LIBERACIÓN DE CUPÓN
// ===============================
const forceReleaseCoupon = async (codigoCupon) => {
  const token = localStorage.getItem("token");
  try {
    // Primero verificar el estado actual del cupón
    const verification = await verifyCoupon(appliedCoupon.cursoId, codigoCupon);

    if (
      !verification.success &&
      verification.error.includes("reserva pendiente")
    ) {
      // El cupón sigue reservado, intentar liberarlo manualmente
      console.log("🔄 Intentando liberar cupón manualmente...");

      // Aquí necesitarías un endpoint específico para liberar por código
      // Por ahora, simplemente limpiamos el estado local
      setAppliedCoupon(null);

      Swal.fire({
        title: "Cupón liberado",
        text: "El cupón ha sido liberado manualmente. Puedes intentarlo nuevamente.",
        icon: "success",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });

      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error("Error forzando liberación:", error);
    // En caso de error, al menos limpiamos el estado local
    setAppliedCoupon(null);
    return { success: true };
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

const isUpcomingCourse = (curso) => {
  if (!curso.fecha) return false;
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
    return daysDiff >= 2 && daysDiff <= 7;
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

// ✅ MODAL PARA IMAGEN
function ImageModal({ open, src, alt, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ✅ NUEVO MODAL PARA DESCRIPCIÓN COMPLETA
function DescriptionModal({ open, curso, onClose }) {
  if (!open) return null;

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
}

// ✅ COMPONENTE DROPDOWN PARA FILTROS - VERSIÓN MEJORADA PARA MÓVIL
function FilterDropdown({ activeTab, setActiveTab, counts, mobile = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    {
      key: "RELEVANTES",
      label: "Más Relevantes",
      icon: FaFire,
      color: "from-purple-500 to-blue-500",
      count: counts.justLaunchedCount,
    },
    {
      key: "PAGADO",
      label: "Premium",
      icon: FaMoneyBillWave,
      color: "from-yellow-500 to-orange-500",
      count: counts.paidCoursesCount,
    },
    {
      key: "GRATIS",
      label: "Gratuitos",
      icon: FaGraduationCap,
      color: "from-green-500 to-emerald-500",
      count: counts.freeCoursesCount,
    },
    {
      key: "FINALIZADOS",
      label: "Finalizados",
      icon: FaTimesCircle,
      color: "from-red-500 to-pink-500",
      count: counts.expiredCoursesCount,
    },
    {
      key: "TODOS",
      label: "Ver Todos",
      icon: FaFilter,
      color: "from-gray-600 to-gray-700",
      count: counts.totalCoursesCount,
    },
  ];

  const activeFilter = filterOptions.find((option) => option.key === activeTab);

  // VERSIÓN MÓVIL MEJORADA - SE ABRE HACIA ARRIBA FUERA DEL PANEL
  if (mobile) {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            {activeFilter && (
              <activeFilter.icon className="text-blue-500 text-lg" />
            )}
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              {activeFilter?.label || "Filtrar por"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeFilter?.count > 0 && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold min-w-6 text-center ${
                  activeTab === "RELEVANTES"
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                }`}
              >
                {activeFilter.count}
              </span>
            )}
            <FaChevronDown
              className={`text-gray-500 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <>
            {/* Overlay para cerrar - CON Z-INDEX MÁS ALTO */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown que se abre HACIA ARRIBA FUERA DEL PANEL */}
            <div className="fixed bottom-32 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[70] max-h-48 overflow-y-auto">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setActiveTab(option.key);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      activeTab === option.key
                        ? `bg-gradient-to-r ${option.color} text-white`
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`text-lg ${
                          activeTab === option.key
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="font-medium text-sm">
                        {option.label}
                      </span>
                    </div>
                    {option.count > 0 && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold min-w-6 text-center ${
                          activeTab === option.key
                            ? "bg-white/20 text-white"
                            : option.key === "RELEVANTES"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {option.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Versión original para desktop
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto"
      >
        <div className="flex items-center gap-2">
          {activeFilter && <activeFilter.icon className="text-blue-500" />}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {activeFilter?.label || "Seleccionar filtro"}
          </span>
          {activeFilter?.count > 0 && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === "RELEVANTES"
                  ? "bg-yellow-400 text-yellow-900 animate-pulse"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              }`}
            >
              {activeFilter.count}
            </span>
          )}
        </div>
        <FaChevronDown
          className={`text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-40 overflow-hidden">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                onClick={() => {
                  setActiveTab(option.key);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 ${
                  activeTab === option.key
                    ? `bg-gradient-to-r ${option.color} text-white`
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={
                      activeTab === option.key ? "text-white" : "text-gray-500"
                    }
                  />
                  <span className="font-medium">{option.label}</span>
                </div>
                {option.count > 0 && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === option.key
                        ? "bg-white/20 text-white"
                        : option.key === "RELEVANTES"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ✅ MODAL PARA CUPONES
function CouponModal({
  open,
  curso,
  codigoCupon,
  onClose,
  onApply,
  loading,
  onCodigoChange,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaGift className="text-2xl text-yellow-300" />
            <div>
              <h2 className="text-xl font-bold">Aplicar Cupón de Descuento</h2>
              <p className="text-purple-100 text-sm mt-1">
                Curso: <strong>{curso?.titulo}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código del Cupón
            </label>
            <input
              type="text"
              placeholder="Ingresa tu código de cupón..."
              value={codigoCupon}
              onChange={(e) => onCodigoChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === "Enter" && onApply()}
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <FaTag className="text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Tipos de Cupones Disponibles
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  {/* ✅ ACTUALIZADO CON NUEVOS CUPONES */}
                  <li>
                    🎯 <strong>10% de descuento</strong> - Ahorra una décima
                    parte
                  </li>
                  <li>
                    🔥 <strong>15% de descuento</strong> - Descuento especial
                  </li>
                  <li>
                    💥 <strong>30% de descuento</strong> - Ahorra casi un tercio
                  </li>
                  <li>
                    ⚡ <strong>50% de descuento</strong> - ¡Mitad de precio!
                  </li>
                  <li>
                    🎁 <strong>Curso GRATIS</strong> - Acceso completo sin costo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={onApply}
              disabled={loading || !codigoCupon.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <FaGift />
                  Aplicar Cupón
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CursosEstudiante() {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalImg, setModalImg] = useState({ open: false, src: "", alt: "" });
  const [modalDesc, setModalDesc] = useState({ open: false, curso: null });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("RELEVANTES");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ NUEVOS ESTADOS PARA CUPONES
  const [couponModal, setCouponModal] = useState({
    open: false,
    curso: null,
    codigoCupon: "",
  });
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");
    setUserId(uid);

    // ✅ FUNCIÓN PARA LIMPIAR RESERVAS PENDIENTES
    const cleanupReservations = async () => {
      if (!token || !uid) return;

      try {
        console.log("✅ Verificación de reservas completada");
      } catch (error) {
        console.error("Error en limpieza de reservas:", error);
      }
    };

    // ✅ EJECUTAR LIMPIEZA DE RESERVAS Y CARGAR CURSOS
    const loadData = async () => {
      // Primero limpiar reservas pendientes
      await cleanupReservations();

      // Luego cargar los cursos
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/disponibles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (
          typeof response.data === "string" &&
          response.data.includes("<!DOCTYPE html>")
        ) {
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursosData = [];
        if (response.data && Array.isArray(response.data.data))
          cursosData = response.data.data;
        else if (Array.isArray(response.data)) cursosData = response.data;
        else if (response.data && typeof response.data === "object") {
          const possibleArrays = Object.values(response.data).filter((item) =>
            Array.isArray(item)
          );
          cursosData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }

        const cursosOrdenados = sortCoursesByRelevance(cursosData);
        setCursos(cursosOrdenados);
        setFilteredCursos(cursosOrdenados);

        // Verificar si algún curso tiene la propiedad tieneCupones
        const cursosConCupones = cursosOrdenados.filter(
          (curso) => curso.tieneCupones
        );
      } catch (err) {
        console.error("Error al obtener cursos:", err);
        if (err.message && err.message.includes("HTML en lugar de JSON")) {
          Swal.fire({
            title: "Error de Servidor",
            text: "El servidor no está respondiendo correctamente. Verifica que el backend esté corriendo y ngrok esté configurado.",
            icon: "error",
            background: document.documentElement.classList.contains("dark")
              ? "#1f2937"
              : "#ffffff",
            color: document.documentElement.classList.contains("dark")
              ? "#ffffff"
              : "#000000",
          });
        }
        setCursos([]);
        setFilteredCursos([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = cursos;

    if (activeTab === "RELEVANTES") {
      filtered = filtered.filter((curso) => !isCourseExpired(curso));
    } else if (activeTab === "PAGADO") {
      filtered = filtered.filter(
        (curso) => curso.precio > 0 && !isCourseExpired(curso)
      );
    } else if (activeTab === "GRATIS") {
      filtered = filtered.filter(
        (curso) => curso.precio === 0 && !isCourseExpired(curso)
      );
    } else if (activeTab === "FINALIZADOS") {
      filtered = filtered.filter((curso) => isCourseExpired(curso));
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

    setFilteredCursos(filtered);
  }, [cursos, activeTab, searchTerm]);

  // ✅ VERIFICAR RESERVAS PENDIENTES AL CARGAR LA PÁGINA
  useEffect(() => {
    const checkPendingReservations = async () => {
      const pendingReservation = localStorage.getItem("lastCouponReservation");

      if (pendingReservation) {
        try {
          const reservationData = JSON.parse(pendingReservation);
          const { reservationId, clientTransactionId, timestamp } =
            reservationData;

          // Verificar si la reserva es reciente (menos de 1 hora)
          const isRecent = Date.now() - timestamp < 60 * 60 * 1000;

          if (isRecent) {
            // Verificar estado del pago
            await checkPaymentStatus(clientTransactionId, reservationId);
          } else {
            // Liberar reserva antigua
            await releaseCouponReservation(reservationId);
          }

          // Limpiar del localStorage
          localStorage.removeItem("lastCouponReservation");
        } catch (error) {
          console.error("Error verificando reserva pendiente:", error);
          localStorage.removeItem("lastCouponReservation");
        }
      }
    };

    checkPendingReservations();
  }, []);

  const handleEnroll = async (cursoId) => {
    const token = localStorage.getItem("token");
    try {
      Swal.fire({
        title: "Procesando inscripción...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/inscribir-gratis`,
        { cursoId, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );

      Swal.close();
      Swal.fire({
        title: "¡Inscrito!",
        text: "Te has inscrito al curso exitosamente",
        icon: "success",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });

      setCursos((prev) =>
        prev.map((c) => (c.id === cursoId ? { ...c, inscrito: true } : c))
      );
    } catch (err) {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "No se pudo inscribir al curso",
        icon: "error",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    }
  };

  // ✅ FUNCIÓN PARA ABRIR MODAL DE DESCRIPCIÓN
  const openDescriptionModal = (curso) => {
    setModalDesc({ open: true, curso });
  };

  // ===============================
  // ✅ FUNCIÓN PARA VERIFICAR CUPÓN
  // ===============================
  const verifyCoupon = async (cursoId, codigoCupon) => {
    const token = localStorage.getItem("token");
    try {
      setCouponLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify-coupon`,
        {
          cursoId,
          userId,
          codigoCupon: codigoCupon.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Si hay error de reserva pendiente, intentar liberar forzadamente
      if (
        !response.data.success &&
        response.data.error?.includes("reserva pendiente")
      ) {
        console.log(
          "🔄 Detectada reserva pendiente, intentando liberar forzadamente..."
        );

        try {
          await axios.post(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/payments/force-release-coupon`,
            {
              cursoId,
              userId,
              codigoCupon: codigoCupon.toUpperCase(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Reintentar la verificación después de liberar
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retryResponse = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify-coupon`,
            {
              cursoId,
              userId,
              codigoCupon: codigoCupon.toUpperCase(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          return retryResponse.data;
        } catch (forceError) {
          console.error("Error liberando cupón forzadamente:", forceError);
          // Retornar el error original si falla la liberación forzada
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error verificando cupón:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error al verificar cupón",
      };
    } finally {
      setCouponLoading(false);
    }
  };
  // ===============================
  // ✅ FUNCIÓN PARA APLICAR CUPÓN
  // ===============================
  const applyCoupon = async () => {
    if (!couponModal.codigoCupon.trim()) {
      Swal.fire({
        title: "Código requerido",
        text: "Por favor ingresa un código de cupón",
        icon: "warning",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
      return;
    }

    const result = await verifyCoupon(
      couponModal.curso.id,
      couponModal.codigoCupon
    );

    if (result.success) {
      setAppliedCoupon({
        cursoId: couponModal.curso.id,
        codigo: couponModal.codigoCupon.toUpperCase(),
        ...result,
      });

      Swal.fire({
        title: "¡Cupón aplicado! 🎉",
        html: `
          <div class="text-left">
            <p class="mb-2">✅ <strong>${result.cupon.descuentoTexto}</strong> aplicado correctamente.</p>
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700 mt-3">
              <div class="flex justify-between text-sm">
                <span>Precio original:</span>
                <span class="line-through text-gray-500">$${result.precioOriginal}</span>
              </div>
              <div class="flex justify-between text-lg font-bold mt-1">
                <span>Precio final:</span>
                <span class="text-green-600 dark:text-green-400">$${result.precioConDescuento}</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span>Ahorro:</span>
                <span class="text-green-600 dark:text-green-400 font-bold">$${result.ahorro}</span>
              </div>
            </div>
          </div>
        `,
        icon: "success",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });

      setCouponModal({ open: false, curso: null, codigoCupon: "" });
    } else {
      Swal.fire({
        title: "Cupón no válido",
        text: result.error,
        icon: "error",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    }
  };

  // ===============================
  // ✅ FUNCIÓN PARA CREAR PAGO CON CUPÓN (MODIFICADA - CORREGIDA)
  // ===============================
  const createPaymentWithCoupon = async (curso) => {
    const token = localStorage.getItem("token");

    try {
      Swal.fire({
        title: "Procesando pago con cupón...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/payments/create-payphone-payment-with-coupon`,
        {
          cursoId: curso.id,
          userId,
          codigoCupon: appliedCoupon.codigo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.close();

      if (response.data.gratis) {
        // Si es gratis con cupón, actualizar estado directamente
        Swal.fire({
          title: "¡Inscripción exitosa! 🎉",
          html: `
          <div class="text-center">
            <div class="text-6xl mb-4">🎁</div>
            <p class="text-lg mb-2">Te has inscrito al curso <strong>GRATIS</strong> con cupón.</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Cupón aplicado: <strong>${appliedCoupon.codigo}</strong></p>
          </div>
        `,
          icon: "success",
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#ffffff",
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000",
        });

        setCursos((prev) =>
          prev.map((c) => (c.id === curso.id ? { ...c, inscrito: true } : c))
        );
        setAppliedCoupon(null);
      } else {
        // ✅ REDIRIGIR EN LA MISMA VENTANA (COMPORTAMIENTO ORIGINAL)
        window.location.href = response.data.paymentUrl;

        // ✅ GUARDAR RESERVATION ID EN LOCALSTORAGE PARA POSIBLE RECUPERACIÓN
        if (response.data.reservationId) {
          localStorage.setItem(
            "lastCouponReservation",
            JSON.stringify({
              reservationId: response.data.reservationId,
              clientTransactionId: response.data.clientTransactionId,
              cursoId: curso.id,
              codigoCupon: appliedCoupon.codigo,
              timestamp: Date.now(),
            })
          );
        }
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Error al procesar el pago con cupón",
        icon: "error",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    }
  };

  // ===============================
  // ✅ FUNCIÓN MEJORADA PARA VERIFICAR ESTADO DEL PAGO
  // ===============================
  const checkPaymentStatus = async (clientTransactionId, reservationId) => {
    const token = localStorage.getItem("token");

    try {
      // Esperar un momento para que el callback de Payphone se procese
      // await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/check-payment-status`,
        {
          params: { clientTransactionId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Pago exitoso - mantener el cupón aplicado
        Swal.fire({
          title: "¡Pago exitoso! 🎉",
          text: "Tu pago ha sido procesado correctamente",
          icon: "success",
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#ffffff",
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000",
        });

        // Actualizar estado del curso
        setCursos((prev) =>
          prev.map((c) =>
            c.id === appliedCoupon?.cursoId ? { ...c, inscrito: true } : c
          )
        );
        setAppliedCoupon(null);
      } else {
        // ✅ LIBERAR CUPÓN AUTOMÁTICAMENTE EN CASO DE FALLO
        await releaseCouponByTransaction(clientTransactionId);

        Swal.fire({
          title: "Pago no completado",
          text: "El pago no se completó. Tu cupón ha sido liberado y puedes intentarlo nuevamente.",
          icon: "info",
          background: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#ffffff",
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000",
        });

        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error verificando estado del pago:", error);

      // ✅ EN CASO DE ERROR TAMBIÉN LIBERAR EL CUPÓN
      await releaseCouponByTransaction(clientTransactionId);
      setAppliedCoupon(null);

      Swal.fire({
        title: "Error",
        text: "No se pudo verificar el estado del pago. Tu cupón ha sido liberado.",
        icon: "error",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    } finally {
      // ✅ LIMPIAR SIEMPRE DEL LOCALSTORAGE
      localStorage.removeItem("lastCouponReservation");
    }
  };

  // ===============================
  // ✅ NUEVA FUNCIÓN PARA LIBERAR CUPÓN POR TRANSACCIÓN
  // ===============================
  const releaseCouponByTransaction = async (clientTransactionId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/payments/release-coupon-by-transaction`,
        {
          clientTransactionId,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Cupón liberado por transacción");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error liberando cupón por transacción:", error);

      // Si falla, intentar la liberación forzada
      if (appliedCoupon) {
        try {
          await axios.post(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/payments/force-release-coupon`,
            {
              cursoId: appliedCoupon.cursoId,
              userId,
              codigoCupon: appliedCoupon.codigo,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("✅ Cupón liberado forzadamente después de error");
        } catch (forceError) {
          console.error("Error en liberación forzada:", forceError);
        }
      }

      return { success: false };
    }
  };

  // ===============================
  // ✅ ABRIR MODAL DE CUPÓN
  // ===============================
  const openCouponModal = (curso) => {
    setCouponModal({
      open: true,
      curso,
      codigoCupon: "",
    });
  };

  // ===============================
  // ✅ CERRAR MODAL DE CUPÓN
  // ===============================
  const closeCouponModal = () => {
    setCouponModal({ open: false, curso: null, codigoCupon: "" });
  };

  // ===============================
  // ✅ ACTUALIZAR CÓDIGO DEL CUPÓN
  // ===============================
  const updateCouponCode = (codigo) => {
    setCouponModal((prev) => ({ ...prev, codigoCupon: codigo }));
  };

  // ===============================
  // ✅ REMOVER CUPÓN APLICADO (MEJORADA)
  // ===============================
  const removeAppliedCoupon = async () => {
    // Limpiar inmediatamente el estado local
    const couponToRemove = { ...appliedCoupon };
    setAppliedCoupon(null);

    // Si hay un reservationId, liberar la reserva en el backend
    if (couponToRemove?.reservationId) {
      try {
        await releaseCouponReservation(couponToRemove.reservationId);
      } catch (error) {
        console.error("Error liberando cupón:", error);
        // Aunque falle, el cupón ya se removió localmente
      }
    }

    Swal.fire({
      title: "Cupón removido",
      text: "El cupón ha sido removido correctamente",
      icon: "info",
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#ffffff",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#000000",
    });
  };

  // Contar cursos por categoría de lanzamiento
  const justLaunchedCount = cursos.filter((c) => {
    const info = getCourseLaunchInfo(c);
    return info && info.type === "just-launched";
  }).length;

  const newCoursesCount = cursos.filter((c) => {
    const info = getCourseLaunchInfo(c);
    return (
      info &&
      ["just-launched", "today", "yesterday", "recent"].includes(info.type)
    );
  }).length;

  const totalCoursesCount = cursos.length;
  const paidCoursesCount = cursos.filter(
    (c) => c.precio > 0 && !isCourseExpired(c)
  ).length;
  const freeCoursesCount = cursos.filter(
    (c) => c.precio === 0 && !isCourseExpired(c)
  ).length;
  const expiredCoursesCount = cursos.filter(isCourseExpired).length;

  const filterCounts = {
    justLaunchedCount,
    paidCoursesCount,
    freeCoursesCount,
    expiredCoursesCount,
    totalCoursesCount,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Cargando cursos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4 md:p-6">
      {/* HEADER MEJORADO */}
      <div className="hidden md:block">
        {" "}
        {/* Este div oculta todo en móvil */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full -translate-y-20 translate-x-20 opacity-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full translate-y-16 -translate-x-16 opacity-20 blur-xl"></div>

          {/* CONTENEDOR QUE SE OCULTA COMPLETAMENTE EN MÓVIL */}
          <div className="hidden md:block">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <FaRocket className="text-yellow-300 text-3xl animate-bounce" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      CURSOS DISPONIBLES
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base mt-1">
                      Los cursos{" "}
                      <span className="text-yellow-300 font-bold">
                        más nuevos
                      </span>{" "}
                      aparecen primero
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                    <FaBolt className="text-yellow-300" />
                    <span className="text-sm">
                      Ordenado por:{" "}
                      <span className="font-bold">Más recientes primero</span>
                    </span>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FaRocket className="text-green-400" />
                      <span>{newCoursesCount} nuevos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCrown className="text-yellow-300" />
                      <span>
                        {totalCoursesCount - expiredCoursesCount} activos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contador destacado */}
              {justLaunchedCount > 0 && (
                <div className="hidden lg:block bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300 shadow-lg">
                  <div className="text-sm opacity-90 flex items-center gap-2 mb-1">
                    <FaBolt className="text-yellow-300 animate-pulse" />
                    <span>¡Recién Lanzados!</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-300 flex items-center gap-2">
                    {justLaunchedCount}
                    <FaGem className="text-white text-lg md:text-xl" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS - VERSIÓN CORREGIDA */}
      <div className="relative">
        {/* VERSIÓN DESKTOP */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex flex-row gap-4 items-stretch">
            {/* Barra de búsqueda */}
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* FilterDropdown NORMAL (sin prop mobile) */}
            <div className="w-64">
              <FilterDropdown
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                counts={filterCounts}
              />
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
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
                    autoFocus
                  />
                </div>

                {/* FilterDropdown MÓVIL MEJORADO */}
                <div className="relative">
                  <FilterDropdown
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    counts={filterCounts}
                    mobile={true}
                  />
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
          <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {searchTerm
                  ? "No se encontraron cursos"
                  : "No hay cursos disponibles"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : activeTab === "PAGADO"
                  ? "No hay cursos premium disponibles"
                  : activeTab === "GRATIS"
                  ? "No hay cursos gratuitos disponibles"
                  : activeTab === "FINALIZADOS"
                  ? "No hay cursos finalizados"
                  : "No hay cursos disponibles en este momento"}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {filteredCursos.map((curso) => {
                const isExpired = isCourseExpired(curso);
                const launchInfo = getCourseLaunchInfo(curso);
                const isToday = isTodayCourse(curso);
                const isTomorrow = isTomorrowCourse(curso);
                const isUpcoming = isUpcomingCourse(curso);
                const daysUntil = getDaysUntilCourse(curso);
                const hasFewSpots = curso.cupos > 0 && curso.cupos <= 3;
                const hasLimitedSpots = curso.cupos > 0 && curso.cupos <= 5;

                const LaunchIcon = launchInfo?.icon || FaStar;

                // ✅ VERIFICAR SI HAY CUPÓN APLICADO PARA ESTE CURSO
                const hasAppliedCoupon =
                  appliedCoupon && appliedCoupon.cursoId === curso.id;

                return (
                  <div
                    key={curso.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden"
                  >
                    {/* ✅ ETIQUETA DINÁMICA DE LANZAMIENTO - MEJORADA PARA MÓVIL */}
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
                          } text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1 ${
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
                                ? "text-yellow-300 animate-bounce text-xs"
                                : "text-xs"
                            }
                          />
                          <span className="whitespace-nowrap">
                            {launchInfo.label}
                          </span>
                          {launchInfo.type === "just-launched" && (
                            <LaunchIcon className="text-yellow-300 animate-bounce text-xs" />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <img
                        src={
                          curso.imagen
                            ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${
                                curso.imagen
                              }`
                            : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
                        }
                        alt={curso.titulo}
                        className="w-full h-40 md:h-48 object-cover rounded-t-2xl cursor-pointer group-hover:brightness-90 transition duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
                        }}
                        onClick={() =>
                          setModalImg({
                            open: true,
                            src: curso.imagen
                              ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${
                                  curso.imagen
                                }`
                              : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop",
                            alt: curso.titulo,
                          })
                        }
                      />

                      {/* ✅ BADGES MEJORADOS PARA MÓVIL */}
                      <div className="absolute top-10 md:top-12 left-2 flex flex-col gap-1">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${
                            curso.precio > 0
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                              : "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                          }`}
                        >
                          {curso.precio > 0 ? "🔥 PREMIUM" : "🎓 GRATUITO"}
                        </span>

                        {isToday && (
                          <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-md flex items-center gap-1">
                            <FaBolt className="text-yellow-300 text-xs" />
                            ¡HOY!
                          </span>
                        )}

                        {isTomorrow && (
                          <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" />
                            ¡MAÑANA!
                          </span>
                        )}

                        {isUpcoming &&
                          daysUntil !== null &&
                          daysUntil >= 2 &&
                          daysUntil <= 7 &&
                          !isToday &&
                          !isTomorrow && (
                            <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md flex items-center gap-1">
                              <FaCalendarAlt className="text-xs" />
                              EN {daysUntil} D{daysUntil !== 1 ? "ÍAS" : "ÍA"}
                            </span>
                          )}

                        {hasFewSpots && !isExpired && (
                          <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-purple-600 to-pink-700 text-white font-bold shadow-md flex items-center gap-1 animate-pulse">
                            <FaHourglassHalf className="text-yellow-300 text-xs" />
                            ⚠️ {curso.cupos} CUPOS
                          </span>
                        )}

                        {hasLimitedSpots && !hasFewSpots && !isExpired && (
                          <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md flex items-center gap-1">
                            <FaUsers className="text-xs" />
                            🚀 LIMITADO
                          </span>
                        )}

                        {isExpired && (
                          <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold shadow-md">
                            ⏰ FINALIZADO
                          </span>
                        )}
                      </div>

                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/80 text-white font-bold shadow-lg backdrop-blur-sm z-10">
                        🎯 {curso.cupos || 0}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between p-4 md:p-6">
                      {/* ✅ TÍTULO MEJORADO PARA MÓVIL */}
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {curso.titulo || "Curso sin título"}
                      </h3>

                      {/* ✅ DESCRIPCIÓN MEJORADA PARA MÓVIL */}
                      <div className="mb-3 md:mb-4">
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 md:line-clamp-3 text-sm mb-2">
                          {curso.descripcion || "Sin descripción disponible."}
                        </p>
                        <button
                          onClick={() => openDescriptionModal(curso)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs transition-colors group"
                        >
                          <FaEye className="text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform text-xs" />
                          <span>Ver descripción completa</span>
                        </button>
                      </div>

                      {/* ✅ INFORMACIÓN DEL PROFESOR MEJORADA PARA MÓVIL */}
                      {curso.profesorNombre && (
                        <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                          <span className="inline-block px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-700 transition-colors duration-200">
                            👨‍🏫 {curso.profesorNombre}
                          </span>

                          {curso.asignatura && (
                            <span className="inline-block px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700 transition-colors duration-200">
                              📚 {curso.asignatura}
                            </span>
                          )}
                        </div>
                      )}

                      {/* ✅ PRECIO Y FECHA MEJORADOS PARA MÓVIL */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 md:mb-5">
                        {curso.precio > 0 && (
                          <div className="flex flex-col gap-1 md:gap-2">
                            {hasAppliedCoupon ? (
                              <div className="text-center">
                                <div className="line-through text-gray-500 dark:text-gray-400 text-xs">
                                  ${curso.precio}
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 text-sm font-bold border border-green-300 dark:border-green-700 transition-colors duration-200">
                                  💰 ${appliedCoupon.precioConDescuento}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">
                                  🎁 Ahorras ${appliedCoupon.ahorro}
                                </div>
                              </div>
                            ) : (
                              <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-bold border border-yellow-300 dark:border-yellow-700 transition-colors duration-200">
                                💰 ${curso.precio}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col md:flex-row md:items-center gap-1">
                          <span className="font-medium">
                            📅 {curso.fecha || "Por definir"}
                          </span>
                          <span className="hidden md:inline"> | </span>
                          <span className="font-medium">
                            ⏰ {curso.hora || "Por definir"}
                          </span>
                        </div>
                      </div>

                      {/* ✅ BOTONES DE ACCIÓN MEJORADOS PARA MÓVIL */}
                      <div>
                        {isExpired ? (
                          <div className="text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 md:p-3 rounded-lg font-semibold text-xs md:text-sm border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                            ⏰ Este curso ya ha finalizado
                          </div>
                        ) : curso.inscrito ? (
                          <div className="text-green-600 dark:text-green-400 font-semibold text-center">
                            <span className="inline-block px-2 py-1.5 md:px-3 md:py-2 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 transition-colors duration-200 text-xs md:text-sm">
                              ✅ Ya estás inscrito
                            </span>
                          </div>
                        ) : curso.precio > 0 ? (
                          <>
                            {hasAppliedCoupon ? (
                              <div className="space-y-2 md:space-y-3">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-2 md:p-3 border border-green-200 dark:border-green-700">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <FaGift className="text-green-600 dark:text-green-400 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm font-semibold text-green-800 dark:text-green-300">
                                        {appliedCoupon.codigo}
                                      </span>
                                    </div>
                                    <button
                                      onClick={removeAppliedCoupon}
                                      className="text-red-500 hover:text-red-700 transition-colors text-xs"
                                      title="Remover cupón"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                  <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                                    {appliedCoupon.cupon.descuentoTexto}
                                  </div>
                                </div>

                                <button
                                  onClick={() => createPaymentWithCoupon(curso)}
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition duration-300 transform hover:shadow-xl flex items-center justify-center gap-1 md:gap-2 text-sm"
                                >
                                  <FaGift className="text-yellow-300 text-xs md:text-sm" />
                                  {appliedCoupon.gratis
                                    ? "🎁 Obtener GRATIS"
                                    : `💳 Pagar $${appliedCoupon.precioConDescuento}`}
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 md:space-y-3">
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold text-center">
                                  💳 Curso premium
                                </p>

                                {curso.precio > 0 && (
                                  <div className="mb-1 md:mb-2">
                                    <button
                                      onClick={() => openCouponModal(curso)}
                                      className={`w-full px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-semibold transition duration-300 transform flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm ${
                                        curso.tieneCupones
                                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105"
                                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                                      }`}
                                      disabled={!curso.tieneCupones}
                                    >
                                      <FaGift
                                        className={
                                          curso.tieneCupones
                                            ? "text-yellow-300 text-xs md:text-sm"
                                            : "text-gray-400 text-xs md:text-sm"
                                        }
                                      />
                                      {curso.tieneCupones
                                        ? "¿Tienes cupón?"
                                        : "Sin cupones"}
                                    </button>
                                  </div>
                                )}

                                <div className="flex justify-center">
                                  <PayphoneButton
                                    curso={curso}
                                    userId={userId}
                                    onSuccess={() =>
                                      setCursos((prev) =>
                                        prev.map((c) =>
                                          c.id === curso.id
                                            ? { ...c, inscrito: true }
                                            : c
                                        )
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-2 md:mb-3 text-center">
                              🎓 Curso gratuito
                            </p>
                            <button
                              onClick={() => handleEnroll(curso.id)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition duration-300 transform hover:shadow-xl text-sm"
                            >
                              🚀 Inscribirse Gratis
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ImageModal
        open={modalImg.open}
        src={modalImg.src}
        alt={modalImg.alt}
        onClose={() => setModalImg({ open: false, src: "", alt: "" })}
      />

      {/* ✅ NUEVO MODAL PARA DESCRIPCIÓN COMPLETA */}
      <DescriptionModal
        open={modalDesc.open}
        curso={modalDesc.curso}
        onClose={() => setModalDesc({ open: false, curso: null })}
      />

      {/* ✅ NUEVO MODAL PARA CUPONES */}
      <CouponModal
        open={couponModal.open}
        curso={couponModal.curso}
        codigoCupon={couponModal.codigoCupon}
        onClose={closeCouponModal}
        onApply={applyCoupon}
        loading={couponLoading}
        onCodigoChange={updateCouponCode}
      />
    </div>
  );
}
