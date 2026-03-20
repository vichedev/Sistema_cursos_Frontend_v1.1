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
import Swal from "sweetalert2";
import { useDebounce } from "use-debounce";

// Lazy loading de modales
const ModalVerUsuario = lazy(() => import("./modals/ModalVerUsuario"));
const ModalEditarUsuario = lazy(() => import("./modals/ModalEditarUsuario"));
const ModalEliminarUsuario = lazy(
  () => import("./modals/ModalEliminarUsuario"),
);
const ModalCrearUsuarioAdmin = lazy(
  () => import("./modals/ModalCrearUsuarioAdmin"),
);

// Importar componentes y hooks modularizados
import { useUsuarios } from "./utils/usuarios-inscritos/useUsuarios";
import { exportToExcel } from "./utils/usuarios-inscritos/exportHelpers";
import CursosDesplegable from "./utils/usuarios-inscritos/components/CursosDesplegable";
import UserCard from "./utils/usuarios-inscritos/components/UserCard";
import SmartTable from "./utils/usuarios-inscritos/components/SmartTable";

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

// ─── Función helper: banderas de países ───────────────────────────────────────
const getCountryFlag = (pais) => {
  const flags = {
    EC: "🇪🇨",
    CO: "🇨🇴",
    AR: "🇦🇷",
    PE: "🇵🇪",
    CL: "🇨🇱",
    BO: "🇧🇴",
    PY: "🇵🇾",
    UY: "🇺🇾",
    VE: "🇻🇪",
    MX: "🇲🇽",
    GT: "🇬🇹",
    HN: "🇭🇳",
    SV: "🇸🇻",
    NI: "🇳🇮",
    CR: "🇨🇷",
    PA: "🇵🇦",
    DO: "🇩🇴",
    CU: "🇨🇺",
    BR: "🇧🇷",
    PR: "🇵🇷",
    US: "🇺🇸",
    ES: "🇪🇸",
  };
  return flags[pais] || "🌎";
};

// ─── Definición de columnas para SmartTable ───────────────────────────────────

const ESTUDIANTES_COLUMNS = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="font-medium text-blue-700 dark:text-blue-300">
        {val}
      </span>
    ),
  },
  {
    key: "cedula",
    label: "Cédula",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="text-gray-700 dark:text-gray-300">
        {val && val.trim() !== "" ? val : "No especificada"}
      </span>
    ),
  },
  {
    key: "pais",
    label: "País",
    sortable: true,
    defaultVisible: true,
    render: (val) =>
      val ? (
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span className="text-lg">{getCountryFlag(val)}</span>
          <span>{val}</span>
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    key: "nombres",
    label: "Nombre",
    sortable: true,
    defaultVisible: true,
    render: (_val, row) => (
      <span className="font-semibold text-gray-900 dark:text-white">
        {row.nombres} {row.apellidos}
      </span>
    ),
  },
  {
    key: "correo",
    label: "Correo",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="text-gray-700 dark:text-gray-300">{val}</span>
    ),
  },
  {
    key: "ciudad",
    label: "Ciudad",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="text-gray-600 dark:text-gray-400">{val || "—"}</span>
    ),
  },
  {
    key: "empresa",
    label: "Empresa",
    sortable: true,
    defaultVisible: false,
    render: (val) => (
      <span className="text-gray-600 dark:text-gray-400">{val || "—"}</span>
    ),
  },
  {
    key: "cargo",
    label: "Cargo",
    sortable: true,
    defaultVisible: false,
    render: (val) => (
      <span className="text-gray-600 dark:text-gray-400">{val || "—"}</span>
    ),
  },
  {
    key: "emailVerified",
    label: "Verificado",
    sortable: true,
    defaultVisible: true,
    render: (val) =>
      val ? (
        <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
          ✓ Sí
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold">
          ✗ No
        </span>
      ),
  },
  {
    key: "cursos",
    label: "Cursos",
    sortable: false,
    defaultVisible: true,
    render: (val) => (
      <CursosDesplegable cursos={Array.isArray(val) ? val : []} />
    ),
  },
];

const ADMIN_COLUMNS = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="font-medium text-blue-700 dark:text-blue-300">
        {val}
      </span>
    ),
  },
  {
    key: "nombres",
    label: "Nombre",
    sortable: true,
    defaultVisible: true,
    render: (_val, row) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.nombres} {row.apellidos}
          {row.id === 1 && (
            <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded-full">
              MASTER
            </span>
          )}
        </span>
        {row.asignatura && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            📚 {row.asignatura}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "correo",
    label: "Correo",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="text-gray-700 dark:text-gray-300">{val}</span>
    ),
  },
  {
    key: "usuario",
    label: "Usuario",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="text-gray-600 dark:text-gray-400">{val}</span>
    ),
  },
  {
    key: "pais",
    label: "País",
    sortable: true,
    defaultVisible: true,
    render: (val) =>
      val ? (
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span className="text-lg">{getCountryFlag(val)}</span>
          <span>{val}</span>
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    key: "celular",
    label: "Celular",
    sortable: false,
    defaultVisible: false,
    render: (val) => (
      <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
        {val || "—"}
      </span>
    ),
  },
  {
    key: "asignatura",
    label: "Asignatura",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="text-gray-600 dark:text-gray-400">{val || "—"}</span>
    ),
  },
  {
    key: "rol",
    label: "Rol",
    sortable: true,
    defaultVisible: true,
    render: (val) => (
      <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-0.5 rounded-full text-xs font-semibold">
        {val}
      </span>
    ),
  },
  {
    key: "emailVerified",
    label: "Verificado",
    sortable: true,
    defaultVisible: true,
    render: (val) =>
      val ? (
        <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
          ✓ Sí
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold">
          ✗ No
        </span>
      ),
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function UsuariosInscritos() {
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estados para modales
  const [modalType, setModalType] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

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
        pais: updatedUser.pais,
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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      closeModal();
      fetchUsuarios();

      const isDark = document.documentElement.classList.contains("dark");
      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        html: `
          <div style="text-align:center;">
            <p style="margin:0; font-size:0.95rem; color:${isDark ? "#d1d5db" : "#374151"};">
              Los datos de <strong style="color:${isDark ? "#93c5fd" : "#2563eb"};">
                ${updatedUser.nombres} ${updatedUser.apellidos}
              </strong> fueron actualizados correctamente.
            </p>
          </div>
        `,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        background: isDark ? "#1f2937" : "#ffffff",
        color: isDark ? "#f9fafb" : "#111827",
        iconColor: "#22c55e",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          title: "font-bold text-lg",
        },
      });
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
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${userToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data && response.data.success) {
        closeModal();
        fetchUsuarios();
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          message: response.data?.message || "Error al eliminar usuario",
        };
      }
    } catch (err) {
      if (err.response?.data?.success === false) {
        const errorMessage =
          err.response.data.message || "No se puede eliminar el usuario";
        setModalError(errorMessage);
        return { success: false, message: errorMessage };
      } else {
        const errorMessage =
          err.response?.data?.message || "Error al eliminar usuario";
        setModalError(errorMessage);
        return { success: false, message: errorMessage };
      }
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTimeout(() => {
        fetchUsuarios();
      }, 200);
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear usuario";
      setModalError(backendMsg);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleVerifyAccount = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/admin/verify-user/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.success) {
        fetchUsuarios();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(
          response.data?.message || "Error al verificar la cuenta",
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al verificar la cuenta";
      throw new Error(errorMessage);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalUser(null);
    setModalError(null);
  };

  const handleExportToExcel = () => {
    exportToExcel(
      activeTab === "estudiantes" ? data.estudiantes : data.administradores,
      activeTab,
    );
  };

  // ── Acciones reutilizables para SmartTable ──────────────────────────────────

  const estudiantesActions = useCallback(
    (user) => (
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
    ),
    [handleView, handleEdit, handleDelete],
  );

  const adminActions = useCallback(
    (admin) => (
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
    ),
    [handleView, handleEdit, handleDelete],
  );

  // ── Loading ─────────────────────────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────────────────────────

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

      {/* Cuerpo principal */}
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
            {/* ── Tabs ── */}
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

            {/* ── Barra de búsqueda, filtros y controles ── */}
            <div className="space-y-4 mb-6">
              {/* Primera fila: Búsqueda y botones */}
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

              {/* Segunda fila: Filtros activos y avanzados (solo estudiantes) */}
              {(filterCiudad ||
                filterEmpresa ||
                filterCurso ||
                filterCedula ||
                isFilterOpen) &&
                activeTab === "estudiantes" && (
                  <div className="space-y-3">
                    {/* Filtros activos */}
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

                    {/* Filtros avanzados */}
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
                              {(filterOptions?.ciudades || []).map((ciudad) => (
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
                              {(filterOptions?.empresas || []).map(
                                (empresa) => (
                                  <option key={empresa} value={empresa}>
                                    {empresa}
                                  </option>
                                ),
                              )}
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
                              {(filterOptions?.cursos || []).map((titulo) => (
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

            {/* ── Contenido por tab ── */}
            <div className="w-full">
              {/* ════ TAB ESTUDIANTES ════ */}
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

                  {/* Vista desktop — SmartTable */}
                  <div className="hidden md:block">
                    <SmartTable
                      rows={filteredUsers(data.estudiantes)}
                      columns={ESTUDIANTES_COLUMNS}
                      defaultSort={{ key: "id", dir: "asc" }}
                      pageSize={10}
                      emptyMessage={
                        searchTerm
                          ? "No se encontraron estudiantes con esos criterios"
                          : "No hay estudiantes registrados"
                      }
                      actions={estudiantesActions}
                    />
                  </div>
                </section>
              )}

              {/* ════ TAB ADMINISTRADORES / PROFESORES ════ */}
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

                  {/* Vista desktop — SmartTable */}
                  <div className="hidden md:block">
                    <SmartTable
                      rows={filteredUsers(data.administradores)}
                      columns={ADMIN_COLUMNS}
                      defaultSort={{ key: "id", dir: "asc" }}
                      pageSize={10}
                      emptyMessage={
                        searchTerm
                          ? "No se encontraron profesores con esos criterios"
                          : "No hay profesores registrados"
                      }
                      actions={adminActions}
                    />
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Modales con lazy loading ── */}
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
            onVerifyAccount={handleVerifyAccount}
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
