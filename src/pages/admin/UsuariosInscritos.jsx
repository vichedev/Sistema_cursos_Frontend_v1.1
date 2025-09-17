import { useState, useEffect } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/admin/SidebarAdmin";

import ModalVerUsuario from "./modals/ModalVerUsuario";
import ModalEditarUsuario from "./modals/ModalEditarUsuario";
import ModalEliminarUsuario from "./modals/ModalEliminarUsuario";
import ModalCrearUsuarioAdmin from "./modals/ModalCrearUsuarioAdmin";

// Componente para mostrar cursos con desplegable
const CursosDesplegable = ({ cursos }) => {
  const [mostrarCursos, setMostrarCursos] = useState(false);

  // CORRECCIÓN: Verificar si cursos es undefined o null antes de acceder a length
  if (!cursos || cursos.length === 0) {
    return <span className="text-gray-400">Sin cursos</span>;
  }

  const colors = [
    "bg-red-200 text-red-800",
    "bg-green-200 text-green-800",
    "bg-blue-200 text-blue-800",
    "bg-yellow-200 text-yellow-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
    "bg-indigo-200 text-indigo-800",
    "bg-teal-200 text-teal-800",
    "bg-orange-200 text-orange-800",
  ];

  return (
    <div className="relative">
      {/* Resumen de cursos (siempre visible) */}
      <div
        className="flex items-center cursor-pointer group"
        onClick={() => setMostrarCursos(!mostrarCursos)}
      >
        <span className="text-sm text-gray-600 group-hover:text-orange-600 mr-1">
          {cursos.length} curso{cursos.length !== 1 ? 's' : ''}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${mostrarCursos ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Lista desplegable de cursos */}
      {mostrarCursos && (
        <div className="absolute z-10 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-60 overflow-y-auto">
          <div className="font-medium text-xs text-gray-500 mb-1">Cursos inscritos:</div>
          <div className="flex flex-wrap gap-1">
            {cursos.map((curso, index) => (
              <span
                key={curso.id || index}
                className={`inline-block ${colors[index % colors.length]} text-xs font-semibold px-2 py-0.5 rounded mb-1`}
                title={curso.titulo}
              >
                {curso.titulo}
              </span>
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
        // CORRECCIÓN: Asegurar que cada usuario tenga un array de cursos
        const processedData = {
          estudiantes: (res.data.estudiantes || []).map(user => ({
            ...user,
            cursos: user.cursos || [] // Asegurar que cursos sea un array
          })),
          administradores: res.data.administradores || []
        };
        setData(processedData);
      })
      .catch(() => setError("Error al cargar los usuarios"))
      .finally(() => setLoading(false));
  };

  // crear usuario admin
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

  // Abrir modal Ver Usuario y cargar datos completos
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

  // Abrir modal Editar Usuario y cargar datos completos
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

  // Abrir modal Eliminar Usuario (usa datos ya cargados)
  const openDeleteModal = (user) => {
    setModalUser(user);
    setModalType("eliminar");
    setModalError(null);
  };

  // Cerrar modal y limpiar estados
  const closeModal = () => {
    setModalUser(null);
    setModalType(null);
    setModalError(null);
    setModalLoading(false);
  };

  // Actualizar usuario (desde modal editar)
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

  // Eliminar usuario (desde modal eliminar)
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
    <div className="flex min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300">
      <SidebarAdmin className="fixed top-0 left-0 h-screen w-72 overflow-y-auto" />

      <main className="flex-1 p-6 md:p-10 overflow-hidden md:ml-72">
        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-6 md:p-10 border border-orange-100 w-full flex flex-col h-full">
          <div className="flex-shrink-0">
            <button
              onClick={() => (window.location.href = "/admin/dashboard")}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
            >
              ← Volver al Dashboard
            </button>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Usuarios Inscritos</h1>

            {error ? (
              <div className="text-center text-red-500 font-semibold">{error}</div>
            ) : loading ? (
              <div className="text-center text-orange-500 font-semibold">Cargando usuarios...</div>
            ) : (
              <>
                <div className="flex border-b border-orange-200 mb-6">
                  <button
                    className={`flex-1 py-2 text-center font-semibold ${activeTab === "estudiantes"
                      ? "border-b-4 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-orange-600"
                      }`}
                    onClick={() => handleTabChange("estudiantes")}
                    aria-selected={activeTab === "estudiantes"}
                  >
                    Estudiantes ({data.estudiantes.length})
                  </button>
                  <button
                    className={`flex-1 py-2 text-center font-semibold ${activeTab === "administradores"
                      ? "border-b-4 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-orange-600"
                      }`}
                    onClick={() => handleTabChange("administradores")}
                    aria-selected={activeTab === "administradores"}
                  >
                    Profesores ({data.administradores.length})
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex-grow overflow-y-auto">
            {activeTab === "estudiantes" && !loading && !error && (
              <section>
                {data.estudiantes.length === 0 ? (
                  <p className="text-gray-500">No hay estudiantes inscritos.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-orange-50 text-orange-600 font-semibold sticky top-0">
                          <th className="p-3 border border-orange-100">ID</th>
                          <th className="p-3 border border-orange-100">Nombre</th>
                          <th className="p-3 border border-orange-100">Correo</th>
                          <th className="p-3 border border-orange-100">Ciudad</th>
                          <th className="p-3 border border-orange-100">Empresa</th>
                          <th className="p-3 border border-orange-100">Cargo</th>
                          <th className="p-3 border border-orange-100">Cursos inscritos</th>
                          <th className="p-3 border border-orange-100">Cantidad de cursos</th>
                          <th className="p-3 border border-orange-100 text-center">Contraseña</th>
                          <th className="p-3 border border-orange-100 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.estudiantes.map((user) => (
                          <tr key={user.id} className="hover:bg-orange-50">
                            <td className="p-3 border border-orange-100">{user.id}</td>
                            <td className="p-3 border border-orange-100">
                              {user.nombres} {user.apellidos}
                            </td>
                            <td className="p-3 border border-orange-100">{user.correo}</td>
                            <td className="p-3 border border-orange-100">{user.ciudad || "-"}</td>
                            <td className="p-3 border border-orange-100">{user.empresa || "-"}</td>
                            <td className="p-3 border border-orange-100">{user.cargo || "-"}</td>
                            <td className="p-3 border border-orange-100">
                              <CursosDesplegable cursos={user.cursos} />
                            </td>
                            <td className="p-3 border border-orange-100">{user.cursos?.length || 0}</td>
                            <td className="p-3 border border-orange-100 text-center">{'•'.repeat(10)}</td>
                            <td className="p-3 border border-orange-100 text-center space-x-2">
                              <button
                                onClick={() => openViewModal(user)}
                                className="text-blue-600 hover:underline"
                                title="Ver"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="text-green-600 hover:underline"
                                title="Editar"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="text-red-600 hover:underline"
                                title="Eliminar"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === "administradores" && !loading && !error && (
              <section>
                <button
                  onClick={() => {
                    setModalType("crear");
                    setModalUser(null);
                    setModalError(null);
                  }}
                  className="mb-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                >
                  + Agregar Administrador (Profesor)
                </button>

                {data.administradores.length === 0 ? (
                  <p className="text-gray-500">No hay administradores registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[700px] w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-orange-50 text-orange-600 font-semibold sticky top-0">
                          <th className="p-3 border border-orange-100">ID</th>
                          <th className="p-3 border border-orange-100">Nombre</th>
                          <th className="p-3 border border-orange-100">Correo</th>
                          <th className="p-3 border border-orange-100">Usuario</th>
                          <th className="p-3 border border-orange-100">Rol</th>
                          <th className="p-3 border border-orange-100 text-center">Contraseña</th>
                          <th className="p-3 border border-orange-100 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.administradores.map((admin, index) => {
                          const colors = [
                            "bg-red-200 text-red-800",
                            "bg-green-200 text-green-800",
                            "bg-blue-200 text-blue-800",
                            "bg-yellow-200 text-yellow-800",
                            "bg-purple-200 text-purple-800",
                            "bg-pink-200 text-pink-800",
                            "bg-indigo-200 text-indigo-800",
                            "bg-teal-200 text-teal-800",
                            "bg-orange-200 text-orange-800",
                          ];
                          const colorClass = colors[index % colors.length];
                          return (
                            <tr key={admin.id} className="hover:bg-orange-50">
                              <td className="p-3 border border-orange-100">{admin.id}</td>
                              <td className="p-3 border border-orange-100">
                                {admin.nombres} {admin.apellidos}
                                {admin.id === 1 && (
                                  <span
                                    className="bg-yellow-200 text-yellow-800 ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                                    title="Administrador Principal - No puede ser eliminado"
                                  >
                                    MASTER
                                  </span>
                                )}
                                {admin.asignatura && (
                                  <span
                                    className={`${colorClass} ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full`}
                                    title={`Docente de: ${admin.asignatura}`}
                                  >
                                    Docente: {admin.asignatura}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 border border-orange-100">{admin.correo}</td>
                              <td className="p-3 border border-orange-100">{admin.usuario}</td>
                              <td className="p-3 border border-orange-100">{admin.rol}</td>
                              <td className="p-3 border border-orange-100 text-center">{'•'.repeat(10)}</td>
                              <td className="p-3 border border-orange-100 text-center space-x-2">
                                <button
                                  onClick={() => openViewModal(admin)}
                                  className="text-blue-600 hover:underline"
                                  title="Ver"
                                >
                                  Ver
                                </button>
                                <button
                                  onClick={() => openEditModal(admin)}
                                  className="text-green-600 hover:underline"
                                  title="Editar"
                                >
                                  Editar
                                </button>
                                {admin.id !== 1 ? (
                                  <button
                                    onClick={() => openDeleteModal(admin)}
                                    className="text-red-600 hover:underline"
                                    title="Eliminar"
                                  >
                                    Eliminar
                                  </button>
                                ) : (
                                  <span
                                    className="text-gray-400 cursor-not-allowed text-xs"
                                    title="El administrador principal no puede ser eliminado"
                                  >
                                    Protegido
                                  </span>
                                )}
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
        </div>
      </main>

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
    </div>
  );
}