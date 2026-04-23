import React, { useState } from "react";
import { FaTimes, FaShieldAlt, FaCheck } from "react-icons/fa";

function PrivacyModal({ open, onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  const handleAccept = () => {
    if (!checked) return;
    setChecked(false);
    onAccept();
  };

  const handleClose = () => {
    setChecked(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative rounded-t-2xl flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-3xl text-blue-200" />
            <div>
              <h2 className="text-xl font-bold">Política de Privacidad</h2>
              <p className="text-blue-100 text-sm mt-1">
                Antes de continuar, lee y acepta nuestros términos
              </p>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-gray-700 dark:text-gray-300 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              📋 Resumen de nuestra Política
            </h3>
            <p className="text-blue-700 dark:text-blue-400 text-xs">
              Al inscribirte o adquirir un curso, confirmas haber leído y aceptado los términos que se detallan a continuación.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🔐</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Datos que recopilamos</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Nombre, correo electrónico y datos de contacto proporcionados al registrarte. En pagos, los datos de transacción son procesados directamente por <strong>Payphone</strong> — no almacenamos información de tarjetas de crédito.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🎓</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Uso de la información</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tus datos se utilizan exclusivamente para gestionar tu inscripción, enviarte información del curso, notificaciones de pago y, si lo autorizas, comunicaciones sobre nuevos cursos disponibles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🤝</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Compartir datos</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No vendemos ni cedemos tu información a terceros. Solo la compartimos con proveedores de servicios necesarios para el funcionamiento de la plataforma (pasarela de pago, servicio de correo), bajo acuerdos de confidencialidad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⚖️</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Tus derechos</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, contáctanos a través de los canales oficiales de la plataforma.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">💳</span>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Política de pagos y reembolsos</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Los pagos son procesados de forma segura. Las solicitudes de reembolso deben realizarse dentro de las 48 horas posteriores a la compra y antes de acceder al contenido del curso, conforme a nuestras condiciones de servicio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox de aceptación */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200 ${
                checked
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-400 dark:border-gray-500 group-hover:border-blue-400"
              }`}
              onClick={() => setChecked((v) => !v)}
            >
              {checked && <FaCheck className="text-white text-xs" />}
            </div>
            <span
              className="text-sm text-gray-700 dark:text-gray-300 leading-snug select-none"
              onClick={() => setChecked((v) => !v)}
            >
              He leído y acepto la{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Política de Privacidad
              </span>{" "}
              y los{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Términos de Servicio
              </span>{" "}
              de la plataforma.
            </span>
          </label>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={!checked}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaShieldAlt className="text-sm" />
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PrivacyModal };
