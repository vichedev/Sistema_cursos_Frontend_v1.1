import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../../../utils/axiosInstance";
import { useDebounce } from "use-debounce";

export function useUsuarios() {
  const [data, setData] = useState({ estudiantes: [], administradores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // La pestaña activa se recuerda entre visitas (persistente en el navegador)
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const saved = localStorage.getItem("usuarios_activeTab");
      return saved === "administradores" || saved === "estudiantes"
        ? saved
        : "estudiantes";
    } catch {
      return "estudiantes";
    }
  });
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("usuarios_activeTab", tab);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  // ✅ FIX: leadingEdge true para que el primer valor vacío ("") se aplique inmediatamente
  // sin esperar los 300ms, evitando que la lista aparezca vacía al cargar
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300, { leading: true });

  const [filterCiudad, setFilterCiudad] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [filterCurso, setFilterCurso] = useState("");
  const [filterCedula, setFilterCedula] = useState("");
  const [filterPais, setFilterPais] = useState("");
  // "todos" | "verificados" | "noVerificados"
  const [filterVerificado, setFilterVerificado] = useState("todos");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = () => {
    setLoading(true);
    setError(null);

    api
      .get(`/api/users/usuarios-por-rol`, {
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
          pais: u.pais || "",
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
      paises: [...new Set(est.map((u) => u.pais).filter(Boolean))].sort(),
      cursos: [
        ...new Set(
          est.flatMap((u) => u.cursos.map((c) => c.titulo || "Sin título")),
        ),
      ].sort(),
    };
  }, [data.estudiantes, activeTab]);

  // Estadísticas rápidas de estudiantes (para las tarjetas inteligentes)
  const estudiantesStats = useMemo(() => {
    const est = data.estudiantes || [];
    const verificados = est.filter((u) => u.emailVerified).length;
    const noVerificados = est.length - verificados;
    const paises = new Set(est.map((u) => u.pais).filter(Boolean)).size;
    return {
      total: est.length,
      verificados,
      noVerificados,
      paises,
      pctVerificados: est.length ? Math.round((verificados / est.length) * 100) : 0,
    };
  }, [data.estudiantes]);

  // Estudiantes sin verificar (respetando los demás filtros activos)
  const estudiantesNoVerificados = useMemo(
    () => (data.estudiantes || []).filter((u) => !u.emailVerified),
    [data.estudiantes],
  );

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
          const matchesPais = !filterPais || user.pais === filterPais;
          const matchesCurso =
            !filterCurso || user.cursos.some((c) => c.titulo === filterCurso);
          const matchesCedula =
            !filterCedula ||
            user.cedula.toLowerCase().includes(filterCedula.toLowerCase());
          const matchesVerificado =
            filterVerificado === "todos" ||
            (filterVerificado === "verificados" && user.emailVerified) ||
            (filterVerificado === "noVerificados" && !user.emailVerified);

          return (
            matchesSearch &&
            matchesCiudad &&
            matchesEmpresa &&
            matchesPais &&
            matchesCurso &&
            matchesCedula &&
            matchesVerificado
          );
        }

        return matchesSearch;
      });
    },
    [
      debouncedSearchTerm,
      filterCiudad,
      filterEmpresa,
      filterPais,
      filterCurso,
      filterCedula,
      filterVerificado,
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
    filterPais,
    setFilterPais,
    filterVerificado,
    setFilterVerificado,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    fetchUsuarios,
    filterOptions,
    estudiantesStats,
    estudiantesNoVerificados,
    paginatedUsers,
    totalItems,
    filteredUsers,
  };
}
