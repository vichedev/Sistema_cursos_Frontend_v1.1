import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PayphoneButton from "../../components/PayphoneButton";

function ImageModal({ open, src, alt, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

export default function CursosEstudiante() {
  const [cursos, setCursos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalImg, setModalImg] = useState({ open: false, src: "", alt: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");
    setUserId(uid);

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/courses/disponibles`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true', // Agregar este header para evitar la página de advertencia de ngrok
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
      .then((res) => {
       
        
        // Verificar si la respuesta es HTML (error de ngrok)
        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          console.error("Se recibió HTML en lugar de JSON - problema con ngrok o servidor");
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }
        
        // Manejar diferentes estructuras de respuesta
        if (res.data && Array.isArray(res.data.data)) {
          setCursos(res.data.data);
        } else if (Array.isArray(res.data)) {
          setCursos(res.data);
        } else if (res.data && typeof res.data === 'object') {
          // Si es un objeto, intentar extraer array de alguna propiedad
          const possibleArrays = Object.values(res.data).filter(item => Array.isArray(item));
          setCursos(possibleArrays.length > 0 ? possibleArrays[0] : []);
        } else {
          setCursos([]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener cursos:", err);
        
        // Mostrar error específico si es problema de ngrok
        if (err.message && err.message.includes("HTML en lugar de JSON")) {
          Swal.fire({
            title: "Error de Servidor",
            text: "El servidor no está respondiendo correctamente. Verifica que el backend esté corriendo y ngrok esté configurado.",
            icon: "error"
          });
        }
        
        setCursos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleEnroll = async (cursoId) => {
    const token = localStorage.getItem("token");
    try {
      Swal.fire({
        title: "Procesando inscripción...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payments/inscribir-gratis`,
        { cursoId: cursoId, userId: userId },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
          } 
        }
      );

      Swal.close();
      Swal.fire("¡Inscrito!", "Te has inscrito al curso exitosamente", "success");

      setCursos((prev) =>
        prev.map((c) =>
          c.id === cursoId ? { ...c, inscrito: true } : c
        )
      );
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo inscribir al curso",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-300">
        <div className="text-xl font-semibold text-gray-700">Cargando cursos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        {Array.isArray(cursos) && cursos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="group bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                <div className="relative">
                  <img
                    src={
                      curso.imagen
                        ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
                        : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
                    }
                    alt={curso.titulo}
                    className="w-full h-60 object-cover rounded-t-3xl cursor-pointer group-hover:brightness-90 transition"
                    onError={(e) => {
                      // Solo log en caso de error
                      console.error("Error cargando imagen:", curso.titulo);
                      e.target.src = "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";
                    }}
                    onClick={() =>
                      setModalImg({
                        open: true,
                        src: curso.imagen
                          ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
                          : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop",
                        alt: curso.titulo,
                      })
                    }
                  />
                  <span className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs bg-sky-100 text-sky-600 font-bold shadow">
                    {curso.tipo ? curso.tipo.replace(/_/g, " ") : "Curso"}
                  </span>
                  <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-800 font-medium shadow">
                    {curso.cupos || 0} cupos
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{curso.titulo || "Curso sin título"}</h3>
                    <p className="text-gray-700 mb-3">{curso.descripcion || "Sin descripción"}</p>

                    {curso.profesorNombre && (
                      <div className="mb-2 flex flex-wrap gap-2 items-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          Profesor: {curso.profesorNombre}
                        </span>

                        {curso.asignatura && (
                          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                            Asignatura: {curso.asignatura}
                          </span>
                        )}
                      </div>
                    )}

                    {curso.precio > 0 && (
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-base font-bold">
                          ${curso.precio}
                        </span>
                      </div>
                    )}
                    <div className="text-gray-500 text-xs mb-2">
                      Fecha: <span className="font-medium">{curso.fecha || "Por definir"}</span>
                      {" | "}
                      Hora: <span className="font-medium">{curso.hora || "Por definir"}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    {curso.inscrito ? (
                      <div className="text-green-600 font-semibold text-center">
                        <span className="inline-block px-3 py-1 rounded-xl bg-green-100">
                          Ya inscrito en este curso
                        </span>
                      </div>
                    ) : curso.precio > 0 ? (
                      <>
                        <p className="text-xs text-blue-600 font-semibold mb-2 text-center">
                          Curso de pago. Paga con Payphone y te inscribes automáticamente.
                        </p>
                        <div className="flex justify-center">
                          <PayphoneButton
                            curso={curso}
                            userId={userId}
                            onSuccess={() =>
                              setCursos((prev) =>
                                prev.map((c) =>
                                  c.id === curso.id ? { ...c, inscrito: true } : c
                                )
                              )
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-green-700 font-semibold mb-2 text-center">
                          Curso gratuito. Haz clic para inscribirte.
                        </p>
                        <button
                          onClick={() => handleEnroll(curso.id)}
                          className="w-full bg-gradient-to-r from-green-400 to-lime-400 text-white px-5 py-2 rounded-xl font-bold shadow hover:scale-105 transition"
                        >
                          Inscribirse gratis
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700">
              No hay cursos disponibles en este momento
            </h2>
            <p className="text-gray-500 mt-2">
              Vuelve más tarde para ver nuevos cursos
            </p>
          </div>
        )}
      </div>
      
      <ImageModal
        open={modalImg.open}
        src={modalImg.src}
        alt={modalImg.alt}
        onClose={() => setModalImg({ open: false, src: "", alt: "" })}
      />
    </div>
  );
}