import api from "../../../utils/axiosInstance";
import Swal from "sweetalert2";

// ===============================
// ✅ FUNCIÓN PARA LIBERAR RESERVA DE CUPÓN
// ===============================
export const releaseCouponReservation = async (reservationId) => {
  try {
    const response = await api.post(
      `/api/payments/release-coupon-reservation`,
      { reservationId },
    );

    console.log("✅ Cupón liberado correctamente");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error liberando cupón:", error);

    if (
      error.response?.data?.message?.includes("no encontrada") ||
      error.response?.data?.message?.includes("ya fue procesada")
    ) {
      console.log("ℹ️ La reserva ya estaba liberada");
      return { success: true };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Error al liberar cupón",
    };
  }
};

// ===============================
// ✅ FUNCIÓN PARA FORZAR LIBERACIÓN DE CUPÓN
// ===============================
export const forceReleaseCoupon = async (codigoCupon, cursoId) => {
  try {
    const response = await api.post(`/api/payments/force-release-coupon`, {
      codigoCupon,
      cursoId,
    });

    console.log("✅ Cupón liberado forzadamente");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error forzando liberación:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Error al forzar liberación",
    };
  }
};
