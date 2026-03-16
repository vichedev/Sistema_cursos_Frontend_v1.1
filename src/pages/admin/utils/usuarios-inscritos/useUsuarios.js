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

        // Normalización agresiva: garantizamos estructura mínima en cada objeto
        const normalizarUsuario = (u) => ({
          ...u,
          nombres: u.nombres || "",
          apellidos: u.apellidos || "",
          correo: u.correo || "",
          ciudad: u.ciudad || "",
          empresa: u.empresa || "",
          cargo: u.cargo || "",
          cedula: u.cedula || "",
          cursos: Array.isArray(u.cursos) ? u.cursos : [],
        });

        const estudiantes = convertirAArray(res.data.estudiantes).map(
          normalizarUsuario,
        );
        const administradores = convertirAArray(res.data.administradores).map(
          normalizarUsuario,
        );

        setData({ estudiantes, administradores });
      })
      .catch((error) => {
        console.error("❌ Error al cargar usuarios:", error);
        setError("No se pudieron cargar los usuarios. Intente nuevamente.");
      })
      .finally(() => setLoading(false));
  };

  // El filtro de opciones ahora es mucho más seguro al depender de datos normalizados
  const filterOptions = useMemo(() => {
    if (activeTab !== "estudiantes") return null;

    const est = data.estudiantes;
    return {
      ciudades: [...new Set(est.map((u) => u.ciudad).filter(Boolean))].sort(),
      empresas: [...new Set(est.map((u) => u.empresa).filter(Boolean))].sort(),
      cursos: [
        ...new Set(
          est.flatMap((u) => u.cursos.map((c) => c.titulo || "Sin título")),
        ),
      ].sort(),
    };
  }, [data.estudiantes, activeTab]);

  const filteredUsers = useCallback(
    (users) => {
      if (!Array.isArray(users)) return [];

      return users.filter((user) => {
        const term = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
          !term ||
          user.nombres.toLowerCase().includes(term) ||
          user.apellidos.toLowerCase().includes(term) ||
          user.correo.toLowerCase().includes(term) ||
          user.ciudad.toLowerCase().includes(term) ||
          user.empresa.toLowerCase().includes(term) ||
          user.cargo.toLowerCase().includes(term) ||
          user.cedula.toLowerCase().includes(term);

        if (activeTab === "estudiantes") {
          const matchesCiudad = !filterCiudad || user.ciudad === filterCiudad;
          const matchesEmpresa =
            !filterEmpresa || user.empresa === filterEmpresa;
          const matchesCurso =
            !filterCurso || user.cursos.some((c) => c.titulo === filterCurso);
          const matchesCedula =
            !filterCedula ||
            user.cedula.toLowerCase().includes(filterCedula.toLowerCase());

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
    ],
  );

  const paginatedUsers = useMemo(() => {
    const list =
      activeTab === "estudiantes" ? data.estudiantes : data.administradores;
    const users = filteredUsers(list);
    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, activeTab, data, filteredUsers]);

  const totalItems = useMemo(() => {
    const list =
      activeTab === "estudiantes" ? data.estudiantes : data.administradores;
    return filteredUsers(list).length;
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
    fetchUsuarios,
    filterOptions,
    paginatedUsers,
    totalItems,
  };
}
