import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Paper, Grid,
  Skeleton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus, FiShoppingCart, FiRefreshCw,
  FiFilter, FiCheckCircle, FiClock, FiX
} from 'react-icons/fi';
import orderService from '../services/orderService';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import SuccessToast from '../components/common/SuccessToast';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

/* ── Status filter tabs ── */
const FILTERS = [
  { key: 'all',      label: 'All',      icon: FiFilter },
  { key: 'active',   label: 'Active',   icon: FiClock   },
  { key: 'delivered',label: 'Delivered',icon: FiCheckCircle },
  { key: 'cancelled',label: 'Cancelled',icon: FiX       },
];

const ACTIVE_STATUSES = ['pending', 'paid', 'assigned', 'picked', 'in_transit'];

/* ── Single Order Card ── */
const OrderCard = ({ order, onCancel, idx }) => {
  const navigate = useNavigate();
  const isPurchase = order.order_type === 'purchase';
  const canCancel = ['pending', 'paid'].includes(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: idx * 0.055, duration: 0.38 }}
      layout
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'white',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': { boxShadow: '0 6px 24px rgba(0,60,120,0.09)', transform: 'translateY(-2px)' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        {/* Colour bar */}
        <Box sx={{
          height: 4,
          background: isPurchase
            ? 'linear-gradient(90deg,#0066cc,#33aaff)'
            : 'linear-gradient(90deg,#1a8a4a,#34d067)',
        }} />

        <Box sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                bgcolor: isPurchase ? '#dbeeff' : '#d4f5e4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isPurchase
                  ? <FiShoppingCart size={16} color="#0066cc" />
                  : <FiRefreshCw size={16} color="#1a8a4a" />
                }
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {isPurchase ? 'Bottle Purchase' : 'Refill Order'} — {order.size}L
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                  #{order.id}
                </Typography>
              </Box>
            </Box>
            <OrderStatusBadge status={order.status} />
          </Box>

          {/* Details row */}
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, md: 2 },
            pt: 1.5, borderTop: '1px dashed', borderColor: 'divider', mt: 'auto',
            alignItems: 'flex-end'
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem', mb: 0.2 }}>
                Amount
              </Typography>
              <Typography variant="body2" fontWeight={800} color="#0044aa">
                {formatCurrency(order.total_amount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem', mb: 0.2 }}>
                Qty
              </Typography>
              <Typography variant="body2" fontWeight={700}>{order.quantity}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.68rem', mb: 0.2 }}>
                Placed
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {formatRelativeTime(order.created_at)}
              </Typography>
            </Box>
            {canCancel && (
              <Box>
                <Button
                  size="small" color="error" variant="outlined"
                  onClick={(e) => { e.stopPropagation(); onCancel(order.id); }}
                  sx={{
                    borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                    py: 0.4, px: 1.2,
                    borderColor: '#f5b8b8',
                    '&:hover': { bgcolor: '#fff0f0', borderColor: '#e57373' },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

/* ── Skeleton loader ── */
const OrderSkeleton = ({ idx }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
    <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={4} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: '10px', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="55%" height={20} />
            <Skeleton width="30%" height={16} sx={{ mt: 0.4 }} />
          </Box>
          <Skeleton width={70} height={26} sx={{ borderRadius: 99 }} />
        </Box>
        <Skeleton width="100%" height={1} />
        <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
          <Skeleton width={60} height={36} />
          <Skeleton width={40} height={36} />
          <Skeleton width={80} height={36} />
        </Box>
      </Box>
    </Paper>
  </motion.div>
);

/* ── Empty state ── */
const EmptyOrders = ({ filtered }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <Box sx={{
      textAlign: 'center', py: { xs: 6, md: 8 },
      border: '2px dashed', borderColor: 'divider',
      borderRadius: '20px', bgcolor: 'white',
    }}>
      <Box sx={{
        width: 68, height: 68, borderRadius: '18px', bgcolor: '#f0f7ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5,
      }}>
        <FiShoppingCart size={28} color="#99b8d8" strokeWidth={1.5} />
      </Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {filtered ? 'No orders found' : 'No orders yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: filtered ? 0 : 3, maxWidth: 320, mx: 'auto' }}>
        {filtered
          ? 'Try a different filter to find your orders.'
          : 'Place your first water order and get it delivered fresh.'}
      </Typography>
      {!filtered && (
        <Button
          component={Link} to="/orders/new"
          variant="contained" startIcon={<FiPlus size={15} />}
          sx={{ borderRadius: '10px', fontWeight: 700, px: 3, py: 1.1 }}
        >
          Place First Order
        </Button>
      )}
    </Box>
  </motion.div>
);

/* ══════════════════════════════════════════════ */
export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    orderService.getOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleCancel = async (id) => {
    try {
      await orderService.cancelOrder(id);
      setToast('Order cancelled successfully');
      loadOrders();
    } catch {
      setToast('Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATUSES.includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const counts = {
    all: orders.length,
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh' }}>

      {/* ── Clean White Header (Matches Screenshot) ── */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: { xs: 3, md: 4 },
        pb: { xs: 2.5, md: 3 },
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 2 
            }}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, color: 'text.primary' }}>
                  My Orders
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<FiPlus size={16} />}
                component={Link} to="/orders/new"
                sx={{
                  bgcolor: '#0066cc', color: 'white', fontWeight: 700,
                  borderRadius: '10px', px: 3, py: 1.1, fontSize: '0.88rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0055aa', boxShadow: '0 2px 8px rgba(0,85,170,0.25)' },
                  transition: 'all 0.2s',
                }}
              >
                New Order
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Container Fluid for Body ── */}
      <Container maxWidth={false} sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>

        {/* ── Evenly Distributed Filter tabs ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Paper elevation={0} sx={{
            borderRadius: '14px', border: '1px solid', borderColor: 'divider',
            p: 0.75, mb: { xs: 3, md: 3.5 },
            display: 'flex', width: '100%',
            bgcolor: 'white',
          }}>
            {FILTERS.map(({ key, label, icon: Icon }) => {
              const active = filter === key;
              return (
                <Button
                  key={key}
                  fullWidth
                  size="small"
                  startIcon={<Icon size={13} />}
                  onClick={() => setFilter(key)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    borderRadius: '10px',
                    px: { xs: 0.5, md: 1.8 },
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                    bgcolor: active ? '#0066cc' : 'transparent',
                    color: active ? 'white' : 'text.secondary',
                    '&:hover': { bgcolor: active ? '#0055aa' : '#f0f7ff' },
                    transition: 'all 0.18s',
                  }}
                >
                  {label}
                  {counts[key] > 0 && (
                    <Box component="span" sx={{
                      ml: 0.8, px: 0.8, py: 0.1,
                      bgcolor: active ? 'rgba(255,255,255,0.25)' : '#eef5ff',
                      color: active ? 'white' : '#0055bb',
                      borderRadius: 99, fontSize: '0.65rem', fontWeight: 800,
                      display: { xs: 'none', sm: 'inline-block' }
                    }}>
                      {counts[key]}
                    </Box>
                  )}
                </Button>
              );
            })}
          </Paper>
        </motion.div>

        {/* ── Responsive Order grid ── */}
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} item xs={12} sm={6} md={4} xl={3}>
                <OrderSkeleton idx={i} />
              </Grid>
            ))
          ) : filteredOrders.length === 0 ? (
            <Grid item xs={12}>
              <EmptyOrders filtered={filter !== 'all'} />
            </Grid>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order, idx) => (
                <Grid key={order.id} item xs={12} sm={6} md={4} xl={3}>
                  <OrderCard order={order} onCancel={handleCancel} idx={idx} />
                </Grid>
              ))}
            </AnimatePresence>
          )}
        </Grid>
      </Container>

      <SuccessToast open={!!toast} message={toast} onClose={() => setToast(null)} />
    </Box>
  );
};

export default OrdersPage;