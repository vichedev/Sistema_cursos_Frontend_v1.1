// src/pages/admin/Categorias.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosInstance";
import { swSuccess, swError, swConfirm } from "../../utils/swalConfig";
import { FaTags, FaPlus, FaSpinner, FaTrash, FaEdit, FaTimes, FaCheck } from "react-icons/fa";

const COLORS = ["#2563eb", "#7c3aed", "#dc2626", "#ea580c", "#16a34a", "#0891b2", "#db2777", "#ca8a04"];
const ICONS = ["📡", "🛡️", "🔌", "🌐", "🖥️", "⚙️", "📶", "🔧", "💾", "🔐", "📚", "🎓"];

export default function Categorias() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // categoría en edición o {} para nueva
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/categories");
      setCats(data.data || []);
    } catch {
      swError("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (form) => {
    if (!form.nombre?.trim()) return swError("Escribe un nombre");
    setSaving(true);
    try {
      if (form.id) await api.put(`/api/categories/${form.id}`, form);
      else await api.post("/api/categories", form);
      swSuccess(form.id ? "Categoría actualizada" : "Categoría creada");
      setEditing(null);
      load();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (cat) => {
    const r = await swConfirm({
      title: "¿Eliminar categoría?",
      html: `Se eliminará <b>${cat.nombre}</b>. Los cursos que la usaban quedarán sin categoría.`,
      confirmText: "Sí, eliminar",
      icon: "warning",
    });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/api/categories/${cat.id}`);
      swSuccess("Categoría eliminada");
      load();
    } catch (e) {
      swError("Error", e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="mb-6 rounded-2xl p-6 md:p-7 text-white shadow-lg bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaTags /> Categorías
          </h1>
          <p className="text-purple-100 mt-1.5 text-sm">
            Organiza tus cursos por categoría (MikroTik, Redes, Seguridad…). Se muestran a los estudiantes y en la web.
          </p>
        </div>
        <button
          onClick={() => setEditing({ nombre: "", descripcion: "", color: COLORS[0], icono: ICONS[0] })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-sm"
        >
          <FaPlus size={13} /> Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <FaSpinner className="animate-spin mr-2" /> Cargando...
        </div>
      ) : cats.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FaTags className="mx-auto text-4xl mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Aún no hay categorías. Crea la primera.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
            >
              <span
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: (c.color || "#64748b") + "22", color: c.color || "#64748b" }}
              >
                {c.icono || "🏷️"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{c.nombre}</p>
                <p className="text-xs text-gray-400">
                  {c.cursos} curso{c.cursos === 1 ? "" : "s"}
                  {c.descripcion ? ` · ${c.descripcion}` : ""}
                </p>
              </div>
              <button
                onClick={() => setEditing(c)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Editar"
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={() => remove(c)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Eliminar"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CategoriaModal value={editing} saving={saving} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function CategoriaModal({ value, saving, onSave, onClose }) {
  const [form, setForm] = useState(value);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            {form.id ? "Editar categoría" : "Nueva categoría"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Vista previa */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
            <span
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: (form.color || "#64748b") + "22", color: form.color || "#64748b" }}
            >
              {form.icono || "🏷️"}
            </span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{form.nombre || "Nombre de la categoría"}</span>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nombre</span>
            <input
              value={form.nombre || ""}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: MikroTik"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-purple-400"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Descripción (opcional)</span>
            <input
              value={form.descripcion || ""}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Breve descripción"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-purple-400"
            />
          </label>

          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Ícono</span>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set("icono", ic)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition ${
                    form.icono === ic ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30" : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Color</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => set("color", col)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${form.color === col ? "border-gray-800 dark:border-white" : "border-transparent"}`}
                  style={{ background: col }}
                >
                  {form.color === col && <FaCheck className="text-white" size={11} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm disabled:opacity-60"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaCheck size={13} />} Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
