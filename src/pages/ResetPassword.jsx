import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exitoso, setExitoso] = useState(false);

  // Si no hay token en la URL, redirigir al login
  useEffect(() => {
    if (!token) {
      Swal.fire({
        title: "Enlace inválido",
        text: "El enlace de recuperación no es válido. Por favor solicita uno nuevo.",
        icon: "error",
        confirmButtonText: "Ir al login",
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
      }).then(() => navigate("/login"));
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword.length < 6) {
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

    if (form.newPassword !== form.confirmPassword) {
      Swal.fire({
        title: "Las contraseñas no coinciden",
        text: "Por favor verifica que ambas contraseñas sean iguales",
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
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
        { token, newPassword: form.newPassword },
      );

      setExitoso(true);
    } catch (err) {
      const mensaje =
        err.response?.data?.message ||
        "El enlace es inválido o ya expiró. Por favor solicita uno nuevo.";

      Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonText: "Aceptar",
        customClass: {
          popup: "swal2-modern",
          title: "swal2-title-custom",
          htmlContainer: "swal2-html-container-custom",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/logoadmin.png"
              alt="Logo MAAT"
              className="h-16 mx-auto mb-4 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <h1 className="text-2xl font-bold text-blue-800 dark:text-white">
              {exitoso ? "¡Contraseña actualizada!" : "Nueva contraseña"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {exitoso
                ? "Ya puedes iniciar sesión"
                : "Ingresa y confirma tu nueva contraseña"}
            </p>
          </div>

          {/* Estado: exitoso */}
          {exitoso ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Tu contraseña ha sido restablecida correctamente. Ahora puedes
                iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-md transition-all duration-200"
              >
                Ir al inicio de sesión
              </button>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nueva contraseña */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400 ${
                      form.confirmPassword &&
                      form.newPassword !== form.confirmPassword
                        ? "border-red-400 dark:border-red-500"
                        : "border-blue-300 dark:border-gray-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                  >
                    {showConfirm ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Indicador de coincidencia */}
                {form.confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${
                      form.newPassword === form.confirmPassword
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {form.newPassword === form.confirmPassword
                      ? "✅ Las contraseñas coinciden"
                      : "❌ Las contraseñas no coinciden"}
                  </p>
                )}
              </div>

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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Actualizando...
                  </div>
                ) : (
                  "Restablecer contraseña"
                )}
              </button>

              <div className="text-center text-sm pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}
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
        .swal2-modern { border-radius: 1.5rem !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05) !important; padding: 2rem !important; background: white !important; }
        @media (prefers-color-scheme: dark) { .swal2-modern { background: #1f2937 !important; color: white !important; } }
        .swal2-title-custom { font-size: 1.875rem !important; font-weight: 700 !important; color: #1a202c !important; margin-bottom: .5rem !important; }
        @media (prefers-color-scheme: dark) { .swal2-title-custom { color: white !important; } }
        .swal2-html-container-custom { font-size: 1.125rem !important; color: #4a5568 !important; line-height: 1.5 !important; }
        @media (prefers-color-scheme: dark) { .swal2-html-container-custom { color: #d1d5db !important; } }
        .swal2-confirm { background-color: #3b82f6 !important; border-radius: .75rem !important; font-weight: 600 !important; padding: .75rem 1.5rem !important; transition: all .2s ease-in-out !important; }
        .swal2-confirm:hover { background-color: #2563eb !important; }
      `}</style>
    </div>
  );
}
