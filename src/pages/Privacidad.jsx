import { useEffect } from "react";
import {
  FaShieldAlt,
  FaUserShield,
  FaDatabase,
  FaBullseye,
  FaShareAlt,
  FaClock,
  FaUserCheck,
  FaLock,
  FaChild,
  FaSyncAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaUsers,
} from "react-icons/fa";
import Nav from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const Privacidad = () => {
  // Scroll al tope al entrar a la página
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
      title: "Responsable del tratamiento",
      icon: <FaUserShield className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      content: (
        <>
          <p className="mb-3">
            El responsable del tratamiento de sus datos personales es{" "}
            <strong className="text-gray-900">Grupo Maat</strong>, operador de
            la plataforma de cursos en línea{" "}
            <strong className="text-gray-900">MAAT Academy</strong> (maat.ec).
          </p>
          <p>
            Correo de contacto:{" "}
            <a
              href="mailto:info@maat.ec"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              info@maat.ec
            </a>
          </p>
        </>
      ),
    },
    {
      id: "s2",
      num: 2,
      title: "Datos que recopilamos",
      icon: <FaDatabase className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      content: (
        <>
          <p className="mb-4">
            Al crear una cuenta y usar nuestra plataforma, recopilamos los
            siguientes datos personales:
          </p>
          <ul className="space-y-2">
            {[
              "Nombre completo y apellidos",
              "Número de identificación (cédula o pasaporte)",
              "Correo electrónico y nombre de usuario",
              "Número de teléfono celular",
              "País y ciudad de residencia",
              "Empresa y cargo (opcionales)",
              "Contraseña (almacenada de forma encriptada; nunca en texto plano)",
              "Datos de transacciones de pago (procesados por Payphone; no almacenamos números de tarjeta)",
              "Información de uso: cursos inscritos y actividad de acceso a la plataforma",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "s3",
      num: 3,
      title: "Finalidad del tratamiento",
      icon: <FaBullseye className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      content: (
        <>
          <p className="mb-4">
            Utilizamos sus datos personales exclusivamente para los siguientes
            fines:
          </p>
          <ul className="space-y-2">
            {[
              "Crear y gestionar su cuenta de usuario en la plataforma",
              "Procesar inscripciones y pagos de cursos",
              "Emitir certificados de participación",
              "Enviar notificaciones relacionadas con sus cursos (inicio, recordatorios, actualizaciones)",
              "Cumplir con obligaciones legales y tributarias vigentes en el Ecuador",
              "Mejorar la plataforma y la experiencia del usuario",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "s4",
      num: 4,
      title: "Compartición con terceros",
      icon: <FaShareAlt className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      content: (
        <>
          <p className="mb-4">
            Sus datos personales{" "}
            <strong className="text-gray-900">
              no se venden ni se comparten
            </strong>{" "}
            con fines publicitarios o comerciales. Únicamente los compartimos
            con:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong className="text-gray-900">Payphone</strong> — procesador
                de pagos en línea, únicamente para completar transacciones. Está
                sujeto a sus propias políticas de privacidad y seguridad.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong className="text-gray-900">
                  Autoridades competentes
                </strong>{" "}
                — cuando así lo exija la ley o una resolución judicial firme.
              </span>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "s5",
      num: 5,
      title: "Conservación de datos",
      icon: <FaClock className="w-6 h-6" />,
      color: "from-cyan-500 to-cyan-600",
      content: (
        <p>
          Conservamos sus datos mientras su cuenta permanezca activa. Si
          solicita la eliminación de su cuenta, procederemos a eliminar o
          anonimizar sus datos en un plazo máximo de{" "}
          <strong className="text-gray-900">30 días hábiles</strong>, salvo que
          la normativa vigente exija su conservación por un período mayor (p.
          ej., registros tributarios o contables).
        </p>
      ),
    },
    {
      id: "s6",
      num: 6,
      title: "Sus derechos",
      icon: <FaUserCheck className="w-6 h-6" />,
      color: "from-pink-500 to-pink-600",
      content: (
        <>
          <p className="mb-4">
            De conformidad con la{" "}
            <strong className="text-gray-900">
              Ley Orgánica de Protección de Datos Personales (LOPDP)
            </strong>{" "}
            del Ecuador, usted tiene derecho a:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              "Acceder a sus datos personales almacenados",
              "Rectificar datos inexactos o incompletos",
              "Solicitar la supresión de sus datos",
              "Oponerse al tratamiento de sus datos",
              "Solicitar la portabilidad de sus datos a otro prestador",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escríbanos a:{" "}
            <a
              href="mailto:info@maat.ec"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              info@maat.ec
            </a>
          </p>
        </>
      ),
    },
    {
      id: "s7",
      num: 7,
      title: "Seguridad",
      icon: <FaLock className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
      content: (
        <>
          <p className="mb-4">
            Implementamos medidas técnicas y organizativas apropiadas para
            proteger sus datos contra acceso no autorizado, pérdida, alteración
            o divulgación, entre ellas:
          </p>
          <ul className="space-y-2">
            {[
              "Encriptación de contraseñas mediante algoritmos seguros",
              "Transmisión de datos bajo protocolo HTTPS/TLS",
              "Acceso restringido a los sistemas internos de la plataforma",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "s8",
      num: 8,
      title: "Menores de edad",
      icon: <FaChild className="w-6 h-6" />,
      color: "from-teal-500 to-teal-600",
      content: (
        <>
          <p className="mb-3">
            Nuestra plataforma está orientada a profesionales y personas adultas
            interesadas en formación técnica especializada (redes,
            telecomunicaciones y afines). No recopilamos intencionalmente datos
            personales de menores de 18 años.
          </p>
          <p>
            Si identificamos que un usuario menor de edad ha creado una cuenta,
            procederemos a eliminarla de forma inmediata.
          </p>
        </>
      ),
    },
    {
      id: "s9",
      num: 9,
      title: "Cambios en esta política",
      icon: <FaSyncAlt className="w-6 h-6" />,
      color: "from-amber-500 to-amber-600",
      content: (
        <>
          <p className="mb-3">
            Podemos actualizar esta Política de Privacidad ocasionalmente para
            reflejar cambios en nuestras prácticas o en la normativa vigente. Le
            notificaremos cualquier modificación significativa a través de la
            aplicación o por correo electrónico.
          </p>
          <p>
            El uso continuado de la plataforma tras la publicación de los
            cambios implica su aceptación.
          </p>
        </>
      ),
    },
    {
      id: "s10",
      num: 10,
      title: "Contacto",
      icon: <FaEnvelope className="w-6 h-6" />,
      color: "from-rose-500 to-rose-600",
      content: (
        <>
          <p className="mb-3">
            Para consultas, reclamos o ejercicio de sus derechos relacionados
            con esta política, contáctenos en:
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
            <FaShieldAlt className="text-yellow-300 w-5 h-5" />
            <span className="text-sm font-semibold text-white tracking-wider uppercase">
              Documento Legal
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="block">Política de</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Privacidad
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-10">
            Cómo recopilamos, usamos y protegemos su información personal en la
            plataforma MAAT Academy.
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
                    <ol className="space-y-1">
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
                  ¿Tienes dudas sobre tus datos?
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Nuestro equipo está listo para ayudarte a ejercer tus derechos
                  y resolver cualquier inquietud sobre el tratamiento de tu
                  información personal.
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

export default Privacidad;
