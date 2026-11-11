import React from 'react';
import {
  Box, Grid, Paper, Typography, Divider, Button, Avatar, Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiPackage, FiMapPin, FiPhone, FiCreditCard,
  FiNavigation, FiUser, FiDroplet, FiXCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import OrderStatusBadge from './OrderStatusBadge';

const InfoRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: 2, bgcolor: 'grey.100',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={18} color="#666" />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

const StatusStep = ({ label, done, active }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      bgcolor: done ? 'success.main' : active ? 'primary.main' : 'grey.200',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: 12, fontWeight: 700,
    }}>
      {done ? '✓' : active ? '●' : '○'}
    </Box>
    <Typography
      variant="body2"
      fontWeight={active ? 700 : done ? 500 : 400}
      color={active ? 'primary.main' : done ? 'text.primary' : 'text.secondary'}
    >
      {label}
    </Typography>
  </Box>
);

const PROGRESS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'paid', label: 'Payment Confirmed' },
  { key: 'assigned', label: 'Rider Assigned' },
  { key: 'picked', label: 'Order Picked Up' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];
const ORDER_STEPS = PROGRESS_STEPS.map((s) => s.key);

/**
 * Props:
 *  - order: order object from the API
 *  - onPay (optional): called when the user taps "Pay with M-Pesa" on a pending order
 *  - paying (optional): disables the pay button while a payment request is in flight
 */
const OrderDetail = ({ order, onPay, paying = false }) => {
  const navigate = useNavigate();
  if (!order) return null;

  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = ORDER_STEPS.indexOf(order.status);
  const isKnownStatus = currentStepIndex !== -1;
  const customerName = order.customer_name || order.guest_name;
  const customerPhone = order.customer_phone || order.guest_phone;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Grid container spacing={3}>
        {/* ── Main info ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow
                  icon={FiPackage}
                  label="Order Type"
                  value={order.order_type === 'purchase' ? 'New Bottle Purchase' : 'Water Refill'}
                />
                <InfoRow icon={FiDroplet} label="Bottle Size" value={`${order.size} Litres`} />
                <InfoRow icon={FiPackage} label="Quantity" value={`${order.quantity} unit(s)`} />
                <InfoRow icon={FiCreditCard} label="Amount" value={formatCurrency(order.total_amount)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {customerName && <InfoRow icon={FiUser} label="Customer" value={customerName} />}
                {customerPhone && <InfoRow icon={FiPhone} label="Contact Phone" value={customerPhone} />}
                <InfoRow icon={FiPhone} label="Payment Phone" value={order.payment_phone} />
                <InfoRow
                  icon={FiCreditCard}
                  label="M-Pesa Receipt"
                  value={order.mpesa_receipt || (isCancelled ? '—' : 'Pending payment')}
                />
                <InfoRow icon={FiMapPin} label="Delivery Address" value={order.delivery_address} />
                {order.delivery_notes && (
                  <InfoRow icon={FiPackage} label="Delivery Notes" value={order.delivery_notes} />
                )}
              </Grid>
            </Grid>

            {/* Pay button: only when the parent supplies a handler */}
            {order.status === 'pending' && onPay && (
              <>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<FiCreditCard />}
                  onClick={onPay}
                  disabled={paying}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                >
                  {paying ? 'Requesting payment…' : 'Pay with M-Pesa'}
                </Button>
              </>
            )}

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

        {/* ── Order progress ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Delivery Progress</Typography>

            {isCancelled ? (
              <Box sx={{
                mt: 2, p: 2, borderRadius: 2, bgcolor: 'error.50',
                border: '1px solid', borderColor: 'error.light',
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <FiXCircle size={22} color="#dc3545" />
                <Box>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    Order cancelled
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This order will not be delivered.
                  </Typography>
                </Box>
              </Box>
            ) : isKnownStatus ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {PROGRESS_STEPS.map((step, idx) => (
                  <StatusStep
                    key={step.key}
                    label={step.label}
                    done={currentStepIndex > idx}
                    active={currentStepIndex === idx}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textTransform: 'capitalize' }}>
                Status: {String(order.status || 'unknown').replace(/_/g, ' ')}
              </Typography>
            )}

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