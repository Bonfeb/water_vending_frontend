import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Avatar, Typography, TextField, Button,
  IconButton, Chip, Tooltip, Collapse, Stack, useTheme, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination,
} from '@mui/material';
import {
  FiUser, FiPhone, FiEdit2, FiSave, FiTrash2, FiPlus,
  FiPackage, FiCamera, FiX, FiMapPin, FiClock, FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SuccessToast from '../components/common/SuccessToast';
import ErrorAlert from '../components/common/ErrorAlert';

const statusColor = (s) => {
  if (s === 'completed') return 'success';
  if (s === 'cancelled') return 'error';
  if (s === 'dispatched') return 'warning';
  if (s === 'paid') return 'info';
  return 'primary';
};

const zebraRowSx = {
  '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
  '&:hover': { bgcolor: '#eef2ff' },
};

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  });

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    delivery_address: '',
    delivery_notes: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/profile/');
        if (res.data.user) {
          setUser(res.data.user);
          setFormData({
            first_name: res.data.user.first_name || '',
            last_name: res.data.user.last_name || '',
            phone_number: res.data.user.phone_number || '',
          });
        }
        setOrders(res.data.orders || []);
      } catch (err) {
      }
    };
    fetchProfileData();
  }, [setUser]);

  const handleNewOrder = () => {
    navigate('/orders/new');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
    });
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setError(null);
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicture(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('phone_number', formData.phone_number);
      if (profilePicture) data.append('profile_picture', profilePicture);

      const res = await api.put('/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsEditing(false);
      setProfilePicture(null);
      setProfilePicturePreview(null);
      setSuccessMessage('Profile updated successfully!');
      setSuccessOpen(true);
    } catch (err) {
      const errorData = err.response?.data;
      const message =
        errorData && typeof errorData === 'object'
          ? Object.values(errorData).flat()[0]
          : 'Failed to update profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      await api.delete('/profile/');
      const updatedUser = { ...user, profile_picture: null };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccessMessage('Profile picture removed');
      setSuccessOpen(true);
    } catch {
      setError('Failed to remove profile picture.');
    }
  };

  const handleEditOrderClick = (order) => {
    setEditingOrderId(order.id);
    setOrderFormData({
      delivery_address: order.delivery_address,
      delivery_notes: order.delivery_notes,
    });
  };

  const handleCancelOrderEdit = () => {
    setEditingOrderId(null);
    setOrderFormData({ delivery_address: '', delivery_notes: '' });
  };

  const handleSaveOrder = async (orderId) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch('/profile/', {
        order_id: orderId,
        ...orderFormData,
      });
      setOrders(orders.map((o) => (o.id === orderId ? res.data.order : o)));
      setEditingOrderId(null);
      setSuccessMessage('Order updated successfully!');
      setSuccessOpen(true);
    } catch (err) {
      const errorData = err.response?.data;
      const message =
        errorData && typeof errorData === 'object'
          ? errorData.error || Object.values(errorData).flat()[0]
          : 'Failed to update order.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const full_name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
  const avatarLetter = full_name.charAt(0).toUpperCase() || 'U';
  const avatarSrc = profilePicturePreview || user?.profile_picture || '';

  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
      <SuccessToast
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />

      {/* ── Profile Card - Single Row Layout ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          {/* Left: Avatar + Name + Phone - Single Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                }}
              >
                {avatarLetter}
              </Avatar>
              {isEditing && (
                <label
                  htmlFor="profile-pic-upload"
                  style={{ cursor: 'pointer', position: 'absolute', bottom: -4, right: -4 }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                    }}
                  >
                    <FiCamera size={12} color="#fff" />
                  </Box>
                </label>
              )}
              <input
                type="file"
                id="profile-pic-upload"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {full_name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <FiPhone size={14} /> {user?.phone_number}
              </Typography>
              {profilePicturePreview && (
                <Typography variant="caption" color="primary.main">
                  New photo selected
                </Typography>
              )}
            </Box>
          </Box>

          {/* Middle: Editable Fields - Inline Row */}
          <Collapse in={isEditing} orientation="horizontal" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <TextField
                size="small"
                label="First name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                sx={{ flex: '1 1 140px', minWidth: 120 }}
              />
              <TextField
                size="small"
                label="Last name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                sx={{ flex: '1 1 140px', minWidth: 120 }}
              />
              <TextField
                size="small"
                label="Phone"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                sx={{ flex: '1 1 160px', minWidth: 130 }}
              />
            </Box>
          </Collapse>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto' }}>
            {user?.profile_picture && !isEditing && (
              <Tooltip title="Remove photo">
                <IconButton onClick={handleDeletePicture} color="error" size="small">
                  <FiTrash2 size={16} />
                </IconButton>
              </Tooltip>
            )}
            {!isEditing ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<FiEdit2 size={14} />}
                onClick={() => setIsEditing(true)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                {isMobile ? 'Edit' : 'Edit Profile'}
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FiSave size={14} />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </Stack>
            )}
          </Box>
        </Box>

        <ErrorAlert error={error} onClose={() => setError(null)} />
      </Paper>

      {/* ── Stats Row ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        {[
          { label: 'Total orders', value: orders.length, icon: FiPackage, color: '#0066cc' },
          { label: 'Active orders', value: activeOrders.length, icon: FiClock, color: '#f59e0b' },
          { label: 'Completed', value: completedOrders.length, icon: FiCheckCircle, color: '#10b981' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                flexShrink: 0,
                bgcolor: `${stat.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <stat.icon size={20} color={stat.color} strokeWidth={2} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {stat.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* ── Orders header with New Order button ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <FiPackage size={18} /> My Orders
        </Typography>

        <Button
          variant="contained"
          size="small"
          startIcon={<FiPlus size={16} />}
          onClick={handleNewOrder}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
          }}
        >
          {isMobile ? 'New' : 'New Order'}
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <FiPackage size={32} color="#ccc" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            No orders yet. Place your first order to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<FiPlus size={16} />}
            onClick={handleNewOrder}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Place an order
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#eef2ff' }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>
                    Order ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>
                    Type / Size
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>
                      Address
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>
                    Status
                  </TableCell>
                  {!isTablet && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>
                      Date
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2, textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow sx={zebraRowSx}>
                      <TableCell sx={{ px: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ fontFamily: 'monospace' }}
                        >
                          #{order.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2 }}>
                        <Typography variant="body2" noWrap>
                          {order.order_type === 'purchase' ? 'New' : 'Refill'} · {order.size}L × {order.quantity}
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ px: 2 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {order.delivery_address || '—'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell sx={{ px: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Ksh {order.total_amount}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2 }}>
                        <Chip
                          label={order.status.replace(/_/g, ' ')}
                          size="small"
                          color={statusColor(order.status)}
                          sx={{
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            fontSize: '0.68rem',
                          }}
                        />
                      </TableCell>
                      {!isTablet && (
                        <TableCell sx={{ px: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell sx={{ px: 2, textAlign: 'center' }}>
                        {['pending', 'preparing'].includes(order.status) && (
                          editingOrderId === order.id ? (
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton
                                size="small"
                                onClick={handleCancelOrderEdit}
                                color="inherit"
                              >
                                <FiX size={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleSaveOrder(order.id)}
                                disabled={saving}
                                color="primary"
                              >
                                <FiSave size={16} />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Tooltip title="Edit order">
                              <IconButton
                                size="small"
                                onClick={() => handleEditOrderClick(order)}
                                color="primary"
                              >
                                <FiEdit2 size={16} />
                              </IconButton>
                            </Tooltip>
                          )
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Inline Edit Row */}
                    {editingOrderId === order.id && (
                      <TableRow sx={{ bgcolor: '#fff7ed' }}>
                        <TableCell colSpan={isMobile ? 4 : isTablet ? 5 : 6} sx={{ px: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1.5,
                              flexWrap: 'wrap',
                              py: 1.5,
                            }}
                          >
                            <TextField
                              size="small"
                              label="Delivery address"
                              value={orderFormData.delivery_address}
                              onChange={(e) =>
                                setOrderFormData({
                                  ...orderFormData,
                                  delivery_address: e.target.value,
                                })
                              }
                              sx={{ flex: '1 1 200px', minWidth: 150 }}
                              InputProps={{
                                startAdornment: (
                                  <FiMapPin size={14} style={{ marginRight: 8, color: '#999' }} />
                                ),
                              }}
                            />
                            <TextField
                              size="small"
                              label="Delivery notes"
                              value={orderFormData.delivery_notes}
                              onChange={(e) =>
                                setOrderFormData({
                                  ...orderFormData,
                                  delivery_notes: e.target.value,
                                })
                              }
                              sx={{ flex: '1 1 200px', minWidth: 150 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={orders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-select': { fontSize: '0.875rem' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.875rem' },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ProfilePage;