// src/pages/estudiante/utils/useCursosEstudiante.js
// Hook con toda la lógica de la vista de cursos del estudiante: carga de datos,
// filtros, cupones y pagos. Extraído de CursosEstudiante para aligerar el
// componente (mismo comportamiento).
import { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import { isCourseExpired } from "../../../utils/dateUtils";
import { sortCoursesByRelevance, getCourseLaunchInfo } from "./courseSorting";
import { releaseCouponReservation, forceReleaseCoupon } from "./couponUtils";

const swalTheme = () => ({
  background: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
  color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000",
});

// Loading bonito y reutilizable (spinner con marca, popup redondeado)
const swalLoading = (titulo, subtitulo = "") =>
  Swal.fire({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:10px 4px">
        <div class="w-14 h-14 rounded-full border-4 border-blue-200 dark:border-gray-600 border-t-blue-600 animate-spin"></div>
        <div style="font-size:18px;font-weight:800">${titulo}</div>
        ${subtitulo ? `<div style="font-size:13px;opacity:.7">${subtitulo}</div>` : ""}
      </div>`,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: { popup: "rounded-2xl" },
    ...swalTheme(),
  });

export function useCursosEstudiante() {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [modalImg, setModalImg] = useState({ open: false, src: "", alt: "" });
  const [modalDesc, setModalDesc] = useState({ open: false, curso: null });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [activeTab, setActiveTab] = useState("RELEVANTES");
  const [searchTerm, setSearchTerm] = useState("");

  const [couponModal, setCouponModal] = useState({ open: false, curso: null, codigoCupon: "" });
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [privacyModal, setPrivacyModal] = useState({ open: false, resolver: null });

  const requirePrivacyAcceptance = () => {
    return new Promise((resolve) => {
      try {
        const stored = localStorage.getItem("privacyPolicyAccepted");
        if (stored) {
          const data = JSON.parse(stored);
          if (data.accepted && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            resolve(true);
            return;
          }
        }
      } catch {
        /* preferencia inválida en localStorage: pedir aceptación */
      }
      setPrivacyModal({ open: true, resolver: resolve });
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const cleanupReservations = async () => {
      if (!token) return;
      try {
        console.log("✅ Verificación de reservas completada");
      } catch (error) {
        console.error("Error en limpieza de reservas:", error);
      }
    };

    // Categorías para badges
    api
      .get(`/api/categories`)
      .then((r) => setCategorias(r.data?.data || []))
      .catch(() => setCategorias([]));

    const loadData = async () => {
      await cleanupReservations();
      try {
        const response = await api.get(`/api/courses/disponibles`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
          throw new Error("El servidor está devolviendo HTML en lugar de JSON");
        }

        let cursosData = [];
        if (response.data && Array.isArray(response.data.data)) cursosData = response.data.data;
        else if (Array.isArray(response.data)) cursosData = response.data;
        else if (response.data && typeof response.data === "object") {
          const possibleArrays = Object.values(response.data).filter((item) => Array.isArray(item));
          cursosData = possibleArrays.length > 0 ? possibleArrays[0] : [];
        }

        const cursosOrdenados = sortCoursesByRelevance(cursosData);
        setCursos(cursosOrdenados);
        setFilteredCursos(cursosOrdenados);

        const cursosConCupones = cursosOrdenados.filter((curso) => curso.tieneCupones);
        if (cursosConCupones.length > 0) {
          console.log(`🎁 ${cursosConCupones.length} cursos tienen cupones disponibles`);
        }
      } catch (err) {
        console.error("Error al obtener cursos:", err);
        if (err.message && err.message.includes("HTML en lugar de JSON")) {
          Swal.fire({
            title: "Error de Servidor",
            text: "El servidor no está respondiendo correctamente. Verifica que el backend esté corriendo y ngrok esté configurado.",
            icon: "error",
            ...swalTheme(),
          });
        }
        setCursos([]);
        setFilteredCursos([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = cursos;

    if (activeTab === "RELEVANTES") {
      filtered = filtered.filter((curso) => !isCourseExpired(curso));
    } else if (activeTab === "PAGADO") {
      filtered = filtered.filter((curso) => curso.precio > 0 && !isCourseExpired(curso));
    } else if (activeTab === "GRATIS") {
      filtered = filtered.filter((curso) => curso.precio === 0 && !isCourseExpired(curso));
    } else if (activeTab === "FINALIZADOS") {
      filtered = filtered.filter((curso) => isCourseExpired(curso));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (curso) =>
          curso.titulo.toLowerCase().includes(term) ||
          (curso.descripcion && curso.descripcion.toLowerCase().includes(term)) ||
          (curso.profesorNombre && curso.profesorNombre.toLowerCase().includes(term)) ||
          (curso.asignatura && curso.asignatura.toLowerCase().includes(term)),
      );
    }

    setFilteredCursos(filtered);
  }, [cursos, activeTab, searchTerm]);

  // Verificar reservas pendientes al cargar
  useEffect(() => {
    const checkPendingReservations = async () => {
      const pendingReservation = localStorage.getItem("lastCouponReservation");
      if (pendingReservation) {
        try {
          const reservationData = JSON.parse(pendingReservation);
          const { reservationId, clientTransactionId, timestamp } = reservationData;
          const isRecent = Date.now() - timestamp < 60 * 60 * 1000;
          if (isRecent) {
            await checkPaymentStatus(clientTransactionId, reservationId);
          } else {
            await releaseCouponReservation(reservationId);
          }
          localStorage.removeItem("lastCouponReservation");
        } catch (error) {
          console.error("Error verificando reserva pendiente:", error);
          localStorage.removeItem("lastCouponReservation");
        }
      }
    };
    checkPendingReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnroll = async (cursoId) => {
    try {
      swalLoading("Procesando inscripción…", "Estamos confirmando tu cupo 🎓");

      await api.post(
        `/api/payments/inscribir-gratis`,
        { cursoId },
        { headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" } },
      );

      // Actualiza la UI de inmediato (el correo de confirmación llega en segundo plano)
      setCursos((prev) => prev.map((c) => (c.id === cursoId ? { ...c, inscrito: true } : c)));

      Swal.fire({
        icon: "success",
        title: "¡Inscripción exitosa! 🎉",
        html: '<p style="font-size:14px;opacity:.85">Ya tienes tu cupo. Recibirás un correo de confirmación.</p>',
        timer: 2200,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { popup: "rounded-2xl" },
        ...swalTheme(),
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "No se pudo inscribir al curso",
        icon: "error",
        customClass: { popup: "rounded-2xl" },
        ...swalTheme(),
      });
    }
  };

  const openDescriptionModal = (curso) => setModalDesc({ open: true, curso });

  const verifyCoupon = async (cursoId, codigoCupon) => {
    try {
      setCouponLoading(true);
      const response = await api.post(
        `/api/payments/verify-coupon`,
        { cursoId, codigoCupon: codigoCupon.toUpperCase() },
        { headers: { "Content-Type": "application/json" } },
      );

      if (!response.data.success && response.data.error?.includes("reserva pendiente")) {
        console.log("🔄 Detectada reserva pendiente, liberando forzadamente...");
        try {
          await api.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/force-release-coupon`,
            { cursoId, codigoCupon: codigoCupon.toUpperCase() },
            { headers: { "Content-Type": "application/json" } },
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retryResponse = await api.post(
            `/api/payments/verify-coupon`,
            { cursoId, codigoCupon: codigoCupon.toUpperCase() },
            { headers: { "Content-Type": "application/json" } },
          );
          return retryResponse.data;
        } catch (forceError) {
          console.error("Error liberando cupón forzadamente:", forceError);
          return response.data;
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error verificando cupón:", error);
      return { success: false, error: error.response?.data?.error || "Error al verificar cupón" };
    } finally {
      setCouponLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponModal.codigoCupon.trim()) {
      Swal.fire({
        title: "Código requerido",
        text: "Por favor ingresa un código de cupón",
        icon: "warning",
        ...swalTheme(),
      });
      return;
    }

    const result = await verifyCoupon(couponModal.curso.id, couponModal.codigoCupon);

    if (result.success) {
      setAppliedCoupon({
        cursoId: couponModal.curso.id,
        codigo: couponModal.codigoCupon.toUpperCase(),
        ...result,
      });

      Swal.fire({
        title: "¡Cupón aplicado! 🎉",
        html: `
          <div class="text-left">
            <p class="mb-2">✅ <strong>${result.cupon.descuentoTexto}</strong> aplicado correctamente.</p>
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700 mt-3">
              <div class="flex justify-between text-sm">
                <span>Precio original:</span>
                <span class="line-through text-gray-500">$${parseFloat(result.precioOriginal).toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-lg font-bold mt-1">
                <span>Precio final:</span>
                <span class="text-green-600 dark:text-green-400">$${parseFloat(result.precioConDescuento).toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span>Ahorro:</span>
                <span class="text-green-600 dark:text-green-400 font-bold">$${parseFloat(result.ahorro).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `,
        icon: "success",
        ...swalTheme(),
      });

      setCouponModal({ open: false, curso: null, codigoCupon: "" });
    } else {
      Swal.fire({ title: "Cupón no válido", text: result.error, icon: "error", ...swalTheme() });
    }
  };

  const createPaymentWithCoupon = async (curso) => {
    try {
      swalLoading("Procesando pago con cupón…", "Preparando tu inscripción 🎁");

      const response = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-payphone-payment-with-coupon`,
        { cursoId: curso.id, codigoCupon: appliedCoupon.codigo },
        { headers: { "Content-Type": "application/json" } },
      );

      Swal.close();

      if (response.data.gratis) {
        Swal.fire({
          title: "¡Inscripción exitosa! 🎉",
          html: `
          <div class="text-center">
            <div class="text-6xl mb-4">🎁</div>
            <p class="text-lg mb-2">Te has inscrito al curso <strong>GRATIS</strong> con cupón.</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Cupón aplicado: <strong>${appliedCoupon.codigo}</strong></p>
          </div>
        `,
          icon: "success",
          ...swalTheme(),
        });

        setCursos((prev) => prev.map((c) => (c.id === curso.id ? { ...c, inscrito: true } : c)));
        setAppliedCoupon(null);
      } else {
        window.location.href = response.data.paymentUrl;
        if (response.data.reservationId) {
          localStorage.setItem(
            "lastCouponReservation",
            JSON.stringify({
              reservationId: response.data.reservationId,
              clientTransactionId: response.data.clientTransactionId,
              cursoId: curso.id,
              codigoCupon: appliedCoupon.codigo,
              timestamp: Date.now(),
            }),
          );
        }
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Error al procesar el pago con cupón",
        icon: "error",
        ...swalTheme(),
      });
    }
  };

  const checkPaymentStatus = async (clientTransactionId) => {
    try {
      const response = await api.get(`/api/payments/check-payment-status`, {
        params: { clientTransactionId },
        headers: {},
      });

      if (response.data.success) {
        Swal.fire({
          title: "¡Pago exitoso! 🎉",
          text: "Tu pago ha sido procesado correctamente",
          icon: "success",
          ...swalTheme(),
        });
        setCursos((prev) =>
          prev.map((c) => (c.id === appliedCoupon?.cursoId ? { ...c, inscrito: true } : c)),
        );
        setAppliedCoupon(null);
      } else {
        await releaseCouponByTransaction(clientTransactionId);
        Swal.fire({
          title: "Pago no completado",
          text: "El pago no se completó. Tu cupón ha sido liberado y puedes intentarlo nuevamente.",
          icon: "info",
          ...swalTheme(),
        });
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error verificando estado del pago:", error);
      await releaseCouponByTransaction(clientTransactionId);
      setAppliedCoupon(null);
      Swal.fire({
        title: "Error",
        text: "No se pudo verificar el estado del pago. Tu cupón ha sido liberado.",
        icon: "error",
        ...swalTheme(),
      });
    } finally {
      localStorage.removeItem("lastCouponReservation");
    }
  };

  const releaseCouponByTransaction = async (clientTransactionId) => {
    try {
      const response = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/release-coupon-by-transaction`,
        { clientTransactionId },
        { headers: { "Content-Type": "application/json" } },
      );
      console.log("✅ Cupón liberado por transacción");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error liberando cupón por transacción:", error);
      if (appliedCoupon) {
        try {
          await forceReleaseCoupon(appliedCoupon.codigo, appliedCoupon.cursoId);
          console.log("✅ Cupón liberado forzadamente después de error");
        } catch (forceError) {
          console.error("Error en liberación forzada:", forceError);
        }
      }
      return { success: false };
    }
  };

  const openCouponModal = (curso) => setCouponModal({ open: true, curso, codigoCupon: "" });
  const closeCouponModal = () => setCouponModal({ open: false, curso: null, codigoCupon: "" });
  const updateCouponCode = (codigo) => setCouponModal((prev) => ({ ...prev, codigoCupon: codigo }));

  const removeAppliedCoupon = async () => {
    const couponToRemove = { ...appliedCoupon };
    setAppliedCoupon(null);
    if (couponToRemove?.reservationId) {
      try {
        await releaseCouponReservation(couponToRemove.reservationId);
      } catch (error) {
        console.error("Error liberando cupón:", error);
      }
    }
    Swal.fire({
      title: "Cupón removido",
      text: "El cupón ha sido removido correctamente",
      icon: "info",
      ...swalTheme(),
    });
  };

  // Conteos para los filtros
  const justLaunchedCount = cursos.filter((c) => {
    const info = getCourseLaunchInfo(c);
    return info && info.type === "just-launched";
  }).length;

  const newCoursesCount = cursos.filter((c) => {
    const info = getCourseLaunchInfo(c);
    return info && ["just-launched", "today", "yesterday", "recent"].includes(info.type);
  }).length;

  const totalCoursesCount = cursos.length;
  const paidCoursesCount = cursos.filter((c) => c.precio > 0 && !isCourseExpired(c)).length;
  const freeCoursesCount = cursos.filter((c) => c.precio === 0 && !isCourseExpired(c)).length;
  const expiredCoursesCount = cursos.filter(isCourseExpired).length;

  const filterCounts = {
    justLaunchedCount,
    paidCoursesCount,
    freeCoursesCount,
    expiredCoursesCount,
    totalCoursesCount,
  };

  return {
    // datos
    cursos,
    setCursos,
    filteredCursos,
    loading,
    categorias,
    // filtros
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
    // modales
    modalImg,
    setModalImg,
    modalDesc,
    setModalDesc,
    couponModal,
    couponLoading,
    privacyModal,
    setPrivacyModal,
    appliedCoupon,
    // acciones
    requirePrivacyAcceptance,
    handleEnroll,
    openDescriptionModal,
    applyCoupon,
    createPaymentWithCoupon,
    openCouponModal,
    closeCouponModal,
    updateCouponCode,
    removeAppliedCoupon,
  };
}
