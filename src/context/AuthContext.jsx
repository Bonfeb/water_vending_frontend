import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const data = await authService.getProfile();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const login = async (phoneNumber, password) => {
    const profile = await authService.login(phoneNumber, password);
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
    return profile;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser, 
        isAuthenticated: !!user, 
        login, 
        logout, 
        register,
        updateProfile,
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;