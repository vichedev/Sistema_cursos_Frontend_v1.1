import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Función para hacer scroll suave a las secciones
  const scrollToSection = (sectionId) => {
    closeMenu();
    if (location.pathname !== "/") {
      // Si no estamos en la landing, navegar a la landing primero
      window.location.href = `/#${sectionId}`;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 w-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              closeMenu();
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src="/logoadmin.png"
                alt="MAAT ACADEMY"
                className="h-10 w-10 transition-transform group-hover:scale-110"
              />
              <div
                className={`transition-all duration-300 ${
                  scrolled ? "opacity-100" : "opacity-0 md:opacity-100"
                }`}
              >
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MAAT ACADEMY
                </span>
              </div>
            </div>
          </Link>

          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-10 ml-auto">
            <NavLinks scrollToSection={scrollToSection} scrolled={scrolled} />
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          </div>

          {/* Botón hamburguesa móvil */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div
          className={`md:hidden px-4 pb-6 transition-all duration-300 ${
            scrolled ? "bg-white shadow-lg" : "bg-gray-900/95 backdrop-blur-lg"
          }`}
        >
          <div className="flex flex-col space-y-4 pt-4">
            <MobileNavLinks
              scrollToSection={scrollToSection}
              scrolled={scrolled}
            />
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                onClick={closeMenu}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold text-center hover:bg-gray-50 transition-all duration-300"
                onClick={closeMenu}
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Componente para enlaces desktop
const NavLinks = ({ scrollToSection, scrolled }) => (
  <div className="flex items-center space-x-8">
    {[
      { id: "hero", label: "Inicio" },
      { id: "sobre-nosotros", label: "Sobre Nosotros" },
      { id: "cursos", label: "Cursos" },
      { id: "contacto", label: "Contacto" },
    ].map(({ id, label }) => (
      <button
        key={id}
        onClick={() => scrollToSection(id)}
        className={`font-medium transition-all duration-300 hover:scale-105 ${
          scrolled
            ? "text-gray-700 hover:text-blue-600"
            : "text-white hover:text-blue-300"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

// Componente para enlaces móviles
const MobileNavLinks = ({ scrollToSection, scrolled }) => (
  <>
    {[
      { id: "hero", label: "Inicio" },
      { id: "sobre-nosotros", label: "Sobre Nosotros" },
      { id: "cursos", label: "Cursos" },
      { id: "contacto", label: "Contacto" },
    ].map(({ id, label }) => (
      <button
        key={id}
        onClick={() => scrollToSection(id)}
        className={`py-3 text-left font-medium transition-all duration-300 ${
          scrolled
            ? "text-gray-700 hover:text-blue-600"
            : "text-white hover:text-blue-300"
        }`}
      >
        {label}
      </button>
    ))}
  </>
);

export default Nav;
