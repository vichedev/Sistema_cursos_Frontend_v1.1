import { useState } from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center py-3 px-4 md:px-8">
        {/* Logo alineado a la izquierda */}
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <img
            src="/logo_render.png"
            alt="Logo Cursasos"
            className="h-12 w-auto"
          />
        </Link>

        {/* Menú e íconos a la derecha */}
        <div className="flex items-center">
          {/* Botón hamburguesa en móviles */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 focus:outline-none" aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menú en pantallas grandes */}
          <div className="hidden md:flex items-center space-x-6 ml-6">
            <NavLinks closeMenu={closeMenu} />
            <Link
              to="/login"
              onClick={closeMenu}
              className="ml-6 px-5 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
            >
              Acceder
            </Link>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 bg-white shadow">
          <div className="flex flex-col space-y-3">
            <NavLinks closeMenu={closeMenu} />
            <Link
              to="/login"
              onClick={closeMenu}
              className="mt-4 px-5 py-2 rounded-full bg-orange-500 text-white font-semibold text-center"
            >
              Acceder
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// Reutilizable para todos los enlaces del menú (landing típicos)
const NavLinks = ({ closeMenu }) => (
  <>
    <CustomLink to="/#hero" label="Inicio" closeMenu={closeMenu} />
    <CustomLink to="/#sobre-nosotros" label="Sobre Nosotros" closeMenu={closeMenu} />
    <CustomLink to="/#cursos" label="Cursos Disponibles" closeMenu={closeMenu} />
    <CustomLink to="/#contacto" label="Contacto" closeMenu={closeMenu} />
  </>
);

const CustomLink = ({ to, label, closeMenu }) => (
  <Link
    to={to}
    onClick={closeMenu}
    className="text-gray-700 hover:text-orange-500 transition duration-300 font-medium"
  >
    {label}
  </Link>
);

export default Nav;
