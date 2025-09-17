import React from "react";
import Modal from "./Modal";

export default function ModalVerUsuario({ user, onClose, loading, error }) {
  if (loading) {
    return (
      <Modal onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </Modal>
    );
  }

  if (!user || !user.id) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">Usuario no encontrado.</p>
        </div>
      </Modal>
    );
  }

  const fields = [
    { label: "ID", value: user.id },
    { label: "Nombres", value: user.nombres },
    { label: "Apellidos", value: user.apellidos },
    { label: "Correo", value: user.correo },
    { label: "Ciudad", value: user.ciudad || "-" },
    { label: "Empresa", value: user.empresa || "-" },
    { label: "Cargo", value: user.cargo || "-" },
    { label: "Usuario", value: user.usuario },
    { label: "Rol", value: user.rol },
    { label: "Contraseña (hash)", value: "••••••••••" },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 shadow-md">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Detalles de Usuario</h2>
        <p className="text-gray-600 mt-1">Información completa del usuario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1 py-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{label}</label>
            <div className="text-gray-800 font-medium truncate" title={value}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md transition-all duration-300"
      >
        Cerrar
      </button>
    </Modal>
  );
}