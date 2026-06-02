// src/pages/estudiante/components/CursoCardEstudiante.jsx
// Tarjeta de curso para la vista del estudiante (extraída de CursosEstudiante
// para reducir el tamaño del componente principal — mismo comportamiento).
import PayphoneButton from "../../../components/PayphoneButton";
import {
  FaStar,
  FaBolt,
  FaCalendarAlt,
  FaUsers,
  FaHourglassHalf,
  FaEye,
  FaGift,
  FaTimes,
} from "react-icons/fa";
import { isCourseExpired } from "../../../utils/dateUtils";
import { getCourseLaunchInfo } from "../utils/courseSorting";
import {
  isTodayCourse,
  isTomorrowCourse,
  isUpcomingCourse,
  getDaysUntilCourse,
} from "../utils/courseDates";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=400&fit=crop";

export default function CursoCardEstudiante({
  curso,
  categorias,
  appliedCoupon,
  onOpenImage,
  onOpenDescription,
  onOpenCoupon,
  onRemoveCoupon,
  onEnrollFree,
  onPayWithCoupon,
  requirePrivacyAcceptance,
  onPaymentSuccess,
}) {
  const isExpired = isCourseExpired(curso);
  const launchInfo = getCourseLaunchInfo(curso);
  const isToday = isTodayCourse(curso);
  const isTomorrow = isTomorrowCourse(curso);
  const isUpcoming = isUpcomingCourse(curso);
  const daysUntil = getDaysUntilCourse(curso);
  const hasFewSpots = curso.cupos > 0 && curso.cupos <= 3;
  const hasLimitedSpots = curso.cupos > 0 && curso.cupos <= 5;
  const LaunchIcon = launchInfo?.icon || FaStar;
  const hasAppliedCoupon = appliedCoupon && appliedCoupon.cursoId === curso.id;

  const imgSrc = curso.imagen
    ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${curso.imagen}`
    : FALLBACK_IMG;

  const cat = categorias.find((c) => c.id === curso.categoriaId);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden">
      {/* ✅ ETIQUETA DINÁMICA DE LANZAMIENTO */}
      {launchInfo && (
        <div
          className={`absolute ${
            launchInfo.type === "just-launched" ? "-top-2 -left-2" : "top-2 right-2"
          } z-20`}
        >
          <div
            className={`bg-gradient-to-r ${launchInfo.color} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1 ${launchInfo.animate} ${
              launchInfo.borderColor ? `border-2 ${launchInfo.borderColor}` : ""
            }`}
          >
            <LaunchIcon
              className={
                launchInfo.type === "just-launched"
                  ? "text-yellow-300 animate-bounce text-xs"
                  : "text-xs"
              }
            />
            <span className="whitespace-nowrap">{launchInfo.label}</span>
            {launchInfo.type === "just-launched" && (
              <LaunchIcon className="text-yellow-300 animate-bounce text-xs" />
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <img
          src={imgSrc}
          alt={curso.titulo}
          className="w-full h-40 md:h-48 object-cover rounded-t-2xl cursor-pointer group-hover:brightness-90 transition duration-300"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
          onClick={() => onOpenImage(imgSrc, curso.titulo)}
        />

        {/* ✅ BADGES */}
        <div className="absolute top-10 md:top-12 left-2 flex flex-col gap-1">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${
              curso.precio > 0
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                : "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
            }`}
          >
            {curso.precio > 0 ? "🔥 PREMIUM" : "🎓 GRATUITO"}
          </span>

          {isToday && (
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-md flex items-center gap-1">
              <FaBolt className="text-yellow-300 text-xs" />
              ¡HOY!
            </span>
          )}

          {isTomorrow && (
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md flex items-center gap-1">
              <FaCalendarAlt className="text-xs" />
              ¡MAÑANA!
            </span>
          )}

          {isUpcoming &&
            daysUntil !== null &&
            daysUntil >= 2 &&
            daysUntil <= 7 &&
            !isToday &&
            !isTomorrow && (
              <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md flex items-center gap-1">
                <FaCalendarAlt className="text-xs" />
                EN {daysUntil} D{daysUntil !== 1 ? "ÍAS" : "ÍA"}
              </span>
            )}

          {hasFewSpots && !isExpired && (
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-purple-600 to-pink-700 text-white font-bold shadow-md flex items-center gap-1 animate-pulse">
              <FaHourglassHalf className="text-yellow-300 text-xs" />
              ⚠️ {curso.cupos} CUPOS
            </span>
          )}

          {hasLimitedSpots && !hasFewSpots && !isExpired && (
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md flex items-center gap-1">
              <FaUsers className="text-xs" />
              🚀 LIMITADO
            </span>
          )}

          {isExpired && (
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold shadow-md">
              ⏰ FINALIZADO
            </span>
          )}
        </div>

        <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/80 text-white font-bold shadow-lg backdrop-blur-sm z-10">
          🎯 {curso.cupos || 0} Cupos
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between p-4 md:p-6">
        {/* CATEGORÍA */}
        {cat && (
          <span
            className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-bold mb-2"
            style={{ background: (cat.color || "#2563eb") + "1a", color: cat.color || "#2563eb" }}
          >
            {cat.icono || "🏷️"} {cat.nombre}
          </span>
        )}

        {/* TÍTULO */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {curso.titulo || "Curso sin título"}
        </h3>

        {/* DESCRIPCIÓN */}
        <div className="mb-3 md:mb-4">
          <p className="text-gray-700 dark:text-gray-300 line-clamp-2 md:line-clamp-3 text-sm mb-2">
            {curso.descripcion || "Sin descripción disponible."}
          </p>
          <button
            onClick={() => onOpenDescription(curso)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs transition-colors group"
          >
            <FaEye className="text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform text-xs" />
            <span>Ver descripción completa</span>
          </button>
        </div>

        {/* PROFESOR */}
        {curso.profesorNombre && (
          <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
            <span className="inline-block px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-700 transition-colors duration-200">
              👨‍🏫 {curso.profesorNombre}
            </span>
            {curso.asignatura && (
              <span className="inline-block px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700 transition-colors duration-200">
                📚 {curso.asignatura}
              </span>
            )}
          </div>
        )}

        {/* PRECIO Y FECHA */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 md:mb-5">
          {curso.precio > 0 && (
            <div className="flex flex-col gap-1 md:gap-2">
              {hasAppliedCoupon ? (
                <div className="text-center">
                  <div className="line-through text-gray-500 dark:text-gray-400 text-xs">
                    ${parseFloat(curso.precio).toFixed(2)}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 text-sm font-bold border border-green-300 dark:border-green-700 transition-colors duration-200">
                    💰 ${parseFloat(appliedCoupon.precioConDescuento).toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">
                    🎁 Ahorras ${parseFloat(appliedCoupon.ahorro).toFixed(2)}
                  </div>
                </div>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-bold border border-yellow-300 dark:border-yellow-700 transition-colors duration-200">
                  💰 ${parseFloat(curso.precio).toFixed(2)}
                </span>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col md:flex-row md:items-center gap-1">
            <span className="font-medium">📅 {curso.fecha || "Por definir"}</span>
            <span className="hidden md:inline"> | </span>
            <span className="font-medium">⏰ {curso.hora || "Por definir"}</span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div>
          {isExpired ? (
            <div className="text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 md:p-3 rounded-lg font-semibold text-xs md:text-sm border border-gray-300 dark:border-gray-600 transition-colors duration-200">
              ⏰ Este curso ya ha finalizado
            </div>
          ) : curso.inscrito ? (
            <div className="space-y-2">
              <div className="text-green-600 dark:text-green-400 font-semibold text-center">
                <span className="inline-block px-2 py-1.5 md:px-3 md:py-2 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 transition-colors duration-200 text-xs md:text-sm">
                  ✅ Ya estás inscrito
                </span>
              </div>

              {curso.link ? (
                <button
                  onClick={() => window.open(curso.link, "_blank", "noopener,noreferrer")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl font-bold text-center block hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                >
                  {curso.tipo?.startsWith("ONLINE") ? "🎓 IR A CLASE" : "📍 VER UBICACIÓN"}
                </button>
              ) : (
                <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-2 rounded-lg font-semibold text-xs border border-yellow-200 dark:border-yellow-700">
                  ⏳ El enlace de clase será publicado próximamente por el profesor
                </div>
              )}

              {curso.recursosLink && (
                <button
                  onClick={() => window.open(curso.recursosLink, "_blank", "noopener,noreferrer")}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl font-bold text-center block hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm mt-2"
                >
                  📚 RECURSOS DEL CURSO
                </button>
              )}
            </div>
          ) : curso.precio > 0 ? (
            <>
              {hasAppliedCoupon ? (
                <div className="space-y-2 md:space-y-3">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-2 md:p-3 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 md:gap-2">
                        <FaGift className="text-green-600 dark:text-green-400 text-xs md:text-sm" />
                        <span className="text-xs md:text-sm font-semibold text-green-800 dark:text-green-300">
                          {appliedCoupon.codigo}
                        </span>
                      </div>
                      <button
                        onClick={onRemoveCoupon}
                        className="text-red-500 hover:text-red-700 transition-colors text-xs"
                        title="Remover cupón"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                      {appliedCoupon.cupon.descuentoTexto}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const ok = await requirePrivacyAcceptance();
                      if (ok) onPayWithCoupon(curso);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition duration-300 transform hover:shadow-xl flex items-center justify-center gap-1 md:gap-2 text-sm"
                  >
                    <FaGift className="text-yellow-300 text-xs md:text-sm" />
                    {appliedCoupon.gratis
                      ? "🎁 Obtener GRATIS"
                      : `💳 Pagar $${parseFloat(appliedCoupon.precioConDescuento).toFixed(2)}`}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold text-center">
                    💳 Curso premium
                  </p>
                  {curso.precio > 0 && (
                    <div className="mb-1 md:mb-2">
                      <button
                        onClick={() => onOpenCoupon(curso)}
                        className={`w-full px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-semibold transition duration-300 transform flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm ${
                          curso.tieneCupones
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!curso.tieneCupones}
                      >
                        <FaGift
                          className={
                            curso.tieneCupones
                              ? "text-yellow-300 text-xs md:text-sm"
                              : "text-gray-400 text-xs md:text-sm"
                          }
                        />
                        {curso.tieneCupones ? "¿Tienes un cupón?" : "Sin cupones disponibles"}
                      </button>
                    </div>
                  )}
                  <br />
                  <div className="flex justify-center">
                    <PayphoneButton
                      curso={curso}
                      onBeforePayment={requirePrivacyAcceptance}
                      onSuccess={() => onPaymentSuccess(curso.id)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-2 md:mb-3 text-center">
                🎓 Curso gratuito
              </p>
              <button
                onClick={async () => {
                  const ok = await requirePrivacyAcceptance();
                  if (ok) onEnrollFree(curso.id);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition duration-300 transform hover:shadow-xl text-sm"
              >
                🚀 Inscribirse Gratis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
