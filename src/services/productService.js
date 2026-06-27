import api from './api';

const productService = {

  getPricing: async () => {
    const response = await api.get('/products/pricing/');
    return response.data;
  },

  getBottleSizes: async () => {
    const response = await api.get('/products/sizes/');
    return response.data;
  },

  calculateTotal: async (orderType, size, quantity = 1) => {
    const response = await api.post('/products/calculate-total/', {
      order_type: orderType,
      size,
      quantity
    });
    return response.data;
  },

  staffGetBottles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.size) params.append('size', filters.size);
    if (filters.is_active !== undefined) {
      params.append('is_active', String(filters.is_active));
    }
    const response = await api.get(
      `/admin/bottles/?${params.toString()}`
    );
    return response.data;
  },

  staffAddBottle: async (bottleData) => {
    const response = await api.post('/admin/bottles/', bottleData);
    return response.data;
  },

  staffGetBottle: async (bottleId) => {
    const response = await api.get(`/admin/bottle/${bottleId}/`);
    return response.data;
  },

  staffUpdateBottle: async (bottleId, bottleData) => {
    const response = await api.put(
      `/admin/bottle/${bottleId}/`, bottleData
    );
    return response.data;
  },

  staffDeleteBottle: async (bottleId) => {
    const response = await api.delete(`/admin/bottle/${bottleId}/`);
    return response.data;
  },

  staffGetPricingList: async () => {
    const response = await api.get('/admin/pricing/');
    return response.data;
  },

  staffAddPricing: async (pricingData) => {
    const response = await api.post('/admin/pricing/', pricingData);
    return response.data;
  },

  staffGetPricing: async (pricingId) => {
    const response = await api.get(`/admin/pricing/${pricingId}/`);
    return response.data;
  },

  staffUpdatePricing: async (pricingId, pricingData) => {
    const response = await api.put(
      `/admin/pricing/${pricingId}/`, pricingData
    );
    return response.data;
  },

  staffDeletePricing: async (pricingId) => {
    const response = await api.delete(
      `/admin/pricing/${pricingId}/`
    );
    return response.data;
  },

};

export default productService;