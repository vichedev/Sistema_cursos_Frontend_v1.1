import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

export default function CursoCardAdmin({ curso, setCursos }) {
  const token = localStorage.getItem("token");

  const eliminarCurso = async () => {
    const confirm = await Swal.fire({
      title: "¿Eliminar curso?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/courses/${curso.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCursos((prev) => prev.filter((c) => c.id !== curso.id));
    Swal.fire("Eliminado", "Curso eliminado correctamente", "success");
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-7 flex flex-col gap-3 h-full">
      <img
        src={
          curso.imagen
            ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
            : "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"
        }
        alt={curso.titulo}
        className="rounded-xl w-full h-32 object-cover mb-2"
      />
      <h3 className="text-xl font-bold text-gray-900">{curso.titulo}</h3>
      <p className="text-gray-600 text-sm flex-1">{curso.descripcion}</p>
      <div className="flex flex-wrap gap-2 my-2">
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
          {curso.tipo.replace(/_/g, " ")}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${curso.cupos === 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
          {curso.cupos} cupos
        </span>
        {curso.precio > 0 && (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
            ${curso.precio}
          </span>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-2 mt-3">
        <Link
          to={`/admin/editar-curso/${curso.id}`}
          className="flex-1 px-4 py-2 rounded-xl text-center bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow hover:bg-blue-100 transition"
        >
          Editar
        </Link>
        <Link
          to={`/admin/estudiantes-curso/${curso.id}`}
          className="flex-1 px-4 py-2 rounded-xl text-center bg-green-50 text-green-700 border border-green-200 font-semibold shadow hover:bg-green-100 transition"
        >
          Estudiantes
        </Link>
        <button
          className="flex-1 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-semibold shadow hover:bg-red-100 transition"
          onClick={eliminarCurso}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
