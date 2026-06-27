import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, Chip, Snackbar, Alert, CircularProgress,
  FormControl, Select, MenuItem, useTheme, useMediaQuery, InputLabel,
  Tooltip, Fade,
} from '@mui/material';
import {
  FiPlus, FiShoppingCart, FiRefreshCw,
  FiFilter, FiCheckCircle, FiClock, FiX, FiSearch,
  FiDroplet, FiMapPin, FiExternalLink,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import SuccessToast from '../components/common/SuccessToast';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

const zebraRowSx = {
  '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
  '&:hover': { bgcolor: '#eef2ff' },
  transition: 'background 0.15s',
};

const ACTIVE_STATUSES = ['pending', 'paid', 'assigned', 'picked', 'in_transit', 'preparing', 'dispatched'];

const statusColorMap = {
  pending: 'default',
  paid: 'info',
  preparing: 'secondary',
  dispatched: 'warning',
  in_transit: 'warning',
  assigned: 'warning',
  picked: 'warning',
  completed: 'success',
  delivered: 'success',
  cancelled: 'error',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const OrdersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    orderService.getOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await orderService.cancelOrder(id);
      setToast('Order cancelled successfully');
      loadOrders();
    } catch {
      setToast('Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Tab filter
    let passTab = true;
    if (filter === 'active') passTab = ACTIVE_STATUSES.includes(o.status);
    else if (filter === 'completed') passTab = ['completed', 'delivered'].includes(o.status);
    else if (filter === 'cancelled') passTab = o.status === 'cancelled';

    // Status dropdown filter
    let passStatus = true;
    if (filterStatus !== 'all') passStatus = o.status === filterStatus;

    // Search filter
    let passSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      passSearch =
        String(o.id).includes(q) ||
        (o.delivery_address || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q) ||
        (o.mpesa_receipt || '').toLowerCase().includes(q);
    }

    return passTab && passStatus && passSearch;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (key) => {
    setFilter(key);
    setPage(0);
  };

  const counts = {
    all: orders.length,
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    completed: orders.filter((o) => ['completed', 'delivered'].includes(o.status)).length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pt: { xs: 3, md: 4 },
          pb: { xs: 2, md: 3 },
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, color: 'text.primary' }}
              >
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
                bgcolor: '#0066cc',
                color: 'white',
                fontWeight: 700,
                borderRadius: '10px',
                px: { xs: 2, sm: 3 },
                py: 1.1,
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0055aa', boxShadow: '0 2px 8px rgba(0,85,170,0.25)' },
                transition: 'all 0.2s',
              }}
            >
              {isMobile ? 'New' : 'New Order'}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        sx={{ pt: { xs: 2.5, md: 3.5 }, pb: 6, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
      >
        {/* Filter Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            p: 0.5,
            mb: 2.5,
            display: 'flex',
            bgcolor: 'white',
            overflow: 'hidden',
          }}
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            const Icon = key === 'all' ? FiFilter : key === 'active' ? FiClock : key === 'completed' ? FiCheckCircle : FiX;
            return (
              <Button
                key={key}
                fullWidth
                size="small"
                startIcon={<Icon size={14} />}
                onClick={() => handleTabChange(key)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: '10px',
                  py: 0.9,
                  fontWeight: 700,
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  bgcolor: active ? '#0066cc' : 'transparent',
                  color: active ? 'white' : 'text.secondary',
                  '&:hover': { bgcolor: active ? '#0055aa' : '#f0f7ff' },
                  transition: 'all 0.18s',
                }}
              >
                {label}
                {counts[key] > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.8,
                      px: 0.8,
                      py: 0.15,
                      bgcolor: active ? 'rgba(255,255,255,0.22)' : '#eef5ff',
                      color: active ? 'white' : '#0055bb',
                      borderRadius: 99,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: { xs: 'none', sm: 'inline-block' },
                    }}
                  >
                    {counts[key]}
                  </Box>
                )}
              </Button>
            );
          })}
        </Paper>

        {/* Search & Status Filter */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            mb: 2.5,
            bgcolor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '10px',
                px: 1.5,
                py: 0.4,
                minWidth: { xs: 140, sm: 220 },
                flex: { xs: 1, sm: 'auto' },
                bgcolor: '#fafbfc',
                transition: 'border-color 0.2s',
                '&:focus-within': { borderColor: '#0066cc', bgcolor: 'white' },
              }}
            >
              <FiSearch size={15} color="#9ca3af" style={{ marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%',
                  background: 'transparent',
                  color: 'inherit',
                }}
              />
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 150 } }}>
              <InputLabel sx={{ fontSize: '0.85rem' }}>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                sx={{ borderRadius: '10px', fontSize: '0.85rem' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                {['pending', 'paid', 'preparing', 'dispatched', 'in_transit', 'completed', 'cancelled'].map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                    {s.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              startIcon={<FiRefreshCw size={14} />}
              onClick={loadOrders}
              sx={{ borderRadius: '10px', fontWeight: 600 }}
            >
              {isMobile ? '' : 'Refresh'}
            </Button>
          </Box>
        </Paper>

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            overflow: 'hidden',
          }}
        >
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)',
                }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                    Order
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                    Type
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                      Address
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }} align="right">
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                    Status
                  </TableCell>
                  {!isTablet && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                      Date
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Fade in>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={36} sx={{ color: '#0066cc' }} />
                          <Typography variant="body2" color="text.secondary">Loading orders…</Typography>
                        </Box>
                      </Fade>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '16px',
                            bgcolor: '#f0f7ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FiShoppingCart size={28} color="#99b8d8" strokeWidth={1.5} />
                        </Box>
                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                          {filter !== 'all' || searchQuery || filterStatus !== 'all'
                            ? 'No orders found'
                            : 'No orders yet'}
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 300, textAlign: 'center' }}>
                          {filter !== 'all' || searchQuery || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Place your first water order and get it delivered fresh.'}
                        </Typography>
                        {filter === 'all' && !searchQuery && filterStatus === 'all' && (
                          <Button
                            component={Link}
                            to="/orders/new"
                            variant="contained"
                            startIcon={<FiPlus size={15} />}
                            sx={{
                              mt: 1,
                              borderRadius: '10px',
                              fontWeight: 700,
                              px: 3,
                              bgcolor: '#0066cc',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#0055aa' },
                            }}
                          >
                            Place First Order
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => {
                    const isPurchase = order.order_type === 'purchase';
                    const canCancel = ['pending', 'paid'].includes(order.status);

                    return (
                      <TableRow
                        key={order.id}
                        sx={zebraRowSx}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                            >
                              #{order.id}
                            </Typography>
                            {!isTablet && <FiExternalLink size={11} color="#9ca3af" />}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                          <Chip
                            icon={<FiDroplet size={11} />}
                            label={`${isPurchase ? 'Buy' : 'Refill'} · ${order.size}L × ${order.quantity}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              height: 26,
                              borderRadius: '6px',
                              borderColor: isPurchase ? '#0066cc40' : '#1a8a4a40',
                              color: isPurchase ? '#0066cc' : '#1a8a4a',
                              '& .MuiChip-icon': { color: 'inherit' },
                            }}
                          />
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: 180 }}>
                              <FiMapPin size={12} color="#9ca3af" flexShrink={0} />
                              <Typography variant="body2" noWrap sx={{ fontSize: '0.78rem' }} color="text.secondary">
                                {order.delivery_address || '—'}
                              </Typography>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell sx={{ px: { xs: 1.5, sm: 2 } }} align="right">
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', color: '#0044aa' }}>
                            {formatCurrency(order.total_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                          <Chip
                            label={order.status?.replace(/_/g, ' ') || 'Unknown'}
                            size="small"
                            color={statusColorMap[order.status] || 'default'}
                            sx={{
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              fontSize: '0.68rem',
                              height: 24,
                              borderRadius: '6px',
                            }}
                          />
                        </TableCell>
                        {!isTablet && (
                          <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {formatRelativeTime(order.created_at)}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ px: { xs: 1, sm: 1.5 } }} align="center">
                          {canCancel && (
                            <Tooltip title="Cancel order">
                              <span>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  disabled={cancellingId === order.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel(order.id);
                                  }}
                                  sx={{
                                    borderRadius: '8px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    py: 0.3,
                                    px: 1.2,
                                    minWidth: 0,
                                    borderColor: '#f5b8b8',
                                    '&:hover': { bgcolor: '#fff0f0', borderColor: '#e57373' },
                                  }}
                                >
                                  {cancellingId === order.id ? '…' : 'Cancel'}
                                </Button>
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-select': { fontSize: '0.85rem', borderRadius: '8px' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
              '& .MuiTablePagination-actions button': { borderRadius: '8px' },
            }}
          />
        </Paper>
      </Container>

      <SuccessToast open={!!toast} message={toast} onClose={() => setToast(null)} />
    </Box>
  );
};

export default OrdersPage;