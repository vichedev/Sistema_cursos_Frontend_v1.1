import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import Swal from "sweetalert2";
import axios from "axios";
import CursoImageUpload from "../../components/admin/CursoImageUpload";
import InfoPortada from "../../components/admin/InfoPortada";

export default function CrearCurso() {
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/users/profesores`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setProfesores(res.data.data);
        } else if (Array.isArray(res.data)) {
          setProfesores(res.data);
        } else if (res.data && typeof res.data === 'object') {
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          setProfesores(possibleArrays.length > 0 ? possibleArrays[0] : []);
        } else {
          setProfesores([]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener profesores:", err);
        setProfesores([]);
      });
  }, []);

  const profesorSeleccionado = Array.isArray(profesores)
    ? profesores.find(p => p.id === Number(form.profesorId))
    : null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImagenFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "cupos") value = Number(value);
    if (e.target.name === "precio") value = value === "" ? "" : Number(value);
    
    setForm({ ...form, [e.target.name]: value });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleTipoChange = (e) => {
    setForm({ ...form, tipo: e.target.value, link: "" });
    
    // Limpiar error del tipo si existe
    if (errors.tipo) {
      setErrors({ ...errors, tipo: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obligatorios
    if (!form.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!form.profesorId) newErrors.profesorId = "Debes seleccionar un profesor";
    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria";
    if (!form.hora) newErrors.hora = "La hora es obligatoria";
    if (!form.link.trim()) newErrors.link = form.tipo.startsWith("ONLINE") 
      ? "El link de la videollamada es obligatorio" 
      : "La ubicación es obligatoria";
    
    // Validaciones específicas para cursos pagados
    if (form.tipo.endsWith("PAGADO")) {
      if (!form.precio || Number(form.precio) <= 0) {
        newErrors.precio = "El precio debe ser mayor a 0 para cursos pagados";
      }
    }
    
    // Validar cupos
    if (!form.cupos || form.cupos < 1) {
      newErrors.cupos = "Debe haber al menos 1 cupo disponible";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar el formulario antes de enviar
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos obligatorios correctamente',
        confirmButtonColor: '#3b82f6'
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
        if (key === "profesorId") {
          data.append(key, Number(value));
        } else {
          data.append(key, value);
        }
      });
      if (imagenFile) data.append("imagen", imagenFile);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/courses/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Curso creado',
        text: 'El curso ha sido creado exitosamente',
        confirmButtonColor: '#3b82f6'
      });
      
      // Resetear formulario
      setForm({
        titulo: "", descripcion: "", profesorId: "", tipo: "ONLINE_GRATIS",
        cupos: 1, link: "", precio: 0, fecha: "", hora: "",
        notificarCorreo: false, notificarWhatsapp: false
      });
      setPreview("");
      setImagenFile(null);
      setErrors({});
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || "No se pudo crear el curso",
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 h-screen overflow-y-auto md:ml-72 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crear Nuevo Curso</h1>
            <p className="text-gray-500 mt-2">Completa la información para crear un nuevo curso en la plataforma</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                  {/* Imagen de portada */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Imagen de Portada</h2>
                    <div className="flex flex-col items-center">
                      <CursoImageUpload preview={preview} onImageChange={handleImage} />
                      <p className="text-xs text-gray-400 text-center mt-2">Tamaño recomendado: 400x400px</p>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Subir portada</h3>
                      <p className="text-xs text-gray-400">Así lo verán las estudiantes</p>
                    </div>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Título del curso</label>
                    <input
                      name="titulo"
                      value={form.titulo}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-white border ${errors.titulo ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800`}
                      placeholder="Introducción a la Programación"
                    />
                    {errors.titulo && <p className="mt-1 text-sm text-red-500">{errors.titulo}</p>}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-white border ${errors.descripcion ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800`}
                      rows={4}
                      placeholder="Describe los objetivos y contenido del curso..."
                    />
                    {errors.descripcion && <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>}
                  </div>

                  {/* Profesor */}
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Profesor</label>
                    <select
                      name="profesorId"
                      value={form.profesorId}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-white border ${errors.profesorId ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800`}
                    >
                      <option value="">Seleccione un profesor</option>
                      {Array.isArray(profesores) && profesores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombres} {p.apellidos}
                        </option>
                      ))}
                    </select>
                    {errors.profesorId && <p className="mt-1 text-sm text-red-500">{errors.profesorId}</p>}
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  {/* Tipo de curso y Fecha */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Tipo de curso</label>
                      <select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleTipoChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                      >
                        <option value="ONLINE_GRATIS">Online Gratis</option>
                        <option value="ONLINE_PAGADO">Online Pagado</option>
                        <option value="PRESENCIAL_GRATIS">Presencial Gratis</option>
                        <option value="PRESENCIAL_PAGADO">Presencial Pagado</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Fecha</label>
                      <input
                        type="date"
                        name="fecha"
                        value={form.fecha || ""}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 bg-white border ${errors.fecha ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800`}
                      />
                      {errors.fecha && <p className="mt-1 text-sm text-red-500">{errors.fecha}</p>}
                    </div>
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Hora</label>
                    <div className="relative">
                      <div
                        className={`w-full px-4 py-3 bg-white border ${errors.hora ? 'border-red-500' : 'border-gray-200'} rounded-lg text-gray-800 cursor-pointer flex items-center justify-between`}
                        onClick={() => setShowHourDropdown(!showHourDropdown)}
                      >
                        <span>{form.hora || "Seleccionar hora"}</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                      {errors.hora && <p className="mt-1 text-sm text-red-500">{errors.hora}</p>}

                      {showHourDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Horas</label>
                              <select
                                value={form.hora ? form.hora.split(':')[0] : '00'}
                                onChange={(e) => {
                                  const hours = e.target.value;
                                  const minutes = form.hora ? form.hora.split(':')[1] : '00';
                                  handleChange({ target: { name: 'hora', value: `${hours}:${minutes}` } });
                                }}
                                className="w-full p-2 border border-gray-200 rounded-md text-center"
                              >
                                {Array.from({ length: 24 }, (_, i) => (
                                  <option key={i} value={i.toString().padStart(2, '0')}>
                                    {i.toString().padStart(2, '0')}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Minutos</label>
                              <select
                                value={form.hora ? form.hora.split(':')[1] : '00'}
                                onChange={(e) => {
                                  const hours = form.hora ? form.hora.split(':')[0] : '00';
                                  const minutes = e.target.value;
                                  handleChange({ target: { name: 'hora', value: `${hours}:${minutes}` } });
                                }}
                                className="w-full p-2 border border-gray-200 rounded-md text-center"
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
                              onClick={() => handleChange({ target: { name: 'hora', value: '' } })}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Limpiar
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowHourDropdown(false)}
                              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
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
                    <label className="block mb-2 font-medium text-gray-700">
                      {form.tipo.startsWith("ONLINE") ? "Link de la videollamada" : "Ubicación (Google Maps)"}
                    </label>
                    <input
                      name="link"
                      value={form.link}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-white border ${errors.link ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800`}
                      placeholder={form.tipo.startsWith("ONLINE") ? "https://meet.google.com/..." : "https://goo.gl/maps/..."}
                    />
                    {errors.link && <p className="mt-1 text-sm text-red-500">{errors.link}</p>}
                  </div>

                  {/* Cupos y Precio */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium text-gray-700">Cupos disponibles</label>
                      <input
                        name="cupos"
                        type="number"
                        value={form.cupos}
                        onChange={handleChange}
                        min={1}
                        required
                        className={`w-full px-4 py-3 bg-white border ${errors.cupos ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800`}
                      />
                      {errors.cupos && <p className="mt-1 text-sm text-red-500">{errors.cupos}</p>}
                    </div>
                    
                    {form.tipo.endsWith("PAGADO") && (
                      <div>
                        <label className="block mb-2 font-medium text-gray-700">Precio (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <input
                            name="precio"
                            type="number"
                            value={form.precio === 0 ? '' : form.precio}
                            onChange={handleChange}
                            placeholder="0.00"
                            className={`w-full pl-8 pr-4 py-3 bg-white border ${errors.precio ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800`}
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        {errors.precio && <p className="mt-1 text-sm text-red-500">{errors.precio}</p>}
                      </div>
                    )}
                  </div>

                  {/* Opciones de Notificación */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Opciones de Notificación</h2>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.notificarCorreo}
                            onChange={(e) => setForm({ ...form, notificarCorreo: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 rounded-full ${form.notificarCorreo ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition transform ${form.notificarCorreo ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-700">Notificar por correo electrónico</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.notificarWhatsapp}
                            onChange={(e) => setForm({ ...form, notificarWhatsapp: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`w-10 h-5 rounded-full ${form.notificarWhatsapp ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition transform ${form.notificarWhatsapp ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-700">Notificar por WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  {/* Botón de enviar */}
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando curso...
                        </div>
                      ) : "Crear curso"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}