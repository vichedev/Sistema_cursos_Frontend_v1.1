// frontend/src/components/PayphoneButton.jsx
import React, { useState } from 'react';
import axios from 'axios';

const PayphoneButton = ({ curso, userId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      if (!curso || !curso.id) {
        throw new Error('Información del curso no disponible');
      }

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-payphone-payment`,
        { cursoId: curso.id, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        localStorage.setItem('currentPaymentId', response.data.clientTransactionId);
        if (onSuccess) onSuccess();
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data.error || 'Error al crear el pago');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Error al procesar el pago';
      setError(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`px-6 py-2 rounded-xl font-semibold text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-blue-700'
          }`}
      >
        {loading ? 'Procesando...' : `Pagar $${curso?.precio || 0}`}
      </button>
      {error && (
        <p className="mt-2 text-red-600 text-sm font-medium">{error}</p>
      )}
    </div>
  );
};

export default PayphoneButton;