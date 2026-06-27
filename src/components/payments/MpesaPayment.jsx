import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, CircularProgress,
  Alert, Stepper, Step, StepLabel, TextField, InputAdornment
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiCheckCircle, FiAlertCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import paymentService from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';

const paymentSteps = ['Initiate', 'Awaiting PIN', 'Confirmed'];

export const MpesaPayment = ({ orderId, amount, phoneNumber: defaultPhone, onSuccess }) => {
  const [phone, setPhone] = useState(defaultPhone || '');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutId, setCheckoutId] = useState(null);

  const initiatePush = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentService.initiateSTKPush(orderId, phone);
      setCheckoutId(res.checkout_request_id);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = useCallback(async () => {
    try {
      const res = await paymentService.getPaymentStatus(orderId);
      if (res.status === 'success') {
        setStep(2);
        setPolling(false);
        onSuccess?.();
      } else if (res.status === 'failed') {
        setError('Payment failed. Please try again.');
        setStep(0);
        setPolling(false);
      }
    } catch {}
  }, [orderId, onSuccess]);

  useEffect(() => {
    if (step === 1 && !polling) {
      setPolling(true);
      const interval = setInterval(checkStatus, 5000);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setPolling(false);
        if (step === 1) setError('Payment timed out. Please try again.');
      }, 120000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [step, checkStatus]);

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
          sx={{ height: 36 }}
          alt="M-Pesa"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Pay with M-Pesa</Typography>
          <Typography variant="body2" color="text.secondary">Amount: {formatCurrency(amount)}</Typography>
        </Box>
      </Box>

      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {paymentSteps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TextField
              fullWidth label="M-Pesa Phone Number" sx={{ mb: 2 }}
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="07XX XXX XXX"
              InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone size={18} /></InputAdornment> }}
            />
            <Button
              fullWidth variant="contained" size="large"
              onClick={initiatePush} disabled={!phone || loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FiPhone />}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
            >
              {loading ? 'Sending Request...' : 'Send STK Push'}
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <FiClock size={48} color="#0066cc" />
              </motion.div>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>Check Your Phone</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                An M-Pesa prompt has been sent to <strong>{phone}</strong>.
                Enter your PIN to complete payment.
              </Typography>
              <Button variant="outlined" startIcon={<FiRefreshCw />} onClick={checkStatus}>
                Check Status
              </Button>
            </Box>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <FiCheckCircle size={64} color="#28a745" />
              </motion.div>
              <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 2 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your order has been confirmed and will be processed shortly.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};

export const PaymentStatus = ({ orderId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getPaymentStatus(orderId)
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <CircularProgress size={24} />;
  if (!status) return null;

  const colors = { pending: 'warning', success: 'success', failed: 'error', cancelled: 'default' };

  return (
    <Alert severity={colors[status.status] || 'info'} icon={
      status.status === 'success' ? <FiCheckCircle /> : <FiAlertCircle />
    }>
      Payment {status.status}
      {status.mpesa_receipt && ` · Receipt: ${status.mpesa_receipt}`}
      {status.amount && ` · ${formatCurrency(status.amount)}`}
    </Alert>
  );
};

export default MpesaPayment;