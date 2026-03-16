import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
} from "react-icons/fa";
import CursosDesplegable from "./CursosDesplegable";

// Flags de países
const getCountryFlag = (pais) => {
  const flags = {
    EC: "🇪🇨",
    CO: "🇨🇴",
    AR: "🇦🇷",
    PE: "🇵🇪",
    CL: "🇨🇱",
    BO: "🇧🇴",
    PY: "🇵🇾",
    UY: "🇺🇾",
    VE: "🇻🇪",
    MX: "🇲🇽",
    GT: "🇬🇹",
    HN: "🇭🇳",
    SV: "🇸🇻",
    NI: "🇳🇮",
    CR: "🇨🇷",
    PA: "🇵🇦",
    DO: "🇩🇴",
    CU: "🇨🇺",
    BR: "🇧🇷",
    PR: "🇵🇷",
    US: "🇺🇸",
    ES: "🇪🇸",
  };
  return flags[pais] || "🌎";
};

// ─────────────────────────────────────────────
// Fila individual memoizada para evitar re-renders
// ─────────────────────────────────────────────
const TableRow = React.memo(({ user, onView, onEdit, onDelete }) => {
  if (!user) return null;
  const userCursos = Array.isArray(user?.cursos) ? user.cursos : [];

  return (
    <tr className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150">
      {/* ID */}
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-700 dark:text-blue-300">
        {user.id}
      </td>

      {/* Cédula */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {user.cedula && user.cedula.trim() !== ""
          ? user.cedula
          : "No especificada"}
      </td>

      {/* País */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {user.pais ? (
          <div className="flex items-center gap-1">
            <span className="text-base">{getCountryFlag(user.pais)}</span>
            <span>{user.pais}</span>
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* Nombre */}
      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white max-w-[180px]">
        <span className="block truncate">
          {user.nombres} {user.apellidos}
        </span>
      </td>

      {/* Correo */}
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[200px]">
        <span className="block truncate">{user.correo}</span>
      </td>

      {/* Ciudad */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {user.ciudad ? (
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
            <span>{user.ciudad}</span>
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* Empresa */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {user.empresa ? (
          <div className="flex items-center gap-1">
            <FaBuilding className="text-gray-400 text-xs flex-shrink-0" />
            <span>{user.empresa}</span>
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* Cargo */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {user.cargo ? (
          <div className="flex items-center gap-1">
            <FaBriefcase className="text-gray-400 text-xs flex-shrink-0" />
            <span>{user.cargo}</span>
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* Cursos */}
      <td className="px-4 py-3 text-sm">
        <CursosDesplegable cursos={userCursos} />
      </td>

      {/* Acciones */}
      <td className="px-4 py-3 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(user)}
            className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors duration-200"
            title="Ver"
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors duration-200"
            title="Editar"
          >
            <FaEdit size={14} />
          </button>
          {user.id !== 1 ? (
            <button
              onClick={() => onDelete(user)}
              className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
              title="Eliminar"
            >
              <FaTrash size={14} />
            </button>
          ) : (
            <div
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
              title="El administrador principal no puede ser eliminado"
            >
              <FaTrash size={14} />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

// ─────────────────────────────────────────────
// Tabla principal con scroll virtualizado manual
// Renderiza solo las filas visibles + buffer
// Escala eficientemente a 100, 200, 500+ usuarios
// ─────────────────────────────────────────────
const VirtualizedTable = ({
  users = [],
  rowHeight = 64,
  onView,
  onEdit,
  onDelete,
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);

  const totalHeight = users.length * rowHeight;
  const overscan = 5;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + overscan * 2;
  const endIndex = Math.min(users.length, startIndex + visibleCount);
  const visibleUsers = users.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!users.length) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No hay estudiantes para mostrar
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700"
      // Altura máxima 600px, con scroll interno. Nunca colapsa a 0.
      style={{ height: Math.min(totalHeight + 48, 600) }}
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {/* Cabecera pegajosa */}
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
          <tr>
            {[
              "ID",
              "Cédula",
              "País",
              "Nombre",
              "Correo",
              "Ciudad",
              "Empresa",
              "Cargo",
              "Cursos",
              "Acciones",
            ].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {/* Espaciador superior — simula las filas anteriores al viewport */}
          {offsetY > 0 && (
            <tr style={{ height: offsetY }}>
              <td colSpan={10} />
            </tr>
          )}

          {/* Únicamente las filas visibles en pantalla */}
          {visibleUsers.map((user) => (
            <TableRow
              key={user.id}
              user={user}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {/* Espaciador inferior — simula las filas después del viewport */}
          {endIndex < users.length && (
            <tr style={{ height: (users.length - endIndex) * rowHeight }}>
              <td colSpan={10} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VirtualizedTable;
