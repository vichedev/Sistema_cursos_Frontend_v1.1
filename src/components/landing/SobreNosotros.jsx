import {
  FaNetworkWired,
  FaHistory,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaUsers,
  FaGraduationCap,
  FaRocket,
  FaAward,
} from "react-icons/fa";

const Nosotros = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 sm:py-24 lg:py-32">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-blue-200 shadow-sm mb-8">
            <span className="text-lg font-semibold text-blue-600">
              MAAT ACADEMY
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="block">Especialistas en</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Redes y Telecomunicaciones
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Formamos a los próximos expertos en redes, telecomunicaciones y
            seguridad informática con metodología práctica.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            {
              number: "50+",
              label: "Estudiantes",
              icon: <FaGraduationCap className="w-6 h-6" />,
            },
            {
              number: "10+",
              label: "Cursos Especializados",
              icon: <FaNetworkWired className="w-6 h-6" />,
            },
            {
              number: "5+",
              label: "Instructores Expertos",
              icon: <FaUsers className="w-6 h-6" />,
            },
            {
              number: "98%",
              label: "Satisfacción Estudiantil",
              icon: <FaAward className="w-6 h-6" />,
            },
          ].map(({ number, label, icon }, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-all duration-300 group"
            >
              <div className="text-blue-600 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {number}
              </div>
              <div className="text-sm text-gray-600 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Especialidades */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nuestras <span className="text-blue-600">Especialidades</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Redes y Conectividad",
                description:
                  "CCNA, CCNP, redes inalámbricas, fibra óptica y configuración de routers y switches.",
                icon: <FaNetworkWired className="w-10 h-10" />,
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "Seguridad Informática",
                description:
                  "Ciberseguridad, ethical hacking, firewalls y protección de infraestructuras críticas.",
                icon: <FaShieldAlt className="w-10 h-10" />,
                color: "from-green-500 to-green-600",
              },
              {
                title: "Telecomunicaciones",
                description:
                  "Sistemas VoIP, telefonía IP, centrales telefónicas y comunicaciones unificadas.",
                icon: <FaMapMarkedAlt className="w-10 h-10" />,
                color: "from-purple-500 to-purple-600",
              },
            ].map(({ title, description, icon, color }, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
              >
                <div
                  className={`bg-gradient-to-r ${color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}
                >
                  {icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historia y Metodología */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Historia */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Nuestra <span className="text-blue-600">Trayectoria</span>
            </h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>MAAT ACADEMY</strong> nace de la experiencia de más de
                12 años en el sector de redes y telecomunicaciones,
                identificando la necesidad de formación especializada y práctica
                en Ecuador.
              </p>
              <p>
                Somos un equipo de ingenieros certificados en MikroTik que
                decidimos compartir nuestro conocimiento para formar a la
                próxima generación de profesionales en telecomunicaciones.
              </p>
              <p>
                Nuestro nombre <strong>MAAT</strong> representa el equilibrio y
                la excelencia que buscamos en cada uno de nuestros programas
                formativos.
              </p>
            </div>
          </div>

          {/* Metodología */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaRocket className="text-yellow-300" />
              Metodología Práctica
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-bold mb-1">Laboratorios Reales</h5>
                  <p className="text-blue-100 text-sm">
                    Acceso a equipos físicos y simuladores profesionales
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-bold mb-1">Proyectos del Mundo Real</h5>
                  <p className="text-blue-100 text-sm">
                    Casos prácticos basados en situaciones laborales reales
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-bold mb-1">Seguimiento Personalizado</h5>
                  <p className="text-blue-100 text-sm">
                    Mentoría constante de instructores certificados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-200 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FaMapMarkedAlt className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-blue-700">
                Nuestra Misión
              </h4>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Formar profesionales altamente capacitados en redes y
              telecomunicaciones mediante programas educativos prácticos y
              actualizados, contribuyendo al desarrollo tecnológico del Ecuador
              y Latinoamérica.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-200 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-600 p-3 rounded-xl">
                <FaRocket className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-purple-700">
                Nuestra Visión
              </h4>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Ser el centro de formación líder en redes y telecomunicaciones en
              Ecuador, reconocido por la excelencia de nuestros egresados y
              nuestro impacto positivo en la industria tecnológica regional.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nuestros <span className="text-blue-600">Valores</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Excelencia",
                description:
                  "Buscamos la máxima calidad en cada curso y servicio",
              },
              {
                title: "Innovación",
                description:
                  "Contenidos siempre actualizados con las últimas tecnologías",
              },
              {
                title: "Compromiso",
                description:
                  "Acompañamos a nuestros estudiantes hasta su éxito profesional",
              },
              {
                title: "Comunidad",
                description:
                  "Creemos en el poder de la colaboración y el networking",
              },
            ].map(({ title, description }, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all duration-300 group hover:border-blue-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg">
                    {idx + 1}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  {title}
                </h4>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para convertirte en un experto en redes?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a MAAT ACADEMY y accede a formación especializada con
            instructores certificados y metodología 100% práctica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
            >
              <FaGraduationCap className="w-5 h-5 mr-2" />
              Ver Cursos Disponibles
            </a>
            <a
              href="https://wa.link/zj2s6q"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
            >
              <FaUsers className="w-5 h-5 mr-2" />
              Consultoría Gratuita
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
