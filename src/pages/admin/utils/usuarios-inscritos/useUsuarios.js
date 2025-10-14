import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useDebounce } from "use-debounce";

export function useUsuarios() {
  const [data, setData] = useState({ estudiantes: [], administradores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("estudiantes");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const [filterCiudad, setFilterCiudad] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [filterCurso, setFilterCurso] = useState("");
  const [filterCedula, setFilterCedula] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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
        const convertirAArray = (data) => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object") return Object.values(data);
          return [];
        };

        const estudiantes = convertirAArray(res.data.estudiantes);
        const administradores = convertirAArray(res.data.administradores);

        setData({
          estudiantes: estudiantes.map((user) => ({
            ...user,
            cursos: user.cursos || [],
          })),
          administradores: administradores,
        });
      })
      .catch((error) => {
        console.error("❌ Error completo:", error);
        if (error.code === "ECONNABORTED") {
          setError("Timeout - El servidor tardó demasiado en responder");
        } else if (error.response) {
          if (error.response.status === 401) {
            setError("No autorizado - Tu sesión ha expirado");
          } else if (error.response.status === 403) {
            setError("Acceso denegado - No tienes permisos para ver usuarios");
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

  const filterOptions = useMemo(() => {
    if (activeTab !== "estudiantes") return null;

    const estudiantes = data.estudiantes;
    return {
      ciudades: [
        ...new Set(estudiantes.map((u) => u.ciudad).filter(Boolean)),
      ].sort(),
      empresas: [
        ...new Set(estudiantes.map((u) => u.empresa).filter(Boolean)),
      ].sort(),
      cursos: [
        ...new Set(
          estudiantes.flatMap((u) =>
            Array.isArray(u.cursos) ? u.cursos.map((c) => c.titulo) : []
          )
        ),
      ].sort(),
    };
  }, [data.estudiantes, activeTab]);

  const filteredUsers = useCallback(
    (users) => {
      return users.filter((user) => {
        const matchesSearch =
          !debouncedSearchTerm ||
          user.nombres
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.apellidos
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          user.correo
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (user.ciudad &&
            user.ciudad
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())) ||
          (user.empresa &&
            user.empresa
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())) ||
          (user.cargo &&
            user.cargo
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())) ||
          (user.usuario &&
            user.usuario
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())) ||
          (user.cedula &&
            user.cedula
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()));

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

        return matchesSearch;
      });
    },
    [
      debouncedSearchTerm,
      filterCiudad,
      filterEmpresa,
      filterCurso,
      filterCedula,
      activeTab,
    ]
  );

  const paginatedUsers = useMemo(() => {
    const users = filteredUsers(
      activeTab === "estudiantes" ? data.estudiantes : data.administradores
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, activeTab, data, filteredUsers]);

  const totalItems = useMemo(() => {
    const users = filteredUsers(
      activeTab === "estudiantes" ? data.estudiantes : data.administradores
    );
    return users.length;
  }, [activeTab, data, filteredUsers]);

  return {
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
    modalCallbacks: null, 
    modalType: null,
    setModalType: null,
    modalUser: null,
    setModalUser: null,
    modalLoading: null,
    setModalLoading: null,
    modalError: null,
    setModalError: null,
    fetchUsuarios,
    filterOptions,
    paginatedUsers,
    totalItems,
    filteredUsers,
  };
}