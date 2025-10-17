import React from "react";

// ✅ MODAL PARA IMAGEN
function ImageModal({ open, src, alt, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] rounded-3xl shadow-2xl border-4 border-white dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
export { ImageModal };
