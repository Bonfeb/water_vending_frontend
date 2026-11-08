import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField, Button, InputAdornment, IconButton, Box, Typography, CircularProgress,
} from '@mui/material';
import { FiEye, FiEyeOff, FiPhone, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ErrorAlert from '../common/ErrorAlert';

/* ── Reusable dark field styles ── */
export const darkFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(255,255,255,0.04)', color: '#fff', borderRadius: 2, fontSize: '0.95rem',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)', transition: 'all 0.2s' },
    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
    '&.Mui-focused': { bgcolor: 'rgba(0,102,204,0.05)' },
    '&.Mui-focused fieldset': { borderColor: '#0066cc', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', '&.Mui-focused': { color: '#4da6ff' } },
  '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.3)' },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.3)', ml: 0 },
  '& .MuiIconButton-root': { color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'rgba(255,255,255,0.7)' } },
  '& input::placeholder': { color: 'rgba(255,255,255,0.2)', opacity: 1 },
};

const ctaBtnSx = {
  py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600,
  background: 'linear-gradient(135deg, #0055b3 0%, #0088dd 100%)',
  boxShadow: '0 4px 24px rgba(0,102,204,0.35)', color: 'white', transition: 'all 0.2s ease',
  '&:hover': { background: 'linear-gradient(135deg, #004d9e 0%, #0077cc 100%)', boxShadow: '0 6px 32px rgba(0,102,204,0.45)', transform: 'translateY(-1px)' },
  '&:active': { transform: 'translateY(0)' },
  '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)', boxShadow: 'none' },
};

/**
 * onSuccess(message) is called after a successful login.
 * The parent (AuthModal) shows the toast and closes the modal.
 */
const LoginForm = ({ onSwitchToRegister, onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ phone_number: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile = await login(formData.phone_number, formData.password);

      // Show toast + close modal (handled by AuthModal)
      onSuccess?.('Login successful! Welcome back.');

      // Redirect based on role
      if (profile?.is_admin || profile?.is_superuser) {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      const d = err.response?.data;
      const message =
        d?.error || d?.detail || d?.non_field_errors?.[0] ||
        Object.values(d || {}).flat()[0] ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <TextField
        fullWidth label="Phone Number" variant="outlined" margin="normal" required
        value={formData.phone_number} onChange={set('phone_number')}
        InputProps={{ startAdornment: (<InputAdornment position="start"><FiPhone size={18} /></InputAdornment>) }}
        placeholder="07XX XXX XXX"
        sx={{ ...darkFieldSx, mb: 1.5 }}
      />

      <TextField
        fullWidth label="Password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined" margin="normal" required
        value={formData.password} onChange={set('password')}
        InputProps={{
          startAdornment: (<InputAdornment position="start"><FiLock size={18} /></InputAdornment>),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ ...darkFieldSx, mb: 3 }}
      />

      <Button
        type="submit" fullWidth variant="contained" size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FiLogIn />}
        sx={ctaBtnSx}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          Don&apos;t have an account?{' '}
          <Box component="span" onClick={() => onSwitchToRegister()} sx={{
            color: '#4da6ff', fontWeight: 600, cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}>
            Register
          </Box>
        </Typography>
      </Box>
    </form>
  );
};

export default LoginForm;