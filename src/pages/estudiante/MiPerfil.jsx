// src/pages/estudiante/MiPerfil.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/axiosInstance";
import { swSuccess, swError } from "../../utils/swalConfig";
import { compressImage } from "../../utils/compressImage";
import { FaUserCircle, FaCamera, FaSpinner, FaSave, FaEnvelope } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    api
      .get("/api/users/profile/me")
      .then((r) => {
        setPerfil(r.data);
        setNombres(r.data?.nombres || "");
        setApellidos(r.data?.apellidos || "");
      })
      .catch(() => swError("No se pudo cargar tu perfil"))
      .finally(() => setLoading(false));
  }, []);

  const avatarUrl = perfil?.foto
    ? perfil.foto.startsWith("http")
      ? perfil.foto
      : `${BACKEND_URL}/uploads/${perfil.foto}`
    : null;

  const onFoto = async (e) => {
    const original = e.target.files?.[0];
    if (!original) return;
    setUploading(true);
    try {
      const file = await compressImage(original, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
      const fd = new FormData();
      fd.append("foto", file);
      const { data } = await api.post("/api/users/profile/avatar", fd);
      setPerfil((p) => ({ ...p, foto: data.foto }));
      // Refresca el nombre guardado en localStorage por si el navbar lo usa
      swSuccess("Foto actualizada");
    } catch (err) {
      swError("Error al subir la foto", err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const guardar = async () => {
    if (!nombres.trim()) return swError("El nombre no puede estar vacío");
    setSaving(true);
    try {
      const { data } = await api.put("/api/users/profile/me", {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
      });
      setPerfil(data);
      localStorage.setItem("nombres", `${data.nombres} ${data.apellidos}`.trim());
      swSuccess("Perfil actualizado");
    } catch (err) {
      swError("Error al guardar", err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-gray-400">
        <FaSpinner className="animate-spin mr-2" /> Cargando perfil...
      </div>
    );
  }

  const iniciales = `${(nombres[0] || "").toUpperCase()}${(apellidos[0] || "").toUpperCase()}` || "?";

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl p-6 md:p-7 text-white shadow-lg bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaUserCircle /> Mi perfil
          </h1>
          <p className="text-blue-100 mt-1.5 text-sm">
            Actualiza tu nombre y tu foto de perfil.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900/40 shadow"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow">
                  {iniciales}
                </div>
              )}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 disabled:opacity-60"
                title="Cambiar foto"
              >
                {uploading ? <FaSpinner className="animate-spin" size={14} /> : <FaCamera size={14} />}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFoto}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              JPG, PNG o WebP · se ajusta automáticamente
            </p>
          </div>

          {/* Datos */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Nombres</span>
                <input
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Tus nombres"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Apellidos</span>
                <input
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Tus apellidos"
                />
              </label>
            </div>

            {/* Correo (solo lectura) */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2.5">
              <FaEnvelope className="text-gray-400" />
              <span>{perfil?.correo || "—"}</span>
              <span className="ml-auto text-xs text-gray-400">No editable</span>
            </div>
          </div>

          <button
            onClick={guardar}
            disabled={saving}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold disabled:opacity-60 transition"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
