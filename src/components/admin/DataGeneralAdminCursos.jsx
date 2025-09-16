import { useEffect, useState } from "react";
import axios from "axios";

export default function DataGeneralAdminCursos() {
  const [stats, setStats] = useState(null);
  const [allCursos, setAllCursos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1) Estadísticas resumen
    axios
      .get("http://localhost:3001/stats/general", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));

    // 2) Todos los cursos (para tablas detalladas)
    axios
      .get("http://localhost:3001/courses/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllCursos(res.data))
      .catch(() => setAllCursos([]));
  }, []);

  if (!stats) {
    return (
      <div className="p-6 text-center text-orange-300/80">
        Cargando estadísticas…
      </div>
    );
  }

  // Filtrar gratis / pagados
  const cursosGratis = allCursos.filter((c) => c.tipo.endsWith("GRATIS"));
  const cursosPagados = allCursos.filter((c) => c.tipo.endsWith("PAGADO"));

  const totalGeneral =
    stats.totalCursos +
    stats.totalEstudiantes +
    stats.totalProfesores +
    stats.totalInscripciones || 1;

  const porcentaje = (value) =>
    ((value / totalGeneral) * 100).toFixed(2);

  const cards = [
    {
      title: "Cursos",
      value: stats.totalCursos,
      description: "Cursos creados",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      progressColor: "bg-orange-400",
    },
    {
      title: "Estudiantes",
      value: stats.totalEstudiantes,
      description: "Inscripciones registradas",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-600",
      progressColor: "bg-yellow-400",
    },
    {
      title: "Profesores",
      value: stats.totalProfesores,
      description: "Docentes registrados",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-600",
      progressColor: "bg-amber-400",
    },
    {
      title: "Inscripciones",
      value: stats.totalInscripciones,
      description: "Total de inscripciones",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-600",
      progressColor: "bg-rose-400",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map(
          ({
            title,
            value,
            description,
            bgColor,
            borderColor,
            textColor,
            progressColor,
          }) => (
            <div
              key={title}
              className={`${bgColor} ${borderColor} border rounded-3xl p-8 shadow-xl flex flex-col justify-between transform hover:scale-[1.03] transition`}
              style={{
                fontFamily:
                  "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
              }}
            >
              <div>
                <h3 className={`font-semibold text-2xl mb-3 ${textColor} tracking-tight`}>
                  {title}
                </h3>
                <p className="text-6xl font-extrabold text-gray-900 mb-2 select-text">
                  {value}
                </p>
                <p className="text-sm text-gray-600 select-text">{description}</p>
              </div>
              <div className="mt-8">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`${progressColor} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${porcentaje(value)}%` }}
                    aria-label={`${porcentaje(value)}%`}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-gray-500 font-semibold select-text">
                  {porcentaje(value)}%
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Tablas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gratis */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
          <h4 className="text-xl font-bold text-orange-600 mb-4 select-text">
            Cursos Gratuitos ({cursosGratis.length})
          </h4>
          {cursosGratis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="bg-orange-50 text-orange-600">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Título</th>
                    <th className="px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {cursosGratis.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-orange-50 transition"
                    >
                      <td className="px-4 py-2 select-text">{c.id}</td>
                      <td className="px-4 py-2 font-medium select-text">{c.titulo}</td>
                      <td className="px-4 py-2 select-text">
                        {c.fecha
                          ? new Date(c.fecha).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 italic select-text">
              No hay cursos gratuitos.
            </p>
          )}
        </div>

        {/* Pagados */}
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6">
          <h4 className="text-xl font-bold text-yellow-600 mb-4 select-text">
            Cursos Pagados ({cursosPagados.length})
          </h4>
          {cursosPagados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-600">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Título</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {cursosPagados.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-yellow-50 transition"
                    >
                      <td className="px-4 py-2 select-text">{c.id}</td>
                      <td className="px-4 py-2 font-medium select-text">{c.titulo}</td>
                      <td className="px-4 py-2 select-text">
                        {c.fecha
                          ? new Date(c.fecha).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 select-text">${c.precio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 italic select-text">
              No hay cursos pagados.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
