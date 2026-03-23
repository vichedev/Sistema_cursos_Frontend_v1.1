import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaClock,
  FaUserFriends,
  FaDollarSign,
  FaMoneyBillWave,
  FaArrowLeft,
  FaEnvelope,
  FaIdBadge,
} from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { FiUsers, FiDownload, FiMail } from "react-icons/fi";
import { isCourseExpired } from "../../utils/dateUtils";
import * as XLSX from "xlsx";

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
    estudiantesGratis: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Curso
        const cursoResponse = await api.get(`/api/courses/${id}`);
        setCurso(cursoResponse.data);

        // Estudiantes (con pagos si existe)
        try {
          const estudiantesResponse = await api.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/courses/${id}/estudiantes-con-pagos`,
          );

          setEstudiantes(estudiantesResponse.data.estudiantes || []);

          const estudiantesPagados =
            estudiantesResponse.data.estudiantes.filter(
              (est) => est.montoPagado > 0,
            ).length;
          const estudiantesGratis = estudiantesResponse.data.estudiantes.filter(
            (est) => est.montoPagado === 0,
          ).length;
          const totalRecaudado = estudiantesResponse.data.estudiantes.reduce(
            (sum, est) => sum + est.montoPagado,
            0,
          );

          setPaymentData({
            totalRecaudado,
            estudiantesPagados,
            estudiantesGratis,
          });
        } catch {
          // Fallback sin pagos
          const estudiantesBasic = await api.get(
            `/api/courses/${id}/estudiantes`,
          );

          const estudiantesConPago = estudiantesBasic.data.map((est) => ({
            ...est,
            montoPagado: 0,
            metodoPago: "Gratis",
            fechaInscripcion: null,
          }));

          setEstudiantes(estudiantesConPago);
          setPaymentData({
            totalRecaudado: 0,
            estudiantesPagados: 0,
            estudiantesGratis: estudiantesConPago.length,
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

  const exportToExcel = () => {
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // ================================
    // HOJA 1: RESUMEN DEL CURSO
    // ================================
    const summaryData = [
      ["INFORME DETALLADO DE ESTUDIANTES - MAAT ACADEMY"],
      [""],
      ["INFORMACIÓN DEL CURSO"],
      ["Título del curso:", curso?.titulo || "N/A"],
      [
        "Profesor:",
        curso?.profesor
          ? `${curso.profesor.nombres || ""} ${
              curso.profesor.apellidos || ""
            }`.trim()
          : "Por confirmar",
      ],
      ["Fecha:", curso?.fecha || "Por definir"],
      ["Hora:", curso?.hora || "Por definir"],
      ["Tipo:", curso?.tipo?.replace(/_/g, " ") || "N/A"],
      ["Precio:", `$${curso?.precio || 0}`],
      ["Cupos:", curso?.cupos || 0],
      [""],
      ["ESTADÍSTICAS DE INSCRIPCIÓN"],
      ["Total de estudiantes:", estudiantes.length],
      ["Estudiantes pagados:", paymentData.estudiantesPagados],
      ["Estudiantes gratis:", paymentData.estudiantesGratis],
      ["Total recaudado:", `$${paymentData.totalRecaudado.toFixed(2)}`],
      [
        "Fecha de generación:",
        new Date().toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ],
      [""],
      [""],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

    // Aplicar estilos a la hoja de resumen
    if (wsSummary["!merges"] === undefined) wsSummary["!merges"] = [];

    // Fusionar celdas para el título
    wsSummary["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });

    // Establecer anchos de columna
    wsSummary["!cols"] = [
      { wch: 25 }, // Columna A
      { wch: 30 }, // Columna B
      { wch: 15 }, // Columna C
      { wch: 15 }, // Columna D
      { wch: 15 }, // Columna E
    ];

    // ================================
    // HOJA 2: DETALLE DE ESTUDIANTES - CORREGIDA
    // ================================
    const studentsData = [
      [
        "N°",
        "NOMBRES COMPLETOS",
        "CORREO ELECTRÓNICO",
        "MONTO PAGADO (USD)",
        "MÉTODO DE PAGO",
        "ESTADO DE PAGO",
        "FECHA DE INSCRIPCIÓN",
        "TIPO DE INSCRIPCIÓN",
      ],
      ...estudiantes.map((est, index) => {
        console.log("📋 Procesando estudiante:", est); // Para debug

        // ✅ MANEJO SEGURO DE DATOS - CORREGIDO
        const nombres = est.nombres || est.Nombres || "Sin nombre";
        const apellidos = est.apellidos || est.Apellidos || "";
        const correo = est.correo || est.Correo || "Sin correo";
        const montoPagado = est.montoPagado || est.MontoPagado || 0;
        const metodoPago = est.metodoPago || est.MetodoPago || "Gratis";
        const fechaInscripcion =
          est.fechaInscripcion || est.FechaInscripcion
            ? new Date(
                est.fechaInscripcion || est.FechaInscripcion,
              ).toLocaleDateString("es-ES")
            : "N/A";

        return [
          index + 1,
          `${nombres} ${apellidos}`.trim(),
          correo,
          montoPagado > 0 ? montoPagado : 0,
          metodoPago,
          montoPagado > 0 ? "PAGADO" : "GRATIS",
          fechaInscripcion,
          montoPagado > 0 ? "PAGADA" : "GRATUITA",
        ];
      }),
    ];

    // Agregar fila de totales solo si hay estudiantes
    if (estudiantes.length > 0) {
      studentsData.push([""]);
      studentsData.push([
        "TOTALES:",
        "",
        "",
        `$${paymentData.totalRecaudado.toFixed(2)}`,
        "",
        "",
        "",
        "",
      ]);
    }

    const wsStudents = XLSX.utils.aoa_to_sheet(studentsData);

    // Aplicar estilos a la hoja de estudiantes
    wsStudents["!cols"] = [
      { wch: 5 }, // Columna A: N°
      { wch: 35 }, // Columna B: Nombres (más ancho)
      { wch: 30 }, // Columna C: Email
      { wch: 15 }, // Columna D: Monto
      { wch: 15 }, // Columna E: Método
      { wch: 12 }, // Columna F: Estado
      { wch: 15 }, // Columna G: Fecha
      { wch: 12 }, // Columna H: Tipo
    ];

    // Aplicar formato de moneda a la columna de montos
    const range = XLSX.utils.decode_range(wsStudents["!ref"]);
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // Columna D (índice 3)
      if (wsStudents[cellAddress]) {
        // Si es un número, aplicar formato de moneda
        if (typeof wsStudents[cellAddress].v === "number") {
          wsStudents[cellAddress].z = '"$"#,##0.00';
        }
      }
    }

    // ================================
    // HOJA 3: RESUMEN FINANCIERO - MEJORADO
    // ================================
    const porcentajePagados =
      estudiantes.length > 0
        ? (paymentData.estudiantesPagados / estudiantes.length) * 100
        : 0;
    const porcentajeGratis =
      estudiantes.length > 0
        ? (paymentData.estudiantesGratis / estudiantes.length) * 100
        : 0;
    const promedioPago =
      paymentData.estudiantesPagados > 0
        ? paymentData.totalRecaudado / paymentData.estudiantesPagados
        : 0;

    const financialData = [
      ["RESUMEN FINANCIERO - MAAT ACADEMY"],
      [""],
      ["ESTADÍSTICAS DE PAGOS"],
      ["Concepto", "Cantidad", "Porcentaje", "Monto Total"],
      [
        "Estudiantes Pagados",
        paymentData.estudiantesPagados,
        `${porcentajePagados.toFixed(1)}%`,
        `$${paymentData.totalRecaudado.toFixed(2)}`,
      ],
      [
        "Estudiantes Gratis",
        paymentData.estudiantesGratis,
        `${porcentajeGratis.toFixed(1)}%`,
        "$0.00",
      ],
      [
        "TOTAL",
        estudiantes.length,
        "100%",
        `$${paymentData.totalRecaudado.toFixed(2)}`,
      ],
      [""],
      ["ANÁLISIS FINANCIERO"],
      [
        "Promedio de pago por estudiante pagado:",
        `$${promedioPago.toFixed(2)}`,
      ],
      ["Tasa de conversión a pago:", `${porcentajePagados.toFixed(1)}%`],
      [""],
      ["INFORMACIÓN ADICIONAL"],
      ["Curso:", curso?.titulo || "N/A"],
      ["Fecha de corte:", new Date().toLocaleDateString("es-ES")],
      ["Total estudiantes procesados:", estudiantes.length],
      ["Generado por:", "Sistema MAAT ACADEMY"],
    ];

    const wsFinancial = XLSX.utils.aoa_to_sheet(financialData);
    wsFinancial["!cols"] = [
      { wch: 40 }, // Columna A (más ancho para textos largos)
      { wch: 15 }, // Columna B
      { wch: 15 }, // Columna C
      { wch: 15 }, // Columna D
    ];

    // Agregar hojas al libro
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Curso");
    XLSX.utils.book_append_sheet(wb, wsStudents, "Estudiantes");
    XLSX.utils.book_append_sheet(wb, wsFinancial, "Resumen Financiero");

    // Generar archivo con nombre seguro
    const cursoTitle = curso?.titulo
      ? curso.titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "_")
      : "Curso";
    const fileName = `Estudiantes_${cursoTitle}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    XLSX.writeFile(wb, fileName);

    console.log("✅ Excel generado exitosamente");
    console.log("📊 Estudiantes procesados:", estudiantes.length);
    console.log("💰 Total recaudado:", paymentData.totalRecaudado);
    console.log("📋 Datos de estudiantes:", estudiantes); // Para debug
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
          <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
            Cargando estudiantes...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="text-center p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg max-w-md mx-4 transition-colors duration-200">
          <div className="text-red-500 text-5xl md:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Error al cargar
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl transition shadow-md text-sm md:text-base"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate("/admin/ver-todo")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl transition shadow-md text-sm md:text-base"
            >
              Volver a cursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = curso ? isCourseExpired(curso) : false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl md:rounded-2xl p-5 md:p-8 text-white shadow-xl mb-6 md:mb-8">
        <div className="flex flex-col gap-5 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-4 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-sm">
              <FaUserGraduate className="text-2xl md:text-4xl" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                <h1 className="text-xl md:text-3xl font-bold">
                  Estudiantes Inscritos
                </h1>
                {isExpired && (
                  <span className="px-2 md:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs md:text-sm font-semibold self-start sm:self-auto">
                    CURSO FINALIZADO
                  </span>
                )}
              </div>
              <p className="text-blue-100 text-sm md:text-lg mt-1">
                Curso:{" "}
                <span className="font-semibold">
                  {curso?.titulo || "Cargando..."}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 bg-white/20 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl backdrop-blur-sm">
              <FiUsers className="text-lg md:text-2xl" />
              <span className="text-base md:text-xl font-bold">
                {estudiantes.length} Inscrito
                {estudiantes.length === 1 ? "" : "s"}
              </span>
            </div>

            <button
              onClick={() => navigate("/admin/ver-todo")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl transition backdrop-blur-sm text-sm md:text-base"
            >
              <FaArrowLeft className="text-sm md:text-base" />
              Volver a cursos
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas de Pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 md:p-6 rounded-xl md:rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg md:rounded-xl backdrop-blur-sm">
              <FaMoneyBillWave className="text-lg md:text-2xl" />
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90">Total Recaudado</p>
              <p className="text-xl md:text-2xl font-bold">
                ${paymentData.totalRecaudado.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 rounded-xl md:rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg md:rounded-xl backdrop-blur-sm">
              <FaDollarSign className="text-lg md:text-2xl" />
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90">
                Estudiantes Pagados
              </p>
              <p className="text-xl md:text-2xl font-bold">
                {paymentData.estudiantesPagados}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 rounded-xl md:rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg md:rounded-xl backdrop-blur-sm">
              <FaUserFriends className="text-lg md:text-2xl" />
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90">
                Estudiantes Gratis
              </p>
              <p className="text-xl md:text-2xl font-bold">
                {paymentData.estudiantesGratis}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Curso */}
      {curso && (
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8 mb-6 md:mb-8 transition-colors duration-200">
          <div className="flex flex-col lg:flex-row gap-5 md:gap-8 items-start">
            <div className="flex-shrink-0 p-3 md:p-5 bg-blue-100 dark:bg-blue-900/20 rounded-xl md:rounded-2xl self-center transition-colors duration-200">
              <HiOutlineAcademicCap className="text-3xl md:text-5xl text-blue-600 dark:text-blue-400" />
            </div>

            <div className="flex-1 w-full">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 transition-colors duration-200">
                {curso.titulo}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:rounded-xl transition-colors duration-200">
                  <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-800 rounded-lg transition-colors duration-200">
                    <FaChalkboardTeacher className="text-blue-600 dark:text-blue-400 text-base md:text-xl" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      Profesor
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base transition-colors duration-200">
                      {curso.profesor
                        ? `${curso.profesor.nombres} ${curso.profesor.apellidos}`
                        : "Por confirmar"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:rounded-xl transition-colors duration-200">
                  <div className="p-2 md:p-3 bg-orange-100 dark:bg-orange-800 rounded-lg transition-colors duration-200">
                    <FaCalendarAlt className="text-orange-600 dark:text-orange-400 text-base md:text-xl" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      Fecha
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base transition-colors duration-200">
                      {curso.fecha || "Por definir"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:rounded-xl transition-colors duration-200">
                  <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-800 rounded-lg transition-colors duration-200">
                    <FaClock className="text-purple-600 dark:text-purple-400 text-base md:text-xl" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      Hora
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base transition-colors duration-200">
                      {curso.hora || "Por definir"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:rounded-xl transition-colors duration-200">
                  <div className="p-2 md:p-3 bg-green-100 dark:bg-green-800 rounded-lg transition-colors duration-200">
                    <FaUserFriends className="text-green-600 dark:text-green-400 text-base md:text-xl" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      Cupos
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base transition-colors duration-200">
                      {curso.cupos} disponibles
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:rounded-xl transition-colors duration-200">
                  <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-800 rounded-lg transition-colors duration-200">
                    <FaIdBadge className="text-indigo-600 dark:text-indigo-400 text-base md:text-xl" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      Tipo
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base transition-colors duration-200">
                      {curso.tipo?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:rounded-xl transition-colors duration-200">
                  <div className="p-2 md:p-3 bg-amber-100 dark:bg-amber-800 rounded-lg transition-colors duration-200">
                    <FaDollarSign className="text-amber-600 dark:text-amber-400 text-base md:text-xl" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      Precio
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm md:text-base transition-colors duration-200">
                      ${curso.precio || 0}
                    </p>
                  </div>
                </div>
              </div>

              {curso.profesor?.asignatura && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg md:rounded-xl border border-blue-200 dark:border-blue-800 transition-colors duration-200">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    Asignatura del profesor:
                  </p>
                  <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm md:text-base">
                    {curso.profesor.asignatura}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Estudiantes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 md:gap-3 transition-colors duration-200">
              <FaUserGraduate className="text-blue-600 dark:text-blue-400 text-lg md:text-xl" />
              Lista de Estudiantes
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base transition-colors duration-200">
              Todos los estudiantes inscritos en este curso
            </p>
          </div>

          {estudiantes.length > 0 && (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl transition shadow-md text-sm md:text-base"
            >
              <FiDownload className="text-sm md:text-base" />
              Exportar Excel
            </button>
          )}
        </div>

        {estudiantes.length === 0 ? (
          <div className="text-center py-10 md:py-16 bg-gray-50 dark:bg-gray-700 rounded-xl md:rounded-2xl transition-colors duration-200">
            <div className="text-6xl md:text-8xl mb-3 md:mb-4">👨‍🎓</div>
            <h3 className="text-lg md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3 transition-colors duration-200">
              No hay estudiantes inscritos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 md:mb-6 text-sm md:text-base transition-colors duration-200">
              Aún no hay estudiantes registrados en este curso.
            </p>
            <button
              onClick={() => navigate("/admin/ver-todo")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg md:rounded-xl transition shadow-md text-sm md:text-base"
            >
              Volver a cursos
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {estudiantes.map((est, i) => (
                <div
                  key={est.id || i}
                  className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {est.nombres?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full transition-colors duration-200">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white text-base transition-colors duration-200">
                        {est.nombres} {est.apellidos}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-gray-300 transition-colors duration-200">
                        <FaEnvelope className="text-blue-500 text-xs" />
                        <span className="text-xs truncate">{est.correo}</span>
                      </div>

                      {/* Pago */}
                      <div className="mt-2">
                        {est.montoPagado > 0 ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1.5 rounded-lg text-xs transition-colors duration-200">
                            <div className="flex items-center gap-1">
                              <FaDollarSign className="text-xs" />
                              <span className="font-medium">
                                Pagó: ${est.montoPagado.toFixed(2)}
                              </span>
                            </div>
                            <span className="bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded-full transition-colors duration-200">
                              Pagado
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1.5 rounded-lg text-xs transition-colors duration-200">
                            <span className="font-medium">Gratis</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-auto rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-200">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl md:rounded-tl-2xl">
                      #
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Correo electrónico
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider rounded-tr-xl md:rounded-tr-2xl">
                      Pago
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600 transition-colors duration-200">
                  {estudiantes.map((est, i) => (
                    <tr
                      key={est.id || i}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm md:text-lg transition-colors duration-200">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-sm">
                            {est.nombres?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm md:text-base transition-colors duration-200">
                              {est.nombres} {est.apellidos}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-blue-500 text-sm md:text-lg" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base transition-colors duration-200">
                            {est.correo}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        {est.montoPagado > 0 ? (
                          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg md:rounded-xl text-sm md:text-base transition-colors duration-200">
                            <FaDollarSign className="text-sm md:text-lg" />
                            <span className="font-semibold">
                              ${est.montoPagado.toFixed(2)}
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-800 px-2 py-1 rounded-full transition-colors duration-200">
                              Pagado
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg md:rounded-xl text-sm md:text-base transition-colors duration-200">
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
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl md:rounded-2xl border border-blue-200 dark:border-blue-800 transition-colors duration-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-blue-600 dark:text-blue-400 text-lg md:text-xl" />
                  <span className="text-sm md:text-lg text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    Total: <strong>{estudiantes.length}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm md:text-lg text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl font-semibold transition-colors duration-200">
                    <strong>{paymentData.estudiantesPagados}</strong> pagados
                  </div>
                  <div className="text-sm md:text-lg text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl font-semibold transition-colors duration-200">
                    <strong>{paymentData.estudiantesGratis}</strong> gratis
                  </div>
                </div>

                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Curso ID:{" "}
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 md:px-2 py-0.5 md:py-1 rounded transition-colors duration-200">
                    {id}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
