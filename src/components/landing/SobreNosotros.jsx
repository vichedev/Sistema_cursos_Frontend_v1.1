import { FaNetworkWired, FaHistory, FaMapMarkedAlt, FaShieldAlt } from 'react-icons/fa';

const Nosotros = () => {
  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="block">Más que educación,</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              somos RNC Academy, tu puente al conocimiento
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            En RNC Academy, transformamos vidas con cursos prácticos y actualizados que potencian tus habilidades y abren nuevas oportunidades profesionales en tecnología y negocios digitales.
          </p>
        </div>

        {/* Grid de características con react-icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            {
              title: 'Más de 50 cursos',
              description: 'Programación, redes, diseño, marketing digital y más.',
              icon: <FaNetworkWired className="w-8 h-8" />,
              color: 'text-blue-500'
            },
            {
              title: 'Aprendizaje flexible',
              description: 'Accede a contenidos online desde cualquier lugar y dispositivo.',
              icon: <FaHistory className="w-8 h-8" />,
              color: 'text-purple-500'
            },
            {
              title: 'Certificados reconocidos',
              description: 'Recibe constancias oficiales para impulsar tu carrera profesional.',
              icon: <FaMapMarkedAlt className="w-8 h-8" />,
              color: 'text-green-500'
            },
            {
              title: 'Soporte dedicado',
              description: 'Nuestro equipo te acompaña durante todo tu proceso de aprendizaje.',
              icon: <FaShieldAlt className="w-8 h-8" />,
              color: 'text-orange-500'
            },
          ].map(({ title, description, icon, color }, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl group hover:transform hover:-translate-y-1"
            >
              <div className={`${color} mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">{description}</p>
            </div>
          ))}
        </div>

        {/* Historia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Imagen */}
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="/logo_render.png"
              alt="Equipo RNC Academy"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Texto */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Nuestra historia</h3>
            <p className="text-gray-600 mb-4">
              RNC Academy nació con la visión de democratizar la educación tecnológica en Ecuador, brindando acceso a cursos de alta calidad que preparan a nuestros estudiantes para los retos del mundo digital actual. Nuestro compromiso es formar profesionales competentes, con habilidades prácticas y certificadas.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Innovación constante</h4>
                  <p className="text-gray-600 text-sm">
                    Actualizamos continuamente nuestros contenidos y métodos para que siempre aprendas lo último y más relevante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
          <div className="bg-white shadow-md rounded-2xl p-8 border border-blue-100">
            <h4 className="text-xl font-bold text-blue-700 mb-4">Misión</h4>
            <p className="text-gray-700">
              Ofrecer educación de calidad y accesible en tecnología y negocios digitales, para empoderar a las personas a transformar su futuro y desarrollar sus carreras profesionales.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-2xl p-8 border border-blue-100">
            <h4 className="text-xl font-bold text-blue-700 mb-4">Visión</h4>
            <p className="text-gray-700">
              Ser la academia líder en formación digital en Ecuador, reconocida por su innovación, excelencia y compromiso con el éxito de sus estudiantes.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            ¿Listo para potenciar tu carrera con RNC Academy?
          </h3>
          <a
            href="https://wa.link/by3a5o"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-flex items-center"
          >
            Habla con un especialista
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Nosotros;
