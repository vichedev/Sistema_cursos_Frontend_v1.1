import { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/admin/SidebarAdmin";
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
  FaLock,
  FaBuilding,
  FaMapMarkerAlt,
  FaBriefcase
} from "react-icons/fa";

// Componente para mostrar cursos con desplegable
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
      <div
        className="flex items-center cursor-pointer group"
        onClick={() => setMostrarCursos(!mostrarCursos)}
      >
        <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700 mr-2">
          {cursos.length} curso{cursos.length !== 1 ? 's' : ''}
        </span>
        <svg
          className={`w-4 h-4 text-blue-500 transition-transform ${mostrarCursos ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {mostrarCursos && (
        <div className="absolute z-20 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl w-72 max-h-64 overflow-y-auto">
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

  // Estados para modales
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
          estudiantes: (res.data.estudiantes || []).map(user => ({
            ...user,
            cursos: user.cursos || []
          })),
          administradores: res.data.administradores || []
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <SidebarAdmin className="fixed top-0 left-0 h-screen w-72 overflow-y-auto" />

      <main className="flex-1 p-6 md:p-8 overflow-hidden md:ml-72">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaUsers className="text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
                <p className="text-blue-100 text-lg">Administra estudiantes y profesores del sistema</p>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/admin/dashboard")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition backdrop-blur-sm"
            >
              <FaArrowLeft />
              Volver al Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {error ? (
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>
              <button
                onClick={fetchUsuarios}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl transition"
              >
                Reintentar
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <div className="text-blue-600 font-semibold">Cargando usuarios...</div>
            </div>
          ) : (
            <>
              {/* Tabs Navigation */}
              <div className="flex border-b border-gray-200 mb-8">
                <button
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === "estudiantes"
                      ? "border-b-4 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => handleTabChange("estudiantes")}
                >
                  <FaGraduationCap />
                  Estudiantes
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                    {data.estudiantes.length}
                  </span>
                </button>

                <button
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === "administradores"
                      ? "border-b-4 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => handleTabChange("administradores")}
                >
                  <FaChalkboardTeacher />
                  Profesores
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                    {data.administradores.length}
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto">
                {activeTab === "estudiantes" && (
                  <section>
                    {data.estudiantes.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-6xl mb-4">👨‍🎓</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay estudiantes inscritos</h3>
                        <p className="text-gray-500">Aún no hay estudiantes registrados en el sistema.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">ID</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Nombre</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Correo</th>
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
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Cursos</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                <FaLock className="inline mr-1" />
                                Contraseña
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Acciones</th>
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
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-500 rounded-full">
                                    •••
                                  </span>
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
                    )}
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
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md mb-6"
                    >
                      <FaPlus />
                      Agregar Profesor
                    </button>

                    {data.administradores.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay profesores registrados</h3>
                        <p className="text-gray-500">Agrega el primer profesor al sistema.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">ID</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Nombre</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Correo</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Usuario</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Rol</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                <FaLock className="inline mr-1" />
                                Contraseña
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Acciones</th>
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
                                      <span className={`${colorClass} text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block`}>
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
                                  <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-500 rounded-full">
                                      •••
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
                    )}
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
        {modalType === "ver" && (
          modalLoading ? (
            <ModalVerUsuario user={null} loading={modalLoading} error={modalError} onClose={closeModal} />
          ) : (
            modalUser && <ModalVerUsuario user={modalUser} onClose={closeModal} />
          )
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
      </main>
    </div>
  );
}