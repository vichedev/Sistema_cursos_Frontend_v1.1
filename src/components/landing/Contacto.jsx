import React, { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";

// Valores por defecto si el backend aún no responde.
const FALLBACK = {
  whatsapp: "+593979860095",
  whatsappNota: "Chat directo 24/7",
  correo: "cursos@maat.ec",
  correoNota: "Respuesta en 24h",
  pais: "ECUADOR",
  ciudad: "Guayaquil",
  grupo: "✨Grupo Maat✨",
};

const Contactos = () => {
  const [info, setInfo] = useState(FALLBACK);
  const [formData, setFormData] = useState({ nombre: "", correo: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Carga los datos de contacto configurados en el panel admin.
  useEffect(() => {
    api
      .get("/api/settings/contact")
      .then((r) => setInfo({ ...FALLBACK, ...(r.data?.data || {}) }))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/settings/contact", formData);
      setSuccessMessage("¡Tu mensaje ha sido enviado correctamente!");
      setFormData({ nombre: "", correo: "", mensaje: "" });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/${(info.whatsapp || "").replace(/[^\d]/g, "")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Contáctanos
          </h2>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ¿Tienes alguna duda o necesitas ayuda? Nuestro equipo de soporte está listo para
            asistirte. Completa el formulario o usa los medios directos para contactarnos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Tarjetas de contacto */}
          <div className="space-y-8">
            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-500/40 group"
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 2l-5.5 20.5-4.5-9-9-4.5L22 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800 dark:text-slate-100">WhatsApp</h3>
              <p className="text-center text-gray-600 dark:text-slate-300 text-lg font-medium">{info.whatsapp}</p>
              {info.whatsappNota && (
                <p className="text-center text-green-600 dark:text-green-400 mt-3 font-semibold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {info.whatsappNota}
                </p>
              )}
            </a>

            {/* Correo */}
            <a
              href={`mailto:${info.correo}`}
              className="block bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/40 group"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4z" />
                  <path d="M22 4L12 14.01 2 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800 dark:text-slate-100">Correo Electrónico</h3>
              <p className="text-center text-gray-600 dark:text-slate-300 text-lg font-medium">{info.correo}</p>
              {info.correoNota && (
                <p className="text-center text-blue-600 dark:text-blue-400 mt-3 font-semibold">{info.correoNota}</p>
              )}
            </a>

            {/* Ubicación */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-500/40 group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800 dark:text-slate-100">{info.pais}</h3>
              <p className="text-center text-gray-600 dark:text-slate-300 text-lg font-medium">{info.ciudad}</p>
              {info.grupo && (
                <p className="text-center text-purple-600 dark:text-purple-400 mt-3 font-semibold">{info.grupo}</p>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Envíanos un mensaje
              </h3>
              <p className="text-gray-500 dark:text-slate-400 text-lg">
                Estamos aquí para ayudarte. Completa el formulario y te responderemos pronto.
              </p>
            </div>

            <form onSubmit={sendEmail} className="space-y-8">
              <div>
                <label htmlFor="nombre" className="block text-lg font-semibold mb-3 text-gray-700 dark:text-slate-200">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label htmlFor="correo" className="block text-lg font-semibold mb-3 text-gray-700 dark:text-slate-200">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-lg font-semibold mb-3 text-gray-700 dark:text-slate-200">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-6 py-4 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400 dark:placeholder-slate-500 resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
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
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-300 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-100 dark:border-blue-800/40">
                <h4 className="font-bold text-lg text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  ¿Qué sucede después de enviar tu mensaje?
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
                  <li className="ml-4">Recibirás un correo de confirmación automático.</li>
                  <li className="ml-4">Nuestro equipo revisará tu solicitud en menos de 24 horas.</li>
                  <li className="ml-4">Te contactaremos por el medio que nos hayas indicado.</li>
                </ol>
                <p className="mt-4 text-sm text-blue-700 dark:text-blue-400 font-medium">
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
