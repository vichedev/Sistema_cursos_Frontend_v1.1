import React from "react";
import { FaEye, FaTimes } from "react-icons/fa";

// ✅ NUEVO MODAL PARA DESCRIPCIÓN COMPLETA
function DescriptionModal({ open, curso, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 p-2 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden transition-colors duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal - MEJORADO PARA MÓVIL */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 text-white hover:text-gray-200 transition-colors bg-black/20 rounded-full p-1"
          >
            <FaTimes className="text-lg md:text-xl" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold mb-2 pr-10 md:pr-8 line-clamp-2">
            {curso.titulo || "Curso sin título"}
          </h2>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {curso.profesorNombre && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs md:text-sm">
                👨‍🏫 {curso.profesorNombre}
              </span>
            )}
            {curso.asignatura && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs md:text-sm">
                📚 {curso.asignatura}
              </span>
            )}
          </div>
        </div>

        {/* Contenido del Modal - MEJORADO PARA MÓVIL */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
              <FaEye className="text-blue-500 dark:text-blue-400 text-sm md:text-base" />
              Descripción Completa del Curso
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <div className="max-h-[30vh] md:max-h-[40vh] overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {curso.descripcion ||
                    "Este curso no tiene descripción disponible."}
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional - MEJORADA PARA MÓVIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700 transition-colors duration-200">
              <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                📅 Fecha del Curso
              </div>
              <div className="text-blue-700 dark:text-blue-400">
                {curso.fecha || "Por definir"}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700 transition-colors duration-200">
              <div className="font-semibold text-green-800 dark:text-green-300 mb-1">
                ⏰ Horario
              </div>
              <div className="text-green-700 dark:text-green-400">
                {curso.hora || "Por definir"}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700 transition-colors duration-200">
              <div className="font-semibold text-purple-800 dark:text-purple-300 mb-1">
                🎯 Cupos Disponibles
              </div>
              <div className="text-purple-700 dark:text-purple-400">
                {curso.cupos || 0} cupos
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-700 transition-colors duration-200">
              <div className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                💰 Precio
              </div>
              <div className="text-orange-700 dark:text-orange-400">
                {curso.precio > 0 ? `$${curso.precio} USD` : "Gratuito"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal - SIEMPRE VISIBLE */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 md:py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm md:text-base"
          >
            Cerrar Descripción
          </button>
        </div>
      </div>
    </div>
  );
}
export { DescriptionModal };
