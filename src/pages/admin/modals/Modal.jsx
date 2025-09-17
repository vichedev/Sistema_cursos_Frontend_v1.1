import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-10 bg-opacity-20 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose} // Cierra modal al hacer click fuera del contenido
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 border border-blue-200 transform transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Evita cierre al click dentro del modal
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200 font-bold text-2xl select-none"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}