import api from './api';

const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders/');
    return response.data;
  },

  staffUpdateOrders: async (orderId, orderData) => {
      const response = await api.put(`/orders/${orderId}/`, orderData);
      return response.data;
    },

  customerUpdateOrder: async (orderId, orderData) => {
      const response = await api.put(`/profile/orders/${orderId}/`, orderData);
      return response.data;
    },
};

export default orderService;