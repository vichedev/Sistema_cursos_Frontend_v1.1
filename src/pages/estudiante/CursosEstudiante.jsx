// src/pages/estudiante/CursosEstudiante.jsx
import {
  FaSearch,
  FaRocket,
  FaBolt,
  FaCrown,
  FaGem,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import { useCursosEstudiante } from "./utils/useCursosEstudiante";

import { ImageModal } from "./components/common/ImageModal";
import { DescriptionModal } from "./components/common/DescriptionModal";
import { FilterDropdown } from "./components/common/FilterDropdown";
import { CouponModal } from "./components/common/CouponModal";
import { PrivacyModal } from "./components/common/PrivacyModal";
import CursoCardEstudiante from "./components/CursoCardEstudiante";

export default function CursosEstudiante() {
  const {
    setCursos,
    filteredCursos,
    loading,
    categorias,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    isSearchExpanded,
    setIsSearchExpanded,
    filterCounts,
    newCoursesCount,
    justLaunchedCount,
    totalCoursesCount,
    expiredCoursesCount,
    modalImg,
    setModalImg,
    modalDesc,
    setModalDesc,
    couponModal,
    couponLoading,
    privacyModal,
    setPrivacyModal,
    appliedCoupon,
    requirePrivacyAcceptance,
    handleEnroll,
    openDescriptionModal,
    applyCoupon,
    createPaymentWithCoupon,
    openCouponModal,
    closeCouponModal,
    updateCouponCode,
    removeAppliedCoupon,
  } = useCursosEstudiante();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Cargando cursos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4 md:p-6">
      {/* HEADER */}
      <div className="hidden md:block">
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full -translate-y-20 translate-x-20 opacity-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full translate-y-16 -translate-x-16 opacity-20 blur-xl"></div>

          <div className="hidden md:block">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <FaRocket className="text-yellow-300 text-3xl animate-bounce" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">CURSOS DISPONIBLES</h1>
                    <p className="text-blue-100 text-sm md:text-base mt-1">
                      Los cursos <span className="text-yellow-300 font-bold">más nuevos</span> aparecen primero
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                    <FaBolt className="text-yellow-300" />
                    <span className="text-sm">
                      Ordenado por: <span className="font-bold">Más recientes primero</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FaRocket className="text-green-400" />
                      <span>{newCoursesCount} nuevos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCrown className="text-yellow-300" />
                      <span>{totalCoursesCount - expiredCoursesCount} activos</span>
                    </div>
                  </div>
                </div>
              </div>

              {justLaunchedCount > 0 && (
                <div className="hidden lg:block bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300 shadow-lg">
                  <div className="text-sm opacity-90 flex items-center gap-2 mb-1">
                    <FaBolt className="text-yellow-300 animate-pulse" />
                    <span>¡Recién Lanzados!</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-300 flex items-center gap-2">
                    {justLaunchedCount}
                    <FaGem className="text-white text-lg md:text-xl" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="relative">
        {/* Desktop */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="w-64">
              <FilterDropdown activeTab={activeTab} setActiveTab={setActiveTab} counts={filterCounts} />
            </div>
          </div>
        </div>

        {/* Móvil - botón flotante */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          {!isSearchExpanded && (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FaSearch className="text-xl" />
            </button>
          )}

          {isSearchExpanded && (
            <div className="fixed bottom-20 right-4 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Buscar y filtrar</h3>
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <FilterDropdown
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    counts={filterCounts}
                    mobile={true}
                  />
                </div>
              </div>

              <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheck className="text-sm" />
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {isSearchExpanded && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsSearchExpanded(false)}
          />
        )}
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-hidden">
        {filteredCursos.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-200">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {searchTerm ? "No se encontraron cursos" : "No hay cursos disponibles"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : activeTab === "PAGADO"
                    ? "No hay cursos premium disponibles"
                    : activeTab === "GRATIS"
                      ? "No hay cursos gratuitos disponibles"
                      : activeTab === "FINALIZADOS"
                        ? "No hay cursos finalizados"
                        : "No hay cursos disponibles en este momento"}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {filteredCursos.map((curso) => (
                <CursoCardEstudiante
                  key={curso.id}
                  curso={curso}
                  categorias={categorias}
                  appliedCoupon={appliedCoupon}
                  onOpenImage={(src, alt) => setModalImg({ open: true, src, alt })}
                  onOpenDescription={openDescriptionModal}
                  onOpenCoupon={openCouponModal}
                  onRemoveCoupon={removeAppliedCoupon}
                  onEnrollFree={handleEnroll}
                  onPayWithCoupon={createPaymentWithCoupon}
                  requirePrivacyAcceptance={requirePrivacyAcceptance}
                  onPaymentSuccess={(id) =>
                    setCursos((prev) => prev.map((c) => (c.id === id ? { ...c, inscrito: true } : c)))
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ImageModal
        open={modalImg.open}
        src={modalImg.src}
        alt={modalImg.alt}
        onClose={() => setModalImg({ open: false, src: "", alt: "" })}
      />

      <DescriptionModal
        open={modalDesc.open}
        curso={modalDesc.curso}
        onClose={() => setModalDesc({ open: false, curso: null })}
      />

      <CouponModal
        open={couponModal.open}
        curso={couponModal.curso}
        codigoCupon={couponModal.codigoCupon}
        onClose={closeCouponModal}
        onApply={applyCoupon}
        loading={couponLoading}
        onCodigoChange={updateCouponCode}
      />

      <PrivacyModal
        open={privacyModal.open}
        onAccept={() => {
          localStorage.setItem(
            "privacyPolicyAccepted",
            JSON.stringify({ accepted: true, timestamp: Date.now() }),
          );
          const resolver = privacyModal.resolver;
          setPrivacyModal({ open: false, resolver: null });
          resolver?.(true);
        }}
        onClose={() => {
          const resolver = privacyModal.resolver;
          setPrivacyModal({ open: false, resolver: null });
          resolver?.(false);
        }}
      />
    </div>
  );
}
