import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import Swal from "sweetalert2";
import { FiArrowLeft } from "react-icons/fi";
import {
  FaBook,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaClock,
  FaLink,
  FaUsers,
  FaDollarSign,
  FaSave,
  FaRobot,
  FaMagic,
  FaGift,
  FaCopy,
  FaTrash,
  FaPlus,
  FaFileAlt,
} from "react-icons/fa";
import CursoImageUpload from "../../components/admin/CursoImageUpload";

export default function EditarCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    profesorId: "",
    tipo: "ONLINE_GRATIS",
    cupos: 1,
    link: "",
    recursosLink: "",
    precio: 0,
    fecha: "",
    hora: "",
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // 🎁 NUEVOS ESTADOS PARA CUPONES
  const [cupones, setCupones] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [tipoCuponSeleccionado, setTipoCuponSeleccionado] = useState("");
  const [nuevoCupon, setNuevoCupon] = useState({
    codigo: "",
    tipo: "PORCENTAJE_30",
    usosMaximos: 1,
    fechaExpiracion: "",
  });

  // Estados temporales para manejar la visualización
  const [tempCupos, setTempCupos] = useState("");
  const [tempPrecio, setTempPrecio] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Cargar profesores
    api
      .get(`/api/users/profesores`, {})
      .then((res) => {
        let profesoresData = [];

        if (res.data && Array.isArray(res.data.data)) {
          profesoresData = res.data.data;
        } else if (Array.isArray(res.data)) {
          profesoresData = res.data;
        } else if (res.data && typeof res.data === "object") {
          const possibleArrays = Object.values(res.data).filter((item) =>
            Array.isArray(item),
          );
          profesoresData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }

        setProfesores(profesoresData);
      })
      .catch((err) => {
        console.error("Error cargando profesores:", err);
        setProfesores([]);
      });

    // Cargar datos del curso
    api
      .get(`/api/courses/${id}`, {})
      .then((res) => {
        const curso = res.data;
        const cuposValue = curso.cupos || 0;
        const precioValue = curso.precio || 0;

        // Buscar profesorId en diferentes ubicaciones posibles
        const posibleProfesorId =
          curso.profesorId ||
          curso.profesor?.id ||
          curso.Profesor?.id ||
          curso.userId ||
          curso.teacherId;

        setForm({
          titulo: curso.titulo || "",
          descripcion: curso.descripcion || "",
          profesorId: posibleProfesorId ? posibleProfesorId.toString() : "",
          tipo: curso.tipo || "ONLINE_GRATIS",
          cupos: cuposValue,
          link: curso.link || "",
          recursosLink: curso.recursosLink || "",
          precio: precioValue,
          fecha: curso.fecha || "",
          hora: curso.hora || "",
        });

        setTempCupos(cuposValue === 0 ? "" : cuposValue.toString());
        setTempPrecio(precioValue === 0 ? "" : precioValue.toString());

        if (curso.imagen) {
          const imagenUrl = curso.imagen.startsWith("http")
            ? curso.imagen
            : `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`;
          setPreview(imagenUrl);
        }

        // 🎁 CARGAR CUPONES DEL CURSO
        cargarCuponesDelCurso(id, token);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar curso:", err);
        Swal.fire("Error", "No se pudo cargar el curso", "error");
        setLoading(false);
      });
  }, [id]);

  const cargarCuponesDelCurso = async (cursoId, token) => {
    try {
      const response = await api.get(`/api/coupons/course/${cursoId}`, {});

      if (response.data && Array.isArray(response.data)) {
        const cuponesConId = response.data.map((cupon) => ({
          ...cupon,
          id: cupon.id,
          precioFinal: calcularPrecioConDescuento(cupon.tipo),
          _esExistente: true,
        }));
        setCupones(cuponesConId);
      }
    } catch (error) {
      console.error("Error cargando cupones:", error);
    }
  };

  // 🎁 FUNCIONES PARA CUPONES
  const generarCodigoCupon = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  };

  const abrirModalCupon = (tipo) => {
    setTipoCuponSeleccionado(tipo);
    setNuevoCupon({
      codigo: generarCodigoCupon(),
      tipo: tipo,
      usosMaximos: 1,
      fechaExpiracion: "",
    });
    setShowCouponModal(true);
  };

  const crearCupon = () => {
    if (!nuevoCupon.codigo.trim()) {
      Swal.fire("Error", "El código del cupón es requerido", "error");
      return;
    }

    if (nuevoCupon.usosMaximos < 1) {
      Swal.fire("Error", "El número de usos debe ser al menos 1", "error");
      return;
    }

    // Validar que el código no esté duplicado localmente
    if (cupones.some((cupon) => cupon.codigo === nuevoCupon.codigo)) {
      Swal.fire("Error", "Ya existe un cupón con este código", "error");
      return;
    }

    const cuponConId = {
      ...nuevoCupon,
      id: Date.now(),
      precioFinal: calcularPrecioConDescuento(nuevoCupon.tipo),
    };

    setCupones((prev) => [...prev, cuponConId]);
    setShowCouponModal(false);

    Swal.fire({
      icon: "success",
      title: "Cupón creado",
      text: `Cupón ${nuevoCupon.codigo} creado exitosamente`,
      confirmButtonColor: "#3b82f6",
    });
  };

  const calcularPrecioConDescuento = (tipoCupon) => {
    if (!form.precio) return 0;

    switch (tipoCupon) {
      case "PORCENTAJE_10":
        return form.precio * 0.9;
      case "PORCENTAJE_15":
        return form.precio * 0.85;
      case "PORCENTAJE_30":
        return form.precio * 0.7;
      case "PORCENTAJE_50":
        return form.precio * 0.5;
      case "GRATIS":
        return 0;
      default:
        return form.precio;
    }
  };

  const copiarCodigo = (codigo, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    navigator.clipboard.writeText(codigo);
    Swal.fire({
      icon: "success",
      title: "Copiado",
      text: `Código ${codigo} copiado al portapapeles`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const eliminarCupon = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    Swal.fire({
      title: "¿Eliminar cupón?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setCupones((prev) => prev.filter((cupon) => cupon.id !== id));
        Swal.fire("Eliminado", "El cupón ha sido eliminado", "success");
      }
    });
  };

  const getTipoCuponTexto = (tipo) => {
    switch (tipo) {
      case "PORCENTAJE_10":
        return "10% de Descuento";
      case "PORCENTAJE_15":
        return "15% de Descuento";
      case "PORCENTAJE_30":
        return "30% de Descuento";
      case "PORCENTAJE_50":
        return "50% de Descuento";
      case "GRATIS":
        return "Curso GRATIS";
      default:
        return tipo;
    }
  };

  const getColorTipoCupon = (tipo) => {
    switch (tipo) {
      case "PORCENTAJE_10":
        return "blue";
      case "PORCENTAJE_15":
        return "cyan";
      case "PORCENTAJE_30":
        return "amber";
      case "PORCENTAJE_50":
        return "green";
      case "GRATIS":
        return "purple";
      default:
        return "gray";
    }
  };

  // 🆕 FUNCIÓN PARA IDENTIFICAR CUPONES NUEVOS VS EXISTENTES
  const prepararCuponesParaEnvio = () => {
    return cupones.map((cupon) => {
      const cuponData = {
        codigo: cupon.codigo,
        tipo: cupon.tipo,
        usosMaximos: cupon.usosMaximos,
        fechaExpiracion: cupon.fechaExpiracion || null,
      };

      if (cupon._esExistente && cupon.id) {
        cuponData.id = cupon.id;
      }

      return cuponData;
    });
  };

  // ✅ FUNCIÓN PARA GENERAR DESCRIPCIÓN CON IA
  const generateDescription = async () => {
    if (!form.titulo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Título requerido",
        text: "Por favor, ingresa un título primero para generar la descripción",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setIsGeneratingDescription(true);

    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/courses/api/generate-description`,
        {
          params: { titulo: form.titulo },
        },
      );

      if (response.data.success) {
        setForm((prev) => ({
          ...prev,
          descripcion: response.data.data.descripcion,
        }));

        Swal.fire({
          icon: "success",
          title: "Descripción generada",
          text: "Se ha generado una descripción automáticamente",
          confirmButtonColor: "#3b82f6",
          timer: 2000,
        });
      } else {
        throw new Error(
          response.data.message || "Error al generar descripción",
        );
      }
    } catch (error) {
      console.error("Error al generar descripción:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "No se pudo generar la descripción automática",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const profesorSeleccionado = Array.isArray(profesores)
    ? profesores.find((p) => p.id.toString() === form.profesorId)
    : null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImagenFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleTipoChange = (e) => {
    setForm({ ...form, tipo: e.target.value });

    if (errors.tipo) {
      setErrors({ ...errors, tipo: "" });
    }
  };

  // Manejo específico para cupos
  const handleCuposChange = (e) => {
    const value = e.target.value;
    setTempCupos(value);

    if (value === "") {
      setForm((prev) => ({ ...prev, cupos: 0 }));
    } else {
      const cuposValue = parseInt(value) || 0;
      setForm((prev) => ({ ...prev, cupos: cuposValue }));
    }

    if (errors.cupos) {
      setErrors({ ...errors, cupos: "" });
    }
  };

  // Manejo específico para precio
  const handlePrecioChange = (e) => {
    const value = e.target.value;
    setTempPrecio(value);

    if (value === "") {
      setForm((prev) => ({ ...prev, precio: 0 }));
    } else {
      const precioValue = parseFloat(value) || 0;
      setForm((prev) => ({ ...prev, precio: precioValue }));
    }

    if (errors.precio) {
      setErrors({ ...errors, precio: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es obligatoria";
    if (!form.profesorId)
      newErrors.profesorId = "Debes seleccionar un profesor";
    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria";
    if (!form.hora) newErrors.hora = "La hora es obligatoria";
    if (!form.link.trim())
      newErrors.link = form.tipo.startsWith("ONLINE")
        ? "El link de la videollamada es obligatorio"
        : "La ubicación es obligatoria";

    if (form.tipo.endsWith("PAGADO")) {
      if (!form.precio || Number(form.precio) <= 0) {
        newErrors.precio = "El precio debe ser mayor a 0 para cursos pagados";
      }
    }

    if (form.cupos < 0) {
      newErrors.cupos = "Los cupos no pueden ser negativos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Formulario incompleto",
        text: "Por favor, completa todos los campos obligatorios correctamente",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("titulo", form.titulo);
      data.append("descripcion", form.descripcion);
      data.append("profesorId", Number(form.profesorId));
      data.append("tipo", form.tipo);
      data.append("cupos", form.cupos);
      data.append("link", form.link);
      data.append("recursosLink", form.recursosLink);

      // 🔥 CORRECCIÓN: Forzar precio a 0 si el curso es GRATIS
      if (form.tipo.endsWith("GRATIS")) {
        data.append("precio", "0");
      } else {
        data.append("precio", form.precio.toString());
      }

      data.append("fecha", form.fecha);
      data.append("hora", form.hora);

      if (cupones.length > 0) {
        const cuponesParaEnviar = prepararCuponesParaEnvio();
        data.append("cupones", JSON.stringify(cuponesParaEnviar));
      }

      if (imagenFile) {
        data.append("imagen", imagenFile);
      }

      await api.put(`/api/courses/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "¡Curso actualizado!",
        html: `
        <div class="text-left">
          <p>El curso <strong>${
            form.titulo
          }</strong> se actualizó correctamente.</p>
          ${
            cupones.length > 0
              ? `<p class="mt-2">🎁 Se han sincronizado ${cupones.length} cupones de descuento.</p>`
              : `<p class="mt-2">🗑️ Todos los cupones han sido eliminados.</p>`
          }
        </div>
      `,
        icon: "success",
        confirmButtonColor: "#f59e42",
      }).then(() => navigate("/admin/ver-todo"));
    } catch (err) {
      console.error("Error completo:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          "No se pudo editar el curso. Verifica la consola para más detalles.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          <div className="text-blue-500 dark:text-blue-400 font-semibold text-lg">
            Cargando curso...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Editar Curso</h1>
            <p className="text-blue-100 mt-1 md:mt-2 text-sm md:text-base">
              Actualiza la información del curso existente
            </p>
          </div>
          <span className="text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 bg-white/20 rounded-full backdrop-blur-sm self-start md:self-auto">
            ID: {id}
          </span>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 transition-colors duration-200">
        <div className="mb-4 md:mb-6">
          <button
            className="flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg md:rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/30 text-sm md:text-base"
            onClick={() => navigate("/admin/ver-todo")}
            type="button"
          >
            <FiArrowLeft className="inline-block" /> Volver a los cursos
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Columna Izquierda - Imagen y Básicos */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
              {/* Imagen de portada */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 md:p-6 rounded-xl md:rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors duration-200">
                <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                  <span className="p-1 md:p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-400">
                    <FaBook className="text-sm md:text-base" />
                  </span>
                  Imagen de Portada
                </h2>
                <div className="flex flex-col items-center">
                  <CursoImageUpload
                    preview={preview}
                    onImageChange={handleImage}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 md:mt-3">
                    Tamaño recomendado: 400x400px
                  </p>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  Tipo de curso
                </label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleTipoChange}
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base"
                >
                  <option
                    value="ONLINE_GRATIS"
                    className="text-gray-800 dark:text-white"
                  >
                    Online Gratis
                  </option>
                  <option
                    value="ONLINE_PAGADO"
                    className="text-gray-800 dark:text-white"
                  >
                    Online Pagado
                  </option>
                  <option
                    value="PRESENCIAL_GRATIS"
                    className="text-gray-800 dark:text-white"
                  >
                    Presencial Gratis
                  </option>
                  <option
                    value="PRESENCIAL_PAGADO"
                    className="text-gray-800 dark:text-white"
                  >
                    Presencial Pagado
                  </option>
                </select>
              </div>

              {/* Profesor */}
              <div>
                <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-purple-600 dark:text-purple-400">
                    <FaChalkboardTeacher className="text-sm md:text-base" />
                  </span>
                  Profesor
                </label>
                <select
                  name="profesorId"
                  value={form.profesorId}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                    errors.profesorId
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base`}
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">
                    Seleccione un profesor
                  </option>
                  {Array.isArray(profesores) &&
                    profesores.map((p) => (
                      <option
                        key={p.id}
                        value={p.id.toString()}
                        className="text-gray-800 dark:text-white"
                      >
                        {p.nombres} {p.apellidos}
                      </option>
                    ))}
                </select>
                {errors.profesorId && (
                  <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.profesorId}
                  </p>
                )}

                {profesorSeleccionado && profesorSeleccionado.asignatura && (
                  <span className="inline-block mt-2 md:mt-3 px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium text-xs md:text-sm border border-blue-100 dark:border-blue-800 transition-colors duration-200">
                    📚 Docente de: {profesorSeleccionado.asignatura}
                  </span>
                )}
              </div>

              {/* Cupos & Precio */}
              <div className="grid grid-cols-1 gap-4 md:gap-5">
                <div>
                  <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      <FaUsers className="text-sm md:text-base" />
                    </span>
                    Cupos disponibles
                  </label>
                  <input
                    name="cupos"
                    type="number"
                    value={tempCupos}
                    onChange={handleCuposChange}
                    min={0}
                    required
                    placeholder="0 = sin cupos"
                    className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                      errors.cupos
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                  />
                  {form.cupos === 0 && (
                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      💡 El curso se guardará sin cupos disponibles
                    </p>
                  )}
                  {errors.cupos && (
                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.cupos}
                    </p>
                  )}
                </div>

                {form.tipo.endsWith("PAGADO") && (
                  <div>
                    <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                      <span className="text-amber-600 dark:text-amber-400">
                        <FaDollarSign className="text-sm md:text-base" />
                      </span>
                      Precio (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 md:left-4 md:top-4 text-gray-500 dark:text-gray-400">
                        $
                      </span>
                      <input
                        name="precio"
                        type="number"
                        value={tempPrecio}
                        onChange={handlePrecioChange}
                        placeholder="0.00 = gratis"
                        className={`w-full pl-8 pr-4 py-3 md:pl-10 md:pr-5 md:py-4 bg-white dark:bg-gray-700 border ${
                          errors.precio
                            ? "border-red-500"
                            : "border-gray-200 dark:border-gray-600"
                        } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {form.precio === 0 && form.tipo.endsWith("PAGADO") && (
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        💡 El curso se guardará como gratuito
                      </p>
                    )}
                    {errors.precio && (
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                        ⚠️ {errors.precio}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Columna Central - Información Principal */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
              {/* Título */}
              <div>
                <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-blue-600 dark:text-blue-400">
                    <FaBook className="text-sm md:text-base" />
                  </span>
                  Título del curso
                </label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                    errors.titulo
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Introducción a la Programación"
                />
                {errors.titulo && (
                  <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descripción con Botón de IA */}
              <div>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                    <span className="text-blue-600 dark:text-blue-400">📝</span>
                    Descripción
                  </label>

                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGeneratingDescription || !form.titulo.trim()}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm font-medium shadow-md"
                    title="Generar descripción con IA"
                  >
                    {isGeneratingDescription ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3 md:h-4 md:w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <FaRobot className="text-xs md:text-sm" />
                        <FaMagic className="text-xs" />
                        Generar con IA
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                    errors.descripcion
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                  rows={6}
                  placeholder="Describe los objetivos y contenido del curso... o haz clic en 'Generar con IA'"
                />
                {errors.descripcion && (
                  <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.descripcion}
                  </p>
                )}
              </div>

              {/* Fecha & Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                    <span className="text-orange-600 dark:text-orange-400">
                      <FaCalendarAlt className="text-sm md:text-base" />
                    </span>
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha || ""}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                      errors.fecha
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base`}
                  />
                  {errors.fecha && (
                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.fecha}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                    <span className="text-orange-600 dark:text-orange-400">
                      <FaClock className="text-sm md:text-base" />
                    </span>
                    Hora
                  </label>
                  <div className="relative">
                    <div
                      className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                        errors.hora
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } rounded-lg md:rounded-xl text-gray-800 dark:text-white cursor-pointer flex items-center justify-between shadow-sm text-sm md:text-base`}
                      onClick={() => setShowHourDropdown(!showHourDropdown)}
                    >
                      <span>{form.hora || "Seleccionar hora"}</span>
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                    {errors.hora && (
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                        ⚠️ {errors.hora}
                      </p>
                    )}

                    {showHourDropdown && (
                      <div className="absolute z-10 mt-1 md:mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg md:rounded-xl shadow-xl p-3 md:p-5 transition-colors duration-200">
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                          <div>
                            <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
                              Horas
                            </label>
                            <select
                              value={form.hora ? form.hora.split(":")[0] : "00"}
                              onChange={(e) => {
                                const hours = e.target.value;
                                const minutes = form.hora
                                  ? form.hora.split(":")[1]
                                  : "00";
                                handleChange({
                                  target: {
                                    name: "hora",
                                    value: `${hours}:${minutes}`,
                                  },
                                });
                              }}
                              className="w-full p-2 md:p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center shadow-sm text-sm md:text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
                              Minutos
                            </label>
                            <select
                              value={form.hora ? form.hora.split(":")[1] : "00"}
                              onChange={(e) => {
                                const hours = form.hora
                                  ? form.hora.split(":")[0]
                                  : "00";
                                const minutes = e.target.value;
                                handleChange({
                                  target: {
                                    name: "hora",
                                    value: `${hours}:${minutes}`,
                                  },
                                });
                              }}
                              className="w-full p-2 md:p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center shadow-sm text-sm md:text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            >
                              <option value="00">00</option>
                              <option value="15">15</option>
                              <option value="30">30</option>
                              <option value="45">45</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              handleChange({
                                target: { name: "hora", value: "" },
                              })
                            }
                            className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition"
                          >
                            Limpiar
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowHourDropdown(false)}
                            className="px-3 py-1 md:px-5 md:py-2 bg-blue-500 text-white text-xs md:text-sm rounded-lg hover:bg-blue-600 transition shadow-md"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Link/Ubicación */}
              <div>
                <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-green-600 dark:text-green-400">
                    <FaLink className="text-sm md:text-base" />
                  </span>
                  {form.tipo.startsWith("ONLINE")
                    ? "Link de la videollamada"
                    : "Ubicación (Google Maps)"}
                </label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                    errors.link
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder={
                    form.tipo.startsWith("ONLINE")
                      ? "https://meet.google.com/..."
                      : "https://goo.gl/maps/..."
                  }
                />
                {errors.link && (
                  <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.link}
                  </p>
                )}
              </div>

              {/* NUEVO CAMPO: Link de Recursos */}
              <div>
                <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    <FaFileAlt className="text-sm md:text-base" />
                  </span>
                  Link de Recursos del Curso
                </label>
                <input
                  name="recursosLink"
                  value={form.recursosLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="https://drive.google.com/... o https://notion.so/..."
                />
                <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  💡 Enlace a materiales, presentaciones, documentos del curso
                  (Google Drive, Notion, etc.)
                </p>
              </div>
            </div>

            {/* Columna Derecha - Cupones y Botón Guardar */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
              {/* 🎁 SECCIÓN DE CUPONES - Solo para cursos pagados */}
              {form.tipo.endsWith("PAGADO") && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 md:p-6 rounded-xl md:rounded-2xl border border-amber-200 dark:border-amber-700 transition-colors duration-200">
                  <h2 className="text-base md:text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3 md:mb-4 flex items-center gap-2">
                    <span className="p-1 md:p-2 bg-amber-100 dark:bg-amber-800 rounded-lg text-amber-600 dark:text-amber-400">
                      <FaGift className="text-sm md:text-base" />
                    </span>
                    Cupones de Descuento
                  </h2>

                  <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300 mb-3 md:mb-4">
                    Crea cupones de descuento que los estudiantes pueden usar
                    para este curso.
                  </p>

                  {/* 🎯 SELECTOR DE TIPO DE CUPÓN */}
                  <div className="mb-4 md:mb-6">
                    <label className="block text-xs md:text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 md:mb-3">
                      Seleccionar tipo de descuento:
                    </label>

                    <div className="relative">
                      <select
                        value={tipoCuponSeleccionado || ""}
                        onChange={(e) =>
                          setTipoCuponSeleccionado(e.target.value)
                        }
                        className="w-full p-3 md:p-4 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-600 rounded-lg appearance-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-800 dark:text-white text-sm md:text-base"
                      >
                        <option value="">Selecciona un descuento</option>
                        <option value="PORCENTAJE_10">10% de descuento</option>
                        <option value="PORCENTAJE_15">15% de descuento</option>
                        <option value="PORCENTAJE_30">30% de descuento</option>
                        <option value="PORCENTAJE_50">50% de descuento</option>
                        <option value="GRATIS">Curso GRATIS</option>
                      </select>

                      {/* Icono de flecha del select */}
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    {/* Mostrar precio final calculado */}
                    {tipoCuponSeleccionado && form.precio && (
                      <div className="mt-2 md:mt-3 p-2 md:p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                        <span className="text-xs md:text-sm font-medium text-amber-800 dark:text-amber-200">
                          Precio final: $
                          {calcularPrecioConDescuento(
                            tipoCuponSeleccionado,
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Botón para crear cupón */}
                    <button
                      type="button"
                      onClick={() =>
                        tipoCuponSeleccionado &&
                        abrirModalCupon(tipoCuponSeleccionado)
                      }
                      disabled={!tipoCuponSeleccionado}
                      className="w-full mt-3 md:mt-4 px-3 py-2 md:px-4 md:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <FaPlus className="text-xs md:text-sm" />
                      Crear Cupón de {getTipoCuponTexto(tipoCuponSeleccionado)}
                    </button>
                  </div>

                  {/* Lista de Cupones Creados */}
                  {cupones.length > 0 && (
                    <div className="mt-3 md:mt-4">
                      <h4 className="font-medium mb-2 md:mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                        🎫 Cupones Creados ({cupones.length})
                      </h4>
                      <div className="space-y-2 md:space-y-3 max-h-40 md:max-h-60 overflow-y-auto">
                        {cupones.map((cupon) => (
                          <div
                            key={cupon.id}
                            className={`flex justify-between items-center p-2 md:p-3 bg-white dark:bg-gray-800 rounded-lg border border-${getColorTipoCupon(
                              cupon.tipo,
                            )}-100 dark:border-${getColorTipoCupon(
                              cupon.tipo,
                            )}-800`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-1 md:gap-2 mb-1">
                                <span className="font-mono text-xs md:text-sm bg-gray-100 dark:bg-gray-700 px-1 md:px-2 py-1 rounded">
                                  {cupon.codigo}
                                </span>
                                <span
                                  className={`text-xs px-1 md:px-2 py-1 rounded-full bg-${getColorTipoCupon(
                                    cupon.tipo,
                                  )}-100 dark:bg-${getColorTipoCupon(
                                    cupon.tipo,
                                  )}-800 text-${getColorTipoCupon(
                                    cupon.tipo,
                                  )}-800 dark:text-${getColorTipoCupon(
                                    cupon.tipo,
                                  )}-200`}
                                >
                                  {getTipoCuponTexto(cupon.tipo)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {cupon.usosMaximos} uso
                                {cupon.usosMaximos !== 1 ? "s" : ""} •
                                {cupon.fechaExpiracion
                                  ? ` Vence: ${new Date(
                                      cupon.fechaExpiracion,
                                    ).toLocaleDateString()}`
                                  : " Sin expiración"}
                              </div>
                            </div>
                            <div className="flex gap-1 md:gap-2">
                              <button
                                onClick={(e) => copiarCodigo(cupon.codigo, e)}
                                className="p-1 md:p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                title="Copiar código"
                                type="button"
                              >
                                <FaCopy className="text-xs md:text-sm" />
                              </button>
                              <button
                                onClick={(e) => eliminarCupon(cupon.id, e)}
                                className="p-1 md:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                title="Eliminar cupón"
                                type="button"
                              >
                                <FaTrash className="text-xs md:text-sm" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de enviar */}
              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base md:text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 md:gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm md:text-base">
                        Guardando cambios...
                      </span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-sm md:text-base" />
                      <span className="text-sm md:text-base">
                        Guardar cambios
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 🎁 MODAL PARA CREAR CUPÓN */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white">
              Crear Cupón - {getTipoCuponTexto(nuevoCupon.tipo)}
            </h3>

            <div className="space-y-3 md:space-y-4">
              {/* Código del Cupón */}
              <div>
                <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700 dark:text-gray-300">
                  Código del Cupón
                </label>
                <div className="flex gap-1 md:gap-2">
                  <input
                    type="text"
                    value={nuevoCupon.codigo}
                    onChange={(e) =>
                      setNuevoCupon({
                        ...nuevoCupon,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    className="flex-1 p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm md:text-base"
                    placeholder="EJEMPLO123"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoCupon({
                        ...nuevoCupon,
                        codigo: generarCodigoCupon(),
                      })
                    }
                    className="px-3 py-2 md:px-4 md:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm md:text-base"
                    title="Generar nuevo código"
                  >
                    🔄
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Los estudiantes usarán este código para aplicar el descuento
                </p>
              </div>

              {/* Número de Usos */}
              <div>
                <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700 dark:text-gray-300">
                  ¿Cuántas personas pueden usar este cupón?
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={nuevoCupon.usosMaximos}
                  onChange={(e) =>
                    setNuevoCupon({
                      ...nuevoCupon,
                      usosMaximos: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm md:text-base"
                  placeholder="Ej: 5, 10, 50..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cada estudiante solo podrá usar este cupón una vez
                </p>
              </div>

              {/* Fecha de Expiración */}
              <div>
                <label className="block text-sm font-medium mb-1 md:mb-2 text-gray-700 dark:text-gray-300">
                  Fecha de expiración (opcional)
                </label>
                <input
                  type="date"
                  value={nuevoCupon.fechaExpiracion}
                  onChange={(e) =>
                    setNuevoCupon({
                      ...nuevoCupon,
                      fechaExpiracion: e.target.value,
                    })
                  }
                  className="w-full p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm md:text-base"
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Si no se establece, el cupón no expirará
                </p>
              </div>

              {/* Resumen del Descuento */}
              <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1 md:mb-2 text-sm md:text-base">
                  Resumen del Descuento
                </h4>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Precio original:
                  </span>
                  <span className="font-medium">
                    ${form.precio?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-xs md:text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Precio con descuento:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${calcularPrecioConDescuento(nuevoCupon.tipo).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs md:text-sm mt-1 font-bold">
                  <span className="text-gray-800 dark:text-gray-200">
                    Ahorro:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    $
                    {(
                      form.precio - calcularPrecioConDescuento(nuevoCupon.tipo)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm md:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearCupon}
                  className="flex-1 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm md:text-base"
                >
                  Crear Cupón
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
