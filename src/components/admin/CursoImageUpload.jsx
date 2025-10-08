// src/components/admin/CursoImageUpload.jsx
export default function CursoImageUpload({ preview, onImageChange }) {
  return (
    <label
      className="mb-3 w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-orange-200 cursor-pointer hover:border-orange-400 transition group relative"
      title="Haz clic para subir portada"
    >
      {preview ? (
        <img
          src={preview}
          alt="Vista previa"
          className="object-cover w-full h-full rounded-2xl"
        />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <svg
            width="60"
            height="60"
            viewBox="0 0 48 48"
            fill="none"
            className="mx-auto mb-2"
          >
            <rect x="6" y="10" width="36" height="28" rx="4" fill="#FFEDD5" />
            <rect x="10" y="14" width="28" height="20" rx="2" fill="#FDBA74" />
            <rect x="14" y="18" width="20" height="12" rx="1" fill="#fff" />
            <rect x="16" y="20" width="16" height="8" rx="1" fill="#FDBA74" />
          </svg>
          <span className="text-xs md:text-sm text-gray-400 group-hover:text-orange-400 font-semibold">
            Subir portada
          </span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
      />
    </label>
  );
}
