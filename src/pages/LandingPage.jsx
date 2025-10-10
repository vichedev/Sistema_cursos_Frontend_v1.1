// LandingPage.jsx - Actualizado con IDs para las secciones
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import SobreNosotros from "../components/landing/SobreNosotros";
import CursosDisponibles from "../components/landing/CursosDisponibles";
import Contacto from "../components/landing/Contacto";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Secciones con IDs para navegación */}
      <section id="hero">
        <Hero />
      </section>
      
      <section id="sobre-nosotros">
        <SobreNosotros />
      </section>
      
      <section id="cursos">
        <CursosDisponibles />
      </section>
      
      <section id="contacto">
        <Contacto />
      </section>
      
      <Footer />
    </div>
  );
}