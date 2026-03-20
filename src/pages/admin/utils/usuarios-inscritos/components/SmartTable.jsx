/**
 * SmartTable.jsx
 * Tabla inteligente con:
 *  - Ordenamiento por columna (asc/desc)
 *  - Columnas movibles (drag & drop)
 *  - Activar / desactivar columnas
 *  - Paginación integrada
 *  - Dark mode compatible (Tailwind)
 *
 * Props:
 *  - rows: array de objetos con los datos
 *  - columns: array de definición de columnas (ver abajo)
 *  - actions: (opcional) función (row) => JSX  ← botones Ver/Editar/Eliminar
 *  - defaultSort: { key: 'id', dir: 'asc' }  (opcional)
 *  - pageSize: número de filas por página por defecto (default 10)
 *  - emptyMessage: texto cuando no hay datos
 *
 * Formato de columns:
 * [
 *   { key: 'id',      label: 'ID',      sortable: true,  defaultVisible: true  },
 *   { key: 'nombres', label: 'Nombre',  sortable: true,  defaultVisible: true,
 *     render: (val, row) => <span>{row.nombres} {row.apellidos}</span> },
 *   ...
 * ]
 */

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaColumns,
  FaChevronLeft,
  FaChevronRight,
  FaGripVertical,
} from "react-icons/fa";

// ─── utilidades ───────────────────────────────────────────────────────────────

function getValue(row, key) {
  const v = row[key];
  if (v == null) return "";
  if (typeof v === "string") return v.toLowerCase();
  return v;
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function SmartTable({
  rows = [],
  columns = [],
  actions = null,
  defaultSort = { key: "id", dir: "asc" },
  pageSize: initialPageSize = 10,
  emptyMessage = "No hay datos",
}) {
  // ── orden ──────────────────────────────────────────────────────────────────
  const [sort, setSort] = useState(defaultSort);

  const cycleSort = useCallback(
    (key) => {
      setSort((prev) => {
        if (prev.key !== key) return { key, dir: "asc" };
        if (prev.dir === "asc") return { key, dir: "desc" };
        return { key: defaultSort.key, dir: "asc" }; // reset
      });
    },
    [defaultSort.key],
  );

  const safeCols = Array.isArray(columns) ? columns : [];

  // ── columnas visibles ──────────────────────────────────────────────────────
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(
      safeCols.map((c) => [c.key, c.defaultVisible !== false]),
    ),
  );

  const toggleVisible = (key) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── orden de columnas (drag & drop) ───────────────────────────────────────
  const [colOrder, setColOrder] = useState(() => safeCols.map((c) => c.key));

  const dragColKey = useRef(null);
  const dragOverColKey = useRef(null);

  const onDragStart = (key) => {
    dragColKey.current = key;
  };
  const onDragOver = (e, key) => {
    e.preventDefault();
    dragOverColKey.current = key;
  };
  const onDrop = () => {
    if (!dragColKey.current || dragColKey.current === dragOverColKey.current)
      return;
    setColOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(dragColKey.current);
      const to = next.indexOf(dragOverColKey.current);
      next.splice(from, 1);
      next.splice(to, 0, dragColKey.current);
      return next;
    });
    dragColKey.current = null;
    dragOverColKey.current = null;
  };

  // columnas ordenadas y filtradas por visibilidad
  const visibleCols = useMemo(
    () =>
      colOrder
        .map((k) => safeCols.find((c) => c.key === k))
        .filter((c) => c && visible[c.key]),
    [colOrder, safeCols, visible],
  );

  // ── panel de columnas ──────────────────────────────────────────────────────
  const [showColPanel, setShowColPanel] = useState(false);

  // ── datos ordenados ────────────────────────────────────────────────────────
  const safeRows = Array.isArray(rows) ? rows : [];

  const sortedRows = useMemo(() => {
    if (!sort.key) return safeRows;
    return [...safeRows].sort((a, b) => {
      const av = getValue(a, sort.key);
      const bv = getValue(b, sort.key);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [safeRows, sort]);

  // ── paginación ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(
    () => sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedRows, safePage, pageSize],
  );

  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  // cuando cambian los datos externos, volvemos a pág 1
  // (puedes agregar un useEffect si los rows cambian asíncronamente)

  // ── icono de sort ──────────────────────────────────────────────────────────
  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey)
      return <FaSort className="text-gray-400 text-xs opacity-60" />;
    return sort.dir === "asc" ? (
      <FaSortUp className="text-blue-500 text-xs" />
    ) : (
      <FaSortDown className="text-blue-500 text-xs" />
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-3">
      {/* ── toolbar ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* info */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {sortedRows.length === 0
            ? "Sin resultados"
            : `Mostrando ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sortedRows.length)} de ${sortedRows.length}`}
        </p>

        <div className="flex items-center gap-2">
          {/* items por página */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / pág
              </option>
            ))}
          </select>

          {/* botón columnas */}
          <div className="relative">
            <button
              onClick={() => setShowColPanel((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150
                ${
                  showColPanel
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-600 dark:text-blue-300"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
            >
              <FaColumns />
              Columnas
            </button>

            {/* panel de columnas */}
            {showColPanel && (
              <div className="absolute right-0 top-9 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3 min-w-[180px] space-y-1 animate-fade-in">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Mostrar / ocultar
                </p>
                {safeCols.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!visible[col.key]}
                      onChange={() => toggleVisible(col.key)}
                      className="accent-blue-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-200">
                      {col.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── tabla ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          {/* ─ cabecera ─ */}
          <thead className="bg-gray-50 dark:bg-gray-700/60">
            <tr>
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  draggable
                  onDragStart={() => onDragStart(col.key)}
                  onDragOver={(e) => onDragOver(e, col.key)}
                  onDrop={onDrop}
                  className={`group px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none
                    ${col.sortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" : "cursor-grab active:cursor-grabbing"}`}
                  onClick={() => col.sortable && cycleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {/* grip para drag */}
                    <FaGripVertical className="opacity-0 group-hover:opacity-40 text-gray-400 text-xs transition-opacity flex-shrink-0" />
                    <span>{col.label}</span>
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* ─ cuerpo ─ */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length + (actions ? 1 : 0)}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors duration-150"
                >
                  {visibleCols.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-200"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-1 flex-wrap">
          {/* anterior */}
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="text-xs" />
          </button>

          {/* páginas */}
          {getPaginationRange(safePage, totalPages).map((item, i) =>
            item === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-gray-400 text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => goTo(item)}
                className={`min-w-[28px] h-7 rounded-lg text-xs font-medium border transition-colors
                  ${
                    safePage === item
                      ? "bg-blue-600 border-blue-600 text-white shadow"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {item}
              </button>
            ),
          )}

          {/* siguiente */}
          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages}
            className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── helper: rango de páginas con elipsis ─────────────────────────────────────
function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
