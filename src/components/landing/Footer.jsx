const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
        {/* Logo y descripción */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src="/img/rnc_academy_logo.png"
            alt="RNC Academy"
            className="h-10 mb-3"
          />
          <p className="max-w-xs text-sm leading-relaxed">
            Aprende y crece con nuestros cursos prácticos en redes y telecomunicaciones.
          </p>
        </div>

        {/* Enlaces rápidos */}
        <nav className="flex flex-col space-y-2 text-sm text-gray-400">
          <a href="/nosotros" className="hover:text-white transition">Sobre Nosotros</a>
          <a href="/documentos" className="hover:text-white transition">Documentos Legales</a>
          <a href="/contactos" className="hover:text-white transition">Contactos</a>
        </nav>

        {/* Redes sociales */}
        <div className="flex space-x-6 justify-center md:justify-start">
          <a href="https://facebook.com/rncacademy" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
          <a href="https://wa.me/593999999999" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 32 32">
              <path d="M16 2.933C8.805 2.933 2.933 8.805 2.933 16c0 2.537.653 5.013 1.888 7.188L2 30l7.042-2.792A13.002 13.002 0 0016 29.067C23.195 29.067 29.067 23.195 29.067 16S23.195 2.933 16 2.933zm0 24a10.922 10.922 0 01-5.832-1.66l-.417-.25-4.167 1.646 1.563-4.042-.271-.438a10.913 10.913 0 01-1.708-5.729c0-6.012 4.887-10.9 10.9-10.9 6.012 0 10.9 4.888 10.9 10.9s-4.888 10.9-10.9 10.9zm5.313-8.063c-.292-.146-1.729-.854-1.997-.95-.271-.104-.47-.146-.667.146-.198.292-.771.95-.946 1.146-.177.198-.354.219-.646.073-.292-.146-1.229-.454-2.34-1.45-.865-.771-1.448-1.729-1.615-2.021-.167-.292-.02-.438.125-.583.125-.125.292-.323.438-.49.146-.167.198-.292.292-.49.104-.219.052-.365-.021-.51-.073-.146-.667-1.615-.917-2.219-.24-.583-.479-.5-.667-.51h-.573c-.198 0-.51.073-.771.365s-1.01.99-1.01 2.417c0 1.427 1.031 2.803 1.177 2.99.146.198 2.031 3.094 4.927 4.333.688.292 1.229.469 1.646.605.688.219 1.313.188 1.813.115.552-.083 1.729-.708 1.979-1.396.24-.688.24-1.292.167-1.396-.063-.104-.24-.167-.51-.292z" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@rncacademy" aria-label="TikTok" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
              <path d="M34.5 10.5a8.25 8.25 0 01-6-6V3h-6v27.75a4.5 4.5 0 11-4.5-4.5V21A10.5 10.5 0 1029 31.5V18.09a14.7 14.7 0 006 1.41V13.5a12.75 12.75 0 01-6-3z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm select-none">
        © {new Date().getFullYear()} RNC Academy. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
