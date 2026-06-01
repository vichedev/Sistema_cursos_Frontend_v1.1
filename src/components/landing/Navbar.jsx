import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" strokeWidth="2" />
    <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const ThemeToggle = ({ scrolled }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema claro/oscuro"
      title="Cambiar tema"
      className={`p-2.5 rounded-xl transition-colors ${
        scrolled
          ? "text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          : "text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (sectionId) => {
    closeMenu();
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-slate-700/60"
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
              <div className={`transition-all duration-300 ${scrolled ? "opacity-100" : "opacity-0 md:opacity-100"}`}>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  MAAT ACADEMY
                </span>
              </div>
            </div>
          </Link>

          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-10 ml-auto">
            <NavLinks scrollToSection={scrollToSection} scrolled={scrolled} />
            <div className="flex items-center gap-4">
              <ThemeToggle scrolled={scrolled} />
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-100 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          </div>

          {/* Móvil: toggle + hamburguesa */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle scrolled={scrolled} />
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                  : "text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden px-4 pb-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg transition-all duration-300">
          <div className="flex flex-col space-y-4 pt-4">
            <MobileNavLinks scrollToSection={scrollToSection} />
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                onClick={closeMenu}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-100 font-semibold text-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300"
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

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "sobre-nosotros", label: "Sobre Nosotros" },
  { id: "cursos", label: "Cursos" },
  { id: "contacto", label: "Contacto" },
];

const NavLinks = ({ scrollToSection, scrolled }) => (
  <div className="flex items-center space-x-8">
    {SECTIONS.map(({ id, label }) => (
      <button
        key={id}
        onClick={() => scrollToSection(id)}
        className={`font-medium transition-all duration-300 hover:scale-105 ${
          scrolled
            ? "text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
            : "text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-300"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const MobileNavLinks = ({ scrollToSection }) => (
  <>
    {SECTIONS.map(({ id, label }) => (
      <button
        key={id}
        onClick={() => scrollToSection(id)}
        className="py-3 text-left font-medium text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
      >
        {label}
      </button>
    ))}
  </>
);

export default Nav;
