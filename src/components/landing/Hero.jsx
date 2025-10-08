import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login'); // Cambié a ruta cursos disponibles
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/img/fondo3.jpg"
          alt="Fondo educativo"
          className="w-full h-full object-cover brightness-75"
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:px-10 lg:px-10 flex flex-col lg:flex-row items-center gap-10">

        {/* Contenedor de texto a la izquierda */}
        <div className="text-white max-w-2xl flex flex-col gap-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            <span className="block">Aprende con MAAT</span>
            <span className="block bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              Cursos Online de Calidad
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-lg">
            Amplía tus habilidades y conocimientos con cursos diseñados para ti, con instructores expertos y materiales actualizados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClick}
              className="px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Ver Cursos Disponibles →
            </button>
          </div>

          {/* Badges */}
          <div className="mt-10 flex flex-wrap gap-4">
            <div className="flex items-center bg-white/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Certificados Oficiales</span>
            </div>
            <div className="flex items-center bg-white/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Aprende a tu ritmo</span>
            </div>
            <div className="flex items-center bg-white/90 px-4 py-2 rounded-full shadow-md backdrop-blur-sm">
              <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-800">Material actualizado</span>
            </div>
          </div>
        </div>

        {/* Imagen / Logo destacado */}
        <div className="relative w-full max-w-lg flex justify-center">
          <img
            src="/logo_render.png"
            alt="Logo"
            className="w-full h-auto object-contain scale-125"
          />
        </div>


      </div>
    </section>
  );
};

export default Hero;
