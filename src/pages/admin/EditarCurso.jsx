import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

  // Estados temporales para manejar la visualización
  const [tempCupos, setTempCupos] = useState("");
  const [tempPrecio, setTempPrecio] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Cargar profesores
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profesores`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setProfesores(res.data.data);
        } else if (Array.isArray(res.data)) {
          setProfesores(res.data);
        } else if (res.data && typeof res.data === "object") {
          const possibleArrays = Object.values(res.data).filter((item) =>
            Array.isArray(item)
          );
          setProfesores(possibleArrays.length > 0 ? possibleArrays[0] : []);
        } else {
          setProfesores([]);
        }
      })
      .catch(() => setProfesores([]));

    // Cargar datos del curso
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const curso = res.data;
        const cuposValue = curso.cupos || 0;
        const precioValue = curso.precio || 0;

        setForm({
          titulo: curso.titulo || "",
          descripcion: curso.descripcion || "",
          profesorId: curso.profesorId || "",
          tipo: curso.tipo || "ONLINE_GRATIS",
          cupos: cuposValue,
          link: curso.link || "",
          precio: precioValue,
          fecha: curso.fecha || "",
          hora: curso.hora || "",
        });

        // Inicializar estados temporales
        setTempCupos(cuposValue === 0 ? "" : cuposValue.toString());
        setTempPrecio(precioValue === 0 ? "" : precioValue.toString());

        if (curso.imagen) {
          const imagenUrl = curso.imagen.startsWith("http")
            ? curso.imagen
            : `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`;
          setPreview(imagenUrl);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar curso:", err);
        Swal.fire("Error", "No se pudo cargar el curso", "error");
        setLoading(false);
      });
  }, [id]);

  const profesorSeleccionado = Array.isArray(profesores)
    ? profesores.find((p) => p.id === Number(form.profesorId))
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
    setTempCupos(value); // Guardar temporalmente como string

    // Convertir a número para el form
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
    setTempPrecio(value); // Guardar temporalmente como string

    // Convertir a número para el form
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

    // Si el tipo es "PAGADO", se asegura de que el precio sea mayor que 0
    if (form.tipo.endsWith("PAGADO")) {
      if (!form.precio || Number(form.precio) <= 0) {
        newErrors.precio = "El precio debe ser mayor a 0 para cursos pagados";
      }
    }

    // ✅ CORREGIDO: Permitir que 'Cupos' sea 0 o más (no forzar mínimo 1)
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
      data.append("precio", form.precio);
      data.append("fecha", form.fecha);
      data.append("hora", form.hora);

      if (imagenFile) {
        data.append("imagen", imagenFile);
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        title: "¡Curso actualizado!",
        text: "El curso se actualizó correctamente.",
        icon: "success",
        confirmButtonColor: "#f59e42",
      }).then(() => navigate("/admin/ver-todo"));
    } catch (err) {
      console.error("Error completo:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          "No se pudo editar el curso. Verifica la consola para más detalles.",
        "error"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {/* Columna Izquierda */}
            <div className="space-y-6 md:space-y-8">
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
                    errors.titulo ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Introducción a la Programación"
                />
                {errors.titulo && (
                  <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block mb-2 md:mb-3 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-blue-600 dark:text-blue-400">📝</span>
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 md:px-5 md:py-4 bg-white dark:bg-gray-700 border ${
                    errors.descripcion ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800 dark:text-white shadow-sm text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400`}
                  rows={4}
                  placeholder="Describe los objetivos y contenido del curso..."
                />
                {errors.descripcion && (
                  <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.descripcion}
                  </p>
                )}
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
                    errors.profesorId ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                  } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base`}
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">Seleccione un profesor</option>
                  {Array.isArray(profesores) &&
                    profesores.map((p) => (
                      <option key={p.id} value={p.id} className="text-gray-800 dark:text-white">
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
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6 md:space-y-8">
              {/* Tipo de curso y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
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
                    <option value="ONLINE_GRATIS" className="text-gray-800 dark:text-white">Online Gratis</option>
                    <option value="ONLINE_PAGADO" className="text-gray-800 dark:text-white">Online Pagado</option>
                    <option value="PRESENCIAL_GRATIS" className="text-gray-800 dark:text-white">Presencial Gratis</option>
                    <option value="PRESENCIAL_PAGADO" className="text-gray-800 dark:text-white">Presencial Pagado</option>
                  </select>
                </div>

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
                      errors.fecha ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                    } rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-800 dark:text-white shadow-sm text-sm md:text-base`}
                  />
                  {errors.fecha && (
                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-red-500 flex items-center gap-1">
                      ⚠️ {errors.fecha}
                    </p>
                  )}
                </div>
              </div>

              {/* Hora */}
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
                      errors.hora ? "border-red-500" : "border-gray-200 dark:border-gray-600"
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
                    errors.link ? "border-red-500" : "border-gray-200 dark:border-gray-600"
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

              {/* Cupos y Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
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
                      errors.cupos ? "border-red-500" : "border-gray-200 dark:border-gray-600"
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
                          errors.precio ? "border-red-500" : "border-gray-200 dark:border-gray-600"
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
    </div>
  );
}