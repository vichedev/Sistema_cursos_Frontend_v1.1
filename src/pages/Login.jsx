// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [emailToResend, setEmailToResend] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setShowResendButton(false);
    try {
      // console.log('📤 Enviando al login:', form);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, form);
      // console.log('✅ Respuesta del login:', res.data);

      // ✅ GUARDAR TODOS LOS DATOS IMPORTANTES
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('usuario', res.data.usuario);
      localStorage.setItem('nombres', res.data.nombres);
      localStorage.setItem('apellidos', res.data.apellidos || '');
      localStorage.setItem('correo', res.data.correo || '');
      localStorage.setItem('celular', res.data.celular || '');
      localStorage.setItem('cargo', res.data.cargo || '');

      Swal.fire({
        title: '¡Bienvenido!',
        html: `Hola <strong>${res.data.nombres || res.data.usuario}</strong>, has iniciado sesión correctamente.`,
        icon: 'success',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).then(() => {
        // ✅ CORREGIDO: Usar navigate en lugar de window.location.href
        if (res.data.rol === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/estudiante/dashboard', { replace: true });
        }
      });
    } catch (err) {
      console.error('❌ Error completo:', err.response);

      const message = err.response?.data?.message || 'Credenciales incorrectas';
      if (message.includes('verificada')) {
        setShowResendButton(true);
        setEmailToResend(form.usuario.includes('@') ? form.usuario : '');
        Swal.fire({
          title: '¡Cuenta no verificada!',
          html: `Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico para activar tu cuenta.`,
          icon: 'warning',
          confirmButtonText: 'Entendido',
          customClass: {
            popup: 'swal2-modern',
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-html-container-custom'
          }
        });
      } else {
        Swal.fire({
          title: '¡Error de inicio de sesión!',
          html: `Ocurrió un problema: <strong>${message}</strong>. Por favor, inténtalo de nuevo.`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal2-modern',
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-html-container-custom'
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... (el resto del código permanece igual)
  const handleResendVerification = async () => {
    if (!emailToResend) {
      Swal.fire({
        title: '¡Correo requerido!',
        html: 'Por favor, ingresa tu correo electrónico para reenviar el enlace de verificación.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      });
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/resend-verification`, { email: emailToResend });
      Swal.fire({
        title: '¡Correo reenviado!',
        html: 'Hemos reenviado el correo de verificación. Por favor, revisa tu bandeja de entrada y también la carpeta de spam.',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      setShowResendButton(false);
    } catch (err) {
      Swal.fire({
        title: '¡Error al reenviar!',
        html: `No pudimos reenviar el correo: <strong>${err.response?.data?.message || 'Inténtalo de nuevo más tarde.'}</strong>`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6 relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center text-blue-600 hover:text-blue-900 transition-colors duration-200 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Volver al sitio</span>
      </button>

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row z-10">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-600 to-blue-800 p-12 flex-col justify-center rounded-l-3xl">
          <img
            src="/logo_render.png"
            alt="Libro abierto"
            className="mb-8 max-h-72 mx-auto object-contain"
          />
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Aprende Redes y Telecomunicaciones</h2>
          <p className="text-blue-200 text-lg leading-relaxed drop-shadow-md">
            Ingresa con tu usuario y contraseña para acceder a tus cursos y aprovechar todo nuestro contenido de aprendizaje.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Inicia sesión</h1>
            <p className="text-blue-700">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-blue-800 mb-1">
                Usuario o Correo electrónico
              </label>
              <input
                id="usuario"
                name="usuario"
                placeholder="usuario o email@ejemplo.com"
                autoComplete="username"
                required
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-800 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                ) : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          {showResendButton && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm mb-3">
                ¿No recibiste el correo de verificación?
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={emailToResend}
                  onChange={(e) => setEmailToResend(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded text-sm"
                />
                <button
                  onClick={handleResendVerification}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Reenviar
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-blue-600">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="font-medium text-blue-700 hover:text-blue-800">
              Regístrate
            </a>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-blue-400 text-center w-full z-10">
        &copy; {new Date().getFullYear()} Sistema de Cursos RNC. Todos los derechos reservados.
      </footer>

      <style jsx global>{`
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

        /* Estilos personalizados para SweetAlert2 */
        .swal2-modern {
          border-radius: 1.5rem !important; /* Bordes más redondeados */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; /* Sombra más pronunciada */
          padding: 2rem !important;
        }

        .swal2-title-custom {
          font-size: 1.875rem !important; /* text-3xl */
          font-weight: 700 !important; /* font-bold */
          color: #1a202c !important; /* gray-900 */
          margin-bottom: 0.5rem !important;
        }

        .swal2-html-container-custom {
          font-size: 1.125rem !important; /* text-lg */
          color: #4a5568 !important; /* gray-700 */
          line-height: 1.5 !important;
        }

        .swal2-success .swal2-success-ring {
          border-color: #3b82f6 !important; /* blue-500 */
        }
        .swal2-success [class^=swal2-success-line][class$=long] {
          background-color: #3b82f6 !important;
        }
        .swal2-success [class^=swal2-success-line][class$=tip] {
          background-color: #3b82f6 !important;
        }

        .swal2-error .swal2-x-mark-line-left,
        .swal2-error .swal2-x-mark-line-right {
          background-color: #ef4444 !important; /* red-500 */
        }
        .swal2-warning {
          border-color: #f59e0b !important; /* yellow-500 */
        }
        .swal2-warning .swal2-icon-content {
          color: #f59e0b !important;
        }
        .swal2-info {
          border-color: #3b82f6 !important; /* blue-500 */
        }
        .swal2-info .swal2-icon-content {
          color: #3b82f6 !important;
        }

        .swal2-confirm {
          background-color: #3b82f6 !important; /* blue-500 */
          border-radius: 0.75rem !important; /* rounded-lg */
          font-weight: 600 !important; /* font-semibold */
          padding: 0.75rem 1.5rem !important;
          transition: all 0.2s ease-in-out !important;
        }
        .swal2-confirm:hover {
          background-color: #2563eb !important; /* blue-600 */
        }
      `}</style>
    </div>
  );
}