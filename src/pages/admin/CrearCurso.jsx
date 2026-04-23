// src/pages/admin/CrearCurso.jsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../utils/axiosInstance";
import CursoImageUpload from "../../components/admin/CursoImageUpload";
import {
  FaBook,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaClock,
  FaLink,
  FaUsers,
  FaDollarSign,
  FaBell,
  FaPaperPlane,
  FaRobot,
  FaMagic,
  FaGift,
  FaCopy,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import { useNotifications } from "../../context/NotificationContext";

export default function CrearCurso() {
  const { addNotification, updateProgress } = useNotifications();

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
    notificarCorreo: false,
    notificarWhatsapp: false,
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [profesores, setProfesores] = useState([]);
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    api
      .get(`/api/users/profesores`)
      .then((res) => {
        if (res.data && Array.isArray(res.data.data))
          setProfesores(res.data.data);
        else if (Array.isArray(res.data)) setProfesores(res.data);
        else if (res.data && typeof res.data === "object") {
          const arrs = Object.values(res.data).filter(Array.isArray);
          setProfesores(arrs.length > 0 ? arrs[0] : []);
        } else setProfesores([]);
      })
      .catch((err) => {
        console.error("Error al obtener profesores:", err);
        setProfesores([]);
      });
  }, []);

  // 🎁 FUNCIONES PARA CUPONES
  const generarCodigoCupon = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  };

  // ✅ ACTUALIZAR: Función para abrir modal
  const abrirModalCupon = (tipo) => {
    setTipoCuponSeleccionado(tipo); // ✅ Guardar el tipo seleccionado
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
      id: Date.now(), // ID temporal para el frontend
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

  // ✅ NUEVA FUNCIÓN: Calcular precio final
  const calcularPrecioFinal = (precioBase, tipo) => {
    if (!precioBase) return 0;

    const descuentos = {
      PORCENTAJE_10: 0.1,
      PORCENTAJE_15: 0.15,
      PORCENTAJE_30: 0.3,
      PORCENTAJE_50: 0.5,
      GRATIS: 1.0,
    };

    return precioBase * (1 - (descuentos[tipo] || 0));
  };

  // ✅ ACTUALIZAR: Función para calcular descuento (mantener esta también)
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
    // ✅ Agregar 'e' como parámetro
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

  // ✅ ACTUALIZAR: Función para obtener texto
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

  // ✅ ACTUALIZAR: Función para obtener color
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
      const response = await api.get(`/api/courses/api/generate-description`, {
        params: { titulo: form.titulo },
      });

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

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImagenFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "cupos") {
      value = value === "" ? "" : Number(value);
    }

    if (e.target.name === "precio") {
      value = value === "" ? "" : Number(value);
    }

    setForm((prev) => ({ ...prev, [e.target.name]: value }));

    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleTipoChange = (e) => {
    setForm((prev) => ({ ...prev, tipo: e.target.value, link: "" }));
    if (errors.tipo) setErrors((prev) => ({ ...prev, tipo: "" }));
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
    if (!form.cupos || form.cupos < 1) {
      newErrors.cupos = "Debe haber al menos 1 cupo disponible";
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

    if (
      form.tipo.endsWith("PAGADO") &&
      (!form.precio || Number(form.precio) <= 0)
    ) {
      Swal.fire(
        "Error",
        "El precio debe ser mayor a 0 para cursos pagados.",
        "error",
      );
      setIsSubmitting(false);
      return;
    }

    if (!form.profesorId) {
      Swal.fire("Error", "Debes seleccionar un profesor.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      // Agregar datos del curso
      Object.entries(form).forEach(([key, value]) => {
        if (key === "profesorId") data.append(key, Number(value));
        else data.append(key, value);
      });

      // Agregar cupones como JSON
      if (cupones.length > 0) {
        data.append("cupones", JSON.stringify(cupones));
      }

      if (imagenFile) data.append("imagen", imagenFile);

      await api.post(`/api/courses/create`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Curso creado",
        html: `
          <div class="text-left">
            <p>El curso <strong>${
              form.titulo
            }</strong> ha sido creado exitosamente.</p>
            ${
              cupones.length > 0
                ? `<p class="mt-2">🎁 Se han creado ${cupones.length} cupones de descuento.</p>`
                : ""
            }
            ${
              form.notificarCorreo || form.notificarWhatsapp
                ? `
              <p class="mt-3">Las notificaciones se están enviando en segundo plano.</p>
              <p class="text-sm text-gray-600">Puedes ver el progreso en el icono de campana.</p>`
                : ""
            }
          </div>
        `,
        confirmButtonColor: "#3b82f6",
      });

      // Resetear formulario
      setForm({
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
        notificarCorreo: false,
        notificarWhatsapp: false,
      });
      setCupones([]);
      setPreview("");
      setImagenFile(null);
      setErrors({});
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo crear el curso",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">Crear Nuevo Curso</h1>
        <p className="text-blue-100 mt-2">
          Completa la información para crear un nuevo curso en la plataforma
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Imagen y Básicos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Imagen */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-400">
                  <FaBook />
                </span>
                Imagen de Portada
              </h2>
              <div className="flex flex-col items-center">
                <CursoImageUpload
                  preview={preview}
                  onImageChange={handleImage}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Tamaño recomendado: 400x400px
                </p>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300">
                Tipo de curso
              </label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleTipoChange}
                className="w-full px-5 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm"
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
              <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400">
                  <FaChalkboardTeacher />
                </span>
                Profesor
              </label>
              <select
                name="profesorId"
                value={form.profesorId}
                onChange={handleChange}
                required
                className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                  errors.profesorId
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm`}
              >
                <option value="" className="text-gray-500 dark:text-gray-400">
                  Seleccione un profesor
                </option>
                {Array.isArray(profesores) &&
                  profesores.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="text-gray-800 dark:text-white"
                    >
                      {p.nombres} {p.apellidos}
                    </option>
                  ))}
              </select>
              {errors.profesorId && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.profesorId}
                </p>
              )}
            </div>

            {/* Cupos & Precio */}
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    <FaUsers />
                  </span>
                  Cupos disponibles
                </label>
                <input
                  name="cupos"
                  type="number"
                  value={form.cupos}
                  onChange={handleChange}
                  min={0}
                  required
                  className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                    errors.cupos
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm`}
                />
                {errors.cupos && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.cupos}
                  </p>
                )}
              </div>

              {form.tipo.endsWith("PAGADO") && (
                <div>
                  <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-amber-600 dark:text-amber-400">
                      <FaDollarSign />
                    </span>
                    Precio (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      name="precio"
                      type="number"
                      value={form.precio === 0 ? "" : form.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-5 py-4 bg-white dark:bg-gray-700 border ${
                        errors.precio
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm`}
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.precio && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.precio}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Columna Central - Información Principal */}
          <div className="lg:col-span-1 space-y-6">
            {/* Título */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">
                  <FaBook />
                </span>
                Título del curso
              </label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                  errors.titulo
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm`}
                placeholder="Introducción a la Programación"
              />
              {errors.titulo && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.titulo}
                </p>
              )}
            </div>

            {/* Descripción con Botón de IA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">📝</span>
                  Descripción
                </label>

                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={isGeneratingDescription || !form.titulo.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                  title="Generar descripción con IA"
                >
                  {isGeneratingDescription ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
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
                      <FaRobot className="text-sm" />
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
                className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                  errors.descripcion
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800 dark:text-white shadow-sm`}
                rows={6}
                placeholder="Describe los objetivos y contenido del curso... o haz clic en 'Generar con IA'"
              />
              {errors.descripcion && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.descripcion}
                </p>
              )}
            </div>

            {/* Fecha & Hora */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-orange-600 dark:text-orange-400">
                    <FaCalendarAlt />
                  </span>
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha || ""}
                  onChange={handleChange}
                  required
                  className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                    errors.fecha
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm`}
                />
                {errors.fecha && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.fecha}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-orange-600 dark:text-orange-400">
                    <FaClock />
                  </span>
                  Hora
                </label>
                <div className="relative">
                  <div
                    className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                      errors.hora
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } rounded-xl text-gray-800 dark:text-white cursor-pointer flex items-center justify-between shadow-sm`}
                    onClick={() => setShowHourDropdown((s) => !s)}
                  >
                    <span>{form.hora || "Seleccionar hora"}</span>
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500"
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
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.hora}
                    </p>
                  )}

                  {showHourDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i).padStart(2, "0")}
                              >
                                {String(i).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-center shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
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
                          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition"
                        >
                          Limpiar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowHourDropdown(false)}
                          className="px-5 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition shadow-md"
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
              <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">
                  <FaLink />
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
                className={`w-full px-5 py-4 bg-white dark:bg-gray-700 border ${
                  errors.link
                    ? "border-red-500"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm`}
                placeholder={
                  form.tipo.startsWith("ONLINE")
                    ? "https://meet.google.com/..."
                    : "https://goo.gl/maps/..."
                }
              />
              {errors.link && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.link}
                </p>
              )}
            </div>
            {/* Link de recursos */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">📚</span>
                Link de Recursos del Curso
              </label>
              <input
                name="recursosLink"
                value={form.recursosLink || ""}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm"
                placeholder="https://drive.google.com/... o https://dropbox.com/..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enlace a documentos, presentaciones, materiales del curso
                (Google Drive, Dropbox, etc.)
              </p>
            </div>
          </div>

          {/* Columna Derecha - Cupones y Notificaciones */}
          <div className="lg:col-span-1 space-y-6">
            {/* 🎁 SECCIÓN DE CUPONES - Solo para cursos pagados */}
            {form.tipo.endsWith("PAGADO") && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-700 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <span className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg text-amber-600 dark:text-amber-400">
                    <FaGift />
                  </span>
                  Cupones de Descuento
                </h2>

                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Crea cupones de descuento que los estudiantes pueden usar para
                  este curso.
                </p>

                {/* 🎯 SELECTOR DE TIPO DE CUPÓN */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">
                    Seleccionar tipo de descuento:
                  </label>

                  <div className="relative">
                    <select
                      value={tipoCuponSeleccionado || ""}
                      onChange={(e) => setTipoCuponSeleccionado(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-600 rounded-lg appearance-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-800 dark:text-white"
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
                        className="w-5 h-5 text-amber-500"
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
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Precio final: $
                        {calcularPrecioFinal(
                          form.precio,
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
                    className="w-full mt-4 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaPlus className="text-sm" />
                    Crear Cupón de {getTipoCuponTexto(tipoCuponSeleccionado)}
                  </button>
                </div>

                {/* Lista de Cupones Creados */}
                {cupones.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      🎫 Cupones Creados ({cupones.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cupones.map((cupon) => (
                        <div
                          key={cupon.id}
                          className={`flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-${getColorTipoCupon(
                            cupon.tipo,
                          )}-100 dark:border-${getColorTipoCupon(
                            cupon.tipo,
                          )}-800`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {cupon.codigo}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full bg-${getColorTipoCupon(
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
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => copiarCodigo(cupon.codigo, e)} // ✅ Pasar evento
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                              title="Copiar código"
                              type="button" // ✅ Especificar type="button"
                            >
                              <FaCopy className="text-sm" />
                            </button>
                            <button
                              onClick={(e) => eliminarCupon(cupon.id, e)} // ✅ Pasar evento
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                              title="Eliminar cupón"
                              type="button" // ✅ Especificar type="button"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notificaciones */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-600 dark:text-purple-400">
                  <FaBell />
                </span>
                Opciones de Notificación
              </h2>
              <div className="flex flex-col gap-5">
                <label className="flex items-center gap-4 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.notificarCorreo}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          notificarCorreo: e.target.checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full ${
                        form.notificarCorreo
                          ? "bg-blue-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      } transition`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white dark:bg-gray-300 w-4 h-4 rounded-full transition transform ${
                        form.notificarCorreo ? "translate-x-6" : ""
                      } shadow-md`}
                    ></div>
                  </div>
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Notificar por correo electrónico
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Los estudiantes recibirán un email
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 transition">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.notificarWhatsapp}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          notificarWhatsapp: e.target.checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-6 rounded-full ${
                        form.notificarWhatsapp
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      } transition`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white dark:bg-gray-300 w-4 h-4 rounded-full transition transform ${
                        form.notificarWhatsapp ? "translate-x-6" : ""
                      } shadow-md`}
                    ></div>
                  </div>
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Notificar por WhatsApp
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Los estudiantes recibirán un mensaje
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Creando curso...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Crear curso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 🎁 MODAL PARA CREAR CUPÓN */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Crear Cupón - {getTipoCuponTexto(nuevoCupon.tipo)}
            </h3>

            <div className="space-y-4">
              {/* Código del Cupón */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Código del Cupón
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoCupon.codigo}
                    onChange={(e) =>
                      setNuevoCupon({
                        ...nuevoCupon,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                    className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Ej: 5, 10, 50..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cada estudiante solo podrá usar este cupón una vez
                </p>
              </div>

              {/* Fecha de Expiración */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Si no se establece, el cupón no expirará
                </p>
              </div>

              {/* Resumen del Descuento */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Resumen del Descuento
                </h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Precio original:
                  </span>
                  <span className="font-medium">
                    ${form.precio?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Precio con descuento:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${calcularPrecioConDescuento(nuevoCupon.tipo).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1 font-bold">
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
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearCupon}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Crear Cupón
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
