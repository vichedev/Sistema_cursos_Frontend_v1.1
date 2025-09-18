// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaUserPlus } from "react-icons/fa";
import { City } from 'country-state-city';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    cedula: '',
    ciudad: '',
    empresa: '',
    rol: 'Gerente',
    usuario: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    correo: '',
    usuario: '',
    cedula: '',
    celular: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formato de email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validar formato de cédula (solo números, 10 dígitos para Ecuador)
  const isValidCedula = (cedula) => {
    return /^\d{10}$/.test(cedula);
  };

  // Validar formato de celular (solo números, 10 dígitos)
  const isValidCelular = (celular) => {
    return /^\d{10}$/.test(celular);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({ correo: '', usuario: '', cedula: '', celular: '' });

    // Validaciones frontend
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.correo.trim() || 
        !form.cedula.trim() || !form.celular.trim() || !form.usuario.trim() || 
        !form.password.trim() || !form.ciudad.trim()) {
      Swal.fire({
        title: 'Error',
        html: 'Por favor, completa todos los campos obligatorios.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      });
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(form.correo)) {
      setFieldErrors(prev => ({ ...prev, correo: 'Por favor, ingresa un correo electrónico válido.' }));
      setIsLoading(false);
      return;
    }

    if (!isValidCedula(form.cedula)) {
      setFieldErrors(prev => ({ ...prev, cedula: 'La cédula debe tener 10 dígitos numéricos.' }));
      setIsLoading(false);
      return;
    }

    if (!isValidCelular(form.celular)) {
      setFieldErrors(prev => ({ ...prev, celular: 'El celular debe tener 10 dígitos numéricos.' }));
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      Swal.fire({
        title: 'Error',
        html: 'La contraseña debe tener al menos 6 caracteres.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, form);
      Swal.fire({
        title: '¡Registro exitoso!',
        text: res.data.message || 'Ahora verifica tu correo electrónico para activar tu cuenta.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: true,
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      // Manejar errores específicos del backend
      const errorMessage = err.response?.data?.message || 'Error al registrar';
      
      if (errorMessage.includes('correo') || errorMessage.includes('Correo')) {
        setFieldErrors(prev => ({ ...prev, correo: 'Este correo ya está registrado.' }));
      } else if (errorMessage.includes('usuario') || errorMessage.includes('Usuario')) {
        setFieldErrors(prev => ({ ...prev, usuario: 'Este usuario ya está en uso.' }));
      } else if (errorMessage.includes('cédula') || errorMessage.includes('cedula')) {
        setFieldErrors(prev => ({ ...prev, cedula: 'Esta cédula ya está registrada.' }));
      } else if (errorMessage.includes('celular') || errorMessage.includes('teléfono')) {
        setFieldErrors(prev => ({ ...prev, celular: 'Este celular ya está registrado.' }));
      }

      Swal.fire({
        title: 'Error',
        html: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-modern',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener ciudades de Ecuador
  const ciudadesEcuador = City.getCitiesOfCountry("EC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6 relative">
      {/* Contenedor principal */}
      <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row z-10">

        {/* Imagen + texto lado izquierdo */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-tr from-blue-600 to-blue-800 p-16 flex-col justify-center rounded-l-3xl">
          <img
            src="/logo_render.png"
            alt="Libro abierto"
            className="mb-8 max-h-72 mx-auto object-contain"
          />
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Únete a MAAT ACADEMY</h2>
          <p className="text-blue-200 text-lg leading-relaxed drop-shadow-md">
            Completa el formulario para crear tu cuenta y acceder a cursos y recursos exclusivos.
          </p>
        </div>

        {/* Formulario lado derecho */}
        <div className="w-full md:w-3/5 p-8 md:p-16 flex flex-col justify-center">
          {/* Título, icono y descripción */}
          <div className="text-center mb-8">
            <FaUserPlus className="text-blue-500 mx-auto mb-3" size={44} />
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Crear Cuenta</h1>
            <p className="text-blue-700">Llena los datos para registrarte en la plataforma</p>
          </div>

          {/* Formulario con grid responsive */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl w-full mx-auto">
            <div>
              <input
                name="nombres"
                placeholder="Nombres"
                required
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
                onChange={handleChange}
                value={form.nombres}
              />
            </div>

            <div>
              <input
                name="apellidos"
                placeholder="Apellidos"
                required
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
                onChange={handleChange}
                value={form.apellidos}
              />
            </div>

            <div>
              <input
                name="empresa"
                placeholder="Empresa (opcional)"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
                onChange={handleChange}
                value={form.empresa}
              />
            </div>

            <div className="md:col-span-2">
              <input
                name="correo"
                type="email"
                placeholder="Correo electrónico"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 ${
                  fieldErrors.correo ? 'border-red-500' : 'border-blue-300'
                }`}
                onChange={handleChange}
                value={form.correo}
              />
              {fieldErrors.correo && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.correo}</p>
              )}
            </div>

            <div>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
              >
                <option value="Gerente">Gerente</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>

            <div>
              <input
                name="cedula"
                placeholder="Cédula"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 ${
                  fieldErrors.cedula ? 'border-red-500' : 'border-blue-300'
                }`}
                onChange={handleChange}
                value={form.cedula}
              />
              {fieldErrors.cedula && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.cedula}</p>
              )}
            </div>

            <div>
              <input
                name="celular"
                placeholder="Celular"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 ${
                  fieldErrors.celular ? 'border-red-500' : 'border-blue-300'
                }`}
                onChange={handleChange}
                value={form.celular}
              />
              {fieldErrors.celular && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.celular}</p>
              )}
            </div>

            <div>
              <input
                name="usuario"
                placeholder="Usuario"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900 ${
                  fieldErrors.usuario ? 'border-red-500' : 'border-blue-300'
                }`}
                onChange={handleChange}
                value={form.usuario}
              />
              {fieldErrors.usuario && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.usuario}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <select
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
              >
                <option value="">Selecciona tu ciudad</option>
                {ciudadesEcuador.map((city) => (
                  <option key={city.isoCode} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Contraseña"
                required
                minLength="6"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-blue-900"
                onChange={handleChange}
                value={form.password}
              />
            </div>

            <div className="md:col-span-3">
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
                ) : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-blue-600">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="font-medium text-blue-700 hover:text-blue-800">
              Inicia sesión
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-blue-400 text-center w-full z-10">
        &copy; {new Date().getFullYear()} Sistema de Cursos MAAT. Todos los derechos reservados.
      </footer>

      {/* Animación CSS y estilos SweetAlert2 */}
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
          border-radius: 1.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 2rem !important;
        }
        .swal2-title-custom {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          color: #1a202c !important;
          margin-bottom: 0.5rem !important;
        }
        .swal2-html-container-custom {
          font-size: 1.125rem !important;
          color:极光#4a5568 !important;
          line-height: 1.5 !important;
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