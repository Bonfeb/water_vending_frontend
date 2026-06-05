import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, ToggleButton,
  ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Stepper, Step, StepLabel, Divider, CircularProgress, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDroplet, FiMapPin, FiPhone, FiShoppingBag, FiRefreshCw, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { BOTTLE_SIZES } from '../../utils/constants';

const steps = ['Order Type', 'Details', 'Location & Payment'];

const CreateOrderForm = ({ bottles = [], onSubmit, loading }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [pricing, setPricing] = useState([]);
  const [total, setTotal] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const [formData, setFormData] = useState({
    order_type: 'purchase',
    size: 20,
    quantity: 1,
    bottle_id: '',
    payment_phone: '',
    delivery_address: '',
    delivery_lat: null,
    delivery_lng: null,
    delivery_notes: '',
  });

  useEffect(() => {
    productService.getPricing().then(setPricing).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.size && formData.order_type) {
      setCalculating(true);
      productService.calculateTotal(formData.order_type, formData.size, formData.quantity)
        .then((res) => setTotal(res.total_amount))
        .catch(() => setTotal(null))
        .finally(() => setCalculating(false));
    }
  }, [formData.order_type, formData.size, formData.quantity]);

  const handleGeolocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData((prev) => ({
          ...prev,
          delivery_lat: pos.coords.latitude,
          delivery_lng: pos.coords.longitude,
        }));
      });
    }
  };

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    onSubmit({ ...formData, bottle_id: formData.bottle_id || undefined });
  };

  const getPriceForSize = (size) => {
    const p = pricing.find((px) => px.size === size);
    if (!p) return null;
    return formData.order_type === 'purchase' ? p.purchase_price : p.refill_price;
  };

  const canNext = () => {
    if (activeStep === 0) return !!formData.order_type;
    if (activeStep === 1) return formData.size && formData.quantity >= 1 && (formData.order_type !== 'refill' || formData.bottle_id);
    if (activeStep === 2) return formData.payment_phone && formData.delivery_address;
    return true;
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>What would you like to order?</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                { type: 'purchase', icon: FiShoppingBag, title: 'New Bottle', desc: 'Buy a new bottle with water' },
                { type: 'refill', icon: FiRefreshCw, title: 'Water Refill', desc: 'Refill your existing bottle' },
              ].map(({ type, icon: Icon, title, desc }) => (
                <Grid item xs={12} sm={6} key={type}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Paper
                      elevation={0}
                      onClick={() => update('order_type', type)}
                      sx={{
                        p: 3, borderRadius: 3, cursor: 'pointer',
                        border: '2px solid',
                        borderColor: formData.order_type === type ? 'primary.main' : 'divider',
                        bgcolor: formData.order_type === type ? 'primary.50' : 'white',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={32} color={formData.order_type === type ? '#0066cc' : '#9e9e9e'} />
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>{title}</Typography>
                      <Typography variant="body2" color="text.secondary">{desc}</Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Select bottle size</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
              {BOTTLE_SIZES.map(({ value, label, icon }) => (
                <Grid item xs={4} key={value}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Paper
                      elevation={0}
                      onClick={() => update('size', value)}
                      sx={{
                        p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center',
                        border: '2px solid',
                        borderColor: formData.size === value ? 'primary.main' : 'divider',
                        bgcolor: formData.size === value ? 'primary.50' : 'white',
                      }}
                    >
                      <Typography fontSize={28}>{icon}</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
                      {getPriceForSize(value) && (
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          {formatCurrency(getPriceForSize(value))}
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => update('quantity', Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: 10 }}
              fullWidth
              sx={{ mb: 2 }}
            />

            {formData.order_type === 'refill' && (
              <FormControl fullWidth>
                <InputLabel>Select Your Bottle</InputLabel>
                <Select
                  value={formData.bottle_id}
                  onChange={(e) => update('bottle_id', e.target.value)}
                  label="Select Your Bottle"
                >
                  {bottles.filter((b) => b.size === formData.size && b.is_active).map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.bottle_code} — {b.size}L</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {total !== null && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Estimated Total</Typography>
                {calculating ? (
                  <CircularProgress size={18} />
                ) : (
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                    {formatCurrency(total)}
                  </Typography>
                )}
              </Box>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <TextField
              fullWidth label="M-Pesa Phone Number" sx={{ mb: 2 }}
              value={formData.payment_phone}
              onChange={(e) => update('payment_phone', e.target.value)}
              placeholder="07XX XXX XXX"
              InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone size={18} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Delivery Address" multiline rows={2} sx={{ mb: 2 }}
              value={formData.delivery_address}
              onChange={(e) => update('delivery_address', e.target.value)}
              placeholder="Enter your full delivery address"
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><FiMapPin size={18} /></InputAdornment> }}
            />
            <Button
              variant="outlined" size="small" startIcon={<FiMapPin />}
              onClick={handleGeolocate} sx={{ mb: 2 }}
            >
              Use Current Location
            </Button>
            {formData.delivery_lat && (
              <Alert severity="success" sx={{ mb: 2 }}>GPS location captured ✓</Alert>
            )}
            <TextField
              fullWidth label="Delivery Notes (Optional)" multiline rows={2}
              value={formData.delivery_notes}
              onChange={(e) => update('delivery_notes', e.target.value)}
              placeholder="e.g., Apartment 4B, call on arrival"
            />

            <Divider sx={{ my: 3 }} />
            <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Order Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formData.order_type === 'purchase' ? 'New Bottle' : 'Refill'} — {formData.size}L × {formData.quantity}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {total ? formatCurrency(total) : '—'}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)} startIcon={<FiArrowLeft />}>
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" disabled={!canNext()} onClick={() => setActiveStep((s) => s + 1)} endIcon={<FiArrowRight />}>
            Next
          </Button>
        ) : (
          <Button variant="contained" disabled={!canNext() || loading} onClick={handleSubmit} endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FiShoppingBag />}>
            {loading ? 'Placing Order...' : 'Place Order & Pay'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CreateOrderForm;