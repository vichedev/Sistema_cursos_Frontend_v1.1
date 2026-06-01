// src/pages/admin/CrearCurso.jsx
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../utils/axiosInstance";
import { formatDateOnly } from "../../utils/dateUtils";
import { compressImage } from "../../utils/compressImage";
import CursoImageUpload from "../../components/admin/CursoImageUpload";
import {
  FormCard,
  Field,
  Toggle,
  TimeField,
  inputCls,
  cuponStyle,
  Spinner,
  CuponModal,
} from "../../components/admin/CursoFormUI";
import {
  FaBook,
  FaChalkboardTeacher,
  FaCalendarAlt,
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
  FaImage,
  FaCog,
} from "react-icons/fa";

import { useNotifications } from "../../context/NotificationContext";

const TIPOS = [
  { value: "ONLINE_GRATIS", label: "Online Gratis" },
  { value: "ONLINE_PAGADO", label: "Online Pagado" },
  { value: "PRESENCIAL_GRATIS", label: "Presencial Gratis" },
  { value: "PRESENCIAL_PAGADO", label: "Presencial Pagado" },
];

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
        throw new Error(response.data.message || "Error al generar descripción");
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

  const handleImage = async (e) => {
    const original = e.target.files[0];
    if (!original) {
      setImagenFile(null);
      setPreview("");
      return;
    }
    // Comprime la portada en el navegador antes de guardarla para subir.
    const file = await compressImage(original, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 });
    setImagenFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "cupos") value = value === "" ? "" : Number(value);
    if (e.target.name === "precio") value = value === "" ? "" : Number(value);

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
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "profesorId") data.append(key, Number(value));
        else data.append(key, value);
      });

      if (cupones.length > 0) {
        data.append("cupones", JSON.stringify(cupones));
      }

      if (imagenFile) data.append("imagen", imagenFile);

      await api.post(`/api/courses/create`, data, {
        headers: { "Content-Type": "multipart/form-data" },
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

  const esPagado = form.tipo.endsWith("PAGADO");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="w-full">
        {/* Header */}
        <div className="mb-7 rounded-2xl p-6 md:p-7 text-white shadow-lg bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600">
          <h1 className="text-2xl md:text-3xl font-bold">Crear nuevo curso</h1>
          <p className="text-blue-100 mt-1.5 text-sm">
            Completa la información para publicar un nuevo curso en la plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-6">
            <FormCard icon={<FaBook />} title="Información básica" subtitle="Título, descripción y responsable" accent="blue">
              <Field label="Título del curso" icon={<FaBook />} error={errors.titulo}>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  className={inputCls(errors.titulo)}
                  placeholder="Introducción a la Programación"
                />
              </Field>

              <Field
                label="Descripción"
                error={errors.descripcion}
              >
                <div className="flex justify-end -mt-9 mb-2">
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGeneratingDescription || !form.titulo.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shadow"
                    title="Generar descripción con IA"
                  >
                    {isGeneratingDescription ? (
                      <><Spinner className="h-3.5 w-3.5" /> Generando...</>
                    ) : (
                      <><FaRobot /> <FaMagic className="text-[10px]" /> Generar con IA</>
                    )}
                  </button>
                </div>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={6}
                  className={`${inputCls(errors.descripcion)} resize-none`}
                  placeholder="Describe los objetivos y contenido del curso... o genera la descripción con IA"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Tipo de curso" icon={<FaCog />}>
                  <select name="tipo" value={form.tipo} onChange={handleTipoChange} className={inputCls(false)}>
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Profesor" icon={<FaChalkboardTeacher />} error={errors.profesorId}>
                  <select name="profesorId" value={form.profesorId} onChange={handleChange} className={inputCls(errors.profesorId)}>
                    <option value="">Seleccione un profesor</option>
                    {Array.isArray(profesores) &&
                      profesores.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>
                      ))}
                  </select>
                </Field>
              </div>
            </FormCard>

            <FormCard icon={<FaCalendarAlt />} title="Programación y acceso" subtitle="Fecha, hora y enlaces" accent="green">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Fecha" icon={<FaCalendarAlt />} error={errors.fecha}>
                  <input type="date" name="fecha" value={form.fecha || ""} onChange={handleChange} className={inputCls(errors.fecha)} />
                </Field>
                <Field label="Hora" error={errors.hora}>
                  <TimeField
                    value={form.hora}
                    error={errors.hora}
                    onChange={(v) => handleChange({ target: { name: "hora", value: v } })}
                  />
                </Field>
              </div>
              <Field
                label={form.tipo.startsWith("ONLINE") ? "Link de la videollamada" : "Ubicación (Google Maps)"}
                icon={<FaLink />}
                error={errors.link}
              >
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  className={inputCls(errors.link)}
                  placeholder={form.tipo.startsWith("ONLINE") ? "https://meet.google.com/..." : "https://goo.gl/maps/..."}
                />
              </Field>
              <Field label="Link de recursos (opcional)" icon={<FaLink />} hint="Materiales del curso: Google Drive, Dropbox, Notion, etc.">
                <input
                  name="recursosLink"
                  value={form.recursosLink || ""}
                  onChange={handleChange}
                  className={inputCls(false)}
                  placeholder="https://drive.google.com/..."
                />
              </Field>
            </FormCard>

            {/* Cupones (solo pagados) */}
            {esPagado && (
              <FormCard icon={<FaGift />} title="Cupones de descuento" subtitle="Opcional — para cursos pagados" accent="amber">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <Field label="Tipo de descuento">
                    <select
                      value={tipoCuponSeleccionado || ""}
                      onChange={(e) => setTipoCuponSeleccionado(e.target.value)}
                      className={inputCls(false)}
                    >
                      <option value="">Selecciona un descuento</option>
                      <option value="PORCENTAJE_10">10% de descuento</option>
                      <option value="PORCENTAJE_15">15% de descuento</option>
                      <option value="PORCENTAJE_30">30% de descuento</option>
                      <option value="PORCENTAJE_50">50% de descuento</option>
                      <option value="GRATIS">Curso GRATIS</option>
                    </select>
                  </Field>
                  <button
                    type="button"
                    onClick={() => tipoCuponSeleccionado && abrirModalCupon(tipoCuponSeleccionado)}
                    disabled={!tipoCuponSeleccionado}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <FaPlus size={12} /> Crear cupón
                  </button>
                </div>
                {tipoCuponSeleccionado && form.precio ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50 text-sm font-medium text-amber-800 dark:text-amber-200">
                    Precio final: ${calcularPrecioFinal(form.precio, tipoCuponSeleccionado).toFixed(2)}
                  </div>
                ) : null}

                {cupones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Cupones creados ({cupones.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cupones.map((cupon) => (
                        <div key={cupon.id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded">{cupon.codigo}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cuponStyle(cupon.tipo)}`}>{getTipoCuponTexto(cupon.tipo)}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {cupon.usosMaximos} uso{cupon.usosMaximos !== 1 ? "s" : ""} ·{" "}
                              {cupon.fechaExpiracion ? `Vence ${formatDateOnly(cupon.fechaExpiracion)}` : "Sin expiración"}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button type="button" onClick={(e) => copiarCodigo(cupon.codigo, e)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg" title="Copiar">
                              <FaCopy size={13} />
                            </button>
                            <button type="button" onClick={(e) => eliminarCupon(cupon.id, e)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="Eliminar">
                              <FaTrash size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FormCard>
            )}
          </div>

          {/* ── Barra lateral ── */}
          <div className="lg:col-span-1 space-y-6">
            <FormCard icon={<FaImage />} title="Portada" accent="indigo">
              <div className="flex flex-col items-center">
                <CursoImageUpload preview={preview} onImageChange={handleImage} />
                <p className="text-xs text-gray-400 text-center mt-3">Tamaño recomendado: 400×400px</p>
              </div>
            </FormCard>

            <FormCard icon={<FaCog />} title="Configuración" accent="purple">
              <Field label="Cupos disponibles" icon={<FaUsers />} error={errors.cupos}>
                <input
                  name="cupos"
                  type="number"
                  min={0}
                  value={form.cupos}
                  onChange={handleChange}
                  className={inputCls(errors.cupos)}
                />
              </Field>
              {esPagado && (
                <Field label="Precio (USD)" icon={<FaDollarSign />} error={errors.precio}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      name="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={form.precio === 0 ? "" : form.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`${inputCls(errors.precio)} pl-7`}
                    />
                  </div>
                </Field>
              )}
            </FormCard>

            <FormCard icon={<FaBell />} title="Notificaciones" subtitle="Avisar al crear el curso" accent="purple">
              <Toggle
                checked={form.notificarCorreo}
                onChange={(v) => setForm((p) => ({ ...p, notificarCorreo: v }))}
                label="Notificar por correo"
                desc="Los estudiantes recibirán un email"
                color="blue"
              />
              <Toggle
                checked={form.notificarWhatsapp}
                onChange={(v) => setForm((p) => ({ ...p, notificarWhatsapp: v }))}
                label="Notificar por WhatsApp"
                desc="Requiere WhatsApp conectado en Configuración"
                color="green"
              />
            </FormCard>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (<><Spinner /> Creando curso...</>) : (<><FaPaperPlane /> Crear curso</>)}
            </button>
          </div>
        </form>
      </div>

      {/* 🎁 MODAL PARA CREAR CUPÓN */}
      {showCouponModal && (
        <CuponModal
          nuevoCupon={nuevoCupon}
          setNuevoCupon={setNuevoCupon}
          generarCodigoCupon={generarCodigoCupon}
          getTipoCuponTexto={getTipoCuponTexto}
          calcularPrecioConDescuento={calcularPrecioConDescuento}
          precio={form.precio}
          onClose={() => setShowCouponModal(false)}
          onCreate={crearCupon}
        />
      )}
    </div>
  );
}
