// src/pages/Login.jsx
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
      value = value.includes("@") ? sanitizeEmail(value) : sanitizeInput(value);
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
        form,
      );

      // ✅ Guardar access token (igual que antes — compatibilidad total)
      localStorage.setItem("token", res.data.token);
      // ✅ NUEVO: guardar refresh token para renovación automática
      localStorage.setItem("refreshToken", res.data.refreshToken);

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
        html: `Hola <strong>${res.data.nombres || res.data.usuario}</strong>, has iniciado sesión correctamente.`,
        icon: "success",
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
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

      let errorMessage = "Credenciales incorrectas";

      if (err.response?.data) {
        const errorData = err.response.data;
        if (Array.isArray(errorData)) {
          errorMessage = errorData
            .map((e) => (typeof e === "object" ? e.message : String(e)))
            .join(", ");
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message
            .map((i) => (typeof i === "object" ? i.message : String(i)))
            .join(", ");
        } else if (errorData.message && typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (typeof errorData === "object") {
          const messages = [];
          for (const key in errorData) {
            if (typeof errorData[key] === "string")
              messages.push(errorData[key]);
            else if (Array.isArray(errorData[key]))
              messages.push(
                ...errorData[key].map((m) =>
                  typeof m === "object" ? m.message : String(m),
                ),
              );
          }
          errorMessage =
            messages.length > 0 ? messages.join(", ") : "Error de validación";
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      }

      const errorMessageString = Array.isArray(errorMessage)
        ? errorMessage.map((i) => i.message || i).join(", ")
        : String(errorMessage);

      if (errorMessageString.toLowerCase().includes("verificada")) {
        setShowResendButton(true);
        setEmailToResend(form.usuario.includes("@") ? form.usuario : "");
        Swal.fire({
          title: "¡Cuenta no verificada!",
          html: "Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico para activar tu cuenta.",
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
        { email: emailToResend },
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
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "No se pudo reenviar el correo. Por favor intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
        customClass: { popup: "swal2-modern" },
      });
    } finally {
      setIsResending(false);
    }
  };

  // ── JSX — idéntico al original ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Blobs decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-200 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* ── Botón volver a la landing ── */}
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

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-blue-100 dark:border-gray-700">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-2xl shadow-md border border-blue-200 dark:border-blue-600">
              <img src="/logo_render.png" alt="Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
              MAAT ACADEMY
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Sistema de Gestión Educativa
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Usuario o correo electrónico
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                placeholder="usuario o correo@ejemplo.com"
                autoComplete="username"
                required
                className="w-full px-4 py-3 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400"
                onChange={handleChange}
                value={form.usuario}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-300">
                  Contraseña
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
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
                className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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
                  className={`px-3 py-2 text-sm rounded transition-colors flex items-center justify-center min-w-[100px] ${isResending ? "bg-blue-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .swal2-modern { border-radius:1.5rem!important;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)!important;padding:2rem!important;background:white!important; }
        @media(prefers-color-scheme:dark){.swal2-modern{background:#1f2937!important;color:white!important}}
        .swal2-title-custom{font-size:1.875rem!important;font-weight:700!important;color:#1a202c!important;margin-bottom:.5rem!important}
        @media(prefers-color-scheme:dark){.swal2-title-custom{color:white!important}}
        .swal2-html-container-custom{font-size:1.125rem!important;color:#4a5568!important;line-height:1.5!important}
        @media(prefers-color-scheme:dark){.swal2-html-container-custom{color:#d1d5db!important}}
        .swal2-confirm{background-color:#3b82f6!important;border-radius:.75rem!important;font-weight:600!important;padding:.75rem 1.5rem!important;transition:all .2s ease-in-out!important}
        .swal2-confirm:hover{background-color:#2563eb!important}
      `}</style>
    </div>
  );
}
