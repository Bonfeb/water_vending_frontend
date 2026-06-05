// src/components/orders/OrderCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiPackage, FiDroplet, FiClock, FiNavigation } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { getStatusColor, getStatusIcon } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';

const OrderCard = ({ order, onCancel }) => {
  const navigate = useNavigate();

  const statusColor = getStatusColor(order.status);
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'visible'
        }}
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order #{order.id}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {order.order_type === 'purchase' ? 'New Bottle' : 'Refill'} - {order.size}L
              </Typography>
            </Box>
            <Chip
              icon={<span style={{ marginLeft: 8 }}>{getStatusIcon(order.status)}</span>}
              label={statusLabel}
              size="small"
              sx={{
                bgcolor: `${statusColor}15`,
                color: statusColor,
                fontWeight: 600,
                borderRadius: 2
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
              <FiPackage size={16} />
              <Typography variant="body2">Qty: {order.quantity}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
              <FiMapPin size={16} />
              <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                {order.delivery_address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
              <FiClock size={16} />
              <Typography variant="body2">{formatRelativeTime(order.created_at)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {formatCurrency(order.total_amount)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {order.status === 'pending' && (
                <Tooltip title="Cancel Order">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => { e.stopPropagation(); onCancel?.(order.id); }}
                  >
                    <FiDroplet size={16} />
                  </IconButton>
                </Tooltip>
              )}
              {['assigned', 'picked', 'in_transit'].includes(order.status) && (
                <Tooltip title="Track Delivery">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => { e.stopPropagation(); navigate(`/track/${order.id}`); }}
                  >
                    <FiNavigation size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderCard;