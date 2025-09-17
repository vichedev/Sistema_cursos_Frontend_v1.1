import { useEffect, useState } from "react";
import axios from "axios";
import { FaDollarSign, FaUsers, FaChalkboardTeacher, FaBook, FaMoneyBillWave, FaUserCheck, FaUserFriends } from "react-icons/fa";

export default function DashboardAdminCursos() {
  const [stats, setStats] = useState(null);
  const [allCursos, setAllCursos] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalRecaudado: 0,
    totalPagados: 0,
    totalGratis: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1) Estadísticas resumen
        const statsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/stats/general`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(statsResponse.data);

        // 2) Todos los cursos
        const coursesResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/courses/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        let coursesData = [];
        if (coursesResponse.data && Array.isArray(coursesResponse.data.data)) {
          coursesData = coursesResponse.data.data;
        } else if (Array.isArray(coursesResponse.data)) {
          coursesData = coursesResponse.data;
        }
        setAllCursos(coursesData);

        // 3) Obtener información de pagos de todos los cursos
        let allPayments = [];
        let totalRecaudado = 0;
        let totalPagados = 0;
        let totalGratis = 0;

        // Para cada curso, obtener los estudiantes con información de pago
        for (const course of coursesData) {
          try {
            const paymentResponse = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/courses/${course.id}/estudiantes-con-pagos`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (paymentResponse.data && paymentResponse.data.estudiantes) {
              const estudiantesConPago = paymentResponse.data.estudiantes;
              
              // Agregar información del curso a cada pago
              const paymentsWithCourseInfo = estudiantesConPago
                .filter(est => est.montoPagado > 0)
                .map(est => ({
                  ...est,
                  cursoId: course.id,
                  cursoTitulo: course.titulo,
                  fechaPago: est.fechaInscripcion || new Date()
                }));
              
              allPayments = [...allPayments, ...paymentsWithCourseInfo];
              
              // Calcular estadísticas
              totalRecaudado += estudiantesConPago.reduce((sum, est) => sum + est.montoPagado, 0);
              totalPagados += estudiantesConPago.filter(est => est.montoPagado > 0).length;
              totalGratis += estudiantesConPago.filter(est => est.montoPagado === 0).length;
            }
          } catch (error) {
            console.log(`No se pudo obtener información de pagos para el curso ${course.id}`);
          }
        }
        
        setPaymentStats({ totalRecaudado, totalPagados, totalGratis });
        
        // Ordenar pagos por fecha (más recientes primero) y tomar los últimos 5
        const sortedPayments = allPayments.sort((a, b) => 
          new Date(b.fechaPago) - new Date(a.fechaPago)
        ).slice(0, 5);
        
        setRecentPayments(sortedPayments);

        // 4) Determinar cursos más populares (con más estudiantes)
        const coursesWithStudents = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const studentsResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/courses/${course.id}/estudiantes`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              return {
                ...course,
                totalEstudiantes: studentsResponse.data.length || 0
              };
            } catch (error) {
              return {
                ...course,
                totalEstudiantes: 0
              };
            }
          })
        );
        
        // Ordenar por número de estudiantes (descendente) y tomar los top 5
        const popularCourses = coursesWithStudents
          .sort((a, b) => b.totalEstudiantes - a.totalEstudiantes)
          .slice(0, 5);
        
        setTopCourses(popularCourses);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preparar datos para visualización
  const cursosGratis = Array.isArray(allCursos) 
    ? allCursos.filter((c) => c.tipo && c.tipo.endsWith("GRATIS")) 
    : [];

  const cursosPagados = Array.isArray(allCursos) 
    ? allCursos.filter((c) => c.tipo && c.tipo.endsWith("PAGADO")) 
    : [];

  const cursosPresenciales = Array.isArray(allCursos) 
    ? allCursos.filter((c) => c.tipo && c.tipo.startsWith("PRESENCIAL")) 
    : [];

  const cursosOnline = Array.isArray(allCursos) 
    ? allCursos.filter((c) => c.tipo && c.tipo.startsWith("ONLINE")) 
    : [];

  // Calcular porcentajes para las barras de progreso
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const totalCursos = allCursos.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Tarjetas de resumen con datos reales
  const summaryCards = [
    {
      title: "Total Cursos",
      value: allCursos.length,
      icon: <FaBook className="text-2xl" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-white"
    },
    {
      title: "Estudiantes",
      value: paymentStats.totalPagados + paymentStats.totalGratis,
      icon: <FaUsers className="text-2xl" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-white"
    },
    {
      title: "Profesores",
      value: stats?.totalProfesores || 0,
      icon: <FaChalkboardTeacher className="text-2xl" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-white"
    },
    {
      title: "Ingresos Totales",
      value: `$${paymentStats.totalRecaudado.toFixed(2)}`,
      icon: <FaMoneyBillWave className="text-2xl" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      textColor: "text-white"
    },
    {
      title: "Estudiantes Pagados",
      value: paymentStats.totalPagados,
      icon: <FaUserCheck className="text-2xl" />,
      color: "bg-gradient-to-r from-teal-500 to-teal-600",
      textColor: "text-white"
    },
    {
      title: "Estudiantes Gratis",
      value: paymentStats.totalGratis,
      icon: <FaUserFriends className="text-2xl" />,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      textColor: "text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
        <p className="text-gray-600">Resumen general del sistema de cursos</p>
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <div key={index} className={`rounded-xl shadow-md p-5 ${card.color} ${card.textColor}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <span className="opacity-90">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Distribución de cursos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribución de Cursos</h2>
          
          <div className="space-y-4">
            {/* Barra de progreso para cursos gratuitos */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-600">Gratuitos</span>
                <span className="text-sm font-medium text-blue-600">{cursosGratis.length} ({calculatePercentage(cursosGratis.length, totalCursos)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(cursosGratis.length, totalCursos)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Barra de progreso para cursos pagados */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-green-600">Pagados</span>
                <span className="text-sm font-medium text-green-600">{cursosPagados.length} ({calculatePercentage(cursosPagados.length, totalCursos)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(cursosPagados.length, totalCursos)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Barra de progreso para cursos presenciales */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-purple-600">Presenciales</span>
                <span className="text-sm font-medium text-purple-600">{cursosPresenciales.length} ({calculatePercentage(cursosPresenciales.length, totalCursos)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(cursosPresenciales.length, totalCursos)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Barra de progreso para cursos online */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-orange-600">Online</span>
                <span className="text-sm font-medium text-orange-600">{cursosOnline.length} ({calculatePercentage(cursosOnline.length, totalCursos)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-orange-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(cursosOnline.length, totalCursos)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen por Tipo</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <span className="text-blue-600 text-2xl mr-2">📘</span>
                <div>
                  <h3 className="font-medium text-blue-800">Gratuitos</h3>
                  <p className="text-xl font-bold text-blue-600">{cursosGratis.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <span className="text-green-600 text-2xl mr-2">💰</span>
                <div>
                  <h3 className="font-medium text-green-800">Pagados</h3>
                  <p className="text-xl font-bold text-green-600">{cursosPagados.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <span className="text-purple-600 text-2xl mr-2">🏢</span>
                <div>
                  <h3 className="font-medium text-purple-800">Presenciales</h3>
                  <p className="text-xl font-bold text-purple-600">{cursosPresenciales.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <span className="text-orange-600 text-2xl mr-2">💻</span>
                <div>
                  <h3 className="font-medium text-orange-800">Online</h3>
                  <p className="text-xl font-bold text-orange-600">{cursosOnline.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cursos más populares */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cursos Más Populares</h2>
          {topCourses.length > 0 ? (
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-500 mr-3">{index + 1}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{course.titulo}</h3>
                      <p className="text-sm text-gray-500">{course.totalEstudiantes} inscritos</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.tipo && course.tipo.includes('PAGADO') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {course.tipo && course.tipo.includes('PAGADO') ? 'Pagado' : 'Gratuito'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos de cursos populares</p>
          )}
        </div>

        {/* Pagos recientes REALES */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Pagos Recientes
          </h2>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {payment.nombres} {payment.apellidos}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {payment.cursoTitulo} • {new Date(payment.fechaPago).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${payment.montoPagado.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800`}>
                      Pagado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay pagos recientes</p>
          )}
          
          {/* Resumen de ingresos */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-green-800">Total Recaudado</h3>
                <p className="text-2xl font-bold text-green-600">${paymentStats.totalRecaudado.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">{paymentStats.totalPagados}</span> pagos
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">{paymentStats.totalGratis}</span> gratuitos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}