import SidebarAdmin from "../../components/admin/SidebarAdmin";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaUsers, FaChalkboardTeacher, FaCalendarAlt, FaClock, FaUserFriends, FaDollarSign, FaMoneyBillWave } from "react-icons/fa";
import { HiOutlineMail, HiOutlineAcademicCap } from "react-icons/hi";
import { FiArrowLeft, FiUsers } from "react-icons/fi";

export default function EstudiantesCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    totalRecaudado: 0,
    estudiantesPagados: 0,
    estudiantesGratis: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Obtener datos del curso
        const cursoResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurso(cursoResponse.data);
        
        // Obtener estudiantes del curso con información de pago
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/${id}/estudiantes-con-pagos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Si el endpoint no existe, usar el endpoint original y asumir que todos son gratis
        if (estudiantesResponse.status === 404) {
          const estudiantesBasic = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/courses/${id}/estudiantes`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const estudiantesConPago = estudiantesBasic.data.map(est => ({
            ...est,
            montoPagado: 0,
            metodoPago: 'Gratis',
            fechaInscripcion: null
          }));
          
          setEstudiantes(estudiantesConPago);
          
          // Calcular estadísticas
          const totalRecaudado = 0;
          const estudiantesPagados = 0;
          const estudiantesGratis = estudiantesConPago.length;
          
          setPaymentData({ totalRecaudado, estudiantesPagados, estudiantesGratis });
        } else {
          setEstudiantes(estudiantesResponse.data.estudiantes || []);
          
          // Calcular estadísticas de pago
          const estudiantesPagados = estudiantesResponse.data.estudiantes.filter(est => est.montoPagado > 0).length;
          const estudiantesGratis = estudiantesResponse.data.estudiantes.filter(est => est.montoPagado === 0).length;
          const totalRecaudado = estudiantesResponse.data.estudiantes.reduce((sum, est) => sum + est.montoPagado, 0);
          
          setPaymentData({ totalRecaudado, estudiantesPagados, estudiantesGratis });
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
        setEstudiantes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <SidebarAdmin />
        <main className="flex-1 flex justify-center items-center py-3 px-0 sm:px-2">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
            <div className="text-orange-500 font-semibold text-lg">Cargando estudiantes...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <SidebarAdmin />
        <main className="flex-1 flex justify-center items-center py-3 px-0 sm:px-2">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <SidebarAdmin />
      <main className="flex-1 lg:ml-72 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
            <button
              className="flex items-center gap-2 text-white hover:text-gray-100 font-semibold mb-6 transition text-base md:text-lg"
              onClick={() => navigate("/admin/dashboard")}
              type="button"
            >
              <FiArrowLeft className="inline-block" /> Volver al Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <FaUsers className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Estudiantes Inscritos</h1>
                  <p className="text-white/90 text-sm md:text-base mt-1">
                    Curso: <span className="font-semibold">{curso?.titulo || "Cargando..."}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <FiUsers className="text-xl" />
                <span className="text-lg font-bold">
                  {estudiantes.length} Inscrito{estudiantes.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas de Pagos */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FaMoneyBillWave className="text-amber-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Recaudado</p>
                    <p className="text-xl font-bold text-amber-700">
                      ${paymentData.totalRecaudado.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaDollarSign className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estudiantes Pagados</p>
                    <p className="text-xl font-bold text-green-700">
                      {paymentData.estudiantesPagados}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaUserFriends className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estudiantes Gratis</p>
                    <p className="text-xl font-bold text-blue-700">
                      {paymentData.estudiantesGratis}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Info Card */}
          {curso && (
            <div className="p-6 bg-orange-50 border-b border-orange-200">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 p-4 bg-white rounded-xl shadow-sm">
                  <HiOutlineAcademicCap className="text-4xl text-orange-500" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-orange-700 mb-3">{curso.titulo}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaChalkboardTeacher className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Profesor</p>
                        <p className="font-medium">
                          {curso.profesor ? `${curso.profesor.nombres} ${curso.profesor.apellidos}` : "Por confirmar"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaCalendarAlt className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="font-medium">{curso.fecha || "Por definir"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaClock className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hora</p>
                        <p className="font-medium">{curso.hora || "Por definir"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaUserFriends className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cupos</p>
                        <p className="font-medium">{curso.cupos}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <span className="text-orange-600 font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="font-medium">{curso.tipo?.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FaDollarSign className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Precio</p>
                        <p className="font-medium">${curso.precio || 0}</p>
                      </div>
                    </div>
                    
                    {curso.profesor?.asignatura && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <span className="text-orange-600 font-bold">A</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Asignatura</p>
                          <p className="font-medium">{curso.profesor.asignatura}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Section */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaUserGraduate className="text-orange-500" />
                Lista de Estudiantes
              </h2>
              <p className="text-gray-600 text-sm">Todos los estudiantes inscritos en este curso</p>
            </div>

            {estudiantes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">👨‍🎓</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay estudiantes inscritos</h3>
                <p className="text-gray-500">Aún no hay estudiantes registrados en este curso.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="block md:hidden space-y-4">
                  {estudiantes.map((est, i) => (
                    <div
                      key={est.id || i}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {est.nombres?.[0] || "?"}
                          </div>
                          <span className="text-xs text-orange-600 font-bold mt-1 bg-orange-100 px-2 py-1 rounded-full">
                            #{i + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg truncate">
                            {est.nombres} {est.apellidos}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-gray-600">
                            <HiOutlineMail className="text-orange-500" />
                            <span className="text-sm truncate">{est.correo}</span>
                          </div>
                          
                          {/* Información de pago */}
                          <div className="mt-2">
                            {est.montoPagado > 0 ? (
                              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                                <FaDollarSign className="text-xs" />
                                <span className="text-sm font-medium">Pagó: ${est.montoPagado}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                <span className="text-sm font-medium">Gratis</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correo electrónico
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl">
                          Pago
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiantes.map((est, i) => (
                        <tr key={est.id || i} className="hover:bg-orange-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold">
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold shadow-sm">
                                {est.nombres?.[0] || "?"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {est.nombres} {est.apellidos}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <HiOutlineMail className="text-orange-500" />
                              <span className="text-gray-700">{est.correo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {est.montoPagado > 0 ? (
                              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                                <FaDollarSign className="text-sm" />
                                <span className="font-medium">${est.montoPagado.toFixed(2)}</span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  Pagado
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                                <span className="font-medium">Gratis</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary Footer */}
                <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-orange-600" />
                      <span className="text-sm text-gray-700">
                        Total de estudiantes: <strong>{estudiantes.length}</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <strong>{paymentData.estudiantesPagados}</strong> pagados
                      </div>
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <strong>{paymentData.estudiantesGratis}</strong> gratis
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Curso ID: <span className="font-mono">{id}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}