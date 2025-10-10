// src/pages/estudiante/MisCursos.jsx
import { useEffect, useState } from "react";
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
  FaCrown,
  FaGem
} from "react-icons/fa";
import { isCourseExpired } from "../../utils/dateUtils";

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
        type: 'just-launched',
        label: '¡RECIÉN LANZADO!',
        icon: FaBolt,
        color: 'from-green-500 to-emerald-600',
        borderColor: 'border-yellow-300',
        animate: 'animate-pulse',
        hours: Math.floor(hoursDiff)
      };
    }
    
    // Menos de 24 horas
    if (hoursDiff < 24) {
      return {
        type: 'today',
        label: `Lanzado hace ${Math.floor(hoursDiff)}h`,
        icon: FaRocket,
        color: 'from-blue-500 to-cyan-600',
        borderColor: 'border-blue-300',
        animate: '',
        hours: Math.floor(hoursDiff)
      };
    }
    
    // 1 día
    if (daysDiff === 1) {
      return {
        type: 'yesterday',
        label: 'Lanzado hace 1 día',
        icon: FaStar,
        color: 'from-purple-500 to-indigo-600',
        borderColor: 'border-purple-300',
        animate: '',
        days: 1
      };
    }
    
    // 2-3 días
    if (daysDiff >= 2 && daysDiff <= 3) {
      return {
        type: 'recent',
        label: `Lanzado hace ${daysDiff} días`,
        icon: FaStar,
        color: 'from-indigo-500 to-purple-600',
        borderColor: 'border-indigo-300',
        animate: '',
        days: daysDiff
      };
    }
    
    // 4-7 días (una semana)
    if (daysDiff >= 4 && daysDiff <= 7) {
      return {
        type: 'week',
        label: `Lanzado hace ${daysDiff} días`,
        icon: FaCalendarAlt,
        color: 'from-orange-500 to-amber-600',
        borderColor: 'border-orange-300',
        animate: '',
        days: daysDiff
      };
    }
    
    // 1-2 semanas
    if (daysDiff >= 8 && daysDiff <= 14) {
      const weeks = Math.floor(daysDiff / 7);
      return {
        type: 'weeks',
        label: weeks === 1 ? 'Lanzado hace 1 semana' : `Lanzado hace ${weeks} semanas`,
        icon: FaHistory,
        color: 'from-gray-500 to-slate-600',
        borderColor: 'border-gray-300',
        animate: '',
        days: daysDiff
      };
    }
    
    // Más de 2 semanas
    if (daysDiff > 14) {
      const weeks = Math.floor(daysDiff / 7);
      return {
        type: 'old',
        label: `Lanzado hace ${weeks} semanas`,
        icon: FaHistory,
        color: 'from-gray-400 to-gray-500',
        borderColor: 'border-gray-200',
        animate: '',
        days: daysDiff
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
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
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
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysDiff = Math.round((courseDate - todayDate) / (1000 * 60 * 60 * 24));
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
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysDiff = Math.round((courseDate - todayDate) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 ? daysDiff : null;
  } catch {
    return null;
  }
};

// ✅ MODAL PARA DESCRIPCIÓN COMPLETA
function DescriptionModal({ open, curso, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold mb-2 pr-8">{curso.titulo || "Curso sin título"}</h2>
          <div className="flex flex-wrap gap-2">
            {curso.profesorNombre && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                👨‍🏫 {curso.profesorNombre}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${
              curso.precio > 0 
                ? 'bg-yellow-500/20 text-yellow-200' 
                : 'bg-blue-500/20 text-blue-200'
            }`}>
              {curso.precio > 0 ? '💰 PREMIUM' : '🎓 GRATUITO'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              curso.activo && !isCourseExpired(curso)
                ? 'bg-green-500/20 text-green-200' 
                : 'bg-red-500/20 text-red-200'
            }`}>
              {isCourseExpired(curso) ? '⏰ FINALIZADO' : curso.activo ? '✅ ACTIVO' : '❌ INACTIVO'}
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
                {curso.descripcion || "Este curso no tiene descripción disponible."}
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700 transition-colors duration-200">
              <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">📅 Fecha del Curso</div>
              <div className="text-blue-700 dark:text-blue-400">{curso.fecha || "Por definir"}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700 transition-colors duration-200">
              <div className="font-semibold text-green-800 dark:text-green-300 mb-1">⏰ Horario</div>
              <div className="text-green-700 dark:text-green-400">{curso.hora || "Por definir"}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700 transition-colors duration-200">
              <div className="font-semibold text-purple-800 dark:text-purple-300 mb-1">🎯 Cupos Disponibles</div>
              <div className="text-purple-700 dark:text-purple-400">{curso.cupos || 0} cupos</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700 transition-colors duration-200">
              <div className="font-semibold text-orange-800 dark:text-orange-300 mb-1">💰 Precio</div>
              <div className="text-orange-700 dark:text-orange-400">
                {curso.precio > 0 ? `$${curso.precio} USD` : "Gratuito"}
              </div>
            </div>
          </div>

          {/* Estado del curso */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Estado de tu inscripción:</h4>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              isCourseExpired(curso)
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                : curso.activo
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {isCourseExpired(curso) 
                ? '⏰ CURSO FINALIZADO' 
                : curso.activo 
                ? '✅ INSCRIPCIÓN ACTIVA' 
                : '❌ CURSO INACTIVO'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {isCourseExpired(curso)
                ? "Este curso ya finalizó según su fecha programada."
                : curso.activo
                ? "Tienes acceso completo al contenido del curso."
                : "Este curso fue eliminado pero se mantiene en tu historial."}
            </p>
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

// ✅ COMPONENTE CURSO CARD MEJORADO
function CursoCard({ curso }) {
  const isExpired = isCourseExpired(curso);
  const [modalDesc, setModalDesc] = useState({ open: false, curso: null });

  // ✅ USAR LAS MISMAS FUNCIONES MEJORADAS
  const launchInfo = getCourseLaunchInfo(curso);
  const isToday = isTodayCourse(curso);
  const isTomorrow = isTomorrowCourse(curso);
  const isUpcoming = isUpcomingCourse(curso);
  const daysUntil = getDaysUntilCourse(curso);
  const hasFewSpots = curso.cupos > 0 && curso.cupos <= 3;
  const hasLimitedSpots = curso.cupos > 0 && curso.cupos <= 5;

  const LaunchIcon = launchInfo?.icon || FaStar;

  // ✅ FUNCIÓN PARA ABRIR MODAL DE DESCRIPCIÓN
  const openDescriptionModal = () => {
    setModalDesc({ open: true, curso });
  };

  return (
    <>
      <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden">
        {/* ✅ ETIQUETA DINÁMICA DE LANZAMIENTO */}
        {launchInfo && (
          <div className={`absolute ${launchInfo.type === 'just-launched' ? '-top-2 -left-2' : 'top-2 right-2'} z-20`}>
            <div className={`bg-gradient-to-r ${launchInfo.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 ${launchInfo.animate} ${launchInfo.borderColor ? `border-2 ${launchInfo.borderColor}` : ''}`}>
              <LaunchIcon className={launchInfo.type === 'just-launched' ? 'text-yellow-300 animate-bounce' : ''} />
              {launchInfo.label}
              {launchInfo.type === 'just-launched' && <LaunchIcon className="text-yellow-300 animate-bounce" />}
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
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
            }}
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
              {curso.precio > 0 ? '🔥 PREMIUM' : '🎓 GRATUITO'}
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
            
            {isUpcoming && daysUntil !== null && daysUntil >= 2 && daysUntil <= 7 && !isToday && !isTomorrow && (
              <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md flex items-center gap-1">
                <FaCalendarAlt />
                EN {daysUntil} DÍA{daysUntil !== 1 ? 'S' : ''}
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
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{curso.titulo}</h3>
          
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
              <span className="font-medium">📅 {curso.fecha || "Por definir"}</span>
              {" | "}
              <span className="font-medium">⏰ {curso.hora || "Por definir"}</span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN ESPECÍFICOS PARA ESTUDIANTE */}
          <div className="flex flex-col gap-3">
            {/* Estado de inscripción */}
            <div className={`text-center px-4 py-2 rounded-xl font-bold text-sm ${
              isExpired
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : curso.activo
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {isExpired 
                ? '⏰ CURSO FINALIZADO' 
                : curso.activo 
                ? '✅ INSCRIPCIÓN ACTIVA' 
                : '❌ CURSO INACTIVO'}
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
                🔒 Acceso no disponible - Curso inactivo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODAL PARA DESCRIPCIÓN COMPLETA */}
      <DescriptionModal
        open={modalDesc.open}
        curso={modalDesc.curso}
        onClose={() => setModalDesc({ open: false, curso: null })}
      />
    </>
  );
}

// ✅ COMPONENTE PRINCIPAL MIS CURSOS (sin cambios en la lógica principal)
export default function MisCursos() {
  const [misCursos, setMisCursos] = useState([]);
  const [cursosActivos, setCursosActivos] = useState([]);
  const [cursosInactivos, setCursosInactivos] = useState([]);
  const [cursosGratis, setCursosGratis] = useState([]);
  const [cursosPagados, setCursosPagados] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ACTIVOS");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setMisCursos([]);
        setLoading(false);
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
              Accept: "application/json",
            },
          }
        );

        if (
          typeof res.data === "string" &&
          res.data.includes("<!DOCTYPE html>")
        ) {
          console.error(
            "Se recibió HTML en lugar de JSON - problema con ngrok o servidor"
          );
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursos = [];
        if (res.data && Array.isArray(res.data.data)) {
          cursos = res.data.data;
        } else if (Array.isArray(res.data)) {
          cursos = res.data;
        } else if (res.data && typeof res.data === "object") {
          const possibleArrays = Object.values(res.data).filter((item) =>
            Array.isArray(item)
          );
          cursos = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }

        setMisCursos(cursos);
        setCursosActivos(cursos.filter((c) => c.activo && !isCourseExpired(c)));
        setCursosInactivos(
          cursos.filter((c) => !c.activo || isCourseExpired(c))
        );
        setCursosGratis(cursos.filter((c) => c.precio === 0));
        setCursosPagados(cursos.filter((c) => c.precio > 0));
        setFilteredCursos(
          cursos.filter((c) => c.activo && !isCourseExpired(c))
        );
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
        setMisCursos([]);
        setCursosActivos([]);
        setCursosInactivos([]);
        setCursosGratis([]);
        setCursosPagados([]);
        setFilteredCursos([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let filtered = [];

    switch (activeTab) {
      case "ACTIVOS":
        filtered = cursosActivos;
        break;
      case "INACTIVOS":
        filtered = cursosInactivos;
        break;
      case "GRATIS":
        filtered = cursosGratis;
        break;
      case "PAGADOS":
        filtered = cursosPagados;
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

    setFilteredCursos(filtered);
  }, [
    misCursos,
    cursosActivos,
    cursosInactivos,
    cursosGratis,
    cursosPagados,
    activeTab,
    searchTerm,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Cargando tus cursos...
          </div>
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

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-5 mb-6 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          {/* Barra de búsqueda */}
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar mis cursos por título, descripción o profesor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Estadísticas - Ocultas en móvil */}
          <div className="hidden md:flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 border border-blue-200 dark:border-blue-700 shadow-sm transition-colors duration-200">
            <div className="grid grid-cols-4 gap-2 w-full">
              <div className="flex flex-col items-center justify-center p-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total
                </div>
                <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {misCursos.length}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Activos
                </div>
                <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {cursosActivos.length}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Inactivos
                </div>
                <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {cursosInactivos.length}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Pagados
                </div>
                <div className="bg-white dark:bg-gray-700 p-1 rounded-lg text-center w-full transition-colors duration-200">
                  <div className="font-bold text-purple-600 dark:text-purple-400">
                    {cursosPagados.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Tabs de filtrado */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab("ACTIVOS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "ACTIVOS"
                  ? "bg-blue-500 text-white shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
              }`}
            >
              <FaGraduationCap />
              <span>Activos</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {cursosActivos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("INACTIVOS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "INACTIVOS"
                  ? "bg-green-500 text-white shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
              }`}
            >
              <FaMoneyBillWave />
              <span>Inactivos</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {cursosInactivos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("GRATIS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "GRATIS"
                  ? "bg-purple-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
              }`}
            >
              <FaFilter />
              <span>Gratis</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {cursosGratis.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("PAGADOS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "PAGADOS"
                  ? "bg-yellow-500 text-white shadow-md transform scale-105"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
              }`}
            >
              <FaMoneyBillWave />
              <span>Pagados</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {cursosPagados.length}
              </span>
            </button>
          </div>
        </div>
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
                  : "No tienes cursos inscritos"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : activeTab === "ACTIVOS"
                  ? "No tienes cursos activos"
                  : activeTab === "INACTIVOS"
                  ? "No tienes cursos inactivos"
                  : activeTab === "GRATIS"
                  ? "No tienes cursos gratuitos"
                  : "No tienes cursos pagados"}
              </p>
            </div>
          </div>
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