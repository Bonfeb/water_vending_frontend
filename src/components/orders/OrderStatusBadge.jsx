import React from 'react';
import { Chip } from '@mui/material';
import { getStatusColor, getStatusIcon } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';

const OrderStatusBadge = ({ status, size = 'small' }) => {
  const color = getStatusColor(status);
  const label = STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status);

  return (
    <Chip
      icon={<span style={{ marginLeft: 8 }}>{icon}</span>}
      label={label}
      size={size}
      sx={{
        bgcolor: `${color}18`,
        color: color,
        fontWeight: 600,
        borderRadius: 2,
        border: `1px solid ${color}30`,
        fontSize: size === 'small' ? '0.72rem' : '0.85rem',
      }}
    />
  );
};

export default OrderStatusBadge;