const Footer = () => {
  // Función para scroll suave a las secciones
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                <img
                  src="/logo_render.png"
                  alt="MAAT ACADEMY"
                  className="h-20 w-40 rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">MAAT ACADEMY</h3>
                <p className="text-sm text-gray-400">Excelencia Educativa</p>
              </div>
            </div>
            <p className="max-w-sm text-gray-400 leading-relaxed text-sm">
              Transformamos vidas a través de la educación de calidad en redes,
              telecomunicaciones y tecnología. Aprende con los mejores
              profesionales del sector.
            </p>
          </div>

          {/* Quick Links - ACTUALIZADO para landing */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-semibold mb-4 text-lg border-b-2 border-blue-500 pb-2">
              Navegación
            </h4>
            <nav className="flex flex-col space-y-3 text-sm">
              <button
                onClick={() => scrollToSection('hero')}
                className="hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center gap-2 group text-left"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                Inicio
              </button>
              <button
                onClick={() => scrollToSection('sobre-nosotros')}
                className="hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center gap-2 group text-left"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                Sobre Nosotros
              </button>
              <button
                onClick={() => scrollToSection('cursos')}
                className="hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center gap-2 group text-left"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                Cursos Disponibles
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center gap-2 group text-left"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                Contacto
              </button>
            </nav>
          </div>

          {/* Social Media & Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-semibold mb-4 text-lg border-b-2 border-purple-500 pb-2">
              Síguenos
            </h4>
            <div className="flex flex-col space-y-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/maat.ec/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Instagram</p>
                  <p className="text-gray-400 text-xs">@maat.ec</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/593999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30 hover:border-green-400 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M16 2.933C8.805 2.933 2.933 8.805 2.933 16c0 2.537.653 5.013 1.888 7.188L2 30l7.042-2.792A13.002 13.002 0 0016 29.067C23.195 29.067 29.067 23.195 29.067 16S23.195 2.933 16 2.933zm0 24a10.922 10.922 0 01-5.832-1.66l-.417-.25-4.167 1.646 1.563-4.042-.271-.438a10.913 10.913 0 01-1.708-5.729c0-6.012 4.887-10.9 10.9-10.9 6.012 0 10.9 4.888 10.9 10.9s-4.888 10.9-10.9 10.9zm5.313-8.063c-.292-.146-1.729-.854-1.997-.95-.271-.104-.47-.146-.667.146-.198.292-.771.95-.946 1.146-.177.198-.354.219-.646.073-.292-.146-1.229-.454-2.34-1.45-.865-.771-1.448-1.729-1.615-2.021-.167-.292-.02-.438.125-.583.125-.125.292-.323.438-.49.146-.167.198-.292.292-.49.104-.219.052-.365-.021-.51-.073-.146-.667-1.615-.917-2.219-.24-.583-.479-.5-.667-.51h-.573c-.198 0-.51.073-.771.365s-1.01.99-1.01 2.417c0 1.427 1.031 2.803 1.177 2.99.146.198 2.031 3.094 4.927 4.333.688.292 1.229.469 1.646.605.688.219 1.313.188 1.813.115.552-.083 1.729-.708 1.979-1.396.24-.688.24-1.292.167-1.396-.063-.104-.24-.167-.51-.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">WhatsApp</p>
                  <p className="text-gray-400 text-xs">Soporte 24/7</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} MAAT ACADEMY!. Todos los derechos
                reservados.
              </p>
            </div>
           
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;