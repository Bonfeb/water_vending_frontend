import React from 'react';
import {
  Box, Grid, Paper, Typography, Divider, Button, Chip, Avatar, Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiPackage, FiMapPin, FiPhone, FiClock, FiCreditCard,
  FiTruck, FiNavigation, FiUser, FiDroplet
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';
import OrderStatusBadge from './OrderStatusBadge';

const InfoRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: 2, bgcolor: 'grey.100',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={18} color="#666" />
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const StatusStep = ({ label, done, active }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      bgcolor: done ? 'success.main' : active ? 'primary.main' : 'grey.200',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: 12, fontWeight: 700
    }}>
      {done ? '✓' : active ? '●' : '○'}
    </Box>
    <Typography variant="body2" fontWeight={active ? 700 : done ? 500 : 400}
      color={active ? 'primary.main' : done ? 'text.primary' : 'text.secondary'}>
      {label}
    </Typography>
  </Box>
);

const ORDER_STEPS = ['pending', 'paid', 'assigned', 'picked', 'in_transit', 'delivered'];

const OrderDetail = ({ order }) => {
  const navigate = useNavigate();
  if (!order) return null;

  const currentStepIndex = ORDER_STEPS.indexOf(order.status);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Grid container spacing={3}>
        {/* Main info */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700}>Order #{order.id}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formatDate(order.created_at)}
                </Typography>
              </Box>
              <OrderStatusBadge status={order.status} size="medium" />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoRow icon={FiPackage} label="Order Type" value={order.order_type === 'purchase' ? 'New Bottle Purchase' : 'Water Refill'} />
                <InfoRow icon={FiDroplet} label="Bottle Size" value={`${order.size} Litres`} />
                <InfoRow icon={FiPackage} label="Quantity" value={`${order.quantity} unit(s)`} />
                <InfoRow icon={FiCreditCard} label="Amount" value={formatCurrency(order.total_amount)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow icon={FiPhone} label="Payment Phone" value={order.payment_phone} />
                <InfoRow icon={FiCreditCard} label="M-Pesa Receipt" value={order.mpesa_receipt || 'Pending payment'} />
                <InfoRow icon={FiMapPin} label="Delivery Address" value={order.delivery_address} />
                {order.delivery_notes && (
                  <InfoRow icon={FiPackage} label="Delivery Notes" value={order.delivery_notes} />
                )}
              </Grid>
            </Grid>

            {order.rider && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Assigned Rider</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {order.rider_details?.first_name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {order.rider_details?.first_name} {order.rider_details?.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.rider_details?.phone_number}
                    </Typography>
                  </Box>
                  {['assigned', 'picked', 'in_transit'].includes(order.status) && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FiNavigation />}
                      onClick={() => navigate(`/track/${order.id}`)}
                      sx={{ ml: 'auto' }}
                    >
                      Track
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Order progress */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Delivery Progress</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {[
                { key: 'pending', label: 'Order Placed' },
                { key: 'paid', label: 'Payment Confirmed' },
                { key: 'assigned', label: 'Rider Assigned' },
                { key: 'picked', label: 'Order Picked Up' },
                { key: 'in_transit', label: 'In Transit' },
                { key: 'delivered', label: 'Delivered' },
              ].map((step) => {
                const stepIdx = ORDER_STEPS.indexOf(step.key);
                return (
                  <StatusStep
                    key={step.key}
                    label={step.label}
                    done={currentStepIndex > stepIdx}
                    active={currentStepIndex === stepIdx}
                  />
                );
              })}
            </Stack>
            {order.delivered_at && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <Typography variant="caption" color="success.dark">
                  Delivered on {formatDate(order.delivered_at)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default OrderDetail;