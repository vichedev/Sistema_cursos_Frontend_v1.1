import React, { useState } from "react";
import {
  FaFire,
  FaMoneyBillWave,
  FaGraduationCap,
  FaTimesCircle,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";

// ✅ COMPONENTE DROPDOWN PARA FILTROS - VERSIÓN MEJORADA PARA MÓVIL
function FilterDropdown({ activeTab, setActiveTab, counts, mobile = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    {
      key: "RELEVANTES",
      label: "Más Relevantes",
      icon: FaFire,
      color: "from-purple-500 to-blue-500",
      count: counts.justLaunchedCount,
    },
    {
      key: "PAGADO",
      label: "Premium",
      icon: FaMoneyBillWave,
      color: "from-yellow-500 to-orange-500",
      count: counts.paidCoursesCount,
    },
    {
      key: "GRATIS",
      label: "Gratuitos",
      icon: FaGraduationCap,
      color: "from-green-500 to-emerald-500",
      count: counts.freeCoursesCount,
    },
    {
      key: "FINALIZADOS",
      label: "Finalizados",
      icon: FaTimesCircle,
      color: "from-red-500 to-pink-500",
      count: counts.expiredCoursesCount,
    },
    {
      key: "TODOS",
      label: "Ver Todos",
      icon: FaFilter,
      color: "from-gray-600 to-gray-700",
      count: counts.totalCoursesCount,
    },
  ];

  const activeFilter = filterOptions.find((option) => option.key === activeTab);

  // VERSIÓN MÓVIL MEJORADA - SE ABRE HACIA ARRIBA FUERA DEL PANEL
  if (mobile) {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            {activeFilter && (
              <activeFilter.icon className="text-blue-500 text-lg" />
            )}
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              {activeFilter?.label || "Filtrar por"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeFilter?.count > 0 && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold min-w-6 text-center ${
                  activeTab === "RELEVANTES"
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                }`}
              >
                {activeFilter.count}
              </span>
            )}
            <FaChevronDown
              className={`text-gray-500 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <>
            {/* Overlay para cerrar - CON Z-INDEX MÁS ALTO */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown que se abre HACIA ARRIBA FUERA DEL PANEL */}
            <div className="fixed bottom-32 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[70] max-h-48 overflow-y-auto">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setActiveTab(option.key);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      activeTab === option.key
                        ? `bg-gradient-to-r ${option.color} text-white`
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`text-lg ${
                          activeTab === option.key
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="font-medium text-sm">
                        {option.label}
                      </span>
                    </div>
                    {option.count > 0 && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold min-w-6 text-center ${
                          activeTab === option.key
                            ? "bg-white/20 text-white"
                            : option.key === "RELEVANTES"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {option.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Versión original para desktop
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto"
      >
        <div className="flex items-center gap-2">
          {activeFilter && <activeFilter.icon className="text-blue-500" />}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {activeFilter?.label || "Seleccionar filtro"}
          </span>
          {activeFilter?.count > 0 && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === "RELEVANTES"
                  ? "bg-yellow-400 text-yellow-900 animate-pulse"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              }`}
            >
              {activeFilter.count}
            </span>
          )}
        </div>
        <FaChevronDown
          className={`text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-40 overflow-hidden">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                onClick={() => {
                  setActiveTab(option.key);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-200 ${
                  activeTab === option.key
                    ? `bg-gradient-to-r ${option.color} text-white`
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={
                      activeTab === option.key ? "text-white" : "text-gray-500"
                    }
                  />
                  <span className="font-medium">{option.label}</span>
                </div>
                {option.count > 0 && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === option.key
                        ? "bg-white/20 text-white"
                        : option.key === "RELEVANTES"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export { FilterDropdown };
