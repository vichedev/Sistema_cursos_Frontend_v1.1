import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { FaUserPlus } from "react-icons/fa";
import { City } from "country-state-city";
import InternationalPhoneInput from "../components/InternationalPhoneInput";
import "../styles/phone-input.css";
import { LATAM_COUNTRIES } from "../constants/latam-countries";
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeName,
  sanitizeUsername,
} from "../utils/sanitize";

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
    [callback, delay],
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
    pais: "",
    ciudad: "",
    empresa: "",
    cargo: "Gerente",
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
    pais: "",
  });

  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  // País seleccionado
  const selectedCountry = LATAM_COUNTRIES.find((c) => c.code === form.pais);

  // Cargar ciudades cuando cambia el país
  useEffect(() => {
    const fetchCiudades = async () => {
      if (!form.pais) {
        setCiudades([]);
        return;
      }

      setLoadingCiudades(true);
      try {
        const cities = City.getCitiesOfCountry(form.pais) || [];
        setCiudades(cities);
      } catch (error) {
        console.error("Error cargando ciudades:", error);
        setCiudades([]);
      } finally {
        setLoadingCiudades(false);
      }
    };

    fetchCiudades();
  }, [form.pais]);

  // Opciones de países
  const countryOptions = useMemo(
    () =>
      LATAM_COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.name} ({country.dialCode})
        </option>
      )),
    [],
  );

  // Validar formato de email
  const isValidEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  // Validar formato de identificación según país
  const isValidCedula = useCallback((cedula, pais) => {
    if (!pais || !cedula) return false;
    const country = LATAM_COUNTRIES.find((c) => c.code === pais);
    if (!country) return false;

    // Limpiar caracteres especiales
    const cleanValue = cedula.replace(/[-\s.]/g, "");
    return country.idPattern.test(cleanValue);
  }, []);

  // ✅ MEJORADO: Validar formato internacional del celular
  const isValidCelular = useCallback((celular) => {
    if (!celular) return false;
    // Debe empezar con + y tener entre 8 y 15 dígitos después
    return /^\+\d{8,15}$/.test(celular);
  }, []);

  // ✅ SIMPLIFICADO: Manejar cambio de celular
  const handlePhoneChange = (phoneValue) => {
    setForm((prev) => ({ ...prev, celular: phoneValue || "" }));

    if (fieldErrors.celular) {
      setFieldErrors((prev) => ({ ...prev, celular: "" }));
    }
  };

  // Validaciones en tiempo real con debounce
  const debouncedValidate = useDebounce((field, value) => {
    let error = "";

    switch (field) {
      case "correo":
        if (value && !isValidEmail(value)) {
          error = "Correo electrónico inválido";
        }
        break;
      case "cedula":
        if (value && !isValidCedula(value, form.pais)) {
          const country = LATAM_COUNTRIES.find((c) => c.code === form.pais);
          error = country
            ? `Formato inválido. Ej: ${country.idExample}`
            : "Formato inválido";
        }
        break;
      case "celular":
        if (value && !isValidCelular(value)) {
          error = "Número de celular inválido (debe incluir código de país)";
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
      case "pais":
        if (!value) {
          error = "El país es obligatorio";
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

    if (name === "usuario" || name === "correo" || name === "cedula") {
      sanitizedValue = value.replace(/\s/g, "");
    }

    switch (name) {
      case "correo":
        sanitizedValue = sanitizeEmail(sanitizedValue);
        break;
      case "usuario":
        sanitizedValue = sanitizeUsername(sanitizedValue);
        break;
      case "cedula":
        sanitizedValue = sanitizeNumber(sanitizedValue);
        break;
      case "password":
        sanitizedValue = sanitizeInput(sanitizedValue);
        break;
      case "ciudad":
        sanitizedValue = sanitizeInput(sanitizedValue);
        break;
    }

    setForm({ ...form, [name]: sanitizedValue });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    debouncedValidate(name, sanitizedValue);
  };

  // Validación completa del formulario
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

    if (!form.pais) {
      errors.pais = "El país es obligatorio";
    }

    if (!form.usuario.trim()) {
      errors.usuario = "El usuario es obligatorio";
    } else if (form.usuario.length < 3) {
      errors.usuario = "El usuario debe tener al menos 3 caracteres";
    }

    if (!form.cedula.trim()) {
      errors.cedula = "La identificación es obligatoria";
    } else if (!isValidCedula(form.cedula, form.pais)) {
      const country = LATAM_COUNTRIES.find((c) => c.code === form.pais);
      errors.cedula = country
        ? `Formato inválido. Ej: ${country.idExample}`
        : "Formato de identificación inválido";
    }

    if (!form.celular.trim()) {
      errors.celular = "El celular es obligatorio";
    } else if (!isValidCelular(form.celular)) {
      errors.celular = "Número de celular inválido (ej: +593991234567)";
    }

    if (!form.password.trim()) {
      errors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!form.ciudad.trim()) {
      errors.ciudad = "La ciudad es obligatoria";
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Manejar errores del backend
  const handleBackendErrors = (errorResponse) => {
    const errorData = errorResponse?.data;

    // Si el backend envía un array de errores
    if (errorData?.message && Array.isArray(errorData.message)) {
      const errores = errorData.message
        .map((err) =>
          typeof err === "object" ? err.message || JSON.stringify(err) : err,
        )
        .join("\n");

      Swal.fire({
        title: "Error de validación",
        text: errores,
        icon: "error",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "swal2-modern dark:bg-gray-800",
        },
      });

      // Actualizar errores en campos específicos
      errorData.message.forEach((err) => {
        if (err.property === "celular") {
          setFieldErrors((prev) => ({ ...prev, celular: err.message }));
        } else if (err.property === "correo") {
          setFieldErrors((prev) => ({ ...prev, correo: err.message }));
        } else if (err.property === "usuario") {
          setFieldErrors((prev) => ({ ...prev, usuario: err.message }));
        } else if (err.property === "cedula") {
          setFieldErrors((prev) => ({ ...prev, cedula: err.message }));
        }
      });
    }
    // Si es un string de error simple
    else if (typeof errorData?.message === "string") {
      const errorMsg = errorData.message;

      if (errorMsg.includes("celular")) {
        setFieldErrors((prev) => ({ ...prev, celular: errorMsg }));
      } else if (errorMsg.includes("correo")) {
        setFieldErrors((prev) => ({ ...prev, correo: errorMsg }));
      } else if (errorMsg.includes("usuario")) {
        setFieldErrors((prev) => ({ ...prev, usuario: errorMsg }));
      } else if (
        errorMsg.includes("cédula") ||
        errorMsg.includes("identificación")
      ) {
        setFieldErrors((prev) => ({ ...prev, cedula: errorMsg }));
      } else {
        Swal.fire({
          title: "Error",
          text: errorMsg,
          icon: "error",
          confirmButtonText: "Aceptar",
          customClass: {
            popup: "swal2-modern dark:bg-gray-800",
          },
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isValid = validateForm();
    if (!isValid) {
      Swal.fire({
        title: "Error de validación",
        text: "Por favor corrige los errores del formulario",
        icon: "error",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-modern dark:bg-gray-800",
        },
      });
      setIsLoading(false);
      return;
    }

    let timeoutId;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000);

      const formDataToSend = {
        ...form,
        nombres: sanitizeName(form.nombres),
        apellidos: sanitizeName(form.apellidos),
        empresa: form.empresa ? sanitizeInput(form.empresa) : form.empresa,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        formDataToSend,
        {
          signal: controller.signal,
          timeout: 30000,
        },
      );

      clearTimeout(timeoutId);

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
                  <li style="color: inherit;">Revisa tu bandeja de entrada</li>
                  <li style="color: inherit;">Busca el correo de verificación</li>
                  <li style="color: inherit;">Haz clic en el botón para verificar tu cuenta</li>
                </ul>
              </div>
            </div>
          `,
          icon: "success",
          timer: 8000,
          showConfirmButton: true,
          confirmButtonText: "Entendido",
          customClass: {
            popup: "swal2-modern",
          },
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      console.error("❌ Error completo:", err);
      console.error("❌ Response data:", err.response?.data);

      if (err.name === "AbortError" || err.code === "ECONNABORTED") {
        Swal.fire({
          title: "Tiempo de espera agotado",
          text: "El servidor está tardando demasiado. Por favor, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } else if (err.response?.status === 400) {
        handleBackendErrors(err.response);
      } else {
        Swal.fire({
          title: "Error",
          text: "Ha ocurrido un error inesperado",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      {/* Blobs decorativos — igual que Login */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-200 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Botón volver */}
        <div className="mb-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al inicio
          </a>
        </div>

        {/* Card principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-700 overflow-hidden">
          {/* Header azul */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <img src="/logo_render.png" alt="Logo" className="h-14 w-auto" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">MAAT ACADEMY</h1>
            <p className="text-blue-200 text-sm mt-1">
              Crea tu cuenta y accede a todos los cursos
            </p>
          </div>

          {/* Formulario */}
          <div className="p-8">
            {/* Título, icono y descripción */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <FaUserPlus
                  className="text-blue-600 dark:text-blue-400"
                  size={32}
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Crear Cuenta
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Completa tus datos para registrarte
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fila 1: Nombres y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nombres"
                    placeholder="Ej: Juan Carlos"
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      fieldErrors.nombres
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="apellidos"
                    placeholder="Ej: Pérez García"
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      fieldErrors.apellidos
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
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
              </div>

              {/* Fila 2: País y Celular */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    País <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pais"
                    value={form.pais}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      fieldErrors.pais
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Selecciona tu país</option>
                    {countryOptions}
                  </select>
                  {fieldErrors.pais && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.pais}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Celular <span className="text-red-500">*</span>
                  </label>
                  <InternationalPhoneInput
                    value={form.celular}
                    onChange={handlePhoneChange}
                    error={fieldErrors.celular}
                    country={form.pais}
                  />
                  {fieldErrors.celular && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.celular}
                    </p>
                  )}
                </div>
              </div>

              {/* Fila 3: Correo y Usuario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      fieldErrors.correo
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="usuario"
                    placeholder="usuario123"
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      fieldErrors.usuario
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
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
              </div>

              {/* Fila 4: Identificación y Ciudad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {selectedCountry
                      ? `${selectedCountry.idFormat}`
                      : "Identificación"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="cedula"
                    placeholder={
                      selectedCountry
                        ? `Ej: ${selectedCountry.idExample}`
                        : "Número de identificación"
                    }
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      fieldErrors.cedula
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  {loadingCiudades ? (
                    <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <select
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      required
                      disabled={!form.pais || ciudades.length === 0}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        fieldErrors.ciudad
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } ${
                        !form.pais || ciudades.length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">Selecciona tu ciudad</option>
                      {ciudades.map((city) => (
                        <option
                          key={`${city.name}-${city.latitude}`}
                          value={city.name}
                        >
                          {city.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {fieldErrors.ciudad && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {fieldErrors.ciudad}
                    </p>
                  )}
                </div>
              </div>

              {/* Fila 5: Empresa y Cargo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Empresa
                  </label>
                  <input
                    name="empresa"
                    placeholder="Nombre de tu empresa (opcional)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={handleChange}
                    value={form.empresa}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cargo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Gerente">Gerente</option>
                    <option value="Técnico">Técnico</option>
                  </select>
                </div>
              </div>

              {/* Fila 6: Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength="6"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    fieldErrors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
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
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
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
                    "Crear Cuenta"
                  )}
                </button>
              </div>

              {/* Link a login */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Inicia sesión aquí
                </a>
              </div>
            </form>
          </div>
          {/* fin div formulario */}
        </div>
        {/* fin card */}
      </div>
      {/* fin max-w-2xl */}

      {/* Estilos SweetAlert2 */}
      <style>{`
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .swal2-modern {
    border-radius: 1.5rem !important;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important;
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
