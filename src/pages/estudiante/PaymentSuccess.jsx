// frontend/src/pages/estudiante/PaymentSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Obtener clientTransactionId de la URL o localStorage
        const urlParams = new URLSearchParams(location.search);
        const clientTransactionId = urlParams.get('clientTransactionId') || 
                                   localStorage.getItem('currentPaymentId');

        if (!clientTransactionId) {
          setPaymentStatus('error');
          Swal.fire('Error', 'No se pudo identificar la transacción', 'error');
          navigate('/estudiante/cursos');
          return;
        }

        console.log('Verificando pago:', clientTransactionId);

        // ✅ VERIFICAR CON TOKEN DE AUTENTICACIÓN
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:3001/payments/check-payment-status?clientTransactionId=${clientTransactionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('Respuesta del pago:', response.data);

        if (response.data.success && response.data.status === 'Approved') {
          setPaymentStatus('success');
          setPaymentData(response.data);
          Swal.fire('¡Éxito!', 'Pago verificado correctamente', 'success');
          
          // Limpiar el localStorage
          localStorage.removeItem('currentPaymentId');
          
        } else if (verificationAttempts < 5) {
          // Reintentar después de 2 segundos
          setTimeout(() => {
            setVerificationAttempts(prev => prev + 1);
          }, 2000);
        } else {
          setPaymentStatus('pending');
          Swal.fire(
            'Pendiente', 
            'El pago está siendo procesado. Recibirás una confirmación por email.', 
            'info'
          );
        }
      } catch (error) {
        console.error('Error verificando pago:', error);
        if (verificationAttempts < 3) {
          setTimeout(() => {
            setVerificationAttempts(prev => prev + 1);
          }, 2000);
        } else {
          setPaymentStatus('error');
          Swal.fire('Error', 'No se pudo verificar el pago', 'error');
        }
      }
    };

    verifyPayment();
  }, [location, verificationAttempts, navigate]);

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h2>
          <p className="text-gray-600 mb-4">Tu inscripción ha sido confirmada.</p>
          <p className="text-gray-600 mb-6">Recibirás un email de confirmación en breve.</p>
          
          {paymentData && (
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p className="text-sm text-gray-600">
                <strong>ID de Transacción:</strong> {paymentData.clientTransactionId}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Monto:</strong> ${paymentData.amount}
              </p>
            </div>
          )}
          
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a Cursos
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
          <div className="text-yellow-600 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pago Pendiente</h2>
          <p className="text-gray-600 mb-4">Tu pago está siendo procesado...</p>
          <p className="text-gray-600">Recibirás una confirmación por email una vez completado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        <div className="text-red-600 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error en el Pago</h2>
        <p className="text-gray-600 mb-4">Hubo un problema verificando tu pago.</p>
        <button
          onClick={() => navigate('/estudiante/cursos')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Volver a Cursos
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;