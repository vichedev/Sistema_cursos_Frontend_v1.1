// src/pages/admin/modals/ModalEditarUsuario.jsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Swal from "sweetalert2";
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeName,
  sanitizeUsername,
} from "../../../utils/sanitize";
import { LATAM_COUNTRIES } from "../../../constants/latam-countries";

export default function ModalEditarUsuario({
  user,
  onClose,
  onUpdate,
  loading,
  error,
}) {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    pais: "",
    ciudad: "",
    empresa: "",
    cargo: "",
    usuario: "",
    rol: "",
    asignatura: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        correo: user.correo || "",
        pais: user.pais || "",
        ciudad: user.ciudad || "",
        empresa: user.empresa || "",
        cargo: user.cargo || "",
        usuario: user.usuario || "",
        rol: user.rol || "",
        asignatura: user.asignatura || "",
        password: "", // Vacío para no mostrar hash
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    switch (name) {
      case "nombres":
      case "apellidos":
        sanitizedValue = sanitizeName(value);
        break;
      case "correo":
        sanitizedValue = sanitizeEmail(value);
        break;
      case "usuario":
        sanitizedValue = sanitizeUsername(value);
        break;
      case "cedula":
      case "celular":
        sanitizedValue = sanitizeNumber(value);
        break;
      case "password":
        sanitizedValue = sanitizeInput(value);
        break;
      case "pais":
      case "ciudad":
      case "empresa":
      case "cargo":
      case "asignatura":
        sanitizedValue = sanitizeInput(value);
        break;
      default:
        sanitizedValue = sanitizeInput(value);
    }

    setForm((f) => ({ ...f, [name]: sanitizedValue }));
  };

  const validateForm = () => {
    if (!form.nombres.trim() || !form.apellidos.trim()) {
      return "Los nombres y apellidos son obligatorios";
    }

    if (
      !form.correo.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)
    ) {
      return "Por favor, ingresa un correo electrónico válido";
    }

    if (!form.usuario.trim() || form.usuario.length < 3) {
      return "El usuario debe tener al menos 3 caracteres";
    }

    if (form.password && form.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      Swal.fire({
        title: "Error de validación",
        text: validationError,
        icon: "error",
        confirmButtonText: "Entendido",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
      return;
    }

    Swal.fire({
      title: "Actualizando usuario...",
      allowOutsideClick: false,
      background: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#ffffff",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#000000",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const dataToUpdate = { ...user, ...form };
    if (!form.password) {
      delete dataToUpdate.password;
    }

    try {
      await onUpdate(dataToUpdate);
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Usuario actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el usuario",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    }
  };

  if (!user || !user.id) {
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

  const isAdmin = form.rol === "ADMIN";

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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Editar Usuario
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Actualice la información del usuario
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-700 flex items-start">
          <svg
            className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
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

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[60vh] overflow-y-auto px-1 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombres
            </label>
            <input
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apellidos
            </label>
            <input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correo electrónico
          </label>
          <input
            name="correo"
            type="email"
            value={form.correo}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* ✅ NUEVO: Campo País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            País
          </label>
          <select
            name="pais"
            value={form.pais}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Seleccione un país</option>
            {LATAM_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name} ({country.dialCode})
              </option>
            ))}
          </select>
        </div>

        {!isAdmin && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciudad
                </label>
                <input
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Empresa
                </label>
                <input
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cargo
                </label>
                <select
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccione un cargo</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Técnico">Técnico</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Usuario
          </label>
          <input
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Asignatura
            </label>
            <input
              name="asignatura"
              value={form.asignatura}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Asignatura que imparte el profesor"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cambiar contraseña (dejar vacío para no modificar)
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Nueva contraseña"
          />
        </div>

        <div className="pt-4 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-300 dark:hover:shadow-blue-900"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
