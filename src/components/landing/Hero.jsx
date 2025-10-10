import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Hero = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Script para partículas
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS("particles-js", {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#3b82f6",
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "repulse" },
              onclick: { enable: true, mode: "push" },
              resize: true,
            },
          },
          retina_detect: true,
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleClick = () => {
    navigate("/login");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Fondo con partículas */}
      <div id="particles-js" className="absolute inset-0 z-0"></div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70 z-1"></div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:px-10 lg:px-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
          {/* Lado izquierdo - Texto más ancho */}
          <div className="text-white flex-1 max-w-2xl lg:max-w-none lg:w-1/2">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-blue-500/30 shadow-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-white">
                  MAAT ACADEMY - Especialistas en Redes
                </span>
              </div>

              {/* Título principal */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-white">Domina las</span>
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Redes Profesionales
                </span>
              </h1>

              {/* Descripción */}
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Conviértete en experto en{" "}
                <span className="text-blue-400 font-semibold">MikroTik</span>,{" "}
                <span className="text-green-400 font-semibold">
                  Fibra Óptica
                </span>
                ,{" "}
                <span className="text-purple-400 font-semibold">
                  Redes Inalámbricas
                </span>{" "}
                y más. Aprende con metodología práctica y instructores
                certificados.
              </p>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleClick}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-3 group"
                >
                  <span>Ver Todos los Cursos</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
               
                <button
                  onClick={() => {
                    const element = document.getElementById("sobre-nosotros");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Conoce Más
                </button>
              </div>

              {/* Tecnologías */}
              <div className="pt-8">
                <p className="text-gray-400 mb-4 font-medium">
                  Tecnologías que dominarás:
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "MikroTik",
                    "Fibra Óptica",
                    "Cisco",
                    "Redes WLAN",
                    "VoIP",
                    "Seguridad",
                    "VPN",
                    "MPLS",
                  ].map((tech, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                    >
                      <span className="text-white text-sm font-medium">
                        {tech}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Imagen más ancha */}
          <div className="flex-1 lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl">
              {/* Tarjeta con imagen */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-8 rounded-2xl shadow-2xl">
                    <img
                      src="/logo_render.png"
                      alt="MAAT ACADEMY"
                      className="w-64 h-64 object-contain filter brightness-110 contrast-110"
                    />
                  </div>
                </div>

                {/* Características técnicas */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: "🛠️", text: "MikroTik Certified" },
                    { icon: "🔌", text: "Fibra Óptica" },
                    { icon: "📡", text: "Redes WLAN" },
                    { icon: "🛡️", text: "Seguridad" },
                    { icon: "🌐", text: "Protocolos" },
                    { icon: "⚡", text: "Alto Rendimiento" },
                    { icon: "🔧", text: "Configuración" },
                    { icon: "📊", text: "Monitoreo" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-white text-sm font-medium">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA adicional */}
                <button
                  onClick={() => navigate("/register")}
                  className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Comenzar Mi Formación
                </button>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/30 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/30 rounded-full blur-sm animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
