import { useState, useEffect } from "react";
import axios from "axios";
import ModalVerUsuario from "./modals/ModalVerUsuario";
import ModalEditarUsuario from "./modals/ModalEditarUsuario";
import ModalEliminarUsuario from "./modals/ModalEliminarUsuario";
import ModalCrearUsuarioAdmin from "./modals/ModalCrearUsuarioAdmin";
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
import { FiMail } from "react-icons/fi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CursosDesplegable = ({ cursos }) => {
  const [mostrarCursos, setMostrarCursos] = useState(false);

  // ✅ CORRECCIÓN: Asegurar que cursos sea siempre un array
  const cursosArray = Array.isArray(cursos) ? cursos : [];

  if (!cursosArray || cursosArray.length === 0) {
    return (
      <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
        Sin cursos
      </span>
    );
  }

  const colors = [
    "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    "bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
    "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
    "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
    "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  ];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center cursor-pointer group"
        onClick={() => setMostrarCursos((v) => !v)}
      >
        <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 mr-1 sm:mr-2">
          {cursosArray.length} curso{cursosArray.length !== 1 ? "s" : ""}
        </span>
        <svg
          className={`w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400 transition-transform ${
            mostrarCursos ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {mostrarCursos && (
        <div className="absolute z-20 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl left-0 right-0 w-full min-w-[250px] sm:w-72 sm:right-0 sm:left-auto max-h-64 overflow-y-auto transition-colors duration-200">
          <div className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
            Cursos inscritos:
          </div>
          <div className="space-y-2">
            {/* ✅ CORRECCIÓN: Usar cursosArray en lugar de cursos */}
            {cursosArray.map((curso, index) => (
              <div
                key={curso.id || index}
                className={`${
                  colors[index % colors.length]
                } px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200`}
              >
                {curso.titulo}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, type, onView, onEdit, onDelete }) => {
  // ✅ Asegurar que cursos sea un array
  const userCursos = Array.isArray(user.cursos) ? user.cursos : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {user.nombres} {user.apellidos}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1">
            <FiMail className="mr-1" />
            <span className="truncate">{user.correo}</span>
          </div>
          {type === "estudiantes" && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {/* ✅ CÉDULA AHORA SÍ SE MUESTRA - Solo para admin logueado */}
              Cédula: {user.cedula || "No especificada"}
            </div>
          )}
        </div>
        <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-200">
          ID: {user.id}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {user.ciudad && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaMapMarkerAlt className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{user.ciudad}</span>
          </div>
        )}
        {user.empresa && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaBuilding className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{user.empresa}</span>
          </div>
        )}
        {user.cargo && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaBriefcase className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{user.cargo}</span>
          </div>
        )}
        {type === "administradores" && user.asignatura && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <FaChalkboardTeacher className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{user.asignatura}</span>
          </div>
        )}
      </div>

      {/* ✅ CORRECCIÓN: Usar userCursos en lugar de user.cursos directamente */}
      {type === "estudiantes" && userCursos.length > 0 && (
        <div className="mb-3">
          <CursosDesplegable cursos={userCursos} />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(user)}
          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
          title="Ver"
        >
          <FaEye />
        </button>
        <button
          onClick={() => onEdit(user)}
          className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
          title="Editar"
        >
          <FaEdit />
        </button>
        {user.id !== 1 && (
          <button
            onClick={() => onDelete(user)}
            className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
};

export default function UsuariosInscritos() {
  const [data, setData] = useState({ estudiantes: [], administradores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("estudiantes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filterCiudad, setFilterCiudad] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [filterCurso, setFilterCurso] = useState("");
  const [filterCedula, setFilterCedula] = useState("");

  const [modalType, setModalType] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay token de autenticación");
      setLoading(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/users/usuarios-por-rol`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      })
      .then((res) => {
        // ✅ CORRECCIÓN: Convertir objetos a arrays si es necesario
        const convertirAArray = (data) => {
          if (Array.isArray(data)) {
            return data;
          }
          if (data && typeof data === "object") {
            // Si es un objeto, convertirlo a array
            return Object.values(data);
          }
          return [];
        };

        const estudiantes = convertirAArray(res.data.estudiantes);
        const administradores = convertirAArray(res.data.administradores);

        const processedData = {
          estudiantes: estudiantes.map((user) => ({
            ...user,
            cursos: user.cursos || [],
          })),
          administradores: administradores,
        };

        setData(processedData);
      })
      .catch((error) => {
        console.error("❌ Error completo:", error);

        if (error.code === "ECONNABORTED") {
          setError("Timeout - El servidor tardó demasiado en responder");
        } else if (error.response) {
          console.error("📞 Status:", error.response.status);
          console.error("📞 Data:", error.response.data);

          if (error.response.status === 401) {
            setError("No autorizado - Tu sesión ha expirado");
          } else if (error.response.status === 403) {
            setError("Acceso denegado - No tienes permisos para ver usuarios");
          } else if (error.response.status === 404) {
            setError("Endpoint no encontrado");
          } else if (error.response.data?.message) {
            setError(`Error del servidor: ${error.response.data.message}`);
          } else {
            setError(`Error del servidor (${error.response.status})`);
          }
        } else if (error.request) {
          setError("No se pudo conectar con el servidor");
        } else {
          setError("Error de configuración: " + error.message);
        }
      })
      .finally(() => setLoading(false));
  };

  // ✅ FUNCIÓN CORREGIDA: handleUpdateUser implementada
  const handleUpdateUser = async (updatedUser) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");

      // Preparar datos para enviar (sin campos innecesarios)
      const dataToSend = {
        nombres: updatedUser.nombres,
        apellidos: updatedUser.apellidos,
        correo: updatedUser.correo,
        usuario: updatedUser.usuario,
        rol: updatedUser.rol,
        ciudad: updatedUser.ciudad,
        empresa: updatedUser.empresa,
        cargo: updatedUser.cargo,
        asignatura: updatedUser.asignatura,
      };

      // Solo incluir password si no está vacío
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
      fetchUsuarios(); // Recargar la lista
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar usuario";
      setModalError(errorMessage);
      throw err; // Importante para que SweetAlert detecte el error
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: handleDeleteUser implementada
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
      fetchUsuarios(); // Recargar la lista
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al eliminar usuario";
      setModalError(errorMessage);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = (users) => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.ciudad &&
          user.ciudad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.empresa &&
          user.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.cargo &&
          user.cargo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.usuario &&
          user.usuario.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.cedula &&
          user.cedula.toLowerCase().includes(searchTerm.toLowerCase()));

      // Solo aplicar filtros avanzados para estudiantes
      if (activeTab === "estudiantes") {
        const matchesCiudad =
          !filterCiudad || (user.ciudad && user.ciudad === filterCiudad);
        const matchesEmpresa =
          !filterEmpresa || (user.empresa && user.empresa === filterEmpresa);
        const matchesCurso =
          !filterCurso ||
          (user.cursos &&
            user.cursos.some((curso) => curso.titulo === filterCurso));
        const matchesCedula =
          !filterCedula ||
          (user.cedula &&
            user.cedula.toLowerCase().includes(filterCedula.toLowerCase()));

        return (
          matchesSearch &&
          matchesCiudad &&
          matchesEmpresa &&
          matchesCurso &&
          matchesCedula
        );
      }

      // Para administradores, solo aplicar búsqueda general
      return matchesSearch;
    });
  };

  const exportToExcel = (usuarios, tipo) => {
    const dataExcel = usuarios.map((user) => ({
      ID: user.id,
      Cédula: user.cedula || "No especificada",
      Nombres: user.nombres,
      Apellidos: user.apellidos,
      Correo: user.correo,
      Ciudad: user.ciudad || "No especificado",
      Empresa: user.empresa || "No especificado",
      Cargo: user.cargo || "No especificado",
      ...(tipo === "estudiantes"
        ? {
            "Cursos Inscritos": user.cursos
              ? user.cursos.map((c) => c.titulo).join("; ")
              : "Ninguno",
          }
        : {
            Usuario: user.usuario || "No especificado",
            Asignatura: user.asignatura || "No especificado",
            Rol: user.rol || "No especificado",
          }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    const wscols = [
      { wch: 5 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      ...(tipo === "estudiantes"
        ? [{ wch: 40 }]
        : [{ wch: 20 }, { wch: 20 }, { wch: 15 }]),
    ];
    worksheet["!cols"] = wscols;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      blob,
      `${tipo}_usuarios_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const openViewModal = (user) => {
    setModalUser(user);
    setModalType("ver");
  };

  const openEditModal = (user) => {
    setModalUser(user);
    setModalType("editar");
  };

  const openDeleteModal = (user) => {
    setModalUser(user);
    setModalType("eliminar");
  };

  const closeModal = () => {
    setModalType(null);
    setModalUser(null);
    setModalError(null);
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
      closeModal();
      fetchUsuarios(); // Recargar la lista
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al crear usuario";
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
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

      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 transition-colors duration-200">
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

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Barra de búsqueda - mostrar para ambas pestañas */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder={
                    activeTab === "estudiantes"
                      ? "Buscar por nombre, email, cédula, ciudad..."
                      : "Buscar por nombre, email, usuario..."
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {/* Botón Filtros - solo para estudiantes */}
                {activeTab === "estudiantes" && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <FaFilter className="text-gray-600 dark:text-gray-400" />
                    <span className="hidden sm:inline">Filtros</span>
                  </button>
                )}

                {/* Botón Agregar Profesor - solo para administradores */}
                {activeTab === "administradores" && (
                  <button
                    onClick={() => {
                      setModalType("crear");
                      setModalUser(null);
                      setModalError(null);
                    }}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl transition shadow-md"
                  >
                    <FaPlus className="flex-shrink-0" />
                    <span className="hidden sm:inline">Agregar Profesor</span>
                    <span className="sm:hidden">Nuevo</span>
                  </button>
                )}

                {/* Botón Exportar - para ambas pestañas */}
                {filteredUsers(
                  activeTab === "estudiantes"
                    ? data.estudiantes
                    : data.administradores
                ).length > 0 && (
                  <button
                    onClick={() =>
                      exportToExcel(
                        activeTab === "estudiantes"
                          ? data.estudiantes
                          : data.administradores,
                        activeTab
                      )
                    }
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl transition shadow-md"
                  >
                    <FaFileExcel className="flex-shrink-0" />
                    <span className="hidden sm:inline">Exportar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filtros avanzados solo para estudiantes */}
            {isFilterOpen && activeTab === "estudiantes" && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ciudad
                    </label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      value={filterCiudad}
                      onChange={(e) => setFilterCiudad(e.target.value)}
                    >
                      <option value="">Todas las ciudades</option>
                      {Array.from(
                        new Set(
                          data.estudiantes.map((u) => u.ciudad).filter(Boolean)
                        )
                      ).map((ciudad) => (
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
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      value={filterEmpresa}
                      onChange={(e) => setFilterEmpresa(e.target.value)}
                    >
                      <option value="">Todas las empresas</option>
                      {Array.from(
                        new Set(
                          data.estudiantes.map((u) => u.empresa).filter(Boolean)
                        )
                      ).map((empresa) => (
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
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      value={filterCurso}
                      onChange={(e) => setFilterCurso(e.target.value)}
                    >
                      <option value="">Todos los cursos</option>
                      {Array.from(
                        new Set(
                          data.estudiantes.flatMap((u) =>
                            u.cursos.map((c) => c.titulo)
                          )
                        )
                      ).map((titulo) => (
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
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      placeholder="Filtrar por cédula"
                      value={filterCedula}
                      onChange={(e) => setFilterCedula(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contenido */}
            <div className="w-full">
              {activeTab === "estudiantes" && (
                <section>
                  {/* Vista móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {filteredUsers(data.estudiantes).length === 0 ? (
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
                      filteredUsers(data.estudiantes).map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          type="estudiantes"
                          onView={openViewModal}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                        />
                      ))
                    )}
                  </div>

                  {/* Vista desktop (tabla) */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 min-h-[500px]">
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
                        {filteredUsers(data.estudiantes).length === 0 ? (
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
                          filteredUsers(data.estudiantes).map((user) => (
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

                              <td className="px-4 py-4">
                                {/* ✅ CORRECCIÓN: Pasar cursos como array */}
                                <CursosDesplegable
                                  cursos={
                                    Array.isArray(user.cursos)
                                      ? user.cursos
                                      : []
                                  }
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openViewModal(user)}
                                    className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
                                    title="Ver"
                                  >
                                    <FaEye />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(user)}
                                    className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
                                    title="Editar"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(user)}
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
                  </div>
                </section>
              )}

              {activeTab === "administradores" && (
                <section>
                  {/* Vista móvil (tarjetas) */}
                  <div className="block md:hidden">
                    {filteredUsers(data.administradores).length === 0 ? (
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
                      filteredUsers(data.administradores).map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          type="administradores"
                          onView={openViewModal}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                        />
                      ))
                    )}
                  </div>

                  {/* Vista desktop (tabla) */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 min-h-[500px]">
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rol
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers(data.administradores).length === 0 ? (
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
                          filteredUsers(data.administradores).map(
                            (admin, index) => {
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
                                        onClick={() => openViewModal(admin)}
                                        className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
                                        title="Ver"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() => openEditModal(admin)}
                                        className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
                                        title="Editar"
                                      >
                                        <FaEdit />
                                      </button>
                                      {admin.id !== 1 ? (
                                        <button
                                          onClick={() => openDeleteModal(admin)}
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
                            }
                          )
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

      {/* MODALES */}
      {modalType === "crear" && (
        <ModalCrearUsuarioAdmin
          onClose={closeModal}
          onCreate={handleCreateUser}
          loading={modalLoading}
          error={modalError}
        />
      )}

      {modalType === "ver" &&
        (modalLoading ? (
          <ModalVerUsuario
            user={null}
            loading={modalLoading}
            error={modalError}
            onClose={closeModal}
          />
        ) : (
          modalUser && <ModalVerUsuario user={modalUser} onClose={closeModal} />
        ))}

      {/* ✅ MODAL EDITAR CORREGIDO - ahora usa handleUpdateUser */}
      {modalType === "editar" && modalUser && (
        <ModalEditarUsuario
          user={modalUser}
          onClose={closeModal}
          onUpdate={handleUpdateUser} // ✅ Ahora está implementada
          loading={modalLoading}
          error={modalError}
        />
      )}

      {/* ✅ MODAL ELIMINAR CORREGIDO - ahora usa handleDeleteUser */}
      {modalType === "eliminar" && modalUser && (
        <ModalEliminarUsuario
          user={modalUser}
          onClose={closeModal}
          onDelete={handleDeleteUser} // ✅ Ahora está implementada
          loading={modalLoading}
          error={modalError}
        />
      )}
    </div>
  );
}
