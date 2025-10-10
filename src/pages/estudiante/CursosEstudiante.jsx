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
  FaTimes
} from "react-icons/fa";
import { isCourseExpired } from '../../utils/dateUtils';

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

// ✅ MODAL PARA IMAGEN
function ImageModal({ open, src, alt, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ✅ NUEVO MODAL PARA DESCRIPCIÓN COMPLETA
function DescriptionModal({ open, curso, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
            {curso.asignatura && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                📚 {curso.asignatura}
              </span>
            )}
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaEye className="text-blue-500" />
              Descripción Completa del Curso
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {curso.descripcion || "Este curso no tiene descripción disponible."}
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="font-semibold text-blue-800 mb-1">📅 Fecha del Curso</div>
              <div className="text-blue-700">{curso.fecha || "Por definir"}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="font-semibold text-green-800 mb-1">⏰ Horario</div>
              <div className="text-green-700">{curso.hora || "Por definir"}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="font-semibold text-purple-800 mb-1">🎯 Cupos Disponibles</div>
              <div className="text-purple-700">{curso.cupos || 0} cupos</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="font-semibold text-orange-800 mb-1">💰 Precio</div>
              <div className="text-orange-700">
                {curso.precio > 0 ? `$${curso.precio} USD` : "Gratuito"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
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

export default function CursosEstudiante() {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalImg, setModalImg] = useState({ open: false, src: "", alt: "" });
  const [modalDesc, setModalDesc] = useState({ open: false, curso: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RELEVANTES');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");
    setUserId(uid);

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/courses/disponibles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      .then((res) => {
        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }
        
        let cursosData = [];
        if (res.data && Array.isArray(res.data.data)) cursosData = res.data.data;
        else if (Array.isArray(res.data)) cursosData = res.data;
        else if (res.data && typeof res.data === 'object') {
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          cursosData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }
        
        const cursosOrdenados = sortCoursesByRelevance(cursosData);
        setCursos(cursosOrdenados);
        setFilteredCursos(cursosOrdenados);
      })
      .catch((err) => {
        console.error("Error al obtener cursos:", err);
        if (err.message && err.message.includes("HTML en lugar de JSON")) {
          Swal.fire({
            title: "Error de Servidor",
            text: "El servidor no está respondiendo correctamente. Verifica que el backend esté corriendo y ngrok esté configurado.",
            icon: "error"
          });
        }
        setCursos([]);
        setFilteredCursos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = cursos;
    
    if (activeTab === 'RELEVANTES') {
      filtered = filtered.filter(curso => !isCourseExpired(curso));
    } else if (activeTab === 'PAGADO') {
      filtered = filtered.filter(curso => curso.precio > 0 && !isCourseExpired(curso));
    } else if (activeTab === 'GRATIS') {
      filtered = filtered.filter(curso => curso.precio === 0 && !isCourseExpired(curso));
    } else if (activeTab === 'FINALIZADOS') {
      filtered = filtered.filter(curso => isCourseExpired(curso));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(curso =>
        curso.titulo.toLowerCase().includes(term) ||
        (curso.descripcion && curso.descripcion.toLowerCase().includes(term)) ||
        (curso.profesorNombre && curso.profesorNombre.toLowerCase().includes(term)) ||
        (curso.asignatura && curso.asignatura.toLowerCase().includes(term))
      );
    }
    
    setFilteredCursos(filtered);
  }, [cursos, activeTab, searchTerm]);

  const handleEnroll = async (cursoId) => {
    const token = localStorage.getItem("token");
    try {
      Swal.fire({
        title: "Procesando inscripción...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/inscribir-gratis`,
        { cursoId, userId },
        { headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' } }
      );

      Swal.close();
      Swal.fire("¡Inscrito!", "Te has inscrito al curso exitosamente", "success");

      setCursos(prev => prev.map(c => c.id === cursoId ? { ...c, inscrito: true } : c));
    } catch (err) {
      Swal.close();
      Swal.fire("Error", err.response?.data?.message || "No se pudo inscribir al curso", "error");
    }
  };

  // ✅ FUNCIÓN PARA ABRIR MODAL DE DESCRIPCIÓN
  const openDescriptionModal = (curso) => {
    setModalDesc({ open: true, curso });
  };

  // Contar cursos por categoría de lanzamiento
  const justLaunchedCount = cursos.filter(c => {
    const info = getCourseLaunchInfo(c);
    return info && info.type === 'just-launched';
  }).length;

  const newCoursesCount = cursos.filter(c => {
    const info = getCourseLaunchInfo(c);
    return info && ['just-launched', 'today', 'yesterday', 'recent'].includes(info.type);
  }).length;

  const totalCoursesCount = cursos.length;
  const paidCoursesCount = cursos.filter(c => c.precio > 0 && !isCourseExpired(c)).length;
  const freeCoursesCount = cursos.filter(c => c.precio === 0 && !isCourseExpired(c)).length;
  const expiredCoursesCount = cursos.filter(isCourseExpired).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          <div className="text-xl font-semibold text-gray-700">Cargando cursos...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="hidden md:block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full -translate-y-20 translate-x-20 opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full translate-y-16 -translate-x-16 opacity-20 blur-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FaRocket className="text-yellow-300 animate-bounce" />
              CURSOS DISPONIBLES
            </h1>
            <p className="text-blue-100 text-lg">
              Los cursos <span className="text-yellow-300 font-bold">más nuevos</span> aparecen primero
            </p>
            
            <div className="mt-3 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 inline-flex">
              <FaBolt className="text-yellow-300" />
              <span className="text-sm">Ordenado por: <span className="font-bold">Más recientes primero</span></span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {justLaunchedCount > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300 shadow-lg">
                <div className="text-sm opacity-90 flex items-center gap-2 mb-1">
                  <FaBolt className="text-yellow-300 animate-pulse" />
                  <span>¡Recién Lanzados!</span>
                </div>
                <div className="text-3xl font-bold text-yellow-300 flex items-center gap-2">
                  {justLaunchedCount}
                  <FaGem className="text-white text-xl" />
                </div>
              </div>
            )}
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="text-sm opacity-90 flex items-center gap-2 mb-1">
                <FaCrown className="text-yellow-300" />
                <span>Total Activos</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {totalCoursesCount - expiredCoursesCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos por título, descripción o profesor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="hidden md:flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-200 shadow-sm">
            <div className="grid grid-cols-4 gap-3 w-full">
              <div className="flex flex-col items-center justify-center p-2">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <FaRocket className="text-green-500" />
                  Nuevos
                </div>
                <div className="bg-white p-2 rounded-lg text-center w-full shadow">
                  <div className="font-bold text-green-600 text-lg">{newCoursesCount}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <FaMoneyBillWave className="text-yellow-500" />
                  Premium
                </div>
                <div className="bg-white p-2 rounded-lg text-center w-full shadow">
                  <div className="font-bold text-yellow-600 text-lg">{paidCoursesCount}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <FaGraduationCap className="text-blue-500" />
                  Gratuitos
                </div>
                <div className="bg-white p-2 rounded-lg text-center w-full shadow">
                  <div className="font-bold text-blue-600 text-lg">{freeCoursesCount}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <FaTimesCircle className="text-red-500" />
                  Finalizados
                </div>
                <div className="bg-white p-2 rounded-lg text-center w-full shadow">
                  <div className="font-bold text-red-600 text-lg">{expiredCoursesCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('RELEVANTES')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'RELEVANTES'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <FaFire className="text-orange-400" />
              <span className="font-bold">Más Relevantes</span>
              {justLaunchedCount > 0 && (
                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  {justLaunchedCount} nuevo{justLaunchedCount > 1 ? 's' : ''}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('PAGADO')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'PAGADO'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <FaMoneyBillWave />
              <span>Premium</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {paidCoursesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('GRATIS')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'GRATIS'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <FaGraduationCap />
              <span>Gratuitos</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {freeCoursesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('FINALIZADOS')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'FINALIZADOS'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <FaTimesCircle />
              <span>Finalizados</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {expiredCoursesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('TODOS')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'TODOS'
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <FaFilter />
              <span>Ver Todos</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {totalCoursesCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor scrollable para cursos */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCursos.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : activeTab === 'PAGADO'
                    ? 'No hay cursos premium disponibles'
                    : activeTab === 'GRATIS'
                      ? 'No hay cursos gratuitos disponibles'
                      : activeTab === 'FINALIZADOS'
                      ? 'No hay cursos finalizados'
                      : 'No hay cursos disponibles en este momento'}
              </p>
            </div>
          ) : (
            filteredCursos.map((curso) => {
              const isExpired = isCourseExpired(curso);
              const launchInfo = getCourseLaunchInfo(curso);
              const isToday = isTodayCourse(curso);
              const isTomorrow = isTomorrowCourse(curso);
              const isUpcoming = isUpcomingCourse(curso);
              const daysUntil = getDaysUntilCourse(curso);
              const hasFewSpots = curso.cupos > 0 && curso.cupos <= 3;
              const hasLimitedSpots = curso.cupos > 0 && curso.cupos <= 5;

              const LaunchIcon = launchInfo?.icon || FaStar;

              return (
                <div
                  key={curso.id}
                  className="group bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden"
                >
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
                      className="w-full h-48 object-cover rounded-t-2xl cursor-pointer group-hover:brightness-90 transition duration-300"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
                      }}
                      onClick={() =>
                        setModalImg({
                          open: true,
                          src: curso.imagen
                            ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
                            : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop",
                          alt: curso.titulo,
                        })
                      }
                    />

                    <div className="absolute top-12 left-2 flex flex-col gap-1">
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md ${
                          curso.precio > 0 
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" 
                            : "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                        }`}
                      >
                        {curso.precio > 0 ? '🔥 PREMIUM' : '🎓 GRATUITO'}
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
                      
                      {isUpcoming && daysUntil !== null && daysUntil >= 2 && daysUntil <= 7 && !isToday && !isTomorrow && (
                        <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md flex items-center gap-1">
                          <FaCalendarAlt />
                          EN {daysUntil} DÍA{daysUntil !== 1 ? 'S' : ''}
                        </span>
                      )}
                      
                      {hasFewSpots && !isExpired && (
                        <span className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-purple-600 to-pink-700 text-white font-bold shadow-md flex items-center gap-1 animate-pulse">
                          <FaHourglassHalf className="text-yellow-300" />
                          ⚠️ ÚLTIMOS {curso.cupos} CUPOS!
                        </span>
                      )}
                      
                      {hasLimitedSpots && !hasFewSpots && !isExpired && (
                        <span className="px-4py-2 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md flex items-center gap-1">
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

                    <span className="absolute top-2 right-2 px-4 py-2 rounded-full text-xs bg-black/70 text-white font-bold shadow-lg backdrop-blur-sm">
                      🎯 {curso.cupos || 0} CUPOS
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{curso.titulo || "Curso sin título"}</h3>
                    
                    {/* ✅ DESCRIPCIÓN CON BOTÓN "VER MÁS" */}
                    <div className="mb-4">
                      <p className="text-gray-700 line-clamp-3 mb-3">
                        {curso.descripcion || "Sin descripción disponible."}
                      </p>
                      <button
                        onClick={() => openDescriptionModal(curso)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
                      >
                        <FaEye className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>Ver descripción completa</span>
                      </button>
                    </div>

                    {curso.profesorNombre && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                          👨‍🏫 Profesor: {curso.profesorNombre}
                        </span>

                        {curso.asignatura && (
                          <span className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                            📚 {curso.asignatura}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-5">
                      {curso.precio > 0 && (
                        <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-base font-bold border border-yellow-300">
                          💰 ${curso.precio}
                        </span>
                      )}
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">📅 {curso.fecha || "Por definir"}</span>
                        {" | "}
                        <span className="font-medium">⏰ {curso.hora || "Por definir"}</span>
                      </div>
                    </div>

                    <div>
                      {isExpired ? (
                        <div className="text-center bg-gray-100 text-gray-700 p-3 rounded-lg font-semibold text-sm border border-gray-300">
                          ⏰ Este curso ya ha finalizado
                        </div>
                      ) : curso.inscrito ? (
                        <div className="text-green-600 font-semibold text-center">
                          <span className="inline-block px-3 py-2 rounded-xl bg-green-100 border border-green-300">
                            ✅ Ya estás inscrito en este curso
                          </span>
                        </div>
                      ) : curso.precio > 0 ? (
                        <>
                          <p className="text-xs text-orange-600 font-semibold mb-3 text-center">
                            💳 Curso premium. Paga con Payphone y accede inmediatamente.
                          </p>
                          <div className="flex justify-center">
                            <PayphoneButton
                              curso={curso}
                              userId={userId}
                              onSuccess={() =>
                                setCursos((prev) =>
                                  prev.map((c) =>
                                    c.id === curso.id ? { ...c, inscrito: true } : c
                                  )
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-green-700 font-semibold mb-3 text-center">
                            🎓 Curso gratuito. ¡Inscríbete ahora!
                          </p>
                          <button
                            onClick={() => handleEnroll(curso.id)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition duration-300 transform hover:shadow-xl"
                          >
                            🚀 Inscribirse Gratis
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
    </>
  );
}