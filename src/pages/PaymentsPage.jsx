import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, Chip, Snackbar, Alert, CircularProgress,
  FormControl, Select, MenuItem, useTheme, useMediaQuery, InputLabel,
  Fade,
} from '@mui/material';
import {
  FiCreditCard, FiRefreshCw, FiDollarSign, FiCheckCircle,
  FiClock, FiXCircle, FiSearch, FiExternalLink,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const zebraRowSx = {
  '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
  '&:hover': { bgcolor: '#eef2ff' },
  transition: 'background 0.15s',
};

const paymentStatusColor = (status) => {
  if (status === 'completed' || status === 'success') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'pending') return 'warning';
  return 'default';
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: `${color}25`,
      bgcolor: 'white',
      height: '100%',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px ${color}18`,
        borderColor: `${color}50`,
      },
    }}
  >
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box
          sx={{
            width: { xs: 36, sm: 42 },
            height: { xs: 36, sm: 42 },
            borderRadius: '11px',
            bgcolor: `${color}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={color} strokeWidth={2.5} />
        </Box>
      </Box>
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ color, lineHeight: 1.1, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={500}
        sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
      >
        {label}
      </Typography>
    </Box>
  </Card>
);

const PaymentsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [totals, setTotals] = useState({
    total_amount: '0',
    completed_amount: '0',
    pending_amount: '0',
    failed_amount: '0',
  });
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/payments/', { params });
      setPayments(res.data.results || []);
      setTotals({
        total_amount: res.data.total_amount || '0',
        completed_amount: res.data.completed_amount || '0',
        pending_amount: res.data.pending_amount || '0',
        failed_amount: res.data.failed_amount || '0',
      });
    } catch {
      setSnack('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return `Ksh ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const paginatedPayments = payments.slice(
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

  return (
    <Box sx={{ bgcolor: '#f5f8fd', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pt: 3,
          pb: 2.5,
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <FiCreditCard size={26} /> Payments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                {loading ? 'Loading…' : `${payments.length} transaction${payments.length !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<FiRefreshCw size={14} />}
              onClick={fetchPayments}
              sx={{ borderRadius: '10px', fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        sx={{ pt: { xs: 2.5, md: 3.5 }, pb: 6, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
      >
        {/* Summary Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={FiDollarSign}
              label="Total Amount"
              value={formatCurrency(totals.total_amount)}
              color="#6366f1"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={FiCheckCircle}
              label="Completed"
              value={formatCurrency(totals.completed_amount)}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={FiClock}
              label="Pending"
              value={formatCurrency(totals.pending_amount)}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={FiXCircle}
              label="Failed"
              value={formatCurrency(totals.failed_amount)}
              color="#ef4444"
            />
          </Grid>
        </Grid>

        {/* Filters Bar */}
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
                placeholder="Search receipt, phone..."
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
            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 140 } }}>
              <InputLabel sx={{ fontSize: '0.85rem' }}>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                sx={{ borderRadius: '10px', fontSize: '0.85rem' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
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
                  bgcolor: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)',
                  background: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)',
                }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                    Order
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                      Customer
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }} align="right">
                    Amount
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                      Receipt
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                    Status
                  </TableCell>
                  {!isTablet && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1.5, sm: 2 }, fontSize: '0.8rem' }}>
                      Date
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Fade in>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={36} sx={{ color: '#0066cc' }} />
                          <Typography variant="body2" color="text.secondary">Loading payments…</Typography>
                        </Box>
                      </Fade>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 64, height: 64, borderRadius: '16px',
                            bgcolor: '#f0f7ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <FiCreditCard size={28} color="#99b8d8" strokeWidth={1.5} />
                        </Box>
                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                          No payments found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchQuery || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Payments will appear here once orders are paid'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((payment, idx) => (
                    <TableRow
                      key={payment.id}
                      sx={zebraRowSx}
                      onClick={() => navigate(`/orders/${payment.order_id || payment.order}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                        >
                          #{payment.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            #{payment.order_id || payment.order}
                          </Typography>
                          {!isTablet && (
                            <FiExternalLink size={12} color="#9ca3af" />
                          )}
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }} noWrap>
                            {payment.customer_name || 'N/A'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell sx={{ px: { xs: 1.5, sm: 2 } }} align="right">
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              color: payment.mpesa_receipt_number || payment.mpesa_receipt ? 'text.primary' : 'text.disabled',
                            }}
                          >
                            {payment.mpesa_receipt_number || payment.mpesa_receipt || '—'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                        <Chip
                          label={payment.status?.replace('_', ' ') || 'Unknown'}
                          size="small"
                          color={paymentStatusColor(payment.status)}
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
                            {new Date(payment.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={payments.length}
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

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsPage;