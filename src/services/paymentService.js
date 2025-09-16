// frontend/src/services/paymentService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const paymentService = {
  // Método para Payphone
  async createPayphonePayment(data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/payments/create-payphone-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Mantener métodos de PayPal si los necesitas como fallback
  async createOrder(data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async captureOrder(data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/payments/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};