// src/components/HorariosLatam.jsx
// Botón que abre un modal con la hora del curso convertida a cada país de LATAM.
import React, { useState } from "react";
import { FaGlobeAmericas, FaTimes } from "react-icons/fa";
import { courseTimesByCountry, tzLabel } from "../utils/timezones";

export default function HorariosLatam({ fecha, hora, zonaHoraria = "America/Guayaquil", titulo }) {
  const [open, setOpen] = useState(false);
  if (!hora) return null;

  const horarios = courseTimesByCountry(fecha, hora, zonaHoraria);
  if (horarios.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition group"
      >
        <FaGlobeAmericas className="group-hover:scale-110 transition-transform" size={12} />
        <span>Ver horario por país</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-start justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="min-w-0 pr-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FaGlobeAmericas className="flex-shrink-0" /> Horario por país
                </h3>
                {titulo && (
                  <p className="text-blue-100 text-sm mt-0.5 truncate" title={titulo}>
                    Curso: {titulo}
                  </p>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/90 hover:text-white flex-shrink-0"
                aria-label="Cerrar"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Hora de referencia del curso: <b className="text-gray-700 dark:text-gray-200">{tzLabel(zonaHoraria)}</b>
                {fecha ? ` · ${fecha}` : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {horarios.map((h) => (
                  <div
                    key={h.code}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                      {h.flag} {h.name}
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-300 ml-2 whitespace-nowrap">
                      {h.hora}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-3 text-center">
                Horarios calculados automáticamente según cada zona horaria.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
