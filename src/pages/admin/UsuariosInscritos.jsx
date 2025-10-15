import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import axios from "axios";
import { useDebounce } from "use-debounce";

// Lazy loading de modales
const ModalVerUsuario = lazy(() => import("./modals/ModalVerUsuario"));
const ModalEditarUsuario = lazy(() => import("./modals/ModalEditarUsuario"));
const ModalEliminarUsuario = lazy(() =>
  import("./modals/ModalEliminarUsuario")
);
const ModalCrearUsuarioAdmin = lazy(() =>
  import("./modals/ModalCrearUsuarioAdmin")
);

// Importar componentes y hooks modularizados
import { useUsuarios } from "./utils/usuarios-inscritos/useUsuarios";
import { exportToExcel } from "./utils/usuarios-inscritos/exportHelpers";
import CursosDesplegable from "./utils/usuarios-inscritos/components/CursosDesplegable";
import UserCard from "./utils/usuarios-inscritos/components/UserCard";
import VirtualizedTable from "./utils/usuarios-inscritos/components/VirtualizedTable";

import {
  FaArrowLeft,
  FaUsers,
  FaChalkboardTeacher,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaGraduationCap,
  FaBuilding,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFileExcel,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

export default function UsuariosInscritos() {
  // Usar el hook personalizado para la gestión de usuarios
  const {
    data,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterCiudad,
    setFilterCiudad,
    filterEmpresa,
    setFilterEmpresa,
    filterCurso,
    setFilterCurso,
    filterCedula,
    setFilterCedula,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    fetchUsuarios,
    filterOptions,
    paginatedUsers,
    totalItems,
    filteredUsers,
  } = useUsuarios();

  // Estados locales específicos del componente
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estados para modales
  const [modalType, setModalType] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Funciones para manejar modales
  const handleView = useCallback((user) => {
    setModalUser(user);
    setModalType("ver");
  }, []);

  const handleEdit = useCallback((user) => {
    setModalUser(user);
    setModalType("editar");
  }, []);

  const handleDelete = useCallback((user) => {
    setModalUser(user);
    setModalType("eliminar");
  }, []);

  // Reset paginación cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterCiudad,
    filterEmpresa,
    filterCurso,
    filterCedula,
    activeTab,
  ]);

  const handleUpdateUser = async (updatedUser) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        nombres: updatedUser.nombres,
        apellidos: updatedUser.apellidos,
        correo: updatedUser.correo,
        usuario: updatedUser.usuario,
        ciudad: updatedUser.ciudad,
        empresa: updatedUser.empresa,
        cargo: updatedUser.cargo,
        asignatura: updatedUser.asignatura,
      };

      if (updatedUser.password && updatedUser.password.trim() !== "") {
        dataToSend.password = updatedUser.password;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${updatedUser.id}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      closeModal();
      fetchUsuarios();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar usuario";
      setModalError(errorMessage);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${userToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      closeModal();
      fetchUsuarios();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar usuario";
      setModalError(errorMessage);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateUser = async (newUser) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // No cierres aquí: el hijo cierra el modal al éxito.
      // Refresca la lista
      setTimeout(() => {
        fetchUsuarios();
      }, 200);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear usuario";
      // Pasa el error al hijo para que lo convierta en fieldErrors (correo/usuario/cedula/celular)
      setModalError(backendMsg);
      // Importante: relanza para que el hijo entre al catch sin SweetAlert
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalUser(null);
    setModalError(null);
  };

  // Función para exportar a Excel
  const handleExportToExcel = () => {
    exportToExcel(
      activeTab === "estudiantes" ? data.estudiantes : data.administradores,
      activeTab
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-4 border-blue-500"></div>
          <div className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300">
            Cargando usuarios...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-xl mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm flex-shrink-0">
              <FaUsers className="text-lg sm:text-xl md:text-2xl lg:text-3xl" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
                Gestión de Usuarios
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm md:text-base">
                Administra estudiantes y profesores del sistema
              </p>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/admin/dashboard")}
            className="self-start lg:self-auto flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl transition backdrop-blur-sm text-xs sm:text-sm md:text-base font-medium"
          >
            <FaArrowLeft className="text-xs sm:text-sm md:text-base flex-shrink-0" />
            <span className="whitespace-nowrap">Volver al Dashboard</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 transition-colors duration-200 min-h-[800px] sm:min-h-[900px] md:min-h-[700px]">
        {error ? (
          <div className="text-center p-4 sm:p-6 md:p-8 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 transition-colors duration-200">
            <div className="text-red-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 sm:mb-3 md:mb-4">
              ⚠️
            </div>
            <div className="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-base md:text-lg mb-2 sm:mb-3">
              {error}
            </div>
            <button
              onClick={fetchUsuarios}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 sm:px-5 md:px-6 rounded-lg md:rounded-xl transition text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 md:mb-8 overflow-x-auto scrollbar-thin -mx-1 px-1">
              <button
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 font-semibold transition whitespace-nowrap text-xs sm:text-sm md:text-base ${
                  activeTab === "estudiantes"
                    ? "border-b-4 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                onClick={() => setActiveTab("estudiantes")}
              >
                <FaGraduationCap className="text-xs sm:text-sm md:text-base flex-shrink-0" />
                <span>Estudiantes</span>
                <span className="ml-0.5 sm:ml-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full text-xs">
                  {data.estudiantes.length}
                </span>
              </button>

              <button
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 font-semibold transition whitespace-nowrap text-xs sm:text-sm md:text-base ${
                  activeTab === "administradores"
                    ? "border-b-4 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                onClick={() => setActiveTab("administradores")}
              >
                <FaChalkboardTeacher className="text-xs sm:text-sm md:text-base flex-shrink-0" />
                <span>Profesores</span>
                <span className="ml-0.5 sm:ml-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full text-xs">
                  {data.administradores.length}
                </span>
              </button>
            </div>

            {/* Barra de búsqueda, filtros y controles */}
            <div className="space-y-4 mb-6">
              {/* Primera fila: Búsqueda y botones principales */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 min-w-0 sm:max-w-md lg:max-w-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400 dark:text-gray-500 text-sm" />
                  </div>
                  <input
                    type="text"
                    placeholder={
                      activeTab === "estudiantes"
                        ? "Buscar por nombre, email, cédula..."
                        : "Buscar por nombre, email, usuario..."
                    }
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm transition-colors duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end sm:justify-start">
                  {activeTab === "estudiantes" && (
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 text-xs sm:text-sm"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      <FaFilter className="text-gray-600 dark:text-gray-400 text-xs" />
                      <span className="whitespace-nowrap">Filtros</span>
                    </button>
                  )}

                  {activeTab === "administradores" && (
                    <button
                      onClick={() => {
                        setModalType("crear");
                        setModalUser(null);
                        setModalError(null);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded-xl transition shadow-md text-xs sm:text-sm"
                    >
                      <FaPlus className="flex-shrink-0 text-xs" />
                      <span className="whitespace-nowrap">Agregar</span>
                    </button>
                  )}

                  {paginatedUsers.length > 0 && (
                    <button
                      onClick={handleExportToExcel}
                      className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-xl transition shadow-md text-xs sm:text-sm"
                    >
                      <FaFileExcel className="flex-shrink-0 text-xs" />
                      <span className="whitespace-nowrap">Exportar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Segunda fila: Filtros activos y filtros avanzados */}
              {(filterCiudad ||
                filterEmpresa ||
                filterCurso ||
                filterCedula ||
                isFilterOpen) &&
                activeTab === "estudiantes" && (
                  <div className="space-y-3">
                    {/* Filtros activos - siempre visibles cuando hay filtros aplicados */}
                    {(filterCiudad ||
                      filterEmpresa ||
                      filterCurso ||
                      filterCedula) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Filtros aplicados:
                          </span>

                          {filterCiudad && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                              <FaMapMarkerAlt className="text-xs" />
                              Ciudad: {filterCiudad}
                              <button
                                onClick={() => setFilterCiudad("")}
                                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                ×
                              </button>
                            </span>
                          )}

                          {filterEmpresa && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                              <FaBuilding className="text-xs" />
                              Empresa: {filterEmpresa}
                              <button
                                onClick={() => setFilterEmpresa("")}
                                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                ×
                              </button>
                            </span>
                          )}

                          {filterCurso && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                              <FaGraduationCap className="text-xs" />
                              Curso: {filterCurso}
                              <button
                                onClick={() => setFilterCurso("")}
                                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                ×
                              </button>
                            </span>
                          )}

                          {filterCedula && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                              📋 Cédula: {filterCedula}
                              <button
                                onClick={() => setFilterCedula("")}
                                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                ×
                              </button>
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setFilterCiudad("");
                              setFilterEmpresa("");
                              setFilterCurso("");
                              setFilterCedula("");
                            }}
                            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                          >
                            Limpiar todos
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filtros avanzados - panel expandible */}
                    {isFilterOpen && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Filtros avanzados
                          </h3>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setFilterCiudad("");
                              setFilterEmpresa("");
                              setFilterCurso("");
                              setFilterCedula("");
                            }}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Ciudad
                            </label>
                            <select
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                              value={filterCiudad}
                              onChange={(e) => setFilterCiudad(e.target.value)}
                            >
                              <option value="">Todas las ciudades</option>
                              {filterOptions?.ciudades.map((ciudad) => (
                                <option key={ciudad} value={ciudad}>
                                  {ciudad}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Empresa
                            </label>
                            <select
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                              value={filterEmpresa}
                              onChange={(e) => setFilterEmpresa(e.target.value)}
                            >
                              <option value="">Todas las empresas</option>
                              {filterOptions?.empresas.map((empresa) => (
                                <option key={empresa} value={empresa}>
                                  {empresa}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Cursos
                            </label>
                            <select
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                              value={filterCurso}
                              onChange={(e) => setFilterCurso(e.target.value)}
                            >
                              <option value="">Todos los cursos</option>
                              {filterOptions?.cursos.map((titulo) => (
                                <option key={titulo} value={titulo}>
                                  {titulo}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Cédula
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 text-sm"
                              placeholder="Filtrar por cédula"
                              value={filterCedula}
                              onChange={(e) => setFilterCedula(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Controles de paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>

                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} de{" "}
                  {totalItems}
                </span>
              </div>

              <div className="flex gap-1 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1 sm:flex-none text-center"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage * itemsPerPage >= totalItems}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1 sm:flex-none text-center"
                >
                  Siguiente
                </button>
              </div>
            </div>

            {/* Contenido con virtualización */}
            <div className="w-full">
              {activeTab === "estudiantes" && (
                <section>
                  {/* Vista móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {paginatedUsers.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-200">
                        <div className="text-6xl mb-4">👨‍🎓</div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {searchTerm
                            ? "No se encontraron estudiantes"
                            : "No hay estudiantes inscritos"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm
                            ? "Intenta con otros términos de búsqueda"
                            : "Aún no hay estudiantes registrados en el sistema."}
                        </p>
                      </div>
                    ) : (
                      paginatedUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          type="estudiantes"
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>

                  {/* Vista desktop con virtualización para muchos datos */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                    {totalItems > 50 ? (
                      <VirtualizedTable
                        users={paginatedUsers}
                        rowHeight={80}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ) : (
                      /* Tabla normal para pocos datos */
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Cédula
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Correo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Ciudad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Empresa
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Cargo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Cursos
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {paginatedUsers.length === 0 ? (
                            <tr>
                              <td
                                colSpan="9"
                                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                {searchTerm
                                  ? "No se encontraron estudiantes con esos criterios"
                                  : "No hay estudiantes registrados"}
                              </td>
                            </tr>
                          ) : (
                            paginatedUsers.map((user) => (
                              <tr
                                key={user.id}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {user.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                  {user.cedula && user.cedula.trim() !== ""
                                    ? user.cedula
                                    : "No especificada"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                  {user.nombres} {user.apellidos}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                  {user.correo}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                  {user.ciudad || "-"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                  {user.empresa || "-"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                  {user.cargo || "-"}
                                </td>

                                {/* Celda de cursos */}
                                <td className="px-4 py-4">
                                  <CursosDesplegable
                                    cursos={
                                      Array.isArray(user.cursos)
                                        ? user.cursos
                                        : []
                                    }
                                  />
                                </td>

                                {/* Celda de acciones */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleView(user)}
                                      className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
                                      title="Ver"
                                    >
                                      <FaEye />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(user)}
                                      className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
                                      title="Editar"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(user)}
                                      className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
                                      title="Eliminar"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "administradores" && (
                <section>
                  {/* Vista móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {paginatedUsers.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors duration-200">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {searchTerm
                            ? "No se encontraron profesores"
                            : "No hay profesores registrados"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm
                            ? "Intenta con otros términos de búsqueda"
                            : "Agrega el primer profesor al sistema."}
                        </p>
                      </div>
                    ) : (
                      paginatedUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          type="administradores"
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>

                  {/* Vista desktop */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Correo
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Usuario
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Asignatura
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                            >
                              {searchTerm
                                ? "No se encontraron profesores con esos criterios"
                                : "No hay profesores registrados"}
                            </td>
                          </tr>
                        ) : (
                          paginatedUsers.map((admin, index) => {
                            const colors = [
                              "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
                              "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
                              "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
                              "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
                              "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                              <tr
                                key={admin.id}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {admin.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                  <div className="flex flex-col">
                                    <span>
                                      {admin.nombres} {admin.apellidos}
                                      {admin.id === 1 && (
                                        <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2 py-1 rounded-full">
                                          MASTER
                                        </span>
                                      )}
                                    </span>
                                    {admin.asignatura && (
                                      <span
                                        className={`${colorClass} text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block transition-colors duration-200`}
                                      >
                                        📚 {admin.asignatura}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                  {admin.correo}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                  {admin.usuario}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                  {admin.asignatura || "-"}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200">
                                    {admin.rol}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleView(admin)}
                                      className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
                                      title="Ver"
                                    >
                                      <FaEye />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(admin)}
                                      className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
                                      title="Editar"
                                    >
                                      <FaEdit />
                                    </button>
                                    {admin.id !== 1 ? (
                                      <button
                                        onClick={() => handleDelete(admin)}
                                        className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
                                        title="Eliminar"
                                      >
                                        <FaTrash />
                                      </button>
                                    ) : (
                                      <span
                                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                                        title="El administrador principal no puede ser eliminado"
                                      >
                                        <FaTrash />
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modales con lazy loading */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          </div>
        }
      >
        {modalType === "ver" && modalUser && (
          <ModalVerUsuario
            user={modalUser}
            onClose={closeModal}
            loading={modalLoading}
            error={modalError}
          />
        )}

        {modalType === "editar" && modalUser && (
          <ModalEditarUsuario
            user={modalUser}
            onClose={closeModal}
            onUpdate={handleUpdateUser}
            loading={modalLoading}
            error={modalError}
          />
        )}

        {modalType === "eliminar" && modalUser && (
          <ModalEliminarUsuario
            user={modalUser}
            onClose={closeModal}
            onDelete={handleDeleteUser}
            loading={modalLoading}
            error={modalError}
          />
        )}

        {modalType === "crear" && (
          <ModalCrearUsuarioAdmin
            onClose={closeModal}
            onCreate={handleCreateUser}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Suspense>
    </div>
  );
}
