import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Box, Typography, Paper, Tooltip, IconButton, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Button, Chip, Snackbar, CircularProgress, Select, MenuItem,
  FormControl, InputLabel, TextField, useTheme, useMediaQuery,
} from '@mui/material';
import {
  FiUsers, FiSearch, FiRefreshCw, FiEdit2, FiTrash2, FiX, FiSave,
  FiUserPlus, FiAlertCircle,
} from 'react-icons/fi';
import api from '../services/api'

const zebraRowSx = {
  '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
  '&:hover': { bgcolor: '#eef2ff' },
};

const UsersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState(null);
  const [snackSeverity, setSnackSeverity] = useState('info');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  // Edit state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'customer',
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/');
      setUsers(res.data.results || res.data || []);
    } catch {
      showSnack('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSnack = (message, severity = 'info') => {
    setSnack(message);
    setSnackSeverity(severity);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      `${u.first_name || ''} ${u.last_name || ''} ${u.phone_number || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'staff' && u.is_staff_member) ||
      (filterRole === 'customer' && u.is_customer);

    // Note: Backend returns only active users for non-superuser, 
    // but we can filter client-side too if needed
    const matchesStatus = filterStatus === 'all' || true; // All users shown are active

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
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

  /* ── Edit handlers ── */
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      role: user.is_staff_member ? 'staff' : 'customer',
    });
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ first_name: '', last_name: '', phone_number: '', role: 'customer' });
    setEditError(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      setEditError('First name and last name are required.');
      return;
    }
    if (!editForm.phone_number.trim()) {
      setEditError('Phone number is required.');
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      const res = await api.put(`/users/${editingUserId}/`, editForm);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUserId ? res.data.user : u))
      );
      setEditingUserId(null);
      showSnack(res.data.message || 'User updated successfully', 'success');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const msg =
          errorData.error ||
          errorData.phone_number?.[0] ||
          errorData.first_name?.[0] ||
          errorData.last_name?.[0] ||
          errorData.role?.[0] ||
          Object.values(errorData).flat()[0];
        setEditError(msg);
      } else {
        setEditError('Failed to update user.');
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete handlers ── */
  const handleDeleteClick = (userId) => {
    setDeleteConfirmId(userId);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/users/${deleteConfirmId}/`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      showSnack(res.data.message || 'User deactivated successfully', 'success');
    } catch (err) {
      const errorData = err.response?.data;
      showSnack(errorData?.error || 'Failed to deactivate user.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

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
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FiUsers size={28} /> User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, edit, and manage user accounts
          </Typography>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
      >
        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            mb: 3,
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                Users
              </Typography>
              <Chip
                label={filteredUsers.length}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.25,
                  minWidth: 200,
                }}
              >
                <FiSearch size={16} color="#999" style={{ marginRight: 8, flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    width: '100%',
                    background: 'transparent',
                  }}
                />
              </Box>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filterRole}
                  label="Role"
                  onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="customer">Customers</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
              <Button
                size="small"
                startIcon={<FiRefreshCw size={14} />}
                onClick={fetchUsers}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Box>
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
                <TableRow sx={{ bgcolor: '#eef2ff' }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>Phone</TableCell>
                  {!isMobile && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>Role</TableCell>
                  )}
                  {!isTablet && (
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2 }}>Joined</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 2, textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <FiUsers size={40} color="#ccc" />
                        <Typography variant="body1" color="text.secondary">No users found</Typography>
                        <Typography variant="body2" color="text.disabled">
                          {searchQuery ? 'Try a different search term' : 'Users will appear here when they register'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => {
                    const isSelf = u.id === currentUserId;
                    const isEditing = editingUserId === u.id;
                    const isDeleting = deleteConfirmId === u.id;

                    return (
                      <React.Fragment key={u.id}>
                        <TableRow sx={zebraRowSx}>
                          <TableCell sx={{ px: 2 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                              #{u.id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ px: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  bgcolor: u.is_staff_member ? '#6366f1' : '#0066cc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {u.profile_picture ? (
                                  <Box
                                    component="img"
                                    src={u.profile_picture}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                ) : (
                                  `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || '?'
                                )}
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {u.first_name} {u.last_name}
                                </Typography>
                                {isSelf && (
                                  <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.65rem' }}>
                                    (You)
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {u.phone_number}
                            </Typography>
                          </TableCell>
                          {!isMobile && (
                            <TableCell sx={{ px: 2 }}>
                              <Chip
                                label={u.is_staff_member ? 'Staff' : 'Customer'}
                                size="small"
                                color={u.is_staff_member ? 'secondary' : 'primary'}
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                variant={u.is_staff_member ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell sx={{ px: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                {u.date_joined
                                  ? new Date(u.date_joined).toLocaleDateString()
                                  : '—'}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell sx={{ px: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              {isDeleting ? (
                                <>
                                  <Tooltip title="Cancel">
                                    <IconButton size="small" onClick={handleCancelDelete} color="inherit">
                                      <FiX size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                    sx={{
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      borderRadius: 1.5,
                                      minWidth: 0,
                                      px: 1.5,
                                    }}
                                  >
                                    {deleting ? '…' : 'Confirm'}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Tooltip title={isSelf ? "Can't edit yourself" : 'Edit user'}>
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditClick(u)}
                                        color="primary"
                                        disabled={isSelf}
                                      >
                                        <FiEdit2 size={16} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title={isSelf ? "Can't deactivate yourself" : 'Deactivate user'}>
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(u.id)}
                                        color="error"
                                        disabled={isSelf}
                                      >
                                        <FiTrash2 size={16} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Inline Edit Row */}
                        {isEditing && (
                          <TableRow sx={{ bgcolor: '#fff7ed' }}>
                            <TableCell
                              colSpan={isMobile ? 3 : isTablet ? 4 : 5}
                              sx={{ px: 2, py: 2 }}
                            >
                              {editError && (
                                <Alert
                                  severity="error"
                                  variant="outlined"
                                  onClose={() => setEditError(null)}
                                  sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.8rem' }}
                                >
                                  {editError}
                                </Alert>
                              )}
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                                Editing: {editForm.first_name} {editForm.last_name}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 1.5,
                                  flexWrap: 'wrap',
                                  alignItems: 'flex-end',
                                }}
                              >
                                <TextField
                                  size="small"
                                  label="First name"
                                  value={editForm.first_name}
                                  onChange={(e) => handleEditChange('first_name', e.target.value)}
                                  sx={{ flex: '1 1 140px', minWidth: 120 }}
                                  error={!editForm.first_name.trim()}
                                  helperText={!editForm.first_name.trim() ? 'Required' : ''}
                                />
                                <TextField
                                  size="small"
                                  label="Last name"
                                  value={editForm.last_name}
                                  onChange={(e) => handleEditChange('last_name', e.target.value)}
                                  sx={{ flex: '1 1 140px', minWidth: 120 }}
                                  error={!editForm.last_name.trim()}
                                  helperText={!editForm.last_name.trim() ? 'Required' : ''}
                                />
                                <TextField
                                  size="small"
                                  label="Phone number"
                                  value={editForm.phone_number}
                                  onChange={(e) => handleEditChange('phone_number', e.target.value)}
                                  sx={{ flex: '1 1 160px', minWidth: 140 }}
                                  error={!editForm.phone_number.trim()}
                                  helperText={!editForm.phone_number.trim() ? 'Required' : ''}
                                />
                                <FormControl size="small" sx={{ flex: '0 0 140px', minWidth: 120 }}>
                                  <InputLabel>Role</InputLabel>
                                  <Select
                                    value={editForm.role}
                                    label="Role"
                                    onChange={(e) => handleEditChange('role', e.target.value)}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <MenuItem value="customer">Customer</MenuItem>
                                    <MenuItem value="staff">Staff</MenuItem>
                                  </Select>
                                </FormControl>
                                <Box sx={{ display: 'flex', gap: 0.5, flex: '0 0 auto' }}>
                                  <Button
                                    size="small"
                                    onClick={handleCancelEdit}
                                    startIcon={<FiX size={14} />}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleSaveEdit}
                                    disabled={saving}
                                    startIcon={<FiSave size={14} />}
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                                  >
                                    {saving ? 'Saving…' : 'Save'}
                                  </Button>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-select': { fontSize: '0.85rem' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.85rem' },
            }}
          />
        </Paper>
      </Container>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(null)}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;