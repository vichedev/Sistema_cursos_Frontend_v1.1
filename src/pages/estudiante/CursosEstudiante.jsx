import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PayphoneButton from "../../components/PayphoneButton"; // ✅ Cambio aquí

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");
    setUserId(uid);

    axios
      .get("http://localhost:3001/courses/disponibles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCursos(res.data))
      .catch(() => setCursos([]));
  }, []);

  const handleEnroll = async (cursoId) => {
    const token = localStorage.getItem("token");
    try {
      // SweetAlert loader mientras procesa inscripción
      Swal.fire({
        title: "Procesando inscripción...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(
        "http://localhost:3001/payments/inscribir-gratis",
        { cursoId: cursoId, userId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 to-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
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
                      ? `http://localhost:3001/uploads/${curso.imagen}`
                      : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
                  }
                  alt={curso.titulo}
                  className="w-full h-60 object-cover rounded-t-3xl cursor-pointer group-hover:brightness-90 transition"
                  onClick={() =>
                    setModalImg({
                      open: true,
                      src: curso.imagen
                        ? `http://localhost:3001/uploads/${curso.imagen}`
                        : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop",
                      alt: curso.titulo,
                    })
                  }
                />
                <span className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs bg-sky-100 text-sky-600 font-bold shadow">
                  {curso.tipo.replace(/_/g, " ")}
                </span>
                <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-800 font-medium shadow">
                  {curso.cupos} cupos
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between p-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{curso.titulo}</h3>
                  <p className="text-gray-700 mb-3">{curso.descripcion}</p>

                  {/* Mostrar nombre del profesor si existe */}
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
      </div>
      {/* MODAL PARA AMPLIAR IMAGEN */}
      <ImageModal
        open={modalImg.open}
        src={modalImg.src}
        alt={modalImg.alt}
        onClose={() => setModalImg({ open: false, src: "", alt: "" })}
      />
    </div>
  );
}