// frontend/src/pages/estudiante/PaymentFailed.jsx
import { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentId = query.get("paymentId");
    const clientTransactionId = query.get("clientTransactionId");
    const transactionStatus = query.get("transactionStatus");

    console.log('PaymentFailed - Parámetros:', {
      paymentId,
      clientTransactionId,
      transactionStatus
    });

    Swal.fire({
      title: "Pago cancelado",
      text: "Tu pago fue cancelado o no se pudo procesar.",
      icon: "info",
      confirmButtonText: "Volver a cursos"
    }).then(() => {
      navigate("/estudiante/dashboard");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        <div className="text-blue-600 text-6xl mb-4">ℹ</div>
        <div className="text-lg text-gray-700 font-semibold">Pago cancelado</div>
        <div className="text-sm text-gray-600 mt-2">Redirigiendo...</div>
      </div>
    </div>
  );
}