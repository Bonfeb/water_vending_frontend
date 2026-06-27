// src/pages/AdminPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Box, Typography, Paper, Grid, Card, CardContent,
  Chip, CircularProgress, Alert, Snackbar, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiPackage, FiDroplet, FiCreditCard, FiUsers, FiRefreshCw,
  FiTrendingUp, FiDollarSign, FiTag,
} from 'react-icons/fi';
import api from '../../services/api';

/* ── helpers ── */
const fmtKsh = (amount) => {
  const num = parseFloat(amount) || 0;
  return `KSh ${num.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Backend sends size as integer (5 / 10 / 20); no size_display on PricingSerializer
const sizeLabel = (size) => `${size} Litres`;

/* ── StatCard ── */
const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <Card elevation={0} variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '12px',
          bgcolor: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={color} strokeWidth={2.5} />
        </Box>
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1.1, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
      {subtitle && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const StatusBadge = ({ label, count, color }) => (
  <Chip
    label={`${label}: ${count}`}
    size="small"
    sx={{
      bgcolor: `${color}15`, color, fontWeight: 600,
      fontSize: '0.75rem', border: `1px solid ${color}30`,
    }}
  />
);

const SizeCard = ({ size, count, color }) => (
  <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 1.5 }}>
    <Typography variant="h6" fontWeight={800} color={color}>{count}</Typography>
    <Typography variant="caption" color="text.secondary">{size}</Typography>
  </Card>
);

const AdminPage = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [snack, setSnack]     = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  /* ── Loading ── */
  if (loading) return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={48} />
    </Box>
  );

  /* ── Error ── */
  if (error || !stats) return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh', pt: 4, px: 2 }}>
      <Container maxWidth="sm">
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, py: 3 }}
          action={<Button color="inherit" size="small" onClick={fetchDashboard}>Retry</Button>}>
          {error || 'Failed to load dashboard'}
        </Alert>
      </Container>
    </Box>
  );

  const { orders, users, bottles, payments, pricings } = stats;

  return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', pt: 3, pb: 2.5 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                🛡️ Business Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time statistics and metrics
              </Typography>
            </Box>
            <Button startIcon={<FiRefreshCw size={14} />} onClick={fetchDashboard} size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Refresh
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>

        {/* ── Key Metrics ── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard icon={FiPackage}    label="Total Orders"    value={orders.total.toLocaleString()}        color="#6366f1" subtitle="All time" />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard icon={FiDollarSign} label="Order Revenue"   value={fmtKsh(orders.completed_revenue)}     color="#10b981" subtitle="From completed orders" />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard icon={FiCreditCard} label="Payments Received" value={fmtKsh(payments.completed_amount)} color="#0066cc" subtitle={`${payments.completed} completed`} />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard icon={FiUsers}      label="Total Users"     value={users.total.toLocaleString()}         color="#f59e0b" subtitle={`${users.new_this_week} new this week`} />
          </Grid>
        </Grid>

        {/* ── Orders Breakdown ── */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <FiPackage size={20} color="#6366f1" />
            <Typography variant="h6" fontWeight={700}>Orders Breakdown</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <StatusBadge label="Pending"    count={orders.by_status.pending}    color="#6b7280" />
            <StatusBadge label="Paid"       count={orders.by_status.paid}       color="#3b82f6" />
            <StatusBadge label="Preparing"  count={orders.by_status.preparing}  color="#8b5cf6" />
            <StatusBadge label="Dispatched" count={orders.by_status.dispatched} color="#f59e0b" />
            <StatusBadge label="Completed"  count={orders.by_status.completed}  color="#10b981" />
            <StatusBadge label="Cancelled"  count={orders.by_status.cancelled}  color="#ef4444" />
          </Box>
        </Paper>

        {/* ── Bottles & Users ── */}
        <Grid container spacing={3} sx={{ mb: 3 }}>

          {/* Bottles */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <FiDroplet size={20} color="#0066cc" />
                <Typography variant="h6" fontWeight={700}>Bottle Inventory</Typography>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { label: 'Total',    value: bottles.total,    color: '#6366f1' },
                  { label: 'Active',   value: bottles.active,   color: '#10b981' },
                  { label: 'Inactive', value: bottles.inactive, color: '#ef4444' },
                ].map((s) => (
                  <Grid item xs={4} key={s.label}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color={s.color}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Active by Size</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={4}><SizeCard size="5L"  count={bottles.active_by_size['5L']}  color="#0066cc" /></Grid>
                <Grid item xs={4}><SizeCard size="10L" count={bottles.active_by_size['10L']} color="#8b5cf6" /></Grid>
                <Grid item xs={4}><SizeCard size="20L" count={bottles.active_by_size['20L']} color="#f59e0b" /></Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Users */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <FiUsers size={20} color="#f59e0b" />
                <Typography variant="h6" fontWeight={700}>Users</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, p: 2, textAlign: 'center', border: '2px solid #0066cc30' }}>
                    <Typography variant="h4" fontWeight={800} color="#0066cc">{users.customers}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Customers</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, p: 2, textAlign: 'center', border: '2px solid #6366f130' }}>
                    <Typography variant="h4" fontWeight={800} color="#6366f1">{users.staff}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Staff</Typography>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FiTrendingUp size={18} color="#10b981" />
                <Typography variant="body2" color="#10b981" fontWeight={600}>
                  {users.new_this_week} new user{users.new_this_week !== 1 ? 's' : ''} this week
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ── Payments Summary ── */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <FiCreditCard size={20} color="#0066cc" />
            <Typography variant="h6" fontWeight={700}>Payments Summary</Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { label: 'Total Transactions', value: payments.total,     color: '#6366f1' },
              { label: 'Completed',          value: payments.completed, color: '#10b981' },
              { label: 'Pending',            value: payments.pending,   color: '#f59e0b' },
              { label: 'Failed',             value: payments.failed,    color: '#ef4444' },
            ].map((s) => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={800} color={s.color}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ── Pricing Table ── */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white', overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2, sm: 3 }, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FiTag size={20} color="#10b981" />
            <Typography variant="h6" fontWeight={700}>Current Pricing</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                  <TableCell sx={{ fontWeight: 700, px: 3 }}>Bottle Size</TableCell>
                  <TableCell sx={{ fontWeight: 700, px: 3 }} align="right">Purchase Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, px: 3 }} align="right">Refill Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, px: 3 }} align="right">Difference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pricings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No pricing configured
                    </TableCell>
                  </TableRow>
                ) : (
                  /* sort by size ascending */
                  [...pricings].sort((a, b) => a.size - b.size).map((p) => {
                    const diff = (Number(p.purchase_price) - Number(p.refill_price)).toFixed(2);
                    return (
                      <TableRow
                        key={p.id ?? p.size}
                        sx={{ '&:nth-of-type(odd)': { bgcolor: '#f8fafc' } }}
                      >
                        <TableCell sx={{ px: 3 }}>
                          <Chip
                            icon={<FiDroplet size={11} />}
                            label={sizeLabel(p.size)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ px: 3 }} align="right">
                          <Typography variant="body2" fontWeight={700} color="#166534">
                            {fmtKsh(p.purchase_price)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 3 }} align="right">
                          <Typography variant="body2" fontWeight={700} color="#0066cc">
                            {fmtKsh(p.refill_price)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 3 }} align="right">
                          <Typography variant="body2" color="text.secondary">
                            {fmtKsh(diff)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Container>

      <Snackbar
        open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack(null)} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage;