import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const Contactos = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    emailjs
      .sendForm('service_k7p7i7o', 'template_imqyz6g', form.current, {
        publicKey: 'rSi0tSHMA4K-IaCA8',
      })
      .then(
        () => {
          setLoading(false);
          setSuccessMessage('¡Tu mensaje ha sido enviado correctamente!');
          setFormData({
            user_name: '',
            user_email: '',
            message: ''
          });
        },
        (error) => {
          setLoading(false);
          setErrorMessage('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
          console.error('Error al enviar:', error);
        }
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-8 text-center">Contáctanos - MAAT ACADEMY</h2>
        <p className="text-center max-w-2xl mx-auto mb-12 text-blue-200">
          ¿Tienes alguna duda o necesitas ayuda? Nuestro equipo de soporte está listo para asistirte.
          Completa el formulario o usa los medios directos para contactarnos.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">

          {/* Contact Info Cards */}
          <div className="space-y-8">
            <div className="bg-blue-700 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 2l-5.5 20.5-4.5-9-9-4.5L22 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-1 text-center">WhatsApp</h3>
              <p className="text-center text-blue-200">+593 99 999 9999</p>
              <p className="text-center text-blue-300 mt-1 font-medium">Chat directo</p>
            </div>

            <div className="bg-blue-700 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="bg-indigo-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                  <path d="M22 4L12 14.01 2 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-1 text-center">Correo Electrónico</h3>
              <p className="text-center text-blue-200">info@rncacademy.com</p>
              <p className="text-center text-blue-300 mt-1 font-medium">Respuesta en 24h</p>
            </div>

            <div className="bg-blue-700 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="bg-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-1 text-center">Visítanos</h3>
              <p className="text-center text-blue-200">Av. Principal 123</p>
              <p className="text-center text-blue-300 mt-1 font-medium">Guayaquil, Ecuador</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-lg text-gray-900">
            <h3 className="text-2xl font-bold mb-6 text-center text-blue-900">Envíanos un mensaje</h3>

            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label htmlFor="user_name" className="block text-sm font-semibold mb-1">Nombre completo</label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label htmlFor="user_email" className="block text-sm font-semibold mb-1">Correo electrónico</label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-1">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'} text-white py-3 px-4 rounded-lg font-semibold transition duration-300 flex justify-center items-center shadow-md hover:shadow-lg`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Enviar Mensaje'
                )}
              </button>

              {successMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center animate-fade-in">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-center animate-fade-in">
                  {errorMessage}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
                <h4 className="font-semibold mb-2">¿Qué sucede después de enviar tu mensaje?</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Recibirás un correo de confirmación automático.</li>
                  <li>Nuestro equipo revisará tu solicitud en menos de 24 horas.</li>
                  <li>Te contactaremos por el medio que nos hayas indicado.</li>
                </ol>
                <p className="mt-3 text-sm text-blue-700">
                  Todos tus datos están protegidos bajo nuestra política de privacidad.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactos;
