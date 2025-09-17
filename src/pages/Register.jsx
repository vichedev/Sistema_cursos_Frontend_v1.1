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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, form);
      Swal.fire({
        title: '¡Registro exitoso!',
        text: res.data.message || 'Ahora verifica tu correo electrónico para activar tu cuenta.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: true
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al registrar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener ciudades de Ecuador
  const ciudadesEcuador = City.getCitiesOfCountry("EC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative">
      {/* Contenedor principal */}
      <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row z-10">

        {/* Imagen + texto lado izquierdo */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-tr from-blue-100 to-blue-300 p-16 flex-col justify-center rounded-l-3xl">
          <img
            src="/logo_render.png"
            alt="Libro abierto"
            className="mb-8 max-h-72 mx-auto object-contain"
          />
          <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Únete a RNC Academy</h2>
          <p className="text-blue-900 text-lg leading-relaxed drop-shadow-md">
            Completa el formulario para crear tu cuenta y acceder a cursos y recursos exclusivos.
          </p>
        </div>

        {/* Formulario lado derecho */}
        <div className="w-full md:w-3/5 p-8 md:p-16 flex flex-col justify-center">
          {/* Título, icono y descripción */}
          <div className="text-center mb-8">
            <FaUserPlus className="text-orange-500 mx-auto mb-3" size={44} />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
            <p className="text-gray-500">Llena los datos para registrarte en la plataforma</p>
          </div>

          {/* Formulario con grid responsive */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl w-full mx-auto">
            <input
              name="nombres"
              placeholder="Nombres"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.nombres}
            />

            <input
              name="apellidos"
              placeholder="Apellidos"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.apellidos}
            />

            <input
              name="empresa"
              placeholder="Empresa (opcional)"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.empresa}
            />

            <input
              name="correo"
              type="email"
              placeholder="Correo electrónico"
              required
              className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.correo}
            />

            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
            >
              <option value="Gerente">Gerente</option>
              <option value="Técnico">Técnico</option>
            </select>

            <input
              name="cedula"
              placeholder="Cédula"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.cedula}
            />

            <input
              name="celular"
              placeholder="Celular"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.celular}
            />

            <input
              name="usuario"
              placeholder="Usuario"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.usuario}
            />

            <select
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              required
              className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
            >
              <option value="">Selecciona tu ciudad</option>
              {ciudadesEcuador.map((city) => (
                <option key={city.isoCode} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>

            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              required
              minLength="6"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-700"
              onChange={handleChange}
              value={form.password}
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`md:col-span-3 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-300 to-orange-500 hover:from-orange-400 hover:to-orange-600 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-all duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
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
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="font-medium text-orange-500 hover:text-orange-600">
              Inicia sesión
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-gray-400 text-center w-full z-10">
        &copy; {new Date().getFullYear()} Sistema de Cursos RNC. Todos los derechos reservados.
      </footer>

      {/* Animación CSS */}
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