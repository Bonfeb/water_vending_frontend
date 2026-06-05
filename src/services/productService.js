import api from './api';

const productService = {
  getPricing: async () => {
    const response = await api.get('/bottles/');
    return response.data;
  },

  staffAddBottle: async (bottleData) => {
    const response = await api.post('/bottles/', bottleData);
    return response.data;
  },

  staffViewBottle: async (bottleId) => {
    const response = await api.get(`/bottles/${bottleId}/`);
    return response.data;
  },

  staffUpdateBottle: async (bottleId, bottleData) => {
    const response = await api.put(`/bottles/${bottleId}/`, bottleData);
    return response.data;
  },

  staffDeleteBottle: async (bottleId) => {
    const response = await api.delete(`/bottles/${bottleId}/`);
    return response.data;
  },

  staffCreateInventory: async (inventoryData) => {
    const response = await api.post('/inventory/', inventoryData);
    return response.data;
  },

  staffViewInventories: async () => {
    const response = await api.get('/inventory/');
    return response.data;
  },

  staffViewInventory: async (inventoryId) => {
    const response = await api.get(`/inventory/${inventoryId}/`);
    return response.data;
  },

  staffUpdateInventory: async (inventoryId, inventoryData) => {
    const response = await api.put(`/inventory/${inventoryId}/`, inventoryData);
    return response.data;
  },

  staffDeleteInventory: async (inventoryId) => {
    const response = await api.delete(`/inventory/${inventoryId}/`);
    return response.data;
  }

};

export default productService;