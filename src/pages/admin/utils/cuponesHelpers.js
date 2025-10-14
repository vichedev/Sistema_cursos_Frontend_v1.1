// src/utils/cuponesHelpers.js
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

// Función para obtener el token (reutilizable)
const getToken = () => localStorage.getItem("token");

// Función para obtener headers con autorización
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// Función principal para cargar datos
export const cargarDatos = async (setters) => {
  const { setCupones, setCursos, setLoading, setStats } = setters;

  try {
    setLoading(true);
    const [cuponesRes, cursosRes] = await Promise.all([
      axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons`,
        getAuthHeaders()
      ),
      axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/all`,
        getAuthHeaders()
      ),
    ]);

    setCupones(cuponesRes.data);
    setCursos(cursosRes.data);
    calcularEstadisticas(cuponesRes.data, setStats);
  } catch (error) {
    console.error("Error cargando datos:", error);
    Swal.fire("Error", "No se pudieron cargar los datos", "error");
  } finally {
    setLoading(false);
  }
};

// Funciones de formateo de fechas
export const formatearFechaParaInput = (fecha) => {
  if (!fecha) return "";

  try {
    const date = new Date(fecha);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);

    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
    const day = String(adjustedDate.getDate()).padStart(2, "0");

    console.log("Fecha original:", fecha);
    console.log("Fecha formateada:", `${year}-${month}-${day}`);

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "";
  }
};

export const formatearFechaParaDisplay = (fecha) => {
  if (!fecha) return "";

  try {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("Error formateando fecha para display:", error);
    return new Date(fecha).toLocaleDateString();
  }
};

// Función para recargar con retraso
export const recargarConRetraso = (cargarDatosFunc) => {
  setTimeout(() => {
    cargarDatosFunc();
  }, 1000);
};

// Función para calcular estadísticas
export const calcularEstadisticas = (cuponesData, setStats) => {
  const total = cuponesData.length;
  const activos = cuponesData.filter(
    (c) =>
      c.activo &&
      (!c.fechaExpiracion || new Date() < new Date(c.fechaExpiracion)) &&
      c.usosActuales < c.usosMaximos
  ).length;
  const expirados = cuponesData.filter(
    (c) => c.fechaExpiracion && new Date() > new Date(c.fechaExpiracion)
  ).length;
  const inactivos = cuponesData.filter((c) => !c.activo).length;
  const agotados = cuponesData.filter(
    (c) => c.usosActuales >= c.usosMaximos
  ).length;
  const usados = cuponesData.reduce((sum, c) => sum + c.usosActuales, 0);
  const disponibles = cuponesData.reduce(
    (sum, c) => sum + (c.usosMaximos - c.usosActuales),
    0
  );

  const totalUsosMaximos = cuponesData.reduce(
    (sum, c) => sum + c.usosMaximos,
    0
  );
  const tasaUsoEfectiva =
    totalUsosMaximos > 0 ? ((usados / totalUsosMaximos) * 100).toFixed(1) : 0;

  setStats({
    total,
    activos,
    expirados,
    inactivos,
    agotados,
    usados,
    disponibles,
    tasaUsoEfectiva,
  });
};

// Función para filtrar cupones
// Función para filtrar cupones
export const filtrarCupones = (
  cupones,
  searchTerm,
  filterCurso,
  filterEstado,
  cursos // Agregar cursos como parámetro
) => {
  return cupones.filter((cupon) => {
    // Buscar el curso correspondiente
    const curso = cursos.find((c) => c.id === cupon.cursoId);
    const tituloCurso = curso ? curso.titulo.toLowerCase() : "";

    const coincideBusqueda =
      cupon.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tituloCurso.includes(searchTerm.toLowerCase());

    const coincideCurso =
      filterCurso === "all" || cupon.cursoId === parseInt(filterCurso);

    const coincideEstado =
      filterEstado === "all" ||
      (filterEstado === "activo" &&
        cupon.activo &&
        (!cupon.fechaExpiracion ||
          new Date() < new Date(cupon.fechaExpiracion)) &&
        cupon.usosActuales < cupon.usosMaximos) ||
      (filterEstado === "inactivo" && !cupon.activo) ||
      (filterEstado === "expirado" &&
        cupon.fechaExpiracion &&
        new Date() > new Date(cupon.fechaExpiracion)) ||
      (filterEstado === "agotado" && cupon.usosActuales >= cupon.usosMaximos);

    return coincideBusqueda && coincideCurso && coincideEstado;
  });
};

// Función para activar/desactivar cupón
export const toggleActivarCupon = async (cuponId, activar, recargarFunc) => {
  const action = activar ? "activar" : "desactivar";
  const result = await Swal.fire({
    title: `¿${activar ? "Activar" : "Desactivar"} cupón?`,
    text: activar
      ? "Los estudiantes podrán usar este cupón nuevamente"
      : "Los estudiantes no podrán usar este cupón",
    icon: activar ? "question" : "warning",
    showCancelButton: true,
    confirmButtonColor: activar ? "#3085d6" : "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: activar ? "Sí, activar" : "Sí, desactivar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const endpoint = activar ? "activate" : "deactivate";
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/coupons/${cuponId}/${endpoint}`,
        {},
        getAuthHeaders()
      );

      Swal.fire(
        activar ? "Activado" : "Desactivado",
        `El cupón ha sido ${action}do`,
        "success"
      );
      recargarFunc();
    } catch (error) {
      Swal.fire("Error", `No se pudo ${action} el cupón`, "error");
    }
  }
};

// Función para eliminar cupón
export const eliminarCupon = async (cuponId, recargarFunc) => {
  const result = await Swal.fire({
    title: "¿Eliminar cupón?",
    text: "Esta acción no se puede deshacer",
    icon: "error",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons/${cuponId}`,
        getAuthHeaders()
      );

      Swal.fire("Eliminado", "El cupón ha sido eliminado", "success");
      recargarFunc();
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el cupón", "error");
    }
  }
};

// Función para ver detalles del cupón
export const verDetallesCupon = async (
  cuponId,
  setSelectedCupon,
  setShowDetalles
) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/coupons/${cuponId}/users`,
      getAuthHeaders()
    );

    setSelectedCupon(response.data);
    setShowDetalles(true);
  } catch (error) {
    console.error("Error cargando detalles:", error);
    Swal.fire("Error", "No se pudieron cargar los detalles del cupón", "error");
  }
};

// Helper para obtener estado del cupón
export const getEstadoCupon = (cupon) => {
  if (cupon.activo === false) {
    return { texto: "Inactivo", color: "gray", icon: FaTimesCircle };
  }

  if (cupon.fechaExpiracion) {
    const fechaExpiracion = new Date(cupon.fechaExpiracion);
    const hoy = new Date();

    const fechaExpiracionSinHora = new Date(
      fechaExpiracion.getFullYear(),
      fechaExpiracion.getMonth(),
      fechaExpiracion.getDate()
    );
    const hoySinHora = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

    if (fechaExpiracionSinHora < hoySinHora) {
      return { texto: "Expirado", color: "red", icon: FaExclamationTriangle };
    }
  }

  if (cupon.usosActuales >= cupon.usosMaximos) {
    return { texto: "Agotado", color: "orange", icon: FaExclamationTriangle };
  }

  return { texto: "Activo", color: "green", icon: FaCheckCircle };
};

// Helper para obtener texto del tipo de cupón
export const getTipoCuponTexto = (tipo) => {
  switch (tipo) {
    case "PORCENTAJE_10":
      return "10% Descuento";
    case "PORCENTAJE_15":
      return "15% Descuento";
    case "PORCENTAJE_30":
      return "30% Descuento";
    case "PORCENTAJE_50":
      return "50% Descuento";
    case "GRATIS":
      return "Curso GRATIS";
    default:
      return tipo;
  }
};

// Helper para obtener color del tipo
// Helper para obtener color del tipo
export const getColorTipo = (tipo) => {
  switch (tipo) {
    case "PORCENTAJE_10":
      return "blue"; // Azul
    case "PORCENTAJE_15":
      return "emerald"; // Verde esmeralda
    case "PORCENTAJE_30":
      return "amber"; // Amarillo/Naranja
    case "PORCENTAJE_50":
      return "red"; // Rojo
    case "GRATIS":
      return "purple"; // Morado
    default:
      return "gray";
  }
};

// Función para editar cupón (separada en otro archivo por tamaño)
export { editarCupon } from "./cuponesEditarHelpers";
