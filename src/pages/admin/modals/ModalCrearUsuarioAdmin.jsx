import React, { useState, useEffect } from "react";
import { FaUserPlus, FaEnvelope, FaUser, FaIdCard, FaPhone, FaLock, FaBook } from "react-icons/fa";

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-10 bg-opacity-70 backdrop-blur-md"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="relative bg-white rounded-3xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white transition"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ModalCrearUsuario({ onClose, onCreate, loading, error }) {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    usuario: "",
    cedula: "",
    celular: "",
    password: "",
    rol: "ADMIN",
    asignatura: "",
  });

  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    correo: '',
    usuario: '',
    cedula: '',
    celular: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (validationError) setValidationError("");
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Manejo de errores del backend
  useEffect(() => {
    if (error) {
      if (error.includes('correo') || error.includes('Correo')) {
        setFieldErrors(prev => ({ ...prev, correo: "Este correo ya está registrado" }));
      } else if (error.includes('usuario') || error.includes('Usuario')) {
        setFieldErrors(prev => ({ ...prev, usuario: "Este usuario ya existe" }));
      } else if (error.includes('cédula') || error.includes('cedula')) {
        setFieldErrors(prev => ({ ...prev, cedula: "Esta cédula ya está registrada" }));
      } else if (error.includes('celular') || error.includes('teléfono')) {
        setFieldErrors(prev => ({ ...prev, celular: "Este número ya está registrado" }));
      } else {
        setValidationError(error);
      }
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setFieldErrors({ correo: '', usuario: '', cedula: '', celular: '' });

    // Validaciones básicas
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.correo.trim() || 
        !form.usuario.trim() || !form.cedula.trim() || !form.celular.trim() || !form.password.trim()) {
      setValidationError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (!isValidEmail(form.correo)) {
      setFieldErrors(prev => ({ ...prev, correo: "Por favor, ingresa un correo electrónico válido." }));
      return;
    }

    if (form.password.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    await onCreate(form);
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
          <FaUserPlus className="text-white w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Agregar Administrador/Docente</h2>
      </div>

      {validationError && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 flex items-center gap-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.681-1.36 3.446 0l6.518 11.59c.75 1.334-.213 2.98-1.723 2.98H3.462c-1.51 0-2.473-1.646-1.723-2.98l6.518-11.59zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            icon={<FaUser className="text-blue-600" />}
            label="Nombres"
            name="nombres"
            value={form.nombres}
            onChange={handleChange}
            placeholder="Nombres"
            required
          />
          <InputField
            icon={<FaUser className="text-blue-600" />}
            label="Apellidos"
            name="apellidos"
            value={form.apellidos}
            onChange={handleChange}
            placeholder="Apellidos"
            required
          />
        </div>

        <InputField
          icon={<FaEnvelope className="text-blue-600" />}
          label="Correo electrónico"
          name="correo"
          type="email"
          value={form.correo}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          required
          error={fieldErrors.correo}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            icon={<FaUser className="text-blue-600" />}
            label="Usuario"
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
            error={fieldErrors.usuario}
          />
          <InputField
            icon={<FaLock className="text-blue-600" />}
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            icon={<FaIdCard className="text-blue-600" />}
            label="Cédula"
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            placeholder="Número de cédula"
            required
            error={fieldErrors.cedula}
          />
          <InputField
            icon={<FaPhone className="text-blue-600" />}
            label="Celular"
            name="celular"
            value={form.celular}
            onChange={handleChange}
            placeholder="Número de celular"
            required
            error={fieldErrors.celular}
          />
        </div>

        <InputField
          icon={<FaBook className="text-blue-600" />}
          label="Asignatura que imparte"
          name="asignatura"
          value={form.asignatura}
          onChange={handleChange}
          placeholder="Ej: Matemáticas, Ciencias, etc."
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3
            ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-300"}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando...
            </>
          ) : (
            <>
              <FaUserPlus className="w-5 h-5" />
              Crear Administrador
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}

function InputField({ icon, label, name, value, onChange, placeholder, type = "text", required = false, error = "" }) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
        {icon}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 shadow-sm
          ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}