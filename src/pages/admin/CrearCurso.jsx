import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import Swal from "sweetalert2";
import axios from "axios";
import BannerSlider from "../../components/admin/BannerSlider";
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
    hora: ""
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [profesores, setProfesores] = useState([]);

  const [showHourDropdown, setShowHourDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/users/profesores", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProfesores(res.data))
      .catch(() => setProfesores([]));
  }, []);

  // Profesor seleccionado completo
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
    setForm({ ...form, tipo: e.target.value, link: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.tipo.endsWith("PAGADO") && (!form.precio || Number(form.precio) <= 0)) {
      Swal.fire("Error", "El precio debe ser mayor a 0 para cursos pagados.", "error");
      return;
    }
    if (!form.profesorId) {
      Swal.fire("Error", "Debes seleccionar un profesor.", "error");
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

      await axios.post("http://localhost:3001/courses/create", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Curso creado", "El curso ha sido creado exitosamente", "success");
      setForm({ titulo: "", descripcion: "", profesorId: "", tipo: "ONLINE_GRATIS", cupos: 1, link: "", precio: 0, fecha: "", hora: "" });
      setPreview("");
      setImagenFile(null);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "No se pudo crear el curso", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Sidebar fijo (izquierda) */}
      <SidebarAdmin className="overflow-y-auto" />

      {/* Contenido principal SCROLLABLE con margen para sidebar */}
      <main className="flex-1 h-screen overflow-y-auto md:ml-72 flex justify-center p-2 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr] gap-6 md:gap-8 lg:gap-10">
          {/* resto del contenido */}
          {/* Formulario principal */}
          <div className="w-full">
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">Crear Curso</h2>

              {/* Sección de imagen */}
              <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col items-center">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full max-w-2xl">
                  {/* Subida de imagen */}
                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <CursoImageUpload preview={preview} onImageChange={handleImage} />
                    <p className="text-xs text-gray-400 text-center mt-2">Tamaño recomendado: 400x400px</p>
                  </div>
                  {/* Info portada */}
                  <div className="flex-1 flex justify-center sm:justify-start w-full">
                    <InfoPortada preview={preview} />
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-gray-500 text-xs sm:text-sm text-center leading-relaxed max-w-2xl">
                  Sube una imagen representativa para tu curso. Aquí podrás crear cursos nuevos, especificar si son online o presenciales, gratuitos o pagados, y asignar todos los detalles necesarios para tus estudiantes.
                </p>
              </div>

              {/* Formulario en grid adaptable */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {/* Columna izquierda */}
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Título */}
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Título del curso</label>
                    <input
                      name="titulo"
                      value={form.titulo}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                    />
                  </div>
                  {/* Descripción */}
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition resize-none text-sm sm:text-base"
                      rows={3}
                    />
                  </div>
                  {/* Profesor */}
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Profesor</label>
                    <select
                      name="profesorId"
                      value={form.profesorId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                    >
                      <option value="">Seleccione un profesor</option>
                      {profesores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombres} {p.apellidos}
                        </option>
                      ))}
                    </select>

                    {/* Etiqueta asignatura */}
                    {profesorSeleccionado && profesorSeleccionado.asignatura && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-200 text-blue-800 font-semibold text-sm">
                        Docente de: {profesorSeleccionado.asignatura}
                      </span>
                    )}
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Tipo de curso */}
                  <div>
                    <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Tipo de curso</label>
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={handleTipoChange}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                    >
                      <option value="ONLINE_GRATIS">Online Gratis</option>
                      <option value="ONLINE_PAGADO">Online Pagado</option>
                      <option value="PRESENCIAL_GRATIS">Presencial Gratis</option>
                      <option value="PRESENCIAL_PAGADO">Presencial Pagado</option>
                    </select>
                  </div>
                  {/* Fecha y hora */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Fecha</label>
                      <input
                        type="date"
                        name="fecha"
                        value={form.fecha || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Hora</label>
                      <div className="relative">
                        {/* Input que muestra la hora seleccionada */}
                        <div
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 text-sm sm:text-base cursor-pointer flex items-center justify-between"
                          onClick={() => setShowHourDropdown(!showHourDropdown)}
                        >
                          <span>{form.hora || "Seleccionar hora"}</span>
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>

                        {/* Selector desplegable hacia arriba */}
                        {showHourDropdown && (
                          <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-3">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {/* Selector de horas */}
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Horas</label>
                                <select
                                  value={form.hora ? form.hora.split(':')[0] : '00'}
                                  onChange={(e) => {
                                    const hours = e.target.value;
                                    const minutes = form.hora ? form.hora.split(':')[1] : '00';
                                    handleChange({ target: { name: 'hora', value: `${hours}:${minutes}` } });
                                  }}
                                  className="w-full p-2 border border-gray-200 rounded-lg text-center"
                                >
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Selector de minutos */}
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Minutos</label>
                                <select
                                  value={form.hora ? form.hora.split(':')[1] : '00'}
                                  onChange={(e) => {
                                    const hours = form.hora ? form.hora.split(':')[0] : '00';
                                    const minutes = e.target.value;
                                    handleChange({ target: { name: 'hora', value: `${hours}:${minutes}` } });
                                  }}
                                  className="w-full p-2 border border-gray-200 rounded-lg text-center"
                                >
                                  <option value="00">00</option>
                                  <option value="15">15</option>
                                  <option value="30">30</option>
                                  <option value="45">45</option>
                                </select>
                              </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex justify-between">
                              <button
                                type="button"
                                onClick={() => handleChange({ target: { name: 'hora', value: '' } })}
                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                              >
                                Limpiar
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowHourDropdown(false)}
                                className="px-3 py-1 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600"
                              >
                                Aplicar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Link */}
                  {(form.tipo.startsWith("ONLINE") || form.tipo.startsWith("PRESENCIAL")) && (
                    <div>
                      <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                        {form.tipo.startsWith("ONLINE") ? "Link Zoom o Meet" : "Ubicación Google Maps"}
                      </label>
                      <input
                        name="link"
                        value={form.link}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                      />
                    </div>
                  )}
                  {/* Cupos y precio */}
                  {form.tipo.endsWith("PAGADO") ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Cupos disponibles</label>
                        <input
                          name="cupos"
                          type="number"
                          value={form.cupos}
                          onChange={handleChange}
                          min={1}
                          required
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Precio USD</label>
                        <input
                          name="precio"
                          type="number"
                          value={form.precio === 0 ? '' : form.precio}
                          onChange={handleChange}
                          placeholder="Precio del curso"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                          inputMode="decimal"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">Cupos disponibles</label>
                      <input
                        name="cupos"
                        type="number"
                        value={form.cupos}
                        onChange={handleChange}
                        min={1}
                        required
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800 transition text-sm sm:text-base"
                      />
                    </div>
                  )}
                </div>
                {/* Botón */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full mt-3 sm:mt-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold text-sm sm:text-base md:text-lg shadow hover:from-yellow-500 hover:to-orange-400 transition-all duration-200 active:scale-95"
                  >
                    Crear curso
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Banner/Slider (solo desktop) */}
          <div className="hidden lg:block w-full h-full">
            <BannerSlider />
          </div>

        </div>
      </main>
    </div>
  );
}
