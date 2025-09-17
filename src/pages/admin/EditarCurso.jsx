import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FiArrowLeft } from "react-icons/fi";
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
    hora: ""
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Cargar profesores
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/users/profesores`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setProfesores(res.data))
      .catch(() => setProfesores([]));

    // Cargar datos del curso
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const curso = res.data;
        setForm({
          titulo: curso.titulo || "",
          descripcion: curso.descripcion || "",
          profesorId: curso.profesorId || "",
          tipo: curso.tipo || "ONLINE_GRATIS",
          cupos: curso.cupos || 1,
          link: curso.link || "",
          precio: curso.precio || 0,
          fecha: curso.fecha || "",
          hora: curso.hora || ""
        });

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

  const profesorSeleccionado = profesores.find(p => p.id === Number(form.profesorId));

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
  };

  const handleTipoChange = (e) => {
    setForm({ ...form, tipo: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Añadir todos los campos explícitamente para evitar problemas
      data.append('titulo', form.titulo);
      data.append('descripcion', form.descripcion);
      data.append('profesorId', Number(form.profesorId));
      data.append('tipo', form.tipo);
      data.append('cupos', form.cupos);
      data.append('link', form.link);
      data.append('precio', form.precio);
      data.append('fecha', form.fecha);
      data.append('hora', form.hora);

      if (imagenFile) {
        data.append("imagen", imagenFile);
      }

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/courses/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "¡Curso actualizado!",
        text: "El curso se actualizó correctamente.",
        icon: "success",
        confirmButtonColor: "#f59e42",
      }).then(() => navigate("/admin/ver-todo"));
    } catch (err) {
      console.error("Error completo:", err);
      Swal.fire("Error", err.response?.data?.message || "No se pudo editar el curso. Verifica la consola para más detalles.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
          <div className="text-blue-500 font-semibold">Cargando curso...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 h-screen overflow-y-auto md:ml-72 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Editar Curso</h1>
              <p className="text-gray-500 mt-2">Actualiza la información del curso existente</p>
            </div>
            <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full shadow">
              ID: {id}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6 flex items-center">
              <button
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium transition"
                onClick={() => navigate("/admin/ver-todo")}
                type="button"
              >
                <FiArrowLeft className="inline-block" /> Volver a los cursos
              </button>
            </div>

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
                  
                </div>

                {/* Título */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Título del curso</label>
                  <input
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                    placeholder="Introducción a la Programación"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800"
                    rows={4}
                    placeholder="Describe los objetivos y contenido del curso..."
                  />
                </div>

                {/* Profesor */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Profesor</label>
                  <select
                    name="profesorId"
                    value={form.profesorId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                  >
                    <option value="">Seleccione un profesor</option>
                    {profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} {p.apellidos}
                      </option>
                    ))}
                  </select>
                  {profesorSeleccionado && profesorSeleccionado.asignatura && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
                      Docente de: {profesorSeleccionado.asignatura}
                    </span>
                  )}
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
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                    />
                  </div>
                </div>

                {/* Hora */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Hora</label>
                  <div className="relative">
                    <div
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 cursor-pointer flex items-center justify-between"
                      onClick={() => setShowHourDropdown(!showHourDropdown)}
                    >
                      <span>{form.hora || "Seleccionar hora"}</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>

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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                    placeholder={form.tipo.startsWith("ONLINE") ? "https://meet.google.com/..." : "https://goo.gl/maps/..."}
                  />
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
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                    />
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
                          className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de enviar */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando cambios...
                      </div>
                    ) : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}