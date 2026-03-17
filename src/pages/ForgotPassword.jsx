import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { sanitizeEmail } from "../utils/sanitize";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "Por favor ingresa tu correo electrónico",
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
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        { correo: sanitizeEmail(correo) },
      );

      // Siempre mostramos éxito (el backend no revela si el correo existe)
      setEnviado(true);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema. Por favor inténtalo de nuevo.",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 relative overflow-hidden">
      {/* Blobs decorativos igual que en Login */}
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
              {enviado ? "¡Correo enviado!" : "¿Olvidaste tu contraseña?"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {enviado
                ? "Revisa tu bandeja de entrada"
                : "Ingresa tu correo y te enviaremos un enlace para restablecerla"}
            </p>
          </div>

          {/* Estado: correo enviado */}
          {enviado ? (
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Si el correo{" "}
                <strong className="text-blue-600 dark:text-blue-400">
                  {correo}
                </strong>{" "}
                está registrado, recibirás las instrucciones en breve.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Revisa también tu carpeta de <strong>spam</strong>. El enlace
                expira en 1 hora.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-md transition-all duration-200"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
                >
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 dark:text-white dark:bg-gray-700 placeholder-blue-400 dark:placeholder-gray-400"
                />
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
                    Enviando...
                  </div>
                ) : (
                  "Enviar instrucciones"
                )}
              </button>

              <div className="text-center text-sm text-blue-600 dark:text-blue-400 pt-2">
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
