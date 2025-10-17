import React from "react";
import { FaTimes, FaGift, FaTag } from "react-icons/fa";

// ✅ MODAL PARA CUPONES
function CouponModal({
  open,
  curso,
  codigoCupon,
  onClose,
  onApply,
  loading,
  onCodigoChange,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaGift className="text-2xl text-yellow-300" />
            <div>
              <h2 className="text-xl font-bold">Aplicar Cupón de Descuento</h2>
              <p className="text-purple-100 text-sm mt-1">
                Curso: <strong>{curso?.titulo}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código del Cupón
            </label>
            <input
              type="text"
              placeholder="Ingresa tu código de cupón..."
              value={codigoCupon}
              onChange={(e) => onCodigoChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === "Enter" && onApply()}
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <FaTag className="text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Tipos de Cupones Disponibles
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  {/* ✅ ACTUALIZADO CON NUEVOS CUPONES */}
                  <li>
                    🎯 <strong>10% de descuento</strong> - Ahorra una décima
                    parte
                  </li>
                  <li>
                    🔥 <strong>15% de descuento</strong> - Descuento especial
                  </li>
                  <li>
                    💥 <strong>30% de descuento</strong> - Ahorra casi un tercio
                  </li>
                  <li>
                    ⚡ <strong>50% de descuento</strong> - ¡Mitad de precio!
                  </li>
                  <li>
                    🎁 <strong>Curso GRATIS</strong> - Acceso completo sin costo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={onApply}
              disabled={loading || !codigoCupon.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <FaGift />
                  Aplicar Cupón
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CouponModal };
