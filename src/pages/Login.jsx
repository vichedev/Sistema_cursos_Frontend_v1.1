import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { sanitizeInput, sanitizeEmail } from "../utils/sanitize";

export default function Login() {
  const [form, setForm] = useState({ usuario: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [emailToResend, setEmailToResend] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === "usuario") {
      if (value.includes("@")) {
        value = sanitizeEmail(value);
      } else {
        value = sanitizeInput(value);
      }
    } else if (name === "password") {
      value = sanitizeInput(value);
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usuario.trim() || !form.password.trim()) {
      Swal.fire({
        title: "Campos requeridos",
        text: "Por favor completa todos los campos",
        icon: "warning",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
      });
      return;
    }

    if (form.password.length < 6) {
      Swal.fire({
        title: "Contraseña muy corta",
        text: "La contraseña debe tener al menos 6 caracteres",
        icon: "warning",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
      });
      return;
    }

    setIsLoading(true);
    setShowResendButton(false);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("rol", res.data.rol);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("usuario", res.data.usuario);
      localStorage.setItem("nombres", res.data.nombres);
      localStorage.setItem("apellidos", res.data.apellidos || "");
      localStorage.setItem("correo", res.data.correo || "");
      localStorage.setItem("celular", res.data.celular || "");
      localStorage.setItem("cargo", res.data.cargo || "");

      Swal.fire({
        title: "¡Bienvenido!",
        html: `Hola <strong>${
          res.data.nombres || res.data.usuario
        }</strong>, has iniciado sesión correctamente.`,
        icon: "success",
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      }).then(() => {
        if (res.data.rol === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/estudiante/dashboard", { replace: true });
        }
      });
    } catch (err) {
      console.error("❌ Error completo:", err.response);

      // ✅ CORREGIDO: Manejo robusto de errores
      let errorMessage = "Credenciales incorrectas";

      if (err.response?.data) {
        const errorData = err.response.data;

        // Si es un array de errores de validación
        if (Array.isArray(errorData)) {
          errorMessage = errorData
            .map((error) =>
              typeof error === "object" ? error.message : String(error)
            )
            .join(", ");
        }
        // Si es un objeto con propiedad "message" que es array
        else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message
            .map((item) =>
              typeof item === "object" ? item.message : String(item)
            )
            .join(", ");
        }
        // Si es un objeto con propiedad "message" que es string
        else if (errorData.message && typeof errorData.message === "string") {
          errorMessage = errorData.message;
        }
        // Si es un objeto con propiedades de error individuales
        else if (typeof errorData === "object") {
          // Buscar cualquier propiedad que contenga el mensaje de error
          const messages = [];
          for (const key in errorData) {
            if (typeof errorData[key] === "string") {
              messages.push(errorData[key]);
            } else if (Array.isArray(errorData[key])) {
              messages.push(
                ...errorData[key].map((msg) =>
                  typeof msg === "object" ? msg.message : String(msg)
                )
              );
            }
          }
          errorMessage =
            messages.length > 0 ? messages.join(", ") : "Error de validación";
        }
        // Si es un string directo
        else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      }

      // ✅ CORREGIDO: Convertir a string si es un array
      const errorMessageString = Array.isArray(errorMessage)
        ? errorMessage.map((item) => item.message || item).join(", ")
        : String(errorMessage);

      if (errorMessageString.toLowerCase().includes("verificada")) {
        setShowResendButton(true);
        setEmailToResend(form.usuario.includes("@") ? form.usuario : "");
        Swal.fire({
          title: "¡Cuenta no verificada!",
          html: `Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico para activar tu cuenta.`,
          icon: "warning",
          confirmButtonText: "Entendido",
          customClass: {
            popup: "swal2-modern",
            title: "swal2-title-custom",
            htmlContainer: "swal2-html-container-custom",
          },
        });
      } else {
        Swal.fire({
          title: "¡Error de inicio de sesión!",
          html: `Ocurrió un problema: <strong>${errorMessageString}</strong>. Por favor, inténtalo de nuevo.`,
          icon: "error",
          confirmButtonText: "Aceptar",
          customClass: {
            popup: "swal2-modern",
            title: "swal2-title-custom",
            htmlContainer: "swal2-html-container-custom",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailToResend) {
      Swal.fire({
        title: "¡Correo requerido!",
        html: "Por favor, ingresa tu correo electrónico para reenviar el enlace de verificación.",
        icon: "info",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
      });
      return;
    }

    setIsResending(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-verification`,
        { email: emailToResend }
      );
      Swal.fire({
        title: "¡Correo reenviado!",
        html: "Hemos reenviado el correo de verificación. Por favor, revisa tu bandeja de entrada y también la carpeta de spam.",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      setShowResendButton(false);
    } catch (err) {
      // ✅ CORREGIDO: Manejar error aquí también
      let errorMessage = "Inténtalo de nuevo más tarde.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
      }

      Swal.fire({
        title: "¡Error al reenviar!",
        html: `No pudimos reenviar el correo: <strong>${errorMessage}</strong>`,
        icon: "error",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-6 relative">
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

      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row z-10">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-600 to-blue-800 p-12 flex-col justify-center rounded-l-3xl">
          <img
            src="/logo_render.png"
            alt="Libro abierto"
            className="mb-8 max-h-72 mx-auto object-contain"
          />
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
            Aprende Redes y Telecomunicaciones
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed drop-shadow-md">
            Ingresa con tu usuario y contraseña para acceder a tus cursos y
            aprovechar todo nuestro contenido de aprendizaje.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-white mb-2">
              Inicia sesión
            </h1>
            <p className="text-blue-700 dark:text-blue-300">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
              >
                Usuario o Correo electrónico
              </label>
              <input
                id="usuario"
                name="usuario"
                placeholder="usuario o email@ejemplo.com"
                autoComplete="username"
                required
                className="w-full px-4 py-3 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400"
                onChange={handleChange}
                value={form.usuario}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400"
                onChange={handleChange}
                value={form.password}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
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
                  "Iniciar sesión"
                )}
              </button>
            </div>
          </form>

          {showResendButton && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                ¿No recibiste el correo de verificación?
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={emailToResend}
                  onChange={(e) => setEmailToResend(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white placeholder-gray-400"
                  disabled={isResending}
                />
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className={`px-3 py-2 text-sm rounded transition-colors flex items-center justify-center min-w-[100px] ${
                    isResending
                      ? "bg-blue-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isResending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Enviando...
                    </>
                  ) : (
                    "Reenviar"
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-blue-600 dark:text-blue-400">
            ¿No tienes una cuenta?{" "}
            <a
              href="/register"
              className="font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Regístrate
            </a>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-blue-400 dark:text-blue-500 text-center w-full z-10">
        &copy; {new Date().getFullYear()} Sistema de Cursos MAAT ACADEMY. Todos
        los derechos reservados.
      </footer>

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
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 2rem !important;
          background: white !important;
        }
        
        @media (prefers-color-scheme: dark) {
          .swal2-modern {
            background: #1f2937 !important;
            color: white !important;
          }
        }
        
        .swal2-title-custom {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          color: #1a202c !important;
          margin-bottom: 0.5rem !important;
        }
        
        @media (prefers-color-scheme: dark) {
          .swal2-title-custom {
            color: white !important;
          }
        }
        
        .swal2-html-container-custom {
          font-size: 1.125rem !important;
          color: #4a5568 !important;
          line-height: 1.5 !important;
        }
        
        @media (prefers-color-scheme: dark) {
          .swal2-html-container-custom {
            color: #d1d5db !important;
          }
        }
        
        .swal2-success .swal2-success-ring {
          border-color: #3b82f6 !important;
        }
        .swal2-success [class^=swal2-success-line][class$=long] {
          background-color: #3b82f6 !important;
        }
        .swal2-success [class^=swal2-success-line][class$=tip] {
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
