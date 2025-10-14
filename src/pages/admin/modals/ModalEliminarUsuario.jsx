import React from "react";
import Modal from "./Modal";

export default function ModalEliminarUsuario({
  user,
  onClose,
  onDelete,
  loading,
  error,
}) {
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

  const handleConfirmDelete = async () => {
    try {
      await onDelete(user);
      // Mostrar mensaje de éxito
      const userType = user.rol === "ADMIN" ? "profesor" : "estudiante";

      // Crear un modal de éxito personalizado
      const successModal = document.createElement("div");
      successModal.className =
        "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50";
      successModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-4 max-w-sm w-full text-center shadow-xl">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Éxito!</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">${
            userType.charAt(0).toUpperCase() + userType.slice(1)
          } eliminado correctamente</p>
          <button onclick="this.parentElement.parentElement.remove()" class="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
            Aceptar
          </button>
        </div>
      `;
      document.body.appendChild(successModal);

      // Auto-eliminar el modal después de 3 segundos
      setTimeout(() => {
        if (successModal.parentElement) {
          successModal.remove();
        }
      }, 3000);
    } catch (err) {
      // El error ya se maneja en el componente padre
      console.error("Error al eliminar:", err);
    }
  };

  const userType = user.rol === "ADMIN" ? "profesor" : "estudiante";

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
