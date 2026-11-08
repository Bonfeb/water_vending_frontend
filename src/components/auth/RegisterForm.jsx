import React, { useState } from 'react';
import {
  TextField, Button, InputAdornment, IconButton, Box, Typography,
  Grid, Alert, Collapse, CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye, FiEyeOff, FiPhone, FiLock, FiUser,
  FiArrowRight, FiArrowLeft, FiUserPlus,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { darkFieldSx } from './LoginForm';

const steps = ['Account', 'Personal'];

/* ── Compact dark stepper ── */
const StepIndicator = ({ activeStep, steps }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
    {steps.map((label, i) => (
      <React.Fragment key={label}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: i <= activeStep ? 1 : 0.35 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: i <= activeStep ? '#0066cc' : 'rgba(255,255,255,0.08)',
            color: i <= activeStep ? 'white' : 'rgba(255,255,255,0.35)',
            fontSize: '0.8rem', fontWeight: 700,
            transition: 'all 0.3s',
            boxShadow: i === activeStep ? '0 0 12px rgba(0,102,204,0.4)' : 'none',
          }}>
            {i + 1}
          </Box>
          <Typography variant="body2" sx={{
            color: i <= activeStep ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            fontWeight: i === activeStep ? 600 : 400,
            display: { xs: 'none', sm: 'block' },
          }}>
            {label}
          </Typography>
        </Box>
        {i < steps.length - 1 && (
          <Box sx={{
            flex: 1, height: 2, borderRadius: 1,
            bgcolor: i < activeStep ? '#0066cc' : 'rgba(255,255,255,0.06)',
            transition: 'all 0.3s',
          }} />
        )}
      </React.Fragment>
    ))}
  </Box>
);

/**
 * onRegistered(message) is called after a successful registration.
 * The parent (AuthModal) shows the toast and switches to the Sign In tab.
 */
const RegisterForm = ({ onSwitchToLogin, onRegistered }) => {
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    phone_number: '', password: '', first_name: '', last_name: '',
  });

  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.phone_number || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setError(null);
    setActiveStep(1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ ...formData });
      // Parent shows toast and flips to the Sign In tab
      onRegistered?.('Account created successfully! Please sign in.');
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === 'object') {
        setError(Object.values(d).flat()[0] || 'Registration failed.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter:  (dir) => ({ opacity: 0, x: dir * 20 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir * -20 }),
  };

  const primaryBtnSx = {
    px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600,
    background: 'linear-gradient(135deg, #0055b3 0%, #0088dd 100%)',
    boxShadow: '0 4px 24px rgba(0,102,204,0.35)',
    '&:hover': { background: 'linear-gradient(135deg, #004d9e 0%, #0077cc 100%)', boxShadow: '0 6px 32px rgba(0,102,204,0.45)' },
    '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)', boxShadow: 'none' },
  };

  return (
    <>
      <Collapse in={!!error}>
        <Alert severity="error" onClose={() => setError(null)} sx={{
          mb: 2, borderRadius: 2,
          bgcolor: 'rgba(211,47,47,0.12)', color: '#ff6b6b',
          '& .MuiAlert-icon': { color: '#ff6b6b' },
          '& .MuiAlert-action': { color: '#ff6b6b' },
        }}>
          {error}
        </Alert>
      </Collapse>

      <StepIndicator activeStep={activeStep} steps={steps} />

      <AnimatePresence mode="wait" custom={1}>
        {activeStep === 0 ? (
          <motion.div key="step0" custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
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
              helperText="Minimum 4 characters"
              sx={darkFieldSx}
            />
          </motion.div>
        ) : (
          <motion.div key="step1" custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="First Name" variant="outlined" margin="normal" required
                  value={formData.first_name} onChange={set('first_name')}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><FiUser size={18} /></InputAdornment>) }}
                  sx={darkFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Last Name" variant="outlined" margin="normal" required
                  value={formData.last_name} onChange={set('last_name')}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><FiUser size={18} /></InputAdornment>) }}
                  sx={darkFieldSx}
                />
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<FiArrowLeft />}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)',
            borderRadius: 2, textTransform: 'none',
            '&:hover': { borderColor: 'rgba(255,255,255,0.25)', bgcolor: 'rgba(255,255,255,0.04)' },
            '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.15)' },
          }}
        >
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FiUserPlus />}
            sx={primaryBtnSx}
          >
            {loading ? 'Creating…' : 'Create Account'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<FiArrowRight />}
            sx={primaryBtnSx}
          >
            Next
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Box component="span" onClick={() => onSwitchToLogin()} sx={{
            color: '#4da6ff', fontWeight: 600, cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}>
            Sign In
          </Box>
        </Typography>
      </Box>
    </>
  );
};

export default RegisterForm;