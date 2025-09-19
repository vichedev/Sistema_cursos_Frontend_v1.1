import SidebarAdmin from "../../components/admin/SidebarAdmin";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUserGraduate, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaCalendarAlt, 
  FaClock, 
  FaUserFriends, 
  FaDollarSign, 
  FaMoneyBillWave,
  FaArrowLeft,
  FaEnvelope,
  FaIdBadge
} from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { FiUsers, FiDownload, FiMail } from "react-icons/fi";
import { isCourseExpired } from '../../utils/dateUtils';

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
        try {
          const estudiantesResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/courses/${id}/estudiantes-con-pagos`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setEstudiantes(estudiantesResponse.data.estudiantes || []);

          // Calcular estadísticas de pago
          const estudiantesPagados = estudiantesResponse.data.estudiantes.filter(est => est.montoPagado > 0).length;
          const estudiantesGratis = estudiantesResponse.data.estudiantes.filter(est => est.montoPagado === 0).length;
          const totalRecaudado = estudiantesResponse.data.estudiantes.reduce((sum, est) => sum + est.montoPagado, 0);

          setPaymentData({ totalRecaudado, estudiantesPagados, estudiantesGratis });
        } catch (error) {
          // Si falla el endpoint con pagos, usar el endpoint básico
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
          setPaymentData({ 
            totalRecaudado: 0, 
            estudiantesPagados: 0, 
            estudiantesGratis: estudiantesConPago.length 
          });
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos del curso");
        setEstudiantes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const exportToCSV = () => {
    const csvContent = [
      ['Nombre', 'Email', 'Monto Pagado', 'Método de Pago', 'Fecha de Inscripción'],
      ...estudiantes.map(est => [
        `${est.nombres} ${est.apellidos}`,
        est.correo,
        `$${est.montoPagado.toFixed(2)}`,
        est.metodoPago,
        est.fechaInscripcion ? new Date(est.fechaInscripcion).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `estudiantes-curso-${id}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <SidebarAdmin />
        <main className="flex-1 flex justify-center items-center py-3 px-0 sm:px-2 md:ml-72">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            <div className="text-blue-600 font-semibold text-lg">Cargando estudiantes...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <SidebarAdmin />
        <main className="flex-1 flex justify-center items-center py-3 px-0 sm:px-2 md:ml-72">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Error al cargar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md"
              >
                Reintentar
              </button>
              <button
                onClick={() => navigate("/admin/ver-todo")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md"
              >
                Volver a cursos
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isExpired = curso ? isCourseExpired(curso) : false;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <SidebarAdmin />
      <main className="flex-1 lg:ml-72 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaUserGraduate className="text-4xl" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold mb-2">Estudiantes Inscritos</h1>
                  {isExpired && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      CURSO FINALIZADO
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-lg">
                  Curso: <span className="font-semibold">{curso?.titulo || "Cargando..."}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-white/20 px-5 py-3 rounded-xl backdrop-blur-sm">
                <FiUsers className="text-2xl" />
                <span className="text-xl font-bold">
                  {estudiantes.length} Inscrito{estudiantes.length === 1 ? "" : "s"}
                </span>
              </div>
              
              <button
                onClick={() => navigate("/admin/ver-todo")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl transition backdrop-blur-sm"
              >
                <FaArrowLeft />
                Volver a cursos
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas de Pagos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaMoneyBillWave className="text-2xl" />
              </div>
              <div>
                <p className="text-sm opacity-90">Total Recaudado</p>
                <p className="text-2xl font-bold">
                  ${paymentData.totalRecaudado.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaDollarSign className="text-2xl" />
              </div>
              <div>
                <p className="text-sm opacity-90">Estudiantes Pagados</p>
                <p className="text-2xl font-bold">
                  {paymentData.estudiantesPagados}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaUserFriends className="text-2xl" />
              </div>
              <div>
                <p className="text-sm opacity-90">Estudiantes Gratis</p>
                <p className="text-2xl font-bold">
                  {paymentData.estudiantesGratis}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Curso */}
        {curso && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 p-5 bg-blue-100 rounded-2xl">
                <HiOutlineAcademicCap className="text-5xl text-blue-600" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{curso.titulo}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaChalkboardTeacher className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profesor</p>
                      <p className="font-semibold text-gray-800">
                        {curso.profesor ? `${curso.profesor.nombres} ${curso.profesor.apellidos}` : "Por confirmar"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FaCalendarAlt className="text-orange-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-semibold text-gray-800">{curso.fecha || "Por definir"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FaClock className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hora</p>
                      <p className="font-semibold text-gray-800">{curso.hora || "Por definir"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FaUserFriends className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cupos</p>
                      <p className="font-semibold text-gray-800">{curso.cupos} disponibles</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <FaIdBadge className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo</p>
                      <p className="font-semibold text-gray-800">{curso.tipo?.replace(/_/g, " ")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <FaDollarSign className="text-amber-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Precio</p>
                      <p className="font-semibold text-gray-800">${curso.precio || 0}</p>
                    </div>
                  </div>
                </div>

                {curso.profesor?.asignatura && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-600">Asignatura del profesor:</p>
                    <p className="font-semibold text-blue-700">{curso.profesor.asignatura}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lista de Estudiantes */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FaUserGraduate className="text-blue-600" />
                Lista de Estudiantes
              </h2>
              <p className="text-gray-600">Todos los estudiantes inscritos en este curso</p>
            </div>

            {estudiantes.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl transition shadow-md"
              >
                <FiDownload />
                Exportar CSV
              </button>
            )}
          </div>

          {estudiantes.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="text-8xl mb-4">👨‍🎓</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">No hay estudiantes inscritos</h3>
              <p className="text-gray-500 mb-6">Aún no hay estudiantes registrados en este curso.</p>
              <button
                onClick={() => navigate("/admin/ver-todo")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md"
              >
                Volver a cursos
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block md:hidden space-y-4">
                {estudiantes.map((est, i) => (
                  <div
                    key={est.id || i}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {est.nombres?.[0] || "?"}
                        </div>
                        <span className="text-xs text-blue-600 font-bold mt-2 bg-blue-100 px-3 py-1 rounded-full">
                          #{i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {est.nombres} {est.apellidos}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                          <FaEnvelope className="text-blue-500" />
                          <span className="text-sm">{est.correo}</span>
                        </div>

                        {/* Información de pago */}
                        <div className="mt-3">
                          {est.montoPagado > 0 ? (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                              <FaDollarSign className="text-sm" />
                              <span className="text-sm font-medium">Pagó: ${est.montoPagado.toFixed(2)}</span>
                              <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                                Pagado
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
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
              <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-2xl">
                        #
                      </th>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Correo electrónico
                      </th>
                      <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-2xl">
                        Pago
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estudiantes.map((est, i) => (
                      <tr key={est.id || i} className="hover:bg-blue-50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {est.nombres?.[0] || "?"}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">
                                {est.nombres} {est.apellidos}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <FiMail className="text-blue-500 text-lg" />
                            <span className="text-gray-700 text-lg">{est.correo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {est.montoPagado > 0 ? (
                            <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-xl">
                              <FaDollarSign className="text-lg" />
                              <span className="font-semibold">${est.montoPagado.toFixed(2)}</span>
                              <span className="text-sm bg-green-100 px-3 py-1 rounded-full">
                                Pagado
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl">
                              <span className="font-semibold">Gratis</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-blue-600 text-xl" />
                    <span className="text-lg text-gray-700">
                      Total de estudiantes: <strong>{estudiantes.length}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-lg text-green-600 bg-green-100 px-4 py-2 rounded-xl font-semibold">
                      <strong>{paymentData.estudiantesPagados}</strong> pagados
                    </div>
                    <div className="text-lg text-blue-600 bg-blue-100 px-4 py-2 rounded-xl font-semibold">
                      <strong>{paymentData.estudiantesGratis}</strong> gratis
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Curso ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}