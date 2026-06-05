import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Box, Typography, Grid, Paper, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Snackbar, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { FiDroplet, FiRefreshCw } from 'react-icons/fi';
import orderService from '../../services/orderService';
import productService from '../../services/productService';

const paperStyle = {
  elevation: 0,
  sx: { borderRadius: '14px', border: '1px solid', borderColor: 'divider', bgcolor: 'white', overflow: 'hidden', height: '100%' }
};

const statusColorMap = {
  pending: 'default', paid: 'info', preparing: 'secondary',
  dispatched: 'primary', delivered: 'success', cancelled: 'error'
};

/* ══════════════════════════════════════════════
   1. ORDER MANAGEMENT TAB
   ══════════════════════════════════════════════ */
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setSnack('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateAdminOrder(orderId, { status: newStatus }); // Assume this API call exists
      setSnack(`Order #${orderId} updated to ${newStatus}`);
      fetchOrders();
    } catch {
      setSnack('Failed to update order');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>Station Orders</Typography>
        <Button size="small" startIcon={<FiRefreshCw size={14} />} onClick={fetchOrders}>Refresh</Button>
      </Box>

      <TableContainer component={Paper} {...paperStyle}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fbff' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type / Capacity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ordered By</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Deliver To (Recipient)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No orders</TableCell></TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={700}>#{order.id}</Typography></TableCell>
                  <TableCell>
                    <Chip 
                      icon={<FiDroplet size={12} />} 
                      label={`${order.order_type === 'purchase' ? 'Buy' : 'Refill'} - ${order.bottle_name || order.bottle}`} 
                      size="small" variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.ordered_by_name || 'Guest'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{order.recipient_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{order.recipient_phone}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700}>Ksh {order.total_amount}</Typography></TableCell>
                  <TableCell>
                    <Chip label={order.status} size="small" color={statusColorMap[order.status]} sx={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        sx={{ height: 32, fontSize: '0.8rem' }}
                      >
                        {['pending', 'paid', 'preparing', 'dispatched', 'delivered', 'cancelled'].map(s => (
                          <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(null)} severity="info" variant="filled" sx={{ width: '100%' }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   2. BOTTLE INVENTORY TAB
   ══════════════════════════════════════════════ */
const InventoryTab = () => {
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming productService.getBottles() pulls the CustomerBottle inventory
      const data = await productService.getBottles(); 
      setBottles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Tracked Bottle Inventory</Typography>
      <TableContainer component={Paper} {...paperStyle}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fbff' }}>
              <TableCell sx={{ fontWeight: 700 }}>Serial Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Current Holder</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : bottles.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No inventory tracked yet</TableCell></TableRow>
            ) : (
              bottles.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{b.serial_code}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{b.bottle_type?.name || 'N/A'}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {b.current_holder ? `${b.current_holder.first_name} ${b.current_holder.last_name}` : 'Unassigned / At Station'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={b.is_with_company ? 'At Station' : 'With Customer'} 
                      size="small" 
                      color={b.is_with_company ? 'success' : 'primary'}
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   MAIN ADMIN PAGE
   ══════════════════════════════════════════════ */
const AdminPage = () => {
  const [tab, setTab] = useState(0);

  const tabs = [
    { label: 'Orders & Dispatch' },
    { label: 'Bottle Inventory' },
  ];

  return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', pt: 3, pb: 2.5 }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            🛡️ Staff Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">Manage orders, dispatch, and track inventory</Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 3, p: 1, bgcolor: 'white' }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.9rem' } },
              '& .Mui-selected': { color: '#0066cc' },
              '& .MuiTabs-indicator': { height: 3, borderRadius: 2 }
            }}
          >
            {tabs.map((t) => <Tab key={t.label} label={t.label} />)}
          </Tabs>
        </Paper>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === 0 && <OrdersTab />}
            {tab === 1 && <InventoryTab />}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default AdminPage;