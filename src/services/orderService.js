import api from './api';

const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders/');
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },

  getOrder: async (orderId, params = {}) => {
    const response = await api.get(`/orders/${orderId}/`, { params });
    return response.data;
  },

  updateOrder: async (orderId, orderData) => {
    const response = await api.put(`/order/${orderId}/`, orderData);
    return response.data;
  },

  cancelOrder: async (orderId, extraData = {}) => {
    const response = await api.delete(`/order/${orderId}/`, {
      data: extraData
    });
    return response.data;
  },

  guestLookup: async (phoneNumber) => {
    const response = await api.post('/orders/guest-lookup/', {
      phone_number: phoneNumber
    });
    return response.data;
  },

  // ─── Staff 

  staffGetOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.order_type) params.append('order_type', filters.order_type);
    if (filters.search) params.append('search', filters.search);
    const response = await api.get(`/staff/orders/?${params.toString()}`);
    return response.data;
  },

  staffGetOrder: async (orderId) => {
    const response = await api.get(`/staff/orders/${orderId}/`);
    return response.data;
  },

  staffUpdateOrder: async (orderId, orderData) => {
    const response = await api.put(`/staff/orders/${orderId}/`, orderData);
    return response.data;
  },

  staffCancelOrder: async (orderId) => {
    const response = await api.delete(`/staff/orders/${orderId}/`);
    return response.data;
  },

};

export default orderService;