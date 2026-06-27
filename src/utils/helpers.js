// src/utils/helpers.js
export const getStatusColor = (status) => {
  const colors = {
    pending: '#ffc107',
    paid: '#17a2b8',
    preparing: '#0066cc',
    dispatched: '#00a8e8',
    delivered: '#28a745',
    cancelled: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

export const getStatusIcon = (status) => {
  const icons = {
    pending: '⏳',
    paid: '💳',
    preparing: '📦',
    dispatched: '🚚',
    delivered: '✅',
    cancelled: '❌'
  };
  return icons[status] || '📋';
}