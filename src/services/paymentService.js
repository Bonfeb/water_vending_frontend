import api from './api';

const paymentService = {
  initiateSTKPush: async (orderId, phoneNumber) => {
    const response = await api.post('/payments/stk-push/', {
      order_id: orderId,
      phone_number: phoneNumber
    });
    return response.data;
  },

  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/status/${orderId}/`);
    return response.data;
  }
};

export default paymentService;