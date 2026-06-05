import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Paper, Chip, Skeleton } from '@mui/material';
import { FiCreditCard } from 'react-icons/fi';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getStatusColor } from '../utils/helpers';
import EmptyState from '../components/common/EmptyState';

const PaymentsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then((data) => {
      setOrders(data.filter((o) => o.status !== 'pending'));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>Payment History</Typography>

      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3].map((i) => <Grid item xs={12} key={i}><Skeleton height={80} variant="rounded" sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : orders.length === 0 ? (
        <EmptyState icon={FiCreditCard} title="No payment history" description="Your completed payments will appear here." />
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {orders.map((order, i) => (
            <Box key={order.id} sx={{
              p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
              borderBottom: i < orders.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider', '&:hover': { bgcolor: 'grey.50' }
            }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.50',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCreditCard color="#0066cc" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Order #{order.id} — {order.order_type === 'purchase' ? 'Purchase' : 'Refill'} {order.size}L
                </Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(order.created_at)}</Typography>
              </Box>
              {order.mpesa_receipt && (
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  {order.mpesa_receipt}
                </Typography>
              )}
              <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(order.total_amount)}</Typography>
              <Chip
                label={order.status === 'paid' || order.status === 'delivered' || order.status === 'assigned' ? 'Paid' : order.status}
                size="small"
                sx={{ bgcolor: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status), fontWeight: 600 }}
              />
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default PaymentsPage;