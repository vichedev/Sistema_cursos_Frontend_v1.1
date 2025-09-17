import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_BACKEND_URL}`;

  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const handleVerify = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado en la URL.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message || 'Correo verificado correctamente.');
    } catch (error) {
      const backendMessage = error.response?.data?.message || error.message || 'Error verificando el correo electrónico.';
      if (backendMessage === 'Token de verificación inválido o ya utilizado') {
        setMessage('Tu correo ya fue verificado anteriormente. Puedes iniciar sesión.');
        setStatus('success');
      } else {
        setMessage(backendMessage);
        setStatus('error');
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-orange-100 via-white to-orange-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl max-w-md w-full p-10 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-300 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-orange-400 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>

        {status === 'idle' && (
          <>
            <h1 className="text-3xl font-extrabold text-orange-600 mb-4">Verifica tu correo electrónico</h1>
            <p className="text-gray-700 mb-8">
              Para activar tu cuenta, presiona el botón de abajo para verificar tu correo.
            </p>
            <button
              onClick={handleVerify}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold text-lg shadow-lg hover:from-orange-500 hover:to-orange-700 transition duration-300"
              aria-label="Verificar correo"
            >
              Verificar correo para acceder a tu cuenta
            </button>
          </>
        )}

        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <svg
                className="animate-spin h-16 w-16 text-orange-500"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-orange-600 mb-2">Verificando correo...</h2>
            <p className="text-gray-600">Por favor espera mientras confirmamos tu dirección de correo electrónico.</p>
          </>
        )}

        {(status === 'success' || status === 'error') && (
          <>
            <div
              className={`flex justify-center mb-6 w-20 h-20 rounded-full items-center mx-auto ${status === 'success' ? 'bg-green-100' : 'bg-red-100'
                } shadow-lg`}
              aria-live="polite"
            >
              {status === 'success' ? (
                <svg
                  className="w-10 h-10 text-green-600"
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
                  className="w-10 h-10 text-red-600"
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
              className={`text-3xl font-extrabold mb-4 ${status === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
            >
              {status === 'success' ? '¡Correo verificado!' : 'Error de verificación'}
            </h2>
            <p className="text-gray-700 mb-8 px-4">{message}</p>
            <button
              onClick={handleLoginRedirect}
              className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition duration-300 ${status === 'success'
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800'
                : 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
                }`}
              aria-label="Ir a inicio de sesión"
            >
              {status === 'success' ? 'Iniciar sesión' : 'Volver al inicio de sesión'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}