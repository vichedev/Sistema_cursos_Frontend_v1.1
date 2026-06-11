// src/pages/estudiante/CursosEstudiante.jsx
import { FaSearch, FaRocket } from "react-icons/fa";

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
    filterCounts,
    newCoursesCount,
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
      {/* HEADER + FILTROS — compacto y responsivo (filtros a la derecha) */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Barra de título compacta */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl px-5 py-3.5 text-white shadow-md flex items-center gap-3">
          <FaRocket className="text-yellow-300 text-xl flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold leading-tight">Cursos disponibles</h1>
            <p className="text-blue-100 text-xs">
              {newCoursesCount} nuevos · {totalCoursesCount - expiredCoursesCount} activos
            </p>
          </div>
        </div>

        {/* Búsqueda (crece) + filtro (derecha) */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="sm:w-56 sm:ml-auto flex-shrink-0">
            <FilterDropdown activeTab={activeTab} setActiveTab={setActiveTab} counts={filterCounts} />
          </div>
        </div>
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
