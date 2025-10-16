import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { FaUserPlus } from "react-icons/fa";
import { City } from "country-state-city";
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeName,
  sanitizeUsername,
} from "../utils/sanitize";

// ✅ Pre-cargar ciudades fuera del componente para optimización
const ciudadesEcuador = City.getCitiesOfCountry("EC") || [];

// ✅ Hook debounce personalizado
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    celular: "",
    cedula: "",
    ciudad: "",
    empresa: "",
    rol: "Gerente",
    usuario: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    correo: "",
    usuario: "",
    cedula: "",
    celular: "",
    nombres: "",
    apellidos: "",
    password: "",
    ciudad: "",
  });

  // ✅ Memoizar las opciones de ciudades para optimización
  const ciudadOptions = useMemo(
    () =>
      ciudadesEcuador.map((city) => (
        <option
          key={`${city.name}-${city.latitude}-${city.longitude}`}
          value={city.name}
        >
          {city.name}
        </option>
      )),
    []
  );

  // Validar formato de email
  const isValidEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  // Validar formato de cédula (solo números, 10 dígitos para Ecuador)
  const isValidCedula = useCallback((cedula) => {
    return /^\d{10}$/.test(cedula);
  }, []);

  // Validar formato de celular (solo números, 10 dígitos)
  const isValidCelular = useCallback((celular) => {
    return /^\d{10}$/.test(celular);
  }, []);

  // ✅ Validaciones en tiempo real con debounce
  const debouncedValidate = useDebounce((field, value) => {
    let error = "";

    switch (field) {
      case "correo":
        if (value && !isValidEmail(value)) {
          error = "Correo electrónico inválido";
        }
        break;
      case "cedula":
        if (value && !isValidCedula(value)) {
          error = "La cédula debe tener 10 dígitos";
        }
        break;
      case "celular":
        if (value && !isValidCelular(value)) {
          error = "El celular debe tener 10 dígitos";
        }
        break;
      case "usuario":
        if (value && value.length < 3) {
          error = "El usuario debe tener al menos 3 caracteres";
        }
        break;
      case "nombres":
        if (!value.trim()) {
          error = "Los nombres son obligatorios";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "Los nombres solo pueden contener letras y espacios";
        }
        break;
      case "apellidos":
        if (!value.trim()) {
          error = "Los apellidos son obligatorios";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "Los apellidos solo pueden contener letras y espacios";
        }
        break;
      case "password":
        if (value && value.length < 6) {
          error = "La contraseña debe tener al menos 6 caracteres";
        }
        break;
      case "ciudad":
        if (!value.trim()) {
          error = "La ciudad es obligatoria";
        }
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  }, 500);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // ✅ SOLO eliminar espacios de campos que NO deben tenerlos
    if (
      name === "usuario" ||
      name === "correo" ||
      name === "cedula" ||
      name === "celular"
    ) {
      sanitizedValue = value.replace(/\s/g, "");
    }
    // ✅ Para nombres, apellidos y empresa - DEJAR EL VALOR ORIGINAL CON ESPACIOS
    else {
      sanitizedValue = value; // Mantener espacios tal cual
    }

    // ✅ APLICAR SANITIZACIÓN ESPECÍFICA POR CAMPO
    switch (name) {
      case "correo":
        sanitizedValue = sanitizeEmail(sanitizedValue);
        break;
      case "usuario":
        sanitizedValue = sanitizeUsername(sanitizedValue);
        break;
      case "cedula":
      case "celular":
        sanitizedValue = sanitizeNumber(sanitizedValue);
        break;
      case "password":
        sanitizedValue = sanitizeInput(sanitizedValue);
        break;
      case "ciudad":
        sanitizedValue = sanitizeInput(sanitizedValue);
        break;
      case "nombres":
      case "apellidos":
        // ✅ NO aplicar sanitización durante escritura para permitir corrección
        break;
      case "empresa":
        // Mantener valor original
        break;
      default:
        break;
    }

    setForm({ ...form, [name]: sanitizedValue });

    // Limpiar errores cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // ✅ Validación en tiempo real con debounce
    debouncedValidate(name, sanitizedValue);
  };

  // ✅ FUNCIÓN: Validación completa del formulario
  const validateForm = () => {
    const errors = {};

    if (!form.nombres.trim()) {
      errors.nombres = "Los nombres son obligatorios";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombres)) {
      errors.nombres = "Los nombres solo pueden contener letras y espacios";
    }

    if (!form.apellidos.trim()) {
      errors.apellidos = "Los apellidos son obligatorios";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellidos)) {
      errors.apellidos = "Los apellidos solo pueden contener letras y espacios";
    }

    if (!form.correo.trim()) {
      errors.correo = "El correo electrónico es obligatorio";
    } else if (!isValidEmail(form.correo)) {
      errors.correo = "Por favor, ingresa un correo electrónico válido";
    }

    if (!form.usuario.trim()) {
      errors.usuario = "El usuario es obligatorio";
    } else if (form.usuario.length < 3) {
      errors.usuario = "El usuario debe tener al menos 3 caracteres";
    }

    if (!form.cedula.trim()) {
      errors.cedula = "La cédula es obligatoria";
    } else if (!isValidCedula(form.cedula)) {
      errors.cedula = "La cédula debe tener 10 dígitos numéricos";
    }

    if (!form.celular.trim()) {
      errors.celular = "El celular es obligatorio";
    } else if (!isValidCelular(form.celular)) {
      errors.celular = "El celular debe tener 10 dígitos numéricos";
    }

    if (!form.password.trim()) {
      errors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!form.ciudad.trim()) {
      errors.ciudad = "La ciudad es obligatoria";
    }

    // Actualizar errores
    setFieldErrors((prev) => ({ ...prev, ...errors }));

    // Retornar si hay errores
    return Object.keys(errors).length > 0
      ? "Por favor corrige los errores del formulario"
      : null;
  };

  // ✅ FUNCIÓN MEJORADA: Manejar errores del backend
  const handleBackendErrors = (errorResponse) => {
    const backendErrors = errorResponse?.data?.message || [];

    // Si es un array de errores de validación
    if (Array.isArray(backendErrors)) {
      const newErrors = {};

      backendErrors.forEach((error) => {
        if (error.property && error.message) {
          newErrors[error.property] = error.message;
        }
      });

      setFieldErrors((prev) => ({ ...prev, ...newErrors }));

      // Mostrar el primer error en un modal
      if (backendErrors.length > 0) {
        const firstError = backendErrors[0];
        Swal.fire({
          title: "¡Registro Exitoso! ✅",
          html: `
    <div style="text-align: left;">
      <p style="margin-bottom: 15px;">${
        res.data.message || "Usuario registrado correctamente."
      }</p>
      <div style="background: rgba(248, 249, 250, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; backdrop-filter: blur(10px);">
        <strong style="display: block; margin-bottom: 10px;">📧 Proceso de verificación:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li style="margin-bottom: 5px;">Revisa tu bandeja de entrada en los próximos segundos</li>
          <li style="margin-bottom: 5px;">Busca el correo de <strong>"Cursos MAAT - Verificación"</strong></li>
          <li style="margin-bottom: 5px;">Haz clic en el botón de verificación</li>
          <li>¡Listo! Podrás iniciar sesión</li>
        </ul>
      </div>
      <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
        <em>¿No ves el correo? Revisa la carpeta de spam.</em>
      </p>
    </div>
  `,
          icon: "success",
          timer: 8000,
          showConfirmButton: true,
          confirmButtonText: "Entendido",
          customClass: {
            popup: "swal2-modern",
            title: "swal2-title-custom",
            htmlContainer: "swal2-html-container-custom",
            confirmButton: "swal2-confirm-custom",
          },
        }).then(() => {
          navigate("/login");
        });
      }
    }
    // Si es un string de error simple
    else if (typeof backendErrors === "string") {
      Swal.fire({
        title: "Error",
        text: backendErrors,
        icon: "error",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-modern dark:bg-gray-800",
          title: "swal2-title-custom dark:text-white",
          htmlContainer: "swal2-html-container-custom dark:text-gray-300",
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ✅ VALIDACIÓN MEJORADA CON FUNCIÓN DEDICADA
    const validationError = validateForm();
    if (validationError) {
      Swal.fire({
        title: "Error de validación",
        text: validationError,
        icon: "error",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-modern dark:bg-gray-800",
          title: "swal2-title-custom dark:text-white",
          htmlContainer: "swal2-html-container-custom dark:text-gray-300",
          confirmButton: "swal2-confirm-custom",
        },
      });
      setIsLoading(false);
      return;
    }

    let timeoutId;

    try {
      // ✅ AUMENTAR TIMEOUT A 30 SEGUNDOS
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos máximo

      // ✅ APLICAR SANITIZACIÓN FINAL ANTES DE ENVIAR
      const formDataToSend = {
        ...form,
        nombres: sanitizeName(form.nombres),
        apellidos: sanitizeName(form.apellidos),
        empresa: form.empresa ? sanitizeInput(form.empresa) : form.empresa,
      };

      console.log("📤 Enviando registro...");

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        formDataToSend,
        {
          signal: controller.signal,
          timeout: 30000,
        }
      );

      clearTimeout(timeoutId);
      console.log("✅ Respuesta del backend:", res.data);

      // ✅ VERIFICAR SI LA RESPUESTA TIENE success O message
      if (res.data.success || res.data.message) {
        Swal.fire({
          title: "¡Registro Exitoso! ✅",
          html: `
      <div style="color: inherit;">
        <p style="margin-bottom: 15px; color: inherit;">${
          res.data.message || "Usuario registrado correctamente."
        }</p>
        <div style="background: transparent; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; color: inherit;">
          <strong style="color: inherit;">📧 Proceso de verificación:</strong>
          <ul style="margin: 10px 0; padding-left: 20px; color: inherit;">
            <li style="color: inherit;">Revisa tu bandeja de entrada en los próximos segundos</li>
            <li style="color: inherit;">Busca el correo de <strong style="color: inherit;">"Cursos MAAT - Verificación"</strong></li>
            <li style="color: inherit;">Haz clic en el botón de verificación</li>
            <li style="color: inherit;">¡Listo! Podrás iniciar sesión</li>
          </ul>
        </div>
        <p style="margin-top: 15px; font-size: 14px; opacity: 0.8; color: inherit;">
          <em>¿No ves el correo? Revisa la carpeta de spam.</em>
        </p>
      </div>
    `,
          icon: "success",
          timer: 8000,
          showConfirmButton: true,
          confirmButtonText: "Entendido",
          customClass: {
            popup: "swal2-modern",
            title: "swal2-title-custom",
            htmlContainer: "swal2-html-container-custom",
          },
        }).then(() => {
          navigate("/login");
        });
      } else {
        throw new Error("Respuesta del servidor inválida");
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      console.log("🔴 Error en frontend:", err);
      console.log("🔴 Response data:", err.response?.data);

      if (err.name === "AbortError" || err.code === "ECONNABORTED") {
        Swal.fire({
          title: "Tiempo de espera agotado",
          text: "El servidor está tardando demasiado. Por favor, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
          customClass: {
            popup: "swal2-modern dark:bg-gray-800",
            title: "swal2-title-custom dark:text-white",
            htmlContainer: "swal2-html-container-custom dark:text-gray-300",
            confirmButton: "swal2-confirm-custom",
          },
        });
        setIsLoading(false);
        return;
      }

      // ✅ CORREGIDO: AHORA SÍ USAMOS handleBackendErrors
      if (err.response?.status === 400) {
        handleBackendErrors(err.response);
      } else {
        // Manejo de otros errores
        const errorResponse = err.response?.data;

        if (errorResponse?.message) {
          // Verificar si es un error de duplicado
          if (
            errorResponse.message.includes("ya existe") ||
            errorResponse.message.includes("ya está") ||
            errorResponse.message.includes("duplicad")
          ) {
            // Mapear errores a campos específicos
            if (errorResponse.message.includes("Usuario")) {
              setFieldErrors((prev) => ({
                ...prev,
                usuario: errorResponse.message,
              }));
            } else if (errorResponse.message.includes("Correo")) {
              setFieldErrors((prev) => ({
                ...prev,
                correo: errorResponse.message,
              }));
            } else if (errorResponse.message.includes("Cédula")) {
              setFieldErrors((prev) => ({
                ...prev,
                cedula: errorResponse.message,
              }));
            } else {
              Swal.fire({
                title: "Error de registro",
                text: errorResponse.message,
                icon: "error",
                confirmButtonText: "Aceptar",
                customClass: {
                  popup: "swal2-modern dark:bg-gray-800",
                  title: "swal2-title-custom dark:text-white",
                  htmlContainer:
                    "swal2-html-container-custom dark:text-gray-300",
                  confirmButton: "swal2-confirm-custom",
                },
              });
            }
          } else {
            Swal.fire({
              title: "Error de registro",
              text: errorResponse.message,
              icon: "error",
              confirmButtonText: "Aceptar",
              customClass: {
                popup: "swal2-modern dark:bg-gray-800",
                title: "swal2-title-custom dark:text-white",
                htmlContainer: "swal2-html-container-custom dark:text-gray-300",
                confirmButton: "swal2-confirm-custom",
              },
            });
          }
        } else {
          Swal.fire({
            title: "Error de registro",
            text: "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar",
            customClass: {
              popup: "swal2-modern dark:bg-gray-800",
              title: "swal2-title-custom dark:text-white",
              htmlContainer: "swal2-html-container-custom dark:text-gray-300",
              confirmButton: "swal2-confirm-custom",
            },
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-6 relative">
      {/* Botón volver al inicio */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">Volver al sitio</span>
      </button>

      {/* Contenedor principal */}
      <div className="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row z-10">
        {/* Imagen + texto lado izquierdo */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-tr from-blue-600 to-blue-800 p-16 flex-col justify-center rounded-l-3xl">
          <img
            src="/logo_render.png"
            alt="Libro abierto"
            className="mb-8 max-h-72 mx-auto object-contain"
            loading="lazy"
          />
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
            Únete a MAAT ACADEMY
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed drop-shadow-md">
            Completa el formulario para crear tu cuenta y acceder a cursos y
            recursos exclusivos.
          </p>
        </div>

        {/* Formulario lado derecho */}
        <div className="w-full md:w-3/5 p-8 md:p-16 flex flex-col justify-center">
          {/* Título, icono y descripción */}
          <div className="text-center mb-8">
            <FaUserPlus
              className="text-blue-500 dark:text-blue-400 mx-auto mb-3"
              size={44}
            />
            <h1 className="text-3xl font-bold text-blue-900 dark:text-white mb-2">
              Crear Cuenta
            </h1>
            <p className="text-blue-700 dark:text-blue-300">
              Llena los datos para registrarte en la plataforma
            </p>
          </div>

          {/* Formulario con grid responsive */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl w-full mx-auto"
          >
            {/* Nombres */}
            <div>
              <input
                name="nombres"
                placeholder="Nombres"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.nombres
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.nombres}
              />
              {fieldErrors.nombres && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.nombres}
                </p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <input
                name="apellidos"
                placeholder="Apellidos"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.apellidos
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.apellidos}
              />
              {fieldErrors.apellidos && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.apellidos}
                </p>
              )}
            </div>

            {/* Empresa */}
            <div>
              <input
                name="empresa"
                placeholder="Empresa (opcional)"
                className="w-full px-4 py-3 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400"
                onChange={handleChange}
                value={form.empresa}
              />
            </div>

            {/* Correo electrónico */}
            <div className="md:col-span-2">
              <input
                name="correo"
                type="email"
                placeholder="Correo electrónico"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.correo
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.correo}
              />
              {fieldErrors.correo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.correo}
                </p>
              )}
            </div>

            {/* Rol */}
            <div>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700"
              >
                <option value="Gerente">Gerente</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>

            {/* Cédula */}
            <div>
              <input
                name="cedula"
                placeholder="Cédula"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.cedula
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.cedula}
              />
              {fieldErrors.cedula && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.cedula}
                </p>
              )}
            </div>

            {/* Celular */}
            <div>
              <input
                name="celular"
                placeholder="Celular"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.celular
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.celular}
              />
              {fieldErrors.celular && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.celular}
                </p>
              )}
            </div>

            {/* Usuario */}
            <div>
              <input
                name="usuario"
                placeholder="Usuario"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.usuario
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.usuario}
              />
              {fieldErrors.usuario && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.usuario}
                </p>
              )}
            </div>

            {/* Ciudad */}
            <div className="md:col-span-2">
              <select
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 ${
                  fieldErrors.ciudad
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
              >
                <option value="">Selecciona tu ciudad</option>
                {ciudadOptions}
              </select>
              {fieldErrors.ciudad && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.ciudad}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <input
                name="password"
                type="password"
                placeholder="Contraseña"
                required
                minLength="6"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                  fieldErrors.password
                    ? "border-red-500"
                    : "border-blue-300 dark:border-gray-600"
                }`}
                onChange={handleChange}
                value={form.password}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Botón de registro */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 dark:focus:ring-offset-gray-800 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Procesando...
                  </div>
                ) : (
                  "Registrarse"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-blue-600 dark:text-blue-400">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Inicia sesión
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-blue-400 dark:text-blue-500 text-center w-full z-10">
        &copy; {new Date().getFullYear()} Sistema de Cursos MAAT. Todos los
        derechos reservados.
      </footer>

      {/* Animación CSS y estilos SweetAlert2 */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* MODALES SWEETALERT2 - FORZAR HERENCIA DE COLORES */
        .swal2-modern {
          border-radius: 1.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 2rem !important;
          background: white !important;
          color: #1a202c !important;
        }

        @media (prefers-color-scheme: dark) {
          .swal2-modern {
            background: #1f2937 !important;
            color: white !important;
          }
        }

        /* FORZAR QUE TODO EL CONTENIDO HEREDE LOS COLORES */
        .swal2-modern * {
          color: inherit !important;
        }

        .swal2-title-custom {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          color: inherit !important;
          margin-bottom: 0.5rem !important;
        }

        .swal2-html-container-custom {
          font-size: 1.125rem !important;
          color: inherit !important;
          line-height: 1.5 !important;
        }

        /* ESTILOS ESPECÍFICOS PARA EL CONTENEDOR DE INFORMACIÓN */
        .swal2-html-container-custom div {
          background: transparent !important;
        }

        .swal2-html-container-custom ul {
          margin: 10px 0 !important;
          padding-left: 20px !important;
        }

        .swal2-html-container-custom li {
          margin-bottom: 5px !important;
        }

        .swal2-success .swal2-success-ring {
          border-color: #3b82f6 !important;
        }
        .swal2-success [class^="swal2-success-line"][class$="long"] {
          background-color: #3b82f6 !important;
        }
        .swal2-success [class^="swal2-success-line"][class$="tip"] {
          background-color: #3b82f6 !important;
        }
        .swal2-error .swal2-x-mark-line-left,
        .swal2-error .swal2-x-mark-line-right {
          background-color: #ef4444 !important;
        }
        .swal2-warning {
          border-color: #f59e0b !important;
        }
        .swal2-warning .swal2-icon-content {
          color: #f59e0b !important;
        }
        .swal2-info {
          border-color: #3b82f6 !important;
        }
        .swal2-info .swal2-icon-content {
          color: #3b82f6 !important;
        }
        .swal2-confirm {
          background-color: #3b82f6 !important;
          border-radius: 0.75rem !important;
          font-weight: 600 !important;
          padding: 0.75rem 1.5rem !important;
          transition: all 0.2s ease-in-out !important;
        }
        .swal2-confirm:hover {
          background-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
}
