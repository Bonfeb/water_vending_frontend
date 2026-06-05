import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, role = null }) => {
  const { isAuthenticated, isRider, isAdmin, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'rider' && !isRider) return <Navigate to="/dashboard" replace />;
  if (role === 'admin' && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PrivateRoute;