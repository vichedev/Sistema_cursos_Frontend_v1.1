import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CursosDisponibles = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/courses/all`);
        const data = await res.json();
        setCursos(data);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-600">Cargando cursos...</div>;
  if (!cursos.length) return <div className="text-center py-20 text-gray-600">No hay cursos disponibles.</div>;

  return (
    <section className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8" >
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Cursos Disponibles en MAAT ACADEMY
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora todos los cursos que tenemos para ti. Para acceder, regístrate o inicia sesión.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="bg-white rounded-3xl shadow-lg border border-gray-200 flex flex-col overflow-hidden"
          >
            <img
              src={curso.imagen ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}` : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"}
              alt={curso.titulo}
              className="w-full h-48 object-cover rounded-t-3xl"
            />
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{curso.titulo}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{curso.descripcion}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {curso.tipo.replace(/_/g, ' ')}
                </span>
                {curso.precio > 0 && (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    ${curso.precio}
                  </span>
                )}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
              >
                Acceder
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CursosDisponibles;
