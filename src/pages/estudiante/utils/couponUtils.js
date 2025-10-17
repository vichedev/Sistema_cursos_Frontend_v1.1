import axios from "axios";
import Swal from "sweetalert2";

// ===============================
// ✅ FUNCIÓN PARA LIBERAR RESERVA DE CUPÓN (CORREGIDA)
// ===============================
export const releaseCouponReservation = async (reservationId) => { // ❌ ELIMINAR userId
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/payments/release-coupon-reservation`,
      {
        reservationId,
        // ❌ ELIMINAR userId del body
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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
// ✅ FUNCIÓN PARA FORZAR LIBERACIÓN DE CUPÓN (CORREGIDA)
// ===============================
export const forceReleaseCoupon = async (codigoCupon, cursoId) => { // ✅ Simplificar parámetros
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/payments/force-release-coupon`,
      {
        codigoCupon,
        cursoId,
        // ❌ SIN userId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Cupón liberado forzadamente");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error forzando liberación:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || "Error al forzar liberación" 
    };
  }
};