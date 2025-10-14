// src/pages/admin/GestionarCupones.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaGift,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUsers,
  FaChartBar,
  FaSync,
  FaCalendarAlt,
  FaEye,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlayCircle,
  FaPauseCircle,
  FaUserCheck,
} from "react-icons/fa";

// Importar todas las funciones desde el archivo de utilidades
import {
  cargarDatos,
  formatearFechaParaInput,
  formatearFechaParaDisplay,
  recargarConRetraso,
  calcularEstadisticas,
  filtrarCupones,
  toggleActivarCupon,
  eliminarCupon,
  verDetallesCupon,
  editarCupon,
  getEstadoCupon,
  getTipoCuponTexto,
  getColorTipo,
} from "./utils/cuponesHelpers";

export default function GestionarCupones() {
  const [cupones, setCupones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCurso, setFilterCurso] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [stats, setStats] = useState(null);
  const [selectedCupon, setSelectedCupon] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);

  // Crear objeto con los setters para pasar a las funciones
  const setters = {
    setCupones,
    setCursos,
    setLoading,
    setStats,
  };

  useEffect(() => {
    handleCargarDatos();
  }, []);

  // Wrapper para cargarDatos
  const handleCargarDatos = () => {
    cargarDatos(setters);
  };

  // Wrapper para recargarConRetraso
  const handleRecargar = () => {
    recargarConRetraso(handleCargarDatos);
  };

  // Wrapper para toggleActivarCupon
  const handleToggleActivar = async (cuponId, activar) => {
    await toggleActivarCupon(cuponId, activar, handleRecargar);
  };

  // Wrapper para eliminarCupon
  const handleEliminar = async (cuponId) => {
    await eliminarCupon(cuponId, handleRecargar);
  };

  // Wrapper para verDetallesCupon
  const handleVerDetalles = async (cuponId) => {
    await verDetallesCupon(cuponId, setSelectedCupon, setShowDetalles);
  };

  // Wrapper para editarCupon
  const handleEditar = async (cupon) => {
    await editarCupon(cupon, handleRecargar);
  };

  // Función para filtrar cupones (llama a la función importada)
  const cuponesFiltrados = filtrarCupones(
    cupones,
    searchTerm,
    filterCurso,
    filterEstado,
    cursos
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Cargando cupones...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <FaGift className="text-2xl text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Gestión de Cupones
              </h1>
              <p className="text-purple-100">
                Administra y monitorea todos los cupones de descuento
              </p>
            </div>
          </div>
          <button
            onClick={handleCargarDatos}
            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition"
          >
            <FaSync className="text-white" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaGift className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Cupones
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Activos
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.activos}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-orange-200 dark:border-orange-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FaExclamationTriangle className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expirados/Agotados
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.expirados + stats.agotados}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FaUserCheck className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usos Realizados
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.usados}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <FaChartBar className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasa de Uso Efectiva
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.tasaUsoEfectiva}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <select
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo}
              </option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="expirado">Expirados</option>
            <option value="agotado">Agotados</option>
          </select>
        </div>
      </div>

      {/* Lista de Cupones */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex-1 flex flex-col">
          <div className="p-6 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Cupones ({cuponesFiltrados.length})
              </h2>
            </div>

            {cuponesFiltrados.length === 0 ? (
              <div className="text-center py-12 flex-1 flex items-center justify-center">
                <div>
                  <FaGift className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No se encontraron cupones
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    {searchTerm ||
                    filterCurso !== "all" ||
                    filterEstado !== "all"
                      ? "Intenta con otros filtros de búsqueda"
                      : "Aún no has creado ningún cupón"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overflow-x-auto pr-2 min-w-0">
                <div className="grid gap-4">
                  {cuponesFiltrados.map((cupon) => {
                    const estado = getEstadoCupon(cupon);
                    const EstadoIcon = estado.icon;
                    const curso = cursos.find((c) => c.id === cupon.cursoId);
                    const puedeActivar =
                      !cupon.activo &&
                      cupon.usosActuales < cupon.usosMaximos &&
                      (!cupon.fechaExpiracion ||
                        new Date() < new Date(cupon.fechaExpiracion));

                    return (
                      <div
                        key={cupon.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Código y Tipo */}
                            <div className="text-center">
                              <div className="font-mono text-lg font-bold bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-gray-800 dark:text-white">
                                {cupon.codigo}
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  getColorTipo(cupon.tipo) === "amber"
                                    ? "bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                                    : getColorTipo(cupon.tipo) === "green"
                                    ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                                    : getColorTipo(cupon.tipo) === "purple"
                                    ? "bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
                                    : getColorTipo(cupon.tipo) === "blue"
                                    ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                    : getColorTipo(cupon.tipo) === "emerald"
                                    ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                                    : getColorTipo(cupon.tipo) === "red"
                                    ? "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200"
                                    : getColorTipo(cupon.tipo) === "cyan"
                                    ? "bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                } mt-1 inline-block`}
                              >
                                {getTipoCuponTexto(cupon.tipo)}
                              </span>
                            </div>

                            {/* Información del Curso */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-white">
                                {curso?.titulo || `Curso ID: ${cupon.cursoId}`}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <FaUsers />
                                  {cupon.usosActuales}/{cupon.usosMaximos} usos
                                </span>
                                {cupon.fechaExpiracion && (
                                  <span className="flex items-center gap-1">
                                    <FaCalendarAlt />
                                    {formatearFechaParaDisplay(
                                      cupon.fechaExpiracion
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Estado */}
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                estado.color === "green"
                                  ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                                  : estado.color === "red"
                                  ? "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200"
                                  : estado.color === "orange"
                                  ? "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              <EstadoIcon className="text-sm" />
                              <span className="text-sm font-medium">
                                {estado.texto}
                              </span>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleVerDetalles(cupon.id)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition dark:text-blue-400"
                              title="Ver detalles y usuarios"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditar(cupon)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition dark:text-green-400"
                              title="Editar cupón"
                            >
                              <FaEdit />
                            </button>
                            {puedeActivar ? (
                              <button
                                onClick={() =>
                                  handleToggleActivar(cupon.id, true)
                                }
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition dark:text-green-400"
                                title="Activar cupón"
                              >
                                <FaPlayCircle />
                              </button>
                            ) : cupon.activo ? (
                              <button
                                onClick={() =>
                                  handleToggleActivar(cupon.id, false)
                                }
                                className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition dark:text-orange-400"
                                title="Desactivar cupón"
                              >
                                <FaPauseCircle />
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleEliminar(cupon.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition dark:text-red-400"
                              title="Eliminar cupón"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetalles && selectedCupon && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header fijo */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Detalles del Cupón: {selectedCupon.cupon?.codigo}
                </h3>
                <button
                  onClick={() => setShowDetalles(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6">
                {/* Información General */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                    Información General
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Código:
                      </span>
                      <p className="font-mono font-bold text-gray-800 dark:text-white text-lg">
                        {selectedCupon.cupon?.codigo}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Tipo:
                      </span>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {getTipoCuponTexto(selectedCupon.cupon?.tipo)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Usos:
                      </span>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {selectedCupon.cupon?.usosActuales} /{" "}
                        {selectedCupon.cupon?.usosMaximos}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          (
                          {selectedCupon.cupon?.usosMaximos -
                            selectedCupon.cupon?.usosActuales}{" "}
                          disponibles)
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Estado:
                      </span>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                          selectedCupon.cupon
                            ? getEstadoCupon(selectedCupon.cupon).color ===
                              "green"
                              ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                              : getEstadoCupon(selectedCupon.cupon).color ===
                                "red"
                              ? "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200"
                              : getEstadoCupon(selectedCupon.cupon).color ===
                                "orange"
                              ? "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {selectedCupon.cupon &&
                          (() => {
                            const EstadoIcon = getEstadoCupon(
                              selectedCupon.cupon
                            ).icon;
                            return <EstadoIcon className="text-sm" />;
                          })()}
                        <span className="text-sm font-medium">
                          {selectedCupon.cupon
                            ? getEstadoCupon(selectedCupon.cupon).texto
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    {selectedCupon.cupon?.fechaExpiracion && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Fecha Expiración:
                        </span>
                        <p className="text-gray-800 dark:text-white">
                          {new Date(
                            selectedCupon.cupon.fechaExpiracion
                          ).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de Usuarios - SCROLLABLE */}
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                    Usuarios que utilizaron este cupón (
                    {selectedCupon.usuarios?.length || 0})
                  </h4>

                  {selectedCupon.usuarios &&
                  selectedCupon.usuarios.length > 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      {/* Header de la tabla */}
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <div className="col-span-5">Usuario</div>
                        <div className="col-span-4">Información</div>
                        <div className="col-span-3 text-right">
                          Fecha de Uso
                        </div>
                      </div>

                      {/* Lista scrollable de usuarios */}
                      <div className="max-h-96 overflow-y-auto overflow-x-auto">
                        {selectedCupon.usuarios.map((usuario, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors last:border-b-0"
                          >
                            <div className="col-span-5">
                              <p className="font-medium text-gray-800 dark:text-white">
                                {usuario.nombres} {usuario.apellidos}
                              </p>
                            </div>
                            <div className="col-span-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                                {usuario.correo}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Cédula: {usuario.cedula}
                              </p>
                            </div>
                            <div className="col-span-3 text-right">
                              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {new Date(usuario.fechaUso).toLocaleDateString(
                                  "es-ES"
                                )}
                              </span>
                              <br />
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(usuario.fechaUso).toLocaleTimeString(
                                  "es-ES",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaUsers className="text-4xl mx-auto mb-3 opacity-50" />
                      <p className="text-lg">
                        Ningún usuario ha utilizado este cupón
                      </p>
                      <p className="text-sm mt-1">
                        Los usos aparecerán aquí cuando los estudiantes apliquen
                        el cupón
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer fijo */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetalles(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
