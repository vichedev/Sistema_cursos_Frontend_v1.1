import SidebarAdmin from "../../components/admin/SidebarAdmin";
import { useParams, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaUsers } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { FiArrowLeft } from "react-icons/fi";

export default function EstudiantesCurso() {
  const { id } = useParams();
  const [estudiantes, setEstudiantes] = useState([]);
  const [curso, setCurso] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:3001/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCurso(res.data))
      .catch(() => setCurso(null));
    axios
      .get(`http://localhost:3001/courses/${id}/estudiantes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEstudiantes(res.data))
      .catch(() => setEstudiantes([]));
  }, [id]);



  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <SidebarAdmin />
      <main className="flex-1 flex justify-center items-start py-3 px-0 sm:px-2">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-orange-100 px-2 xs:px-4 sm:px-8 md:px-16 py-4 sm:py-8 md:py-14 my-4">

          <button
            className="flex items-center gap-2 text-orange-500 hover:text-orange-700 font-bold mb-5 transition text-base sm:text-lg"
            onClick={() => navigate("/admin/dashboard")}
            type="button"
          >
            <FiArrowLeft className="inline-block" /> Volver al Dashboard
          </button>
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-300 shadow text-white text-xl sm:text-2xl">
                <FaUsers />
              </span>
              <div>

                <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">Estudiantes Inscritos</h2>
                <span className="text-xs sm:text-sm text-gray-400 font-semibold block mt-0.5">
                  Curso: {curso?.titulo || "Cargando..."}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-orange-100 text-orange-600 font-bold shadow text-sm sm:text-base mt-2 md:mt-0">
              {estudiantes.length} Inscrito{estudiantes.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Card del curso */}
          {curso && (
            <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 mb-7 p-3 sm:p-4 flex flex-wrap gap-4 items-center">
              <span className="inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-orange-200 text-orange-500 text-xl sm:text-3xl mr-2">
                <FaUserGraduate />
              </span>
              <div className="flex-1 min-w-[120px]">
                <h3 className="text-base sm:text-xl font-bold text-orange-500 mb-1 truncate">{curso.titulo}</h3>
                <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                  <span><b>Tipo:</b> {curso.tipo?.replace(/_/g, " ")}</span>
                  <span><b>Fecha:</b> {curso.fecha || "Por definir"}</span>
                  <span><b>Hora:</b> {curso.hora || "Por definir"}</span>
                  <span><b>Profesor:</b> {curso.profesor ? `${curso.profesor.nombres} ${curso.profesor.apellidos}` : "Por confirmar"}</span>
                  <span><b>Asignatura:</b> {curso.profesor ? curso.profesor.asignatura : "Por confirmar"}</span>

                  <span><b>Cupos:</b> {curso.cupos}</span>
                </div>
              </div>
            </div>
          )}

          {/* Lista/Cards para Mobile, Tabla para Desktop */}
          <div className="bg-white rounded-xl shadow border border-orange-50 p-1 xs:p-2 sm:p-3">
            {/* MOBILE: Cards */}
            <div className="block md:hidden space-y-4">
              {estudiantes.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-base flex flex-col items-center">
                  <span className="text-5xl mb-3">😶</span>
                  No hay estudiantes inscritos aún.
                </div>
              ) : (
                estudiantes.map((est, i) => (
                  <div
                    key={est.id}
                    className="flex items-center gap-3 bg-orange-50/60 rounded-xl shadow-sm p-3"
                  >
                    <div className="flex flex-col items-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-200/80 text-orange-600 font-bold shadow">
                        {est.nombres?.[0] || "?"}
                      </span>
                      <span className="text-xs text-orange-500 mt-1 font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-700 truncate">{est.nombres} {est.apellidos}</div>
                      <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <HiOutlineMail className="text-orange-500" /> {est.correo}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* DESKTOP: Tabla */}
            <div className="hidden md:block">
              {estudiantes.length === 0 ? (
                <div className="text-center text-gray-400 py-16 text-base sm:text-lg flex flex-col items-center">
                  <span className="text-5xl mb-3">😶</span>
                  No hay estudiantes inscritos aún.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[340px] w-full text-xs sm:text-sm border-separate border-spacing-y-1">
                    <thead>
                      <tr className="bg-orange-50 text-orange-500">
                        <th className="px-2 sm:px-5 py-3 text-left rounded-l-xl font-bold">#</th>
                        <th className="px-2 sm:px-5 py-3 text-left font-bold">Nombre</th>
                        <th className="px-2 sm:px-5 py-3 text-left font-bold">Correo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((est, i) => (
                        <tr
                          key={est.id}
                          className="hover:bg-orange-50 transition-all"
                        >
                          <td className="px-2 sm:px-5 py-2 rounded-l-xl text-base font-bold text-orange-500">{i + 1}</td>
                          <td className="px-2 sm:px-5 py-2 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-200/80 text-orange-600 font-bold shadow mr-1">
                              {est.nombres?.[0] || "?"}
                            </span>
                            <span className="truncate">{est.nombres} {est.apellidos}</span>
                          </td>
                          <td className="px-2 sm:px-5 py-2">
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-orange-50 text-orange-600 font-semibold">
                              <HiOutlineMail /> <span className="truncate">{est.correo}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
