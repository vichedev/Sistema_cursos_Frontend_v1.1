import React from "react";
import Modal from "./Modal";

export default function ModalVerUsuario({ user, onClose, loading, error }) {
  if (loading) {
    return (
      <Modal onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando usuario...</p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      </Modal>
    );
  }

  if (!user || !user.id) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Usuario no encontrado.</p>
        </div>
      </Modal>
    );
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No enviado";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Estado de verificación con íconos y colores
  const getVerificationStatus = () => {
    if (user.emailVerified) {
      return {
        text: "Verificado",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      };
    } else {
      return {
        text: "No verificado",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      };
    }
  };

  // Estado de cuenta activa
  const getAccountStatus = () => {
    if (user.activo) {
      return {
        text: "Activa",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12a1 1 0 112 0 1 1 0 01-2 0zm1-8a1 1 0 00-1 1v4a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      };
    } else {
      return {
        text: "Inactiva",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      };
    }
  };

  const verificationStatus = getVerificationStatus();
  const accountStatus = getAccountStatus();

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
    { 
      label: "Estado de Cuenta", 
      value: (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${accountStatus.bgColor} ${accountStatus.color}`}>
          {accountStatus.icon}
          {accountStatus.text}
        </span>
      )
    },
    { 
      label: "Verificación de Correo", 
      value: (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.bgColor} ${verificationStatus.color}`}>
          {verificationStatus.icon}
          {verificationStatus.text}
        </span>
      )
    },
    { label: "Correo de Verificación Enviado", value: formatDate(user.emailVerificationSentAt) },
    { label: "Token de Verificación", value: user.emailVerificationToken ? "✓ Generado" : "No generado" },
    { label: "Contraseña (hash)", value: "••••••••••" },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 shadow-md">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalles de Usuario</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Información completa del usuario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1 py-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">{label}</label>
            <div className="text-gray-800 dark:text-gray-200 font-medium truncate" title={typeof value === 'string' ? value : label}>
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