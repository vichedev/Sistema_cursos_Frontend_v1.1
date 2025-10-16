import React, { useState, useEffect } from "react";
import Modal from "./Modal";

export default function ModalEliminarUsuario({
  user,
  onClose,
  onDelete,
  loading,
  error,
}) {
  const [estadoEliminacion, setEstadoEliminacion] = useState("inicial"); // 'inicial', 'exito', 'advertencia'
  const [mensajePersonalizado, setMensajePersonalizado] = useState("");

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (user && user.id) {
      setEstadoEliminacion("inicial");
      setMensajePersonalizado("");
    }
  }, [user]);

  if (!user || !user.id) {
    return (
      <Modal onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando usuario...
          </p>
        </div>
      </Modal>
    );
  }

  // En ModalEliminarUsuario.jsx - modificar handleConfirmDelete
  const handleConfirmDelete = async () => {
    try {
      const result = await onDelete(user);

      // ✅ NUEVO: Verificar si la eliminación fue exitosa o si hay advertencia
      if (result && result.success) {
        // Éxito - mostrar estado de éxito
        setEstadoEliminacion("exito");

        // Auto-cerrar después de 2 segundos
        setTimeout(() => {
          onClose();
          // Recargar la lista de usuarios
          if (window.location.reload) window.location.reload();
        }, 2000);
      } else {
        // Mostrar advertencia (no se puede eliminar por relaciones)
        setEstadoEliminacion("advertencia");
        setMensajePersonalizado(
          result?.message || error || "No se puede eliminar el usuario"
        );
      }
    } catch (err) {
      // Manejar errores inesperados
      setEstadoEliminacion("advertencia");
      setMensajePersonalizado(
        err.response?.data?.message || "Error interno del servidor"
      );
    }
  };

  const userType = user.rol === "ADMIN" ? "profesor" : "estudiante";

  // Renderizar estado de éxito
  if (estadoEliminacion === "exito") {
    return (
      <Modal onClose={onClose}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 shadow-md">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
            ¡Éxito!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {userType === "profesor" ? "Profesor" : "Estudiante"} eliminado
            correctamente
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-6">
          <p className="text-green-800 dark:text-green-200 text-center">
            <span className="font-bold">
              {user.nombres} {user.apellidos}
            </span>{" "}
            ha sido eliminado permanentemente del sistema.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200"
          >
            Aceptar
          </button>
        </div>
      </Modal>
    );
  }

  // Renderizar estado de advertencia (no se puede eliminar)
  if (estadoEliminacion === "advertencia") {
    return (
      <Modal onClose={onClose}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4 shadow-md">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            No se puede eliminar
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Información asociada encontrada
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-center font-semibold mb-3">
            {mensajePersonalizado ||
              "No se puede eliminar el usuario porque tiene información asociada"}
          </p>
          <div className="text-yellow-700 dark:text-yellow-300 text-sm space-y-2">
            <p>
              📚 <strong>Cursos inscritos</strong>
            </p>
            <p>
              🎫 <strong>Cupones utilizados</strong>
            </p>
            <p>
              💳 <strong>Pagos realizados</strong>
            </p>
            <p className="text-xs mt-3">
              Para eliminar este {userType}, primero debe eliminar o transferir
              esta información.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-xl hover:bg-yellow-700 transition-colors duration-200"
          >
            Entendido
          </button>
        </div>
      </Modal>
    );
  }

  // Renderizar estado inicial (confirmación de eliminación)
  return (
    <Modal onClose={onClose}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4 shadow-md">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
          Eliminar {userType === "profesor" ? "Profesor" : "Estudiante"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Esta acción no se puede deshacer
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-700 flex items-start gap-2">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-6 shadow-sm">
        <p className="text-red-800 dark:text-red-200 text-center text-lg font-semibold">
          ¿Estás seguro que deseas eliminar a{" "}
          <span className="font-bold">
            {user.nombres} {user.apellidos}
          </span>
          ?
        </p>
        <p className="text-red-700 dark:text-red-300 text-sm text-center mt-2">
          {userType === "profesor"
            ? "El profesor y toda su información asociada será eliminada permanentemente."
            : "El estudiante y toda su información asociada será eliminada permanentemente."}
        </p>

        {/* Información adicional sobre posibles restricciones */}
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            ⚠️ <strong>Nota:</strong> Si el {userType} tiene cursos, cupones o
            pagos asociados, no podrá ser eliminado y se mostrará una
            advertencia.
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmDelete}
          disabled={loading}
          className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Eliminando...
            </>
          ) : (
            `Eliminar ${userType === "profesor" ? "Profesor" : "Estudiante"}`
          )}
        </button>
      </div>
    </Modal>
  );
}
