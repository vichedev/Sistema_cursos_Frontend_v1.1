import React, { useState } from "react";

const CursosDesplegable = React.memo(({ cursos }) => {
  const [mostrarCursos, setMostrarCursos] = useState(false);
  const cursosArray = Array.isArray(cursos) ? cursos : [];

  if (!cursosArray || cursosArray.length === 0) {
    return (
      <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
        Sin cursos
      </span>
    );
  }

  const colors = [
    "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    "bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
    "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
    "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
    "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  ];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center cursor-pointer group"
        onClick={() => setMostrarCursos((v) => !v)}
      >
        <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 mr-1 sm:mr-2">
          {cursosArray.length} curso{cursosArray.length !== 1 ? "s" : ""}
        </span>
        <svg
          className={`w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400 transition-transform ${
            mostrarCursos ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {mostrarCursos && (
        <div className="absolute z-20 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl left-0 right-0 w-full min-w-[250px] sm:w-72 sm:right-0 sm:left-auto max-h-64 overflow-y-auto transition-colors duration-200">
          <div className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
            Cursos inscritos:
          </div>
          <div className="space-y-2">
            {cursosArray.map((curso, index) => (
              <div
                key={curso.id || index}
                className={`${
                  colors[index % colors.length]
                } px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200`}
              >
                {curso.titulo}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default CursosDesplegable;