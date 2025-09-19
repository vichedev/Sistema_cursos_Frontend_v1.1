// src/pages/estudiante/CursosEstudiante.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PayphoneButton from "../../components/PayphoneButton";
import { FaSearch, FaMoneyBillWave, FaGraduationCap, FaFilter } from "react-icons/fa";
import { isCourseExpired } from '../../utils/dateUtils';
import EstudianteLayout from "../../layouts/EstudianteLayout"; // ⬅️ NUEVO

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

// ⬇️ TU COMPONENTE ORIGINAL, solo renombrado
export function CursosEstudianteContent() {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalImg, setModalImg] = useState({ open: false, src: "", alt: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");
    setUserId(uid);

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/courses/disponibles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      .then((res) => {
        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          console.error("Se recibió HTML en lugar de JSON - problema con ngrok o servidor");
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }
        let cursosData = [];
        if (res.data && Array.isArray(res.data.data)) cursosData = res.data.data;
        else if (Array.isArray(res.data)) cursosData = res.data;
        else if (res.data && typeof res.data === 'object') {
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          cursosData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }
        setCursos(cursosData);
        setFilteredCursos(cursosData);
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
    if (activeTab !== 'TODOS') {
      filtered = filtered.filter(curso =>
        activeTab === 'PAGADO' ? curso.precio > 0 : curso.precio === 0
      );
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
        `${import.meta.env.VITE_BACKEND_URL}/payments/inscribir-gratis`,
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <div className="text-xl font-semibold text-gray-700">Cargando cursos...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="flex-1 h-screen flex flex-col p-4 md:p-8">
          {/* Header con gradiente - Oculto en móvil */}
          <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">CURSOS DISPONIBLES</h1>

              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 mb-6">
            {/* Contenedor principal: Búsqueda + Stats + Filtros */}
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              {/* Barra de búsqueda */}
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

              {/* Estadísticas - Ocultas en móvil */}
              <div className="hidden md:flex items-center justify-center bg-blue-50 rounded-xl p-2 border border-blue-200 shadow-sm">
                <div className="grid grid-cols-4 gap-2 w-full">
                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="text-xs text-gray-500 mb-1">Total</div>
                    <div className="bg-white p-1 rounded-lg text-center w-full">
                      <div className="font-bold text-blue-600">{cursos.length}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="text-xs text-gray-500 mb-1">Pagados</div>
                    <div className="bg-white p-1 rounded-lg text-center w-full">
                      <div className="font-bold text-green-600">{cursos.filter(c => c.precio > 0).length}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="text-xs text-gray-500 mb-1">Gratuitos</div>
                    <div className="bg-white p-1 rounded-lg text-center w-full">
                      <div className="font-bold text-blue-600">{cursos.filter(c => c.precio === 0).length}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="text-xs text-gray-500 mb-1">Disponibles</div>
                    <div className="bg-white p-1 rounded-lg text-center w-full">
                      <div className="font-bold text-purple-600">{cursos.filter(c => !c.inscrito).length}</div>
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
                  onClick={() => setActiveTab('PAGADO')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'PAGADO'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <FaMoneyBillWave />
                  <span>Pagados</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {cursos.filter(c => c.precio > 0).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('GRATIS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'GRATIS'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <FaGraduationCap />
                  <span>Gratuitos</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {cursos.filter(c => c.precio === 0).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('TODOS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${activeTab === 'TODOS'
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <FaFilter />
                  <span>Todos</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {cursos.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenedor scrollable para cursos */}
          <div className="flex-1 overflow-y-auto">
            {/* Grid de cursos */}
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
                        ? 'No hay cursos pagados disponibles'
                        : activeTab === 'GRATIS'
                          ? 'No hay cursos gratuitos disponibles'
                          : 'No hay cursos disponibles en este momento'}
                  </p>
                </div>
              ) : (
                filteredCursos.map((curso) => {
                  const isExpired = isCourseExpired(curso);

                  return (
                    <div
                      key={curso.id}
                      className="group bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col"
                    >
                      <div className="relative">
                        <img
                          src={
                            curso.imagen
                              ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
                              : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
                          }
                          alt={curso.titulo}
                          className="w-full h-60 object-cover rounded-t-3xl cursor-pointer group-hover:brightness-90 transition"
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

                        {/* ETIQUETAS COMBINADAS - Aquí está el cambio principal */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {/* Etiqueta principal (Pagado/Gratis) */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${curso.precio > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-sky-100 text-sky-600'
                            }`}>
                            {curso.precio > 0 ? 'PAGADO' : 'GRATIS'}
                          </span>

                          {/* Etiqueta de estado (Finalizado) */}
                          {isExpired && (
                            <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-600 font-bold shadow">
                              FINALIZADO
                            </span>
                          )}
                        </div>

                        <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-800 font-medium shadow">
                          {curso.cupos || 0} cupos
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between p-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{curso.titulo || "Curso sin título"}</h3>
                          <p className="text-gray-700 mb-3">{curso.descripcion || "Sin descripción"}</p>

                          {curso.profesorNombre && (
                            <div className="mb-2 flex flex-wrap gap-2 items-center">
                              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                Profesor: {curso.profesorNombre}
                              </span>

                              {curso.asignatura && (
                                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                                  Asignatura: {curso.asignatura}
                                </span>
                              )}
                            </div>
                          )}

                          {curso.precio > 0 && (
                            <div className="mb-3">
                              <span className="inline-block px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-base font-bold">
                                ${curso.precio}
                              </span>
                            </div>
                          )}

                          <div className="text-gray-500 text-xs mb-2">
                            Fecha: <span className="font-medium">{curso.fecha || "Por definir"}</span>
                            {" | "}
                            Hora: <span className="font-medium">{curso.hora || "Por definir"}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          {isExpired ? (
                            <div className="text-center bg-gray-100 text-gray-700 p-3 rounded-lg font-semibold text-sm">
                              Este curso ya ha finalizado
                            </div>
                          ) : curso.inscrito ? (
                            <div className="text-green-600 font-semibold text-center">
                              <span className="inline-block px-3 py-1 rounded-xl bg-green-100">
                                Ya inscrito en este curso
                              </span>
                            </div>
                          ) : curso.precio > 0 ? (
                            <>
                              <p className="text-xs text-orange-600 font-semibold mb-2 text-center">
                                Curso de pago. Paga con Payphone y te inscribes automáticamente.
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
                              <p className="text-xs text-green-700 font-semibold mb-2 text-center">
                                Curso gratuito. Haz clic para inscribirte.
                              </p>
                              <button
                                onClick={() => handleEnroll(curso.id)}
                                className="w-full bg-gradient-to-r from-green-400 to-lime-400 text-white px-5 py-2 rounded-xl font-bold shadow hover:scale-105 transition"
                              >
                                Inscribirse gratis
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
        </main>
      </div>
    </>
  );
}

// ⬇️ Wrapper: export default que SOLO agrega el layout
export default function CursosEstudiante() {
  return (
    <EstudianteLayout>
      <CursosEstudianteContent />
    </EstudianteLayout>
  );
}
