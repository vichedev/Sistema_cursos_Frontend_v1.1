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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contáctanos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ¿Tienes alguna duda o necesitas ayuda? Nuestro equipo de soporte está listo para asistirte.
            Completa el formulario o usa los medios directos para contactarnos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Contact Info Cards */}
          <div className="space-y-8">
            {/* WhatsApp Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 2l-5.5 20.5-4.5-9-9-4.5L22 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">WhatsApp</h3>
              <p className="text-center text-gray-600 text-lg font-medium">+593 99 999 9999</p>
              <p className="text-center text-green-600 mt-3 font-semibold flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Chat directo 24/7
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                  <path d="M22 4L12 14.01 2 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">Correo Electrónico</h3>
              <p className="text-center text-gray-600 text-lg font-medium">info@maatacademy.com</p>
              <p className="text-center text-blue-600 mt-3 font-semibold">Respuesta en 24h</p>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">Visítanos</h3>
              <p className="text-center text-gray-600 text-lg font-medium">Av. Principal 123</p>
              <p className="text-center text-purple-600 mt-3 font-semibold">Guayaquil, Ecuador</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                Envíanos un mensaje
              </h3>
              <p className="text-gray-500 text-lg">
                Estamos aquí para ayudarte. Completa el formulario y te responderemos pronto.
              </p>
            </div>

            <form ref={form} onSubmit={sendEmail} className="space-y-8">
              <div>
                <label htmlFor="user_name" className="block text-lg font-semibold mb-3 text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label htmlFor="user_email" className="block text-lg font-semibold mb-3 text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-lg font-semibold mb-3 text-gray-700">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400 resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                } text-white py-5 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-xl`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Mensaje
                  </span>
                )}
              </button>

              {successMessage && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded-xl text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
                <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  ¿Qué sucede después de enviar tu mensaje?
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li className="ml-4">Recibirás un correo de confirmación automático.</li>
                  <li className="ml-4">Nuestro equipo revisará tu solicitud en menos de 24 horas.</li>
                  <li className="ml-4">Te contactaremos por el medio que nos hayas indicado.</li>
                </ol>
                <p className="mt-4 text-sm text-blue-700 font-medium">
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