import React, { useState } from "react";
import Modal from "./Modal";

export default function ModalVerUsuario({
  user,
  onClose,
  loading,
  error,
  onVerifyAccount,
}) {
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  if (loading) {
    return (
      <Modal onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando usuario...
          </p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
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
            <svg
              className="w-8 h-8 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Usuario no encontrado.
          </p>
        </div>
      </Modal>
    );
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No enviado";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear teléfono - VERSIÓN MEJORADA
  const formatPhone = (phone) => {
    if (!phone || phone.trim() === "") return "No registrado";

    // Limpiar el número
    const cleaned = phone.replace(/\D/g, "");

    // Si está vacío después de limpiar
    if (cleaned === "") return "No registrado";

    // Formato para Ecuador: +593 99 123 4567
    if (cleaned.length === 10) {
      return `+593 ${cleaned.substring(1, 3)} ${cleaned.substring(
        3,
        6
      )} ${cleaned.substring(6)}`;
    }

    // Formato internacional completo
    if (cleaned.length === 12 && cleaned.startsWith("593")) {
      return `+593 ${cleaned.substring(3, 5)} ${cleaned.substring(
        5,
        8
      )} ${cleaned.substring(8)}`;
    }

    // Si no coincide con ningún formato, devolver el original
    return phone;
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
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    } else {
      return {
        text: "No verificado",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
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
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12a1 1 0 112 0 1 1 0 01-2 0zm1-8a1 1 0 00-1 1v4a1 1 0 102 0V5a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    } else {
      return {
        text: "Inactiva",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    }
  };

  const verificationStatus = getVerificationStatus();
  const accountStatus = getAccountStatus();

  // Función para manejar la verificación de cuenta
  const handleVerifyAccount = async () => {
    if (!onVerifyAccount) return;

    setVerifying(true);
    setVerifyMessage("");

    try {
      await onVerifyAccount(user.id);
      setVerifyMessage("✅ Cuenta verificada exitosamente");

      // Actualizar el estado local del usuario
      user.emailVerified = true;
      user.emailVerificationToken = null;
    } catch (error) {
      setVerifyMessage(`❌ Error: ${error.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const fields = [
    { label: "ID", value: user.id },
    { label: "Nombres", value: user.nombres },
    { label: "Apellidos", value: user.apellidos },
    { label: "Correo", value: user.correo },
    {
      label: "Teléfono",
      value: (
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span>{formatPhone(user.celular)}</span>
        </div>
      ),
    },
    { label: "Cédula", value: user.cedula || "-" },
    { label: "Ciudad", value: user.ciudad || "-" },
    { label: "Empresa", value: user.empresa || "-" },
    { label: "Cargo", value: user.cargo || "-" },
    { label: "Usuario", value: user.usuario },
    { label: "Rol", value: user.rol },
    {
      label: "Estado de Cuenta",
      value: (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${accountStatus.bgColor} ${accountStatus.color}`}
        >
          {accountStatus.icon}
          {accountStatus.text}
        </span>
      ),
    },
    {
      label: "Verificación de Correo",
      value: (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.bgColor} ${verificationStatus.color}`}
        >
          {verificationStatus.icon}
          {verificationStatus.text}
        </span>
      ),
    },
    {
      label: "Correo de Verificación Enviado",
      value: formatDate(user.emailVerificationSentAt),
    },
    {
      label: "Token de Verificación",
      value: user.emailVerificationToken ? "✓ Generado" : "No generado",
    },
    { label: "Fecha de Creación", value: formatDate(user.createdAt) },
    { label: "Última Actualización", value: formatDate(user.updatedAt) },
  ];

  return (
    <Modal onClose={onClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 shadow-md">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles de Usuario
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {user.nombres} {user.apellidos} - {user.rol}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1 py-2">
        {fields.map(({ label, value }) => (
          <div
            key={label}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm"
          >
            <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
              {label}
            </label>
            <div
              className="text-gray-800 dark:text-gray-200 font-medium truncate"
              title={typeof value === "string" ? value : label}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ BOTÓN DE VERIFICACIÓN AUTOMÁTICA - Solo mostrar si no está verificado */}
      {!user.emailVerified && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Cuenta no verificada
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                El usuario no ha podido verificar su cuenta. Puedes verificarla
                automáticamente.
              </p>
            </div>
          </div>

          {verifyMessage && (
            <div
              className={`mb-3 p-2 rounded text-sm font-medium ${
                verifyMessage.includes("✅")
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {verifyMessage}
            </div>
          )}

          <button
            onClick={handleVerifyAccount}
            disabled={verifying}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-semibold rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Verificando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificar Cuenta Automáticamente
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md transition-all duration-300"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
