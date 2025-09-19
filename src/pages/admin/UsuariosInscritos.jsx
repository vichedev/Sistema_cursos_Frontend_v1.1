// src/pages/admin/UsuariosInscritos.jsx
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
} from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import AdminLayout from "../../layouts/AdminLayout";

// Subcomponente: cursos del alumno (dropdown)
const CursosDesplegable = ({ cursos }) => {
  const [mostrarCursos, setMostrarCursos] = useState(false);

  if (!cursos || cursos.length === 0) {
    return <span className="text-gray-400">Sin cursos</span>;
  }

  const colors = [
    "bg-red-100 text-red-800 border border-red-200",
    "bg-green-100 text-green-800 border border-green-200",
    "bg-blue-100 text-blue-800 border border-blue-200",
    "bg-yellow-100 text-yellow-800 border border-yellow-200",
    "bg-purple-100 text-purple-800 border border-purple-200",
    "bg-pink-100 text-pink-800 border border-pink-200",
    "bg-indigo-100 text-indigo-800 border border-indigo-200",
    "bg-teal-100 text-teal-800 border border-teal-200",
    "bg-orange-100 text-orange-800 border border-orange-200",
  ];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center cursor-pointer group"
        onClick={() => setMostrarCursos((v) => !v)}
      >
        <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700 mr-2">
          {cursos.length} curso{cursos.length !== 1 ? "s" : ""}
        </span>
        <svg
          className={`w-4 h-4 text-blue-500 transition-transform ${mostrarCursos ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {mostrarCursos && (
        <div
          className="
            absolute z-20 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl
            left-0 right-0 max-w-[92vw] md:max-w-none md:w-72 md:right-0 md:left-auto
            max-h-64 overflow-y-auto
          "
        >
          <div className="font-semibold text-sm text-gray-700 mb-2">Cursos inscritos:</div>
          <div className="space-y-2">
            {cursos.map((curso, index) => (
              <div
                key={curso.id || index}
                className={`${colors[index % colors.length]} px-3 py-2 rounded-lg text-sm font-medium`}
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

export default function UsuariosInscritos() {
  const [data, setData] = useState({ estudiantes: [], administradores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("estudiantes");

  // Modales
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
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/users/usuarios-por-rol`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const processedData = {
          estudiantes: (res.data.estudiantes || []).map((user) => ({
            ...user,
            cursos: user.cursos || [],
          })),
          administradores: res.data.administradores || [],
        };
        setData(processedData);
      })
      .catch(() => setError("Error al cargar los usuarios"))
      .finally(() => setLoading(false));
  };

  const handleCreateUser = async (newUser) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchUsuarios();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al crear usuario";
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  const openViewModal = async (user) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalUser(res.data);
      setModalType("ver");
    } catch (err) {
      setModalError("Error al cargar detalles del usuario");
      setModalType("ver");
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = async (user) => {
    setModalLoading(true);
       setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalUser(res.data);
      setModalType("editar");
    } catch (err) {
      setModalError("Error al cargar el usuario para editar");
      setModalType("editar");
    } finally {
      setModalLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setModalUser(user);
    setModalType("eliminar");
    setModalError(null);
  };

  const closeModal = () => {
    setModalUser(null);
    setModalType(null);
    setModalError(null);
    setModalLoading(false);
  };

  const handleUpdateUser = async (updatedUser) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const userToUpdate = { ...updatedUser };
      // no enviar password vacío
      if (!userToUpdate.password || userToUpdate.password.trim() === "") {
        delete userToUpdate.password;
      }

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/${updatedUser.id}`, userToUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchUsuarios();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al actualizar usuario";
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!modalUser) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/users/${modalUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchUsuarios();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al eliminar usuario";
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            <div className="text-xl font-semibold text-gray-700">Cargando usuarios...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 md:p-8 text-white shadow-xl mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <FaUsers className="text-2xl md:text-4xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Gestión de Usuarios</h1>
              <p className="text-blue-100 text-sm md:text-lg">Administra estudiantes y profesores del sistema</p>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/admin/dashboard")}
            className="self-start md:self-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition backdrop-blur-sm"
          >
            <FaArrowLeft />
            Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 mb-6 md:mb-8">
        {error ? (
          <div className="text-center p-6 md:p-8 bg-red-50 rounded-xl border border-red-200">
            <div className="text-red-500 text-3xl md:text-4xl mb-3 md:mb-4">⚠️</div>
            <div className="text-red-600 font-semibold text-base md:text-lg mb-3">{error}</div>
            <button
              onClick={fetchUsuarios}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 md:px-6 rounded-xl transition"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5 md:mb-8 overflow-x-auto scrollbar-thin -mx-4 px-4">
              <button
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === "estudiantes"
                    ? "border-b-4 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("estudiantes")}
              >
                <FaGraduationCap />
                Estudiantes
                <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs md:text-sm">
                  {data.estudiantes.length}
                </span>
              </button>

              <button
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === "administradores"
                    ? "border-b-4 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("administradores")}
              >
                <FaChalkboardTeacher />
                Profesores
                <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs md:text-sm">
                  {data.administradores.length}
                </span>
              </button>
            </div>

            {/* Contenido */}
            <div className="w-full">
              {activeTab === "estudiantes" && (
                <section>
                  {/* Cards móviles */}
                  <div className="md:hidden space-y-3">
                    {data.estudiantes.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <div className="text-5xl mb-3">👨‍🎓</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                          No hay estudiantes inscritos
                        </h3>
                        <p className="text-gray-500">Aún no hay estudiantes registrados.</p>
                      </div>
                    ) : (
                      data.estudiantes.map((u) => (
                        <div
                          key={u.id}
                          className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex-shrink-0">
                                {u.id}
                              </span>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {u.nombres} {u.apellidos}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <FiMail />
                                  <span className="truncate max-w-[60vw]">{u.correo}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => openViewModal(u)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                                title="Ver"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => openDeleteModal(u)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg"
                                title="Eliminar"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="px-2 py-1 bg-gray-50 rounded-lg">
                              <span className="text-gray-500">Ciudad:</span>{" "}
                              <span className="font-medium">{u.ciudad || "-"}</span>
                            </div>
                            <div className="px-2 py-1 bg-gray-50 rounded-lg">
                              <span className="text-gray-500">Empresa:</span>{" "}
                              <span className="font-medium">{u.empresa || "-"}</span>
                            </div>
                            <div className="px-2 py-1 bg-gray-50 rounded-lg col-span-2">
                              <span className="text-gray-500">Cargo:</span>{" "}
                              <span className="font-medium">{u.cargo || "-"}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <CursosDesplegable cursos={u.cursos} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tabla desktop con contenedor scrolleable */}
                  <div className="hidden md:block">
                    {data.estudiantes.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-6xl mb-4">👨‍🎓</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No hay estudiantes inscritos
                        </h3>
                        <p className="text-gray-500">Aún no hay estudiantes registrados en el sistema.</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
                          <table className="w-full min-w-[980px]">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Nombre
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Correo
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  <FaMapMarkerAlt className="inline mr-1" />
                                  Ciudad
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  <FaBuilding className="inline mr-1" />
                                  Empresa
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  <FaBriefcase className="inline mr-1" />
                                  Cargo
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Cursos
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {data.estudiantes.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                      {user.id}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-900">
                                    {user.nombres} {user.apellidos}
                                  </td>
                                  <td className="px-6 py-4 text-gray-700">{user.correo}</td>
                                  <td className="px-6 py-4 text-gray-600">{user.ciudad || "-"}</td>
                                  <td className="px-6 py-4 text-gray-600">{user.empresa || "-"}</td>
                                  <td className="px-6 py-4 text-gray-600">{user.cargo || "-"}</td>
                                  <td className="px-6 py-4">
                                    <CursosDesplegable cursos={user.cursos} />
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openViewModal(user)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                        title="Ver"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() => openEditModal(user)}
                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                        title="Editar"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => openDeleteModal(user)}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                        title="Eliminar"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "administradores" && (
                <section>
                  <button
                    onClick={() => {
                      setModalType("crear");
                      setModalUser(null);
                      setModalError(null);
                    }}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-xl transition shadow-md mb-4 md:mb-6"
                  >
                    <FaPlus />
                    Agregar Profesor
                  </button>

                  {/* Cards móviles de profesores */}
                  <div className="md:hidden space-y-3">
                    {data.administradores.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <div className="text-5xl mb-3">👨‍🏫</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                          No hay profesores registrados
                        </h3>
                        <p className="text-gray-500">Agrega el primer profesor al sistema.</p>
                      </div>
                    ) : (
                      data.administradores.map((admin, index) => (
                        <div
                          key={admin.id}
                          className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                                {admin.id}
                              </span>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {admin.nombres} {admin.apellidos}
                                </div>
                                <div className="text-sm text-gray-600">{admin.correo}</div>
                                {admin.asignatura && (
                                  <div className="mt-1 text-xs bg-blue-50 text-blue-700 inline-block px-2 py-1 rounded-full">
                                    📚 {admin.asignatura}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openViewModal(admin)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                                title="Ver"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => openEditModal(admin)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              {admin.id !== 1 ? (
                                <button
                                  onClick={() => openDeleteModal(admin)}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg"
                                  title="Eliminar"
                                >
                                  <FaTrash />
                                </button>
                              ) : (
                                <span
                                  className="p-2 bg-gray-100 text-gray-400 rounded-lg"
                                  title="El administrador principal no puede ser eliminado"
                                >
                                  <FaTrash />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tabla desktop profesores */}
                  <div className="hidden md:block">
                    {data.administradores.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No hay profesores registrados
                        </h3>
                        <p className="text-gray-500">Agrega el primer profesor al sistema.</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
                          <table className="w-full min-w-[880px]">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Nombre
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Correo
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Usuario
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Rol
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {data.administradores.map((admin, index) => {
                                const colors = [
                                  "bg-red-100 text-red-800 border border-red-200",
                                  "bg-green-100 text-green-800 border border-green-200",
                                  "bg-blue-100 text-blue-800 border border-blue-200",
                                  "bg-yellow-100 text-yellow-800 border border-yellow-200",
                                  "bg-purple-100 text-purple-800 border border-purple-200",
                                ];
                                const colorClass = colors[index % colors.length];

                                return (
                                  <tr key={admin.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4">
                                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                        {admin.id}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="font-semibold text-gray-900">
                                        {admin.nombres} {admin.apellidos}
                                        {admin.id === 1 && (
                                          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                            MASTER
                                          </span>
                                        )}
                                      </div>
                                      {admin.asignatura && (
                                        <span
                                          className={`${colorClass} text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block`}
                                        >
                                          📚 {admin.asignatura}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{admin.correo}</td>
                                    <td className="px-6 py-4 text-gray-600">{admin.usuario}</td>
                                    <td className="px-6 py-4">
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                                        {admin.rol}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => openViewModal(admin)}
                                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                          title="Ver"
                                        >
                                          <FaEye />
                                        </button>
                                        <button
                                          onClick={() => openEditModal(admin)}
                                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                          title="Editar"
                                        >
                                          <FaEdit />
                                        </button>
                                        {admin.id !== 1 ? (
                                          <button
                                            onClick={() => openDeleteModal(admin)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                            title="Eliminar"
                                          >
                                            <FaTrash />
                                          </button>
                                        ) : (
                                          <span
                                            className="p-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                                            title="El administrador principal no puede ser eliminado"
                                          >
                                            <FaTrash />
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
          <ModalVerUsuario user={null} loading={modalLoading} error={modalError} onClose={closeModal} />
        ) : (
          modalUser && <ModalVerUsuario user={modalUser} onClose={closeModal} />
        ))}
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
    </AdminLayout>
  );
}
