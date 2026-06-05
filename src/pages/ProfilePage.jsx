import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import SuccessToast from '../components/common/SuccessToast';
import ErrorAlert from '../components/common/ErrorAlert';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });

  console.log('[ProfilePage] Render — user:', user?.phone_number, '| isEditing:', isEditing, '| saving:', saving);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[ProfilePage] Field change → ${name}:`, name === 'password' ? '***' : value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = () => {
    console.log('[ProfilePage] Edit mode enabled');
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log('[ProfilePage] Cancel clicked — resetting form to current user data:', user);
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
    });
    setError(null);
    setIsEditing(false);
    console.log('[ProfilePage] State → isEditing: false, form reset, error cleared');
  };

  const handleSave = async () => {
    console.log('[ProfilePage] ── handleSave triggered ──────────────────');
    console.log('[ProfilePage] Payload to send:', formData);

    setSaving(true);
    setError(null);
    console.log('[ProfilePage] State → saving: true, error: null');

    try {
      console.log('[ProfilePage] Calling authService.updateProfile()...');
      const updated = await authService.updateProfile(formData);
      console.log('[ProfilePage] ✓ updateProfile() resolved. Response:', updated);

      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      console.log('[ProfilePage] ✓ AuthContext user updated, localStorage synced');

      setIsEditing(false);
      setSuccessOpen(true);
      console.log('[ProfilePage] State → isEditing: false, successOpen: true (toast should appear)');

    } catch (err) {
      const errorData = err.response?.data;
      console.error('[ProfilePage] ✗ updateProfile() rejected');
      console.error('[ProfilePage] HTTP status:', err.response?.status);
      console.error('[ProfilePage] Server response:', errorData || err.message);

      const message =
        errorData && typeof errorData === 'object'
          ? Object.values(errorData).flat()[0]
          : 'Failed to update profile. Please try again.';

      console.warn('[ProfilePage] Parsed error message:', message);
      setError(message);

    } finally {
      setSaving(false);
      console.log('[ProfilePage] State → saving: false');
      console.log('[ProfilePage] ── handleSave complete ───────────────────');
    }
  };

  const full_name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
  const avatarLetter = full_name.charAt(0).toUpperCase() || 'U';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <SuccessToast
        open={successOpen}
        message="Profile updated successfully!"
        onClose={() => {
          console.log('[ProfilePage] SuccessToast closed');
          setSuccessOpen(false);
        }}
      />

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>

        {/* Profile Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
              {avatarLetter}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {formData.first_name} {formData.last_name}
              </Typography>
              <Typography color="text.secondary">Member since 2023</Typography>
            </Box>
          </Box>

          <IconButton
            onClick={() => {
              if (isEditing) {
                console.log('[ProfilePage] Header save icon clicked → calling handleSave()');
                handleSave();
              } else {
                console.log('[ProfilePage] Header edit icon clicked → enabling edit mode');
                handleToggleEdit();
              }
            }}
            disabled={saving}
            color={isEditing ? 'primary' : 'default'}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {isEditing ? <FiSave size={20} /> : <FiEdit2 size={20} />}
          </IconButton>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <ErrorAlert
          error={error}
          onClose={() => {
            console.log('[ProfilePage] ErrorAlert dismissed');
            setError(null);
          }}
        />

        {/* Profile Fields */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <FiUser color="#666" />
              <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
            </Box>
            <TextField
              fullWidth
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              InputProps={{ disableUnderline: !isEditing }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <FiUser color="#666" />
              <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
            </Box>
            <TextField
              fullWidth
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              InputProps={{ disableUnderline: !isEditing }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <FiMail color="#666" />
              <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
            </Box>
            <TextField
              fullWidth
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              InputProps={{ disableUnderline: !isEditing }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <FiPhone color="#666" />
              <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
            </Box>
            <TextField
              fullWidth
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              InputProps={{ disableUnderline: !isEditing }}
            />
          </Grid>
        </Grid>

        {/* Save/Cancel buttons */}
        {isEditing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<FiSave />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProfilePage;