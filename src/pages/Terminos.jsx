import { useEffect } from "react";
import {
  FaFileContract,
  FaCheckCircle,
  FaInfoCircle,
  FaUserPlus,
  FaGift,
  FaCreditCard,
  FaTags,
  FaDoorOpen,
  FaCertificate,
  FaUserShield,
  FaCopyright,
  FaExclamationTriangle,
  FaSyncAlt,
  FaGavel,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import Nav from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const Terminos = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const secciones = [
    {
      id: "s1",
      num: 1,
      title: "Aceptación de los términos",
      icon: <FaCheckCircle className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      content: (
        <>
          <p className="mb-3">
            Al crear una cuenta o utilizar la plataforma{" "}
            <strong className="text-gray-900">MAAT Academy</strong> (disponible
            en{" "}
            <a
              href="https://cursos.maat.ec"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              cursos.maat.ec
            </a>{" "}
            y en la aplicación móvil), usted declara haber leído, comprendido y
            aceptado estos Términos y Condiciones en su totalidad.
          </p>
          <p>
            Si no está de acuerdo con alguno de estos términos, le solicitamos
            que no utilice nuestros servicios.
          </p>
        </>
      ),
    },
    {
      id: "s2",
      num: 2,
      title: "Descripción del servicio",
      icon: <FaInfoCircle className="w-6 h-6" />,
      color: "from-cyan-500 to-cyan-600",
      content: (
        <p>
          <strong className="text-gray-900">Grupo Maat</strong> ofrece una
          plataforma de formación en línea especializada en cursos técnicos y
          profesionales, principalmente en las áreas de redes,
          telecomunicaciones y tecnología. Los cursos pueden ser gratuitos o de
          pago, según se indique en cada caso.
        </p>
      ),
    },
    {
      id: "s3",
      num: 3,
      title: "Registro de cuenta",
      icon: <FaUserPlus className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      content: (
        <ul className="space-y-2">
          {[
            "Debe proporcionar información veraz, completa y actualizada al momento del registro.",
            "Es responsable de mantener la confidencialidad de sus credenciales de acceso.",
            "No está permitido compartir su cuenta con otras personas ni ceder el acceso a terceros.",
            "Grupo Maat se reserva el derecho de suspender cuentas con información falsa o que presenten actividad irregular.",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "s4",
      num: 4,
      title: "Cursos gratuitos",
      icon: <FaGift className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      content: (
        <p>
          Los cursos marcados como gratuitos están disponibles sin costo para
          todos los usuarios debidamente registrados. Grupo Maat puede
          modificar, suspender o retirar cursos gratuitos en cualquier momento,
          sin obligación de previo aviso.
        </p>
      ),
    },
    {
      id: "s5",
      num: 5,
      title: "Cursos de pago y pagos",
      icon: <FaCreditCard className="w-6 h-6" />,
      color: "from-emerald-500 to-emerald-600",
      content: (
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>
              Los precios están expresados en dólares estadounidenses (USD) e
              incluyen el Impuesto al Valor Agregado (IVA) vigente en el
              Ecuador.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>
              Los pagos se procesan a través de{" "}
              <strong className="text-gray-900">Payphone</strong>, plataforma de
              pagos segura y certificada.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>
              Una vez confirmado el pago, el acceso al curso se habilita de
              forma inmediata.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>
              <strong className="text-gray-900">Política de reembolsos:</strong>{" "}
              No se realizan reembolsos una vez que el usuario ha accedido al
              contenido del curso. Si por razones técnicas imputables a Grupo
              Maat no puede acceder al curso adquirido, contáctenos en{" "}
              <a
                href="mailto:info@maat.ec"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                info@maat.ec
              </a>{" "}
              para evaluar cada caso de forma individual.
            </span>
          </li>
        </ul>
      ),
    },
    {
      id: "s6",
      num: 6,
      title: "Cupones de descuento",
      icon: <FaTags className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      content: (
        <p>
          Los cupones de descuento son de uso único, personales e
          intransferibles. Su validez está sujeta a la fecha de vencimiento
          indicada en cada cupón. Grupo Maat se reserva el derecho de anular
          cupones en caso de uso indebido, fraude o incumplimiento de estas
          condiciones.
        </p>
      ),
    },
    {
      id: "s7",
      num: 7,
      title: "Acceso a los cursos",
      icon: <FaDoorOpen className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
      content: (
        <ul className="space-y-2">
          {[
            "El acceso a un curso es válido durante el período indicado en el mismo.",
            "Grupo Maat puede actualizar, modificar o suspender el contenido de un curso por razones técnicas o académicas sin previo aviso.",
            "El acceso es estrictamente personal y no puede cederse, venderse ni transferirse a terceros.",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "s8",
      num: 8,
      title: "Certificados",
      icon: <FaCertificate className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
      content: (
        <p>
          Los certificados de participación se emiten a los usuarios que cumplan
          con todos los requisitos establecidos en el curso. Son nominales, no
          transferibles y no constituyen un título académico oficial. Grupo Maat
          se reserva el derecho de revocar certificados emitidos por error o
          como consecuencia del incumplimiento de las presentes condiciones.
        </p>
      ),
    },
    {
      id: "s9",
      num: 9,
      title: "Conducta del usuario",
      icon: <FaUserShield className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      content: (
        <>
          <p className="mb-4">Queda expresamente prohibido:</p>
          <ul className="space-y-2 mb-4">
            {[
              "Reproducir, distribuir, publicar o compartir el contenido de los cursos sin autorización escrita de Grupo Maat.",
              "Utilizar la plataforma para fines ilegales o que afecten los derechos de otros usuarios.",
              "Intentar acceder a sistemas, cuentas o datos que no le correspondan.",
              "Usar herramientas automatizadas para extraer, descargar o indexar el contenido de la plataforma.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            El incumplimiento de estas normas podrá resultar en la suspensión
            permanente de la cuenta, sin derecho a reembolso.
          </p>
        </>
      ),
    },
    {
      id: "s10",
      num: 10,
      title: "Propiedad intelectual",
      icon: <FaCopyright className="w-6 h-6" />,
      color: "from-pink-500 to-pink-600",
      content: (
        <p>
          Todo el contenido disponible en la plataforma (videos, materiales
          didácticos, textos, imágenes, logotipos y marca) es propiedad de Grupo
          Maat o de sus respectivos autores, y está protegido por las leyes de
          propiedad intelectual vigentes en el Ecuador. Queda prohibida su
          reproducción, total o parcial, sin autorización escrita previa de
          Grupo Maat.
        </p>
      ),
    },
    {
      id: "s11",
      num: 11,
      title: "Limitación de responsabilidad",
      icon: <FaExclamationTriangle className="w-6 h-6" />,
      color: "from-amber-500 to-amber-600",
      content: (
        <p>
          Grupo Maat no garantiza la disponibilidad ininterrumpida de la
          plataforma. No asumiremos responsabilidad por daños indirectos,
          pérdida de datos o interrupciones del servicio causadas por factores
          fuera de nuestro control razonable, incluyendo fuerza mayor, fallas de
          proveedores de telecomunicaciones o de terceros.
        </p>
      ),
    },
    {
      id: "s12",
      num: 12,
      title: "Modificaciones",
      icon: <FaSyncAlt className="w-6 h-6" />,
      color: "from-teal-500 to-teal-600",
      content: (
        <p>
          Grupo Maat se reserva el derecho de modificar estos Términos y
          Condiciones en cualquier momento. Los cambios entrarán en vigor a
          partir de su publicación en la plataforma. El uso continuado del
          servicio con posterioridad a dicha publicación implica la aceptación
          de los términos actualizados.
        </p>
      ),
    },
    {
      id: "s13",
      num: 13,
      title: "Ley aplicable",
      icon: <FaGavel className="w-6 h-6" />,
      color: "from-slate-500 to-slate-600",
      content: (
        <p>
          Estos Términos y Condiciones se rigen e interpretan de conformidad con
          las leyes de la República del Ecuador. Cualquier controversia derivada
          de su aplicación o interpretación será sometida a los tribunales de
          justicia competentes del Ecuador.
        </p>
      ),
    },
    {
      id: "s14",
      num: 14,
      title: "Contacto",
      icon: <FaEnvelope className="w-6 h-6" />,
      color: "from-rose-500 to-rose-600",
      content: (
        <>
          <p className="mb-3">
            Para consultas o reclamos relacionados con estos Términos y
            Condiciones, puede comunicarse con nosotros en:
          </p>
          <a
            href="mailto:info@maat.ec"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 hover:underline"
          >
            <FaEnvelope className="w-4 h-4" />
            info@maat.ec
          </a>
        </>
      ),
    },
  ];

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20 mb-8">
            <FaFileContract className="text-yellow-300 w-5 h-5" />
            <span className="text-sm font-semibold text-white tracking-wider uppercase">
              Documento Legal
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="block">Términos y</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Condiciones
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-10">
            Condiciones de uso de la plataforma MAAT Academy y los servicios de
            formación en línea ofrecidos por Grupo Maat.
          </p>

          {/* Meta info */}
          <div className="inline-flex flex-wrap justify-center gap-3 bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <FaCalendarAlt className="w-4 h-4 text-yellow-300" />
              <span>Vigente desde: 14 de abril de 2026</span>
            </div>
            <div className="hidden sm:block w-px bg-white/20"></div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <FaMapMarkerAlt className="w-4 h-4 text-yellow-300" />
              <span>Aplica en: Ecuador</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* TOC - Tabla de contenido */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 pb-3 mb-3 border-b border-gray-200">
                    Contenido
                  </h3>
                  <nav>
                    <ol className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                      {secciones.map((sec) => (
                        <li key={sec.id}>
                          <button
                            onClick={() => scrollToSection(sec.id)}
                            className="w-full text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 flex items-start gap-2"
                          >
                            <span className="font-semibold text-blue-600 flex-shrink-0">
                              {sec.num}.
                            </span>
                            <span className="leading-snug">{sec.title}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Secciones */}
            <div className="lg:col-span-3 space-y-6">
              {secciones.map((sec) => (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 scroll-mt-24"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div
                      className={`bg-gradient-to-r ${sec.color} p-3 rounded-xl text-white flex-shrink-0 shadow-md`}
                    >
                      {sec.icon}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400">
                        {String(sec.num).padStart(2, "0")}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {sec.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-6 text-gray-700 leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))}

              {/* CTA Final */}
              <div className="mt-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  ¿Tienes preguntas sobre estos términos?
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Nuestro equipo está disponible para aclarar cualquier duda
                  sobre las condiciones de uso de la plataforma antes o después
                  de tu registro.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:info@maat.ec"
                    className="px-8 py-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2"
                  >
                    <FaEnvelope className="w-5 h-5" />
                    Escríbenos
                  </a>
                  <a
                    href="https://wa.link/zj2s6q"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2"
                  >
                    <FaUsers className="w-5 h-5" />
                    Soporte por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Terminos;
