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
      console.log('📤 Enviando al login:', form);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, form);
      console.log('✅ Respuesta del login:', res.data);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('usuario', res.data.usuario);
      localStorage.setItem('nombres', res.data.nombres);
      localStorage.setItem('cargo', res.data.cargo || '');

      Swal.fire({
        title: `Bienvenido ${res.data.nombres || res.data.usuario}`,
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        if (res.data.rol === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/estudiante/dashboard';
        }
      });
    } catch (err) {
      console.error('❌ Error completo:', err.response);

      // Si el error es de cuenta no verificada, mostrar botón para reenviar
      const message = err.response?.data?.message || 'Credenciales incorrectas';
      if (message.includes('verificada')) {
        setShowResendButton(true);
        setEmailToResend(form.usuario.includes('@') ? form.usuario : '');
      }

      Swal.fire('Error', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailToResend) {
      Swal.fire('Error', 'Por favor ingresa tu correo electrónico', 'error');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/resend-verification`, { email: emailToResend });
      Swal.fire('Éxito', 'Correo de verificación reenviado. Por favor revisa tu bandeja de entrada.', 'success');
      setShowResendButton(false);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al reenviar correo de verificación', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Volver al sitio</span>
      </button>

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row z-10">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-100 to-blue-300 p-12 flex-col justify-center rounded-l-3xl">
          <img
            src="/logo_render.png"
            alt="Libro abierto"
            className="mb-8 max-h-72 mx-auto object-contain"
          />
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Aprende Redes y Telecomunicaciones</h2>
          <p className="text-blue-900 text-lg leading-relaxed drop-shadow-md">
            Ingresa con tu usuario y contraseña para acceder a tus cursos y aprovechar todo nuestro contenido de aprendizaje.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inicia sesión</h1>
            <p className="text-gray-500">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Correo electrónico
              </label>
              <input
                id="usuario"
                name="usuario"
                placeholder="usuario o email@ejemplo.com"
                autoComplete="username"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-300 to-orange-500 hover:from-orange-400 hover:to-orange-600 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-all duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
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
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm mb-3">
                ¿No recibiste el correo de verificación?
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={emailToResend}
                  onChange={(e) => setEmailToResend(e.target.value)}
                  className="flex-1 px-3 py-2 border border-yellow-300 rounded text-sm"
                />
                <button
                  onClick={handleResendVerification}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded transition-colors"
                >
                  Reenviar
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="font-medium text-orange-500 hover:text-orange-600">
              Regístrate
            </a>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-gray-400 text-center w-full z-10">
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
      `}</style>
    </div>
  );
}