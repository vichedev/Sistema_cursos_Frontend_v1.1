import { useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ OPTIMIZADO: Memoizar la URL de la API
  const API_URL = useMemo(
    () => import.meta.env.VITE_API_URL || `${import.meta.env.VITE_BACKEND_URL}`,
    []
  );

  // ✅ OPTIMIZADO: Memoizar el token de la URL
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  }, [location.search]);

  // ✅ OPTIMIZADO: useCallback para evitar recreaciones
  const handleVerify = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado en la URL.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // ✅ OPTIMIZADO: Timeout y AbortController para mejor rendimiento
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.get(
        `${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        { signal: controller.signal, timeout: 10000 }
      );

      clearTimeout(timeoutId);
      setStatus("success");
      setMessage(response.data.message || "Correo verificado correctamente.");
    } catch (error) {
      // ✅ OPTIMIZADO: Manejo de errores más eficiente
      let errorMessage = "Error verificando el correo electrónico.";

      if (error.name === "AbortError" || error.code === "ECONNABORTED") {
        errorMessage =
          "La verificación está tardando demasiado. Por favor, intenta nuevamente.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (errorMessage === "Token de verificación inválido o ya utilizado") {
        setMessage(
          "Tu correo ya fue verificado anteriormente. Puedes iniciar sesión."
        );
        setStatus("success");
      } else {
        setMessage(errorMessage);
        setStatus("error");
      }
    }
  }, [token, API_URL]);

  // ✅ OPTIMIZADO: useCallback para navegación
  const handleLoginRedirect = useCallback(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ OPTIMIZADO: Contenido memoizado por estado
  const renderContent = useMemo(() => {
    switch (status) {
      case "idle":
        return (
          <>
            <h1 className="text-3xl font-extrabold text-blue-600 mb-4 dark:text-blue-400">
              Verifica tu correo electrónico
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              Para activar tu cuenta, presiona el botón de abajo para verificar
              tu correo.
            </p>
            <button
              onClick={handleVerify}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600"
              aria-label="Verificar correo"
            >
              Verificar correo electrónico
            </button>
          </>
        );

      case "loading":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg
                  className="animate-spin h-16 w-16 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Cargando"
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
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Verificando correo...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor espera mientras confirmamos tu dirección de correo
              electrónico.
            </p>
          </>
        );

      case "success":
      case "error":
        return (
          <>
            <div
              className={`flex justify-center mb-6 w-20 h-20 rounded-full items-center mx-auto transition-all duration-300 ${
                status === "success"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              } shadow-lg`}
              aria-live="polite"
            >
              {status === "success" ? (
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-10 h-10 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              )}
            </div>
            <h2
              className={`text-3xl font-extrabold mb-4 transition-colors duration-300 ${
                status === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {status === "success"
                ? "¡Correo verificado!"
                : "Error de verificación"}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 px-4 leading-relaxed">
              {message}
            </p>
            <button
              onClick={handleLoginRedirect}
              className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                status === "success"
                  ? "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 focus:ring-green-300 dark:focus:ring-green-600"
                  : "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 focus:ring-red-300 dark:focus:ring-red-600"
              }`}
              aria-label={
                status === "success"
                  ? "Ir a inicio de sesión"
                  : "Volver al inicio de sesión"
              }
            >
              {status === "success"
                ? "Iniciar sesión"
                : "Volver al inicio de sesión"}
            </button>
          </>
        );

      default:
        return null;
    }
  }, [status, message, handleVerify, handleLoginRedirect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* ✅ CORREGIDO: Burbujas decorativas FIJAS que no interfieren con los clicks */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-float pointer-events-none"></div>
      <div className="absolute bottom-20 right-16 w-16 h-16 bg-blue-300 dark:bg-blue-700 rounded-full opacity-30 animate-float animation-delay-1000 pointer-events-none"></div>
      <div className="absolute top-1/3 right-20 w-12 h-12 bg-blue-400 dark:bg-blue-600 rounded-full opacity-40 animate-float animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-20 w-14 h-14 bg-blue-500 dark:bg-blue-500 rounded-full opacity-50 animate-float animation-delay-3000 pointer-events-none"></div>

      {/* Contenedor principal */}
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl max-w-md w-full p-8 md:p-10 text-center relative z-10 border border-blue-100 dark:border-gray-700">
        {renderContent}
      </div>

      {/* ✅ OPTIMIZADO: Estilos CSS en línea para mejor rendimiento */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        /* Mejoras de accesibilidad y rendimiento */
        @media (prefers-reduced-motion: reduce) {
          .animate-float {
            animation: none;
          }
          .transform {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
