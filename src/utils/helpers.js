// src/utils/helpers.js
export const getStatusColor = (status) => {
  const colors = {
    pending: '#ffc107',
    paid: '#17a2b8',
    assigned: '#0066cc',
    picked: '#6c757d',
    in_transit: '#00a8e8',
    delivered: '#28a745',
    cancelled: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

export const getStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    paid: '💳',
    assigned: '📋',
    picked: '📦',
    in_transit: '🚚',
    delivered: '✅',
    cancelled: '❌'
  };
  return icons[status] || '📋';
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};