// src/components/admin/InfoPortada.jsx
export default function InfoPortada({ preview }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 border border-gray-200 w-full max-w-[240px]">
      <p className="text-xs text-gray-500 mb-2 text-center">Ejemplo de portada:</p>
      <img
        src={preview || "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop"}
        alt="Ejemplo portada"
        className="rounded-lg w-full h-24 md:h-32 object-cover mb-2"
      />
      <span className="text-xs text-gray-700 text-center block">Así la verán tus estudiantes</span>
    </div>
  );
}
