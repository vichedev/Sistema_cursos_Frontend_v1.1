import { useEffect, useState, useCallback } from "react";
import api from "../../utils/axiosInstance";
import {
  FaDollarSign,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBillWave,
  FaUserCheck,
  FaUserFriends,
} from "react-icons/fa";

export default function DashboardAdminCursos() {
  const [stats, setStats] = useState(null);
  const [allCursos, setAllCursos] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalRecaudado: 0,
    totalPagados: 0,
    totalGratis: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ OPTIMIZADO: Función para fetch con timeout
  const fetchWithTimeout = useCallback(
    async (url, options = {}, timeout = 8000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await api({
          url,
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    [],
  );

  // ✅ OPTIMIZADO: Función para obtener estudiantes de un curso
  const fetchCourseStudents = useCallback(
    async (courseId, token) => {
      try {
        const response = await fetchWithTimeout(
          `/api/courses/${courseId}/estudiantes`,
          5000, // 5 segundos timeout
        );
        return response.data.length || 0;
      } catch (error) {
        console.log(
          `No se pudieron obtener estudiantes para el curso ${courseId}`,
        );
        return 0;
      }
    },
    [fetchWithTimeout],
  );

  // ✅ OPTIMIZADO: Función para obtener pagos de un curso
  const fetchCoursePayments = useCallback(
    async (course, token) => {
      try {
        const response = await fetchWithTimeout(
          `/api/courses/${course.id}/estudiantes-con-pagos`,
          5000, // 5 segundos timeout
        );

        if (response.data && response.data.estudiantes) {
          const estudiantesConPago = response.data.estudiantes;

          const paymentsWithCourseInfo = estudiantesConPago
            .filter((est) => est.montoPagado > 0)
            .map((est) => ({
              ...est,
              cursoId: course.id,
              cursoTitulo: course.titulo,
              fechaPago: est.fechaInscripcion || new Date(),
            }));

          const cursoRecaudado = estudiantesConPago.reduce(
            (sum, est) => sum + est.montoPagado,
            0,
          );
          const cursoPagados = estudiantesConPago.filter(
            (est) => est.montoPagado > 0,
          ).length;
          const cursoGratis = estudiantesConPago.filter(
            (est) => est.montoPagado === 0,
          ).length;

          return {
            payments: paymentsWithCourseInfo,
            stats: { cursoRecaudado, cursoPagados, cursoGratis },
          };
        }
      } catch (error) {
        console.log(
          `No se pudo obtener información de pagos para el curso ${course.id}`,
        );
      }

      return {
        payments: [],
        stats: { cursoRecaudado: 0, cursoPagados: 0, cursoGratis: 0 },
      };
    },
    [fetchWithTimeout],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        // ✅ OPTIMIZADO: Hacer requests en PARALELO en lugar de secuencial
        const [statsResponse, coursesResponse] = await Promise.allSettled([
          fetchWithTimeout(`/api/stats/general`),
          fetchWithTimeout(`/api/courses/all`),
        ]);

        // Procesar respuesta de estadísticas
        if (statsResponse.status === "fulfilled") {
          setStats(statsResponse.value.data);
        } else {
          console.error("Error fetching stats:", statsResponse.reason);
        }

        // Procesar respuesta de cursos
        let coursesData = [];
        if (coursesResponse.status === "fulfilled") {
          const responseData = coursesResponse.value.data;
          if (responseData && Array.isArray(responseData.data)) {
            coursesData = responseData.data;
          } else if (Array.isArray(responseData)) {
            coursesData = responseData;
          }
        } else {
          console.error("Error fetching courses:", coursesResponse.reason);
        }

        setAllCursos(coursesData);

        // ✅ OPTIMIZADO: Procesar pagos y estudiantes en PARALELO
        if (coursesData.length > 0) {
          // Obtener pagos de TODOS los cursos en paralelo
          const paymentPromises = coursesData.map((course) =>
            fetchCoursePayments(course, token),
          );

          // Obtener estudiantes de TODOS los cursos en paralelo
          const studentPromises = coursesData.map((course) =>
            fetchCourseStudents(course.id, token),
          );

          const [paymentResults, studentCounts] = await Promise.allSettled([
            Promise.all(paymentPromises),
            Promise.all(studentPromises),
          ]);

          // Procesar resultados de pagos
          let allPayments = [];
          let totalRecaudado = 0;
          let totalPagados = 0;
          let totalGratis = 0;

          if (paymentResults.status === "fulfilled") {
            paymentResults.value.forEach((result) => {
              if (result) {
                allPayments = [...allPayments, ...result.payments];
                totalRecaudado += result.stats.cursoRecaudado;
                totalPagados += result.stats.cursoPagados;
                totalGratis += result.stats.cursoGratis;
              }
            });
          }

          setPaymentStats({ totalRecaudado, totalPagados, totalGratis });

          // Ordenar pagos por fecha (más recientes primero) y tomar los últimos 5
          const sortedPayments = allPayments
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .slice(0, 5);

          setRecentPayments(sortedPayments);

          // Procesar cursos populares
          if (studentCounts.status === "fulfilled") {
            const coursesWithStudents = coursesData.map((course, index) => ({
              ...course,
              totalEstudiantes: studentCounts.value[index] || 0,
            }));

            const popularCourses = coursesWithStudents
              .sort((a, b) => b.totalEstudiantes - a.totalEstudiantes)
              .slice(0, 5);

            setTopCourses(popularCourses);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchWithTimeout, fetchCoursePayments, fetchCourseStudents]);

  // ✅ OPTIMIZADO: Memoizar cálculos de categorías
  const cursosGratis = allCursos.filter(
    (c) => c.tipo && c.tipo.endsWith("GRATIS"),
  );
  const cursosPagados = allCursos.filter(
    (c) => c.tipo && c.tipo.endsWith("PAGADO"),
  );
  const cursosPresenciales = allCursos.filter(
    (c) => c.tipo && c.tipo.startsWith("PRESENCIAL"),
  );
  const cursosOnline = allCursos.filter(
    (c) => c.tipo && c.tipo.startsWith("ONLINE"),
  );
  const totalCursos = allCursos.length;

  // ✅ OPTIMIZADO: Memoizar cálculo de porcentajes
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // ✅ OPTIMIZADO: Memoizar tarjetas de resumen
  const summaryCards = [
    {
      title: "Total Cursos",
      value: totalCursos,
      icon: <FaBook className="text-2xl" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-white",
    },
    {
      title: "Estudiantes",
      value: stats?.totalEstudiantes || 0,
      icon: <FaUsers className="text-2xl" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-white",
    },
    {
      title: "Profesores",
      value: stats?.totalProfesores || 0,
      icon: <FaChalkboardTeacher className="text-2xl" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-white",
    },
    {
      title: "Ingresos Totales",
      value: `$${paymentStats.totalRecaudado.toFixed(2)}`,
      icon: <FaMoneyBillWave className="text-2xl" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      textColor: "text-white",
    },
    {
      title: "Estudiantes Pagados",
      value: paymentStats.totalPagados,
      icon: <FaUserCheck className="text-2xl" />,
      color: "bg-gradient-to-r from-teal-500 to-teal-600",
      textColor: "text-white",
    },
    {
      title: "Estudiantes Gratis",
      value: paymentStats.totalGratis,
      icon: <FaUserFriends className="text-2xl" />,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      textColor: "text-white",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen general del sistema de cursos
        </p>
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`rounded-xl shadow-md p-5 ${card.color} ${card.textColor} transition-transform hover:scale-105 duration-200`}
          >
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

      {/* Resto del JSX permanece igual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Distribución de cursos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Distribución de Cursos
          </h2>

          <div className="space-y-4">
            {/* Barras de progreso... (mantener igual) */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Gratuitos
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {cursosGratis.length} (
                  {calculatePercentage(cursosGratis.length, totalCursos)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${calculatePercentage(cursosGratis.length, totalCursos)}%`,
                  }}
                ></div>
              </div>
            </div>
            {/* Barra de progreso para cursos pagados */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Pagados
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {cursosPagados.length} (
                  {calculatePercentage(cursosPagados.length, totalCursos)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{
                    width: `${calculatePercentage(cursosPagados.length, totalCursos)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Barra de progreso para cursos presenciales */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Presenciales
                </span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {cursosPresenciales.length} (
                  {calculatePercentage(cursosPresenciales.length, totalCursos)}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{
                    width: `${calculatePercentage(cursosPresenciales.length, totalCursos)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Barra de progreso para cursos online */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Online
                </span>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {cursosOnline.length} (
                  {calculatePercentage(cursosOnline.length, totalCursos)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-orange-600 h-2.5 rounded-full"
                  style={{
                    width: `${calculatePercentage(cursosOnline.length, totalCursos)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Resumen por Tipo
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-blue-600 dark:text-blue-400 text-2xl mr-2">
                  📘
                </span>
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">
                    Gratuitos
                  </h3>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {cursosGratis.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-green-600 dark:text-green-400 text-2xl mr-2">
                  💰
                </span>
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-300">
                    Pagados
                  </h3>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {cursosPagados.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-purple-600 dark:text-purple-400 text-2xl mr-2">
                  🏢
                </span>
                <div>
                  <h3 className="font-medium text-purple-800 dark:text-purple-300">
                    Presenciales
                  </h3>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {cursosPresenciales.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 transition-colors duration-200">
              <div className="flex items-center">
                <span className="text-orange-600 dark:text-orange-400 text-2xl mr-2">
                  💻
                </span>
                <div>
                  <h3 className="font-medium text-orange-800 dark:text-orange-300">
                    Online
                  </h3>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {cursosOnline.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cursos más populares */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Cursos Más Populares
          </h2>
          {topCourses.length > 0 ? (
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-500 dark:text-gray-400 mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        {course.titulo}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.totalEstudiantes} inscritos
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.tipo && course.tipo.includes("PAGADO")
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {course.tipo && course.tipo.includes("PAGADO")
                      ? "Pagado"
                      : "Gratuito"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay datos de cursos populares
            </p>
          )}
        </div>

        {/* Pagos recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Pagos Recientes
          </h2>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {payment.nombres} {payment.apellidos}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {payment.cursoTitulo} •{" "}
                      {new Date(payment.fechaPago).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${payment.montoPagado.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
                    >
                      Pagado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay pagos recientes
            </p>
          )}

          {/* Resumen de ingresos */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300">
                  Total Recaudado
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${paymentStats.totalRecaudado.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <span className="font-semibold">
                    {paymentStats.totalPagados}
                  </span>{" "}
                  pagos
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-semibold">
                    {paymentStats.totalGratis}
                  </span>{" "}
                  gratuitos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
