import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const TECHS = ["MikroTik", "Fibra Óptica", "Cisco", "Redes WLAN", "VoIP", "Seguridad", "VPN", "MPLS"];

const FEATURES = [
  { icon: "🛠️", text: "MikroTik Certified" },
  { icon: "🔌", text: "Fibra Óptica" },
  { icon: "📡", text: "Redes WLAN" },
  { icon: "🛡️", text: "Seguridad" },
  { icon: "🌐", text: "Protocolos" },
  { icon: "⚡", text: "Alto Rendimiento" },
];

const STATS = [
  { value: "+100", label: "Estudiantes" },
  { value: "+15", label: "Cursos" },
  { value: "98%", label: "Satisfacción" },
];

const Hero = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Partículas que se reinicializan según el tema (colores adaptados).
  useEffect(() => {
    let cancelled = false;

    const destroy = () => {
      if (window.pJSDom && window.pJSDom.length) {
        try {
          window.pJSDom.forEach((p) => p?.pJS?.fn?.vendors?.destroypJS?.());
        } catch {
          /* ignore */
        }
        window.pJSDom = [];
      }
    };

    const init = () => {
      if (cancelled || !window.particlesJS) return;
      destroy();
      const dot = isDark ? "#ffffff" : "#2563eb";
      const link = isDark ? "#60a5fa" : "#6366f1";
      window.particlesJS("particles-js", {
        particles: {
          number: { value: 70, density: { enable: true, value_area: 900 } },
          color: { value: dot },
          shape: { type: "circle" },
          opacity: { value: isDark ? 0.35 : 0.25, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: link, opacity: isDark ? 0.25 : 0.18, width: 1 },
          move: { enable: true, speed: 1.8, direction: "none", random: true, straight: false, out_mode: "out" },
        },
        interactivity: {
          detect_on: "canvas",
          events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
        },
        retina_detect: true,
      });
    };

    const ensureScript = () =>
      new Promise((resolve) => {
        if (window.particlesJS) return resolve();
        const existing = document.getElementById("particles-js-script");
        if (existing) return existing.addEventListener("load", () => resolve());
        const script = document.createElement("script");
        script.id = "particles-js-script";
        script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    ensureScript().then(init);
    return () => {
      cancelled = true;
      destroy();
    };
  }, [isDark]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden
                 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
                 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950
                 transition-colors duration-500"
    >
      {/* Partículas */}
      <div id="particles-js" className="absolute inset-0 z-0" />

      {/* Blobs decorativos animados */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-400/25 dark:bg-purple-600/20 blur-3xl animate-pulse [animation-delay:1.5s]" />
        <div className="absolute -bottom-32 left-1/4 w-[26rem] h-[26rem] rounded-full bg-cyan-300/25 dark:bg-cyan-500/15 blur-3xl animate-pulse [animation-delay:0.8s]" />
      </div>

      {/* Velo sutil para legibilidad */}
      <div className="absolute inset-0 z-0 bg-white/30 dark:bg-black/30" />

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 sm:px-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
          {/* Izquierda — texto */}
          <div className="flex-1 lg:w-1/2 max-w-2xl lg:max-w-none">
            <div className="space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-full px-5 py-2.5
                              bg-white/70 dark:bg-white/10 backdrop-blur-md
                              border border-blue-200/70 dark:border-white/15 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                </span>
                <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-100">
                  MAAT ACADEMY · Especialistas en Redes
                </span>
              </div>

              {/* Título */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="block text-slate-900 dark:text-white">Domina las</span>
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Redes Profesionales
                </span>
              </h1>

              {/* Descripción */}
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Conviértete en experto en{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">MikroTik</span>,{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Fibra Óptica</span> y{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">Redes Inalámbricas</span>.
                Metodología práctica e instructores certificados.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => navigate("/login")}
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                >
                  <span>Ver Todos los Cursos</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button
                  onClick={() => document.getElementById("sobre-nosotros")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white font-semibold text-lg hover:bg-white dark:hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-sm"
                >
                  Conoce Más
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tecnologías */}
              <div className="pt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">Tecnologías que dominarás:</p>
                <div className="flex flex-wrap gap-2.5">
                  {TECHS.map((tech) => (
                    <span
                      key={tech}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium
                                 bg-white/60 dark:bg-white/5 backdrop-blur-sm
                                 border border-slate-200 dark:border-white/10
                                 text-slate-700 dark:text-slate-200
                                 hover:border-blue-400/70 dark:hover:border-blue-500/50 hover:scale-105 transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Derecha — tarjeta visual */}
          <div className="flex-1 lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl">
              <div className="rounded-3xl p-8
                              bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl
                              border border-white/60 dark:border-white/10
                              shadow-2xl shadow-blue-500/10 dark:shadow-black/40">
                {/* Logo con halo */}
                <div className="flex justify-center">
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-500/20 dark:to-purple-600/20">
                    <div className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-2xl" />
                    <img
                      src="/logo_render.png"
                      alt="MAAT ACADEMY"
                      className="relative w-56 h-56 object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mt-8">
                  {FEATURES.map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 p-3 rounded-xl
                                 bg-white/70 dark:bg-white/5
                                 border border-slate-200/70 dark:border-white/10
                                 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:scale-[1.03] transition-all duration-300"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate("/register")}
                  className="w-full mt-6 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  Comenzar Mi Formación
                </button>
              </div>

              {/* Adornos flotantes */}
              <div className="absolute -top-5 -right-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 flex items-center justify-center text-white text-xl rotate-12 animate-bounce [animation-duration:3s]">
                ⚡
              </div>
              <div className="absolute -bottom-5 -left-5 w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/40 flex items-center justify-center text-white text-lg -rotate-12 animate-bounce [animation-duration:3.5s] [animation-delay:0.5s]">
                🌐
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-slate-400/50 dark:border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-500/60 dark:bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
