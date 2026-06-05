import api from './api';

const authService = {

  login: async (phoneNumber, password) => {
    const response = await api.post('/auth/login/', {
      phone_number: phoneNumber,
      password
    });

    const {access, refresh} = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const profile = await authService.getProfile();
    localStorage.setItem('user', JSON.stringify(profile));

    return profile;
  },

  register: async (userData) => {
    const response = await api.post('/register/', userData);

    return response.data;
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('/logout/', { refresh });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh_token');
    const response = await api.post('/refresh/', { refresh });
    localStorage.setItem('access_token', response.data.access);
    // If ROTATE_REFRESH_TOKENS=True, store the new refresh token too
    if (response.data.refresh) {
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data.access;
  },

  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile/', data);
    return response.data;
  },

};

export default authService;