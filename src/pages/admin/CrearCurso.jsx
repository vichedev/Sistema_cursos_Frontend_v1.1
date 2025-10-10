// src/pages/admin/CrearCurso.jsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import CursoImageUpload from "../../components/admin/CursoImageUpload";
import {
  FaBook, FaChalkboardTeacher, FaCalendarAlt, FaClock, FaLink,
  FaUsers, FaDollarSign, FaBell, FaPaperPlane, FaRobot, FaMagic
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
    precio: 0,
    fecha: "",
    hora: "",
    notificarCorreo: false,
    notificarWhatsapp: false
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [profesores, setProfesores] = useState([]);
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profesores`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) setProfesores(res.data.data);
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

  // ✅ FUNCIÓN PARA GENERAR DESCRIPCIÓN CON IA
  const generateDescription = async () => {
    if (!form.titulo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'Por favor, ingresa un título primero para generar la descripción',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/api/generate-description`,
        {
          params: { titulo: form.titulo },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setForm(prev => ({
          ...prev,
          descripcion: response.data.data.descripcion
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'Descripción generada',
          text: 'Se ha generado una descripción automáticamente',
          confirmButtonColor: '#3b82f6',
          timer: 2000
        });
      } else {
        throw new Error(response.data.message || 'Error al generar descripción');
      }
    } catch (error) {
      console.error('Error al generar descripción:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'No se pudo generar la descripción automática',
        confirmButtonColor: '#3b82f6'
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
    if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!form.profesorId) newErrors.profesorId = "Debes seleccionar un profesor";
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
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    setIsSubmitting(true);

    if (form.tipo.endsWith("PAGADO") && (!form.precio || Number(form.precio) <= 0)) {
      Swal.fire("Error", "El precio debe ser mayor a 0 para cursos pagados.", "error");
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
      Object.entries(form).forEach(([key, value]) => {
        if (key === "profesorId") data.append(key, Number(value));
        else data.append(key, value);
      });
      if (imagenFile) data.append("imagen", imagenFile);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/courses/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      Swal.fire({
        icon: "success",
        title: "Curso creado",
        html: `
          <div class="text-left">
            <p>El curso <strong>${form.titulo}</strong> ha sido creado exitosamente.</p>
            ${form.notificarCorreo || form.notificarWhatsapp
            ? `
              <p class="mt-3">Las notificaciones se están enviando en segundo plano.</p>
              <p class="text-sm text-gray-600">Puedes ver el progreso en el icono de campana.</p>`
            : ""
          }
          </div>
        `,
        confirmButtonColor: "#3b82f6"
      });

      setForm({
        titulo: "",
        descripcion: "",
        profesorId: "",
        tipo: "ONLINE_GRATIS",
        cupos: 1,
        link: "",
        precio: 0,
        fecha: "",
        hora: "",
        notificarCorreo: false,
        notificarWhatsapp: false
      });
      setPreview("");
      setImagenFile(null);
      setErrors({});
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo crear el curso",
        confirmButtonColor: "#3b82f6"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">Crear Nuevo Curso</h1>
        <p className="text-blue-100 mt-2">
          Completa la información para crear un nuevo curso en la plataforma
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Columna Izquierda */}
          <div className="space-y-8">
            {/* Imagen */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FaBook />
                </span>
                Imagen de Portada
              </h2>
              <div className="flex flex-col items-center">
                <CursoImageUpload preview={preview} onImageChange={handleImage} />
                <p className="text-xs text-gray-500 text-center mt-3">
                  Tamaño recomendado: 400x400px
                </p>
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                <span className="text-blue-600">
                  <FaBook />
                </span>
                Título del curso
              </label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                className={`w-full px-5 py-4 bg-white border ${errors.titulo ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 shadow-sm`}
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
                <label className="block font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-blue-600">📝</span>
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
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                className={`w-full px-5 py-4 bg-white border ${errors.descripcion ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800 shadow-sm`}
                rows={4}
                placeholder="Describe los objetivos y contenido del curso... o haz clic en 'Generar con IA'"
              />
              {errors.descripcion && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.descripcion}
                </p>
              )}
            </div>

            {/* Profesor */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                <span className="text-purple-600">
                  <FaChalkboardTeacher />
                </span>
                Profesor
              </label>
              <select
                name="profesorId"
                value={form.profesorId}
                onChange={handleChange}
                required
                className={`w-full px-5 py-4 bg-white border ${errors.profesorId ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 shadow-sm`}
              >
                <option value="">Seleccione un profesor</option>
                {Array.isArray(profesores) &&
                  profesores.map((p) => (
                    <option key={p.id} value={p.id}>
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
          </div>

          {/* Columna Derecha */}
          <div className="space-y-8">
            {/* Tipo & Fecha */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block mb-3 font-medium text-gray-700">Tipo de curso</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleTipoChange}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 shadow-sm"
                >
                  <option value="ONLINE_GRATIS">Online Gratis</option>
                  <option value="ONLINE_PAGADO">Online Pagado</option>
                  <option value="PRESENCIAL_GRATIS">Presencial Gratis</option>
                  <option value="PRESENCIAL_PAGADO">Presencial Pagado</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-orange-600">
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
                  className={`w-full px-5 py-4 bg-white border ${errors.fecha ? "border-red-500" : "border-gray-200"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-800 shadow-sm`}
                />
                {errors.fecha && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.fecha}
                  </p>
                )}
              </div>
            </div>

            {/* Hora */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                <span className="text-orange-600">
                  <FaClock />
                </span>
                Hora
              </label>
              <div className="relative">
                <div
                  className={`w-full px-5 py-4 bg-white border ${errors.hora ? "border-red-500" : "border-gray-200"
                    } rounded-xl text-gray-800 cursor-pointer flex items-center justify-between shadow-sm`}
                  onClick={() => setShowHourDropdown((s) => !s)}
                >
                  <span>{form.hora || "Seleccionar hora"}</span>
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl p-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Horas</label>
                        <select
                          value={form.hora ? form.hora.split(":")[0] : "00"}
                          onChange={(e) => {
                            const hours = e.target.value;
                            const minutes = form.hora ? form.hora.split(":")[1] : "00";
                            handleChange({ target: { name: "hora", value: `${hours}:${minutes}` } });
                          }}
                          className="w-full p-3 border border-gray-200 rounded-lg text-center shadow-sm"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={String(i).padStart(2, "0")}>
                              {String(i).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Minutos</label>
                        <select
                          value={form.hora ? form.hora.split(":")[1] : "00"}
                          onChange={(e) => {
                            const hours = form.hora ? form.hora.split(":")[0] : "00";
                            const minutes = e.target.value;
                            handleChange({ target: { name: "hora", value: `${hours}:${minutes}` } });
                          }}
                          className="w-full p-3 border border-gray-200 rounded-lg text-center shadow-sm"
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
                        onClick={() => handleChange({ target: { name: "hora", value: "" } })}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
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

            {/* Link/Ubicación */}
            <div>
              <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                <span className="text-green-600">
                  <FaLink />
                </span>
                {form.tipo.startsWith("ONLINE") ? "Link de la videollamada" : "Ubicación (Google Maps)"}
              </label>
              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                required
                className={`w-full px-5 py-4 bg-white border ${errors.link ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 shadow-sm`}
                placeholder={
                  form.tipo.startsWith("ONLINE") ? "https://meet.google.com/..." : "https://goo.gl/maps/..."
                }
              />
              {errors.link && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">⚠️ {errors.link}</p>
              )}
            </div>

            {/* Cupos & Precio */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-indigo-600">
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
                  className={`w-full px-5 py-4 bg-white border ${errors.cupos ? "border-red-500" : "border-gray-200"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 shadow-sm`}
                />
                {errors.cupos && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">⚠️ {errors.cupos}</p>
                )}
              </div>

              {form.tipo.endsWith("PAGADO") && (
                <div>
                  <label className="block mb-3 font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-amber-600">
                      <FaDollarSign />
                    </span>
                    Precio (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500">$</span>
                    <input
                      name="precio"
                      type="number"
                      value={form.precio === 0 ? "" : form.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-5 py-4 bg-white border ${errors.precio ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-gray-800 shadow-sm`}
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.precio && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">⚠️ {errors.precio}</p>
                  )}
                </div>
              )}
            </div>

            {/* Notificaciones */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <FaBell />
                </span>
                Opciones de Notificación
              </h2>
              <div className="flex flex-col gap-5">
                <label className="flex items-center gap-4 cursor-pointer p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.notificarCorreo}
                      onChange={(e) => setForm((prev) => ({ ...prev, notificarCorreo: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full ${form.notificarCorreo ? "bg-blue-500" : "bg-gray-300"} transition`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${form.notificarCorreo ? "translate-x-6" : ""} shadow-md`}></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Notificar por correo electrónico</span>
                    <p className="text-sm text-gray-500">Los estudiantes recibirán un email</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.notificarWhatsapp}
                      onChange={(e) => setForm((prev) => ({ ...prev, notificarWhatsapp: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full ${form.notificarWhatsapp ? "bg-green-500" : "bg-gray-300"} transition`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${form.notificarWhatsapp ? "translate-x-6" : ""} shadow-md`}></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Notificar por WhatsApp</span>
                    <p className="text-sm text-gray-500">Los estudiantes recibirán un mensaje</p>
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
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    </div>
  );
}