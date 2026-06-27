import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Button, Paper, Grid,
  CircularProgress, Skeleton, Chip, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiDroplet, FiMapPin, FiPhone, FiClock,
  FiShoppingCart, FiRefreshCw, FiPackage, FiTruck,
  FiCheckCircle, FiAlertCircle, FiHash
} from 'react-icons/fi';
import orderService from '../services/orderService';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';

/* ─── Info row ─── */
const InfoRow = ({ icon: Icon, label, value, accent = false }) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-start', gap: 1.5,
    py: 1.6, borderBottom: '1px dashed', borderColor: 'divider',
    '&:last-child': { borderBottom: 'none' },
  }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '8px',
      bgcolor: accent ? '#dbeeff' : '#f4f6fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1,
    }}>
      <Icon size={15} color={accent ? '#0066cc' : '#888'} strokeWidth={2} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block"
        sx={{ fontSize: '0.68rem', letterSpacing: 0.3, textTransform: 'uppercase', mb: 0.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word', color: accent ? '#0044aa' : 'text.primary' }}>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

/* ─── Status timeline ─── */
const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: FiHash },
  { key: 'paid',       label: 'Payment Confirmed', icon: FiCheckCircle },
  { key: 'assigned',   label: 'Rider Assigned', icon: FiPackage },
  { key: 'in_transit', label: 'Out for Delivery', icon: FiTruck },
  { key: 'delivered',  label: 'Delivered',      icon: FiDroplet },
];

const ORDER_STATUS_ORDER = ['pending', 'paid', 'assigned', 'picked', 'in_transit', 'delivered'];

const StatusTimeline = ({ status }) => {
  const currentIdx = ORDER_STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'cancelled';

  return (
    <Box sx={{ py: 1 }}>
      {isCancelled ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#fde8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiAlertCircle size={18} color="#c0392b" />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700} color="error.main">Order Cancelled</Typography>
            <Typography variant="caption" color="text.secondary">This order has been cancelled</Typography>
          </Box>
        </Box>
      ) : (
        STATUS_STEPS.map((step, i) => {
          const stepIdx = ORDER_STATUS_ORDER.indexOf(step.key);
          const done = stepIdx <= currentIdx;
          const active = stepIdx === currentIdx;
          const Icon = step.icon;

          return (
            <Box key={step.key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 0.5 }}>
              {/* dot + line */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
                <motion.div
                  initial={active ? { scale: 0.8 } : {}}
                  animate={active ? { scale: [0.9, 1.1, 1] } : {}}
                  transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: 2 }}
                >
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '50%',
                    bgcolor: done ? (active ? '#0066cc' : '#d4f5e4') : '#f0f4f8',
                    border: active ? '2.5px solid #0066cc' : done ? '2px solid #1a8a4a' : '2px solid #dde2ea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? '0 0 0 4px rgba(0,102,204,0.15)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    <Icon size={16}
                      color={done ? (active ? 'white' : '#1a8a4a') : '#b0b8c8'}
                      strokeWidth={2}
                    />
                  </Box>
                </motion.div>
                {i < STATUS_STEPS.length - 1 && (
                  <Box sx={{
                    width: 2, height: 22, mt: 0.5,
                    bgcolor: done && stepIdx < currentIdx ? '#1a8a4a' : '#e0e6ef',
                    borderRadius: 1,
                    transition: 'background 0.3s',
                  }} />
                )}
              </Box>

              {/* label */}
              <Box sx={{ pt: 0.7, pb: i < STATUS_STEPS.length - 1 ? 1.5 : 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={active ? 800 : done ? 600 : 400}
                  color={active ? '#0044aa' : done ? 'text.primary' : 'text.disabled'}
                  sx={{ fontSize: '0.85rem' }}
                >
                  {step.label}
                </Typography>
                {active && (
                  <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
                    Current status
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};

/* ─── Section card ─── */
const Section = ({ title, children, accent = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Paper elevation={0} sx={{
      borderRadius: '18px', border: '1px solid',
      borderColor: accent ? '#b8d9f8' : 'divider',
      overflow: 'hidden', bgcolor: 'white',
      boxShadow: accent ? '0 4px 20px rgba(0,102,204,0.08)' : 'none',
    }}>
      {title && (
        <Box sx={{
          px: { xs: 2.5, md: 3 }, py: 1.8,
          borderBottom: '1px solid', borderColor: accent ? '#dbeeff' : 'divider',
          bgcolor: accent ? '#f0f8ff' : 'transparent',
        }}>
          <Typography variant="subtitle2" fontWeight={800} color={accent ? '#0044aa' : 'text.primary'}>
            {title}
          </Typography>
        </Box>
      )}
      <Box sx={{ px: { xs: 2.5, md: 3 }, py: { xs: 1.5, md: 2 } }}>
        {children}
      </Box>
    </Paper>
  </motion.div>
);

/* ── Skeleton loader ── */
const DetailSkeleton = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={7}>
      <Paper elevation={0} sx={{ borderRadius: '18px', border: '1px solid', borderColor: 'divider', p: 3 }}>
        {[80, 55, 65, 70, 50].map((w, i) => (
          <Skeleton key={i} height={24} width={`${w}%`} sx={{ mb: 1 }} />
        ))}
      </Paper>
    </Grid>
    <Grid item xs={12} md={5}>
      <Paper elevation={0} sx={{ borderRadius: '18px', border: '1px solid', borderColor: 'divider', p: 3 }}>
        {[90, 60, 75].map((w, i) => (
          <Skeleton key={i} height={24} width={`${w}%`} sx={{ mb: 1 }} />
        ))}
      </Paper>
    </Grid>
  </Grid>
);

/* ══════════════════════════════════════════════ */
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderService.getOrder(id)
      .then(setOrder)
      .catch(() => setError('Order not found or you don\'t have permission to view it.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh' }}>

      {/* ── Header strip ── */}
      <Box sx={{
        background: 'linear-gradient(130deg,#002f80 0%,#0055cc 55%,#0088e0 100%)',
        pt: { xs: 4, md: 5 }, pb: { xs: 6, md: 7 },
        px: 2, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', top: -80, right: -60, pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              startIcon={<FiArrowLeft size={16} />}
              onClick={() => navigate(-1)}
              sx={{
                color: 'rgba(255,255,255,0.8)', mb: 2.5, fontWeight: 600,
                '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                borderRadius: '9px', px: 1.5,
              }}
            >
              Back to Orders
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.7rem', md: '2rem' } }}>
                  Order #{id}
                </Typography>
                {!loading && order && (
                  <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.3 }}>
                    Placed {formatRelativeTime(order.created_at)}
                  </Typography>
                )}
              </Box>
              {!loading && order && <OrderStatusBadge status={order.status} />}
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -4 }, pb: 6, px: { xs: 2, md: 3 } }}>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Paper elevation={0} sx={{ borderRadius: '18px', border: '1px solid #f9caca', p: { xs: 4, md: 6 }, textAlign: 'center', bgcolor: 'white' }}>
              <Box sx={{ width: 60, height: 60, borderRadius: '16px', bgcolor: '#fde8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <FiAlertCircle size={28} color="#c0392b" />
              </Box>
              <Typography variant="h6" fontWeight={700} color="error.main" gutterBottom>Order Not Found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
              <Button onClick={() => navigate('/orders')} variant="contained" sx={{ borderRadius: '10px', fontWeight: 700 }}>
                Back to Orders
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>

            {/* ── Left column ── */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>

                {/* Order summary */}
                <Section title="Order Summary" accent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, mb: 0.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                    <Box sx={{
                      width: 54, height: 54, borderRadius: '14px', flexShrink: 0,
                      bgcolor: order.order_type === 'purchase' ? '#dbeeff' : '#d4f5e4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {order.order_type === 'purchase'
                        ? <FiShoppingCart size={24} color="#0066cc" />
                        : <FiRefreshCw size={24} color="#1a8a4a" />
                      }
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {order.order_type === 'purchase' ? 'Bottle Purchase' : 'Refill Order'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.size}L × {order.quantity} unit{order.quantity !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight={900} color="#0044aa">
                        {formatCurrency(order.total_amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Total</Typography>
                    </Box>
                  </Box>

                  <InfoRow icon={FiHash}       label="Order ID"        value={`#${order.id}`}              accent />
                  <InfoRow icon={FiClock}      label="Placed"          value={formatDate(order.created_at)} />
                  <InfoRow icon={FiPhone}      label="Payment Phone"   value={order.payment_phone}          accent />
                </Section>

                {/* Delivery info */}
                <Section title="Delivery Details">
                  <InfoRow icon={FiMapPin} label="Delivery Address" value={order.delivery_address} />
                  {order.delivery_notes && (
                    <InfoRow icon={FiPackage} label="Notes" value={order.delivery_notes} />
                  )}
                  {(order.delivery_lat && order.delivery_lng) && (
                    <InfoRow
                      icon={FiMapPin}
                      label="Coordinates"
                      value={`${Number(order.delivery_lat).toFixed(5)}, ${Number(order.delivery_lng).toFixed(5)}`}
                    />
                  )}
                </Section>

              </Box>
            </Grid>

            {/* ── Right column ── */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>

                {/* Status timeline */}
                <Section title="Order Progress">
                  <StatusTimeline status={order.status} />
                </Section>

                {/* Payment info (if available) */}
                {order.payment && (
                  <Section title="Payment">
                    <InfoRow icon={FiCheckCircle} label="Method"    value="M-Pesa"                       accent />
                    <InfoRow icon={FiPhone}       label="Phone"     value={order.payment.phone_number}   />
                    <InfoRow icon={FiHash}        label="M-Pesa Ref" value={order.payment.mpesa_receipt_number} accent />
                    <InfoRow icon={FiClock}       label="Paid At"   value={formatDate(order.payment.paid_at)} />
                  </Section>
                )}

                {/* Rider (if assigned) */}
                {order.rider && (
                  <Section title="Your Rider">
                    <InfoRow icon={FiTruck} label="Name"  value={`${order.rider.first_name} ${order.rider.last_name}`} accent />
                    <InfoRow icon={FiPhone} label="Phone" value={order.rider.phone} />
                  </Section>
                )}

              </Box>
            </Grid>

          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default OrderDetailPage;