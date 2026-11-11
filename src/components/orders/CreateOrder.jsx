import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button,
  Stepper, Step, StepLabel, Divider, CircularProgress,
  Alert, Container, IconButton, InputAdornment,
  Checkbox, FormControlLabel,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDroplet, FiMapPin, FiPhone, FiUser, FiShoppingBag,
  FiRefreshCw, FiArrowRight, FiArrowLeft, FiCheckCircle,
} from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import SuccessToast from '../common/SuccessToast';

const steps = ['Order Type', 'Details', 'Location & Payment'];

const SIZES = [
  { value: 5, label: '5L' },
  { value: 10, label: '10L' },
  { value: 20, label: '20L' },
];

const ORDER_TYPES = ['purchase', 'refill'];

const EMPTY_FORM = {
  order_type: 'purchase',
  size: 20,
  quantity: 1,
  guest_name: '',
  guest_phone: '',
  payment_phone: '',
  delivery_address: '',
  delivery_lat: null,
  delivery_lng: null,
  delivery_notes: '',
};

const CreateOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isGuest = !user;

  // ── Read ?order_type=&size= from the pricing table ──
  const typeParam = searchParams.get('order_type');
  const sizeParam = parseInt(searchParams.get('size'), 10);
  const validType = ORDER_TYPES.includes(typeParam);
  const validSize = SIZES.some((s) => s.value === sizeParam);

  const [activeStep, setActiveStep] = useState(validType && validSize ? 1 : 0);
  const [pricing, setPricing] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null); // guest confirmation
  const [samePhone, setSamePhone] = useState(true);     // guests: M-Pesa number = contact number

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    order_type: validType ? typeParam : EMPTY_FORM.order_type,
    size: validSize ? sizeParam : EMPTY_FORM.size,
  });

  useEffect(() => {
    productService.getPricing().then(setPricing).catch(() => {});
  }, []);

  // Logged-in users: default the M-Pesa number to their account phone
  useEffect(() => {
    if (user?.phone_number) {
      setFormData((prev) =>
        prev.payment_phone ? prev : { ...prev, payment_phone: user.phone_number }
      );
    }
  }, [user]);

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const getPriceForSize = (size) => {
    const p = pricing.find((px) => Number(px.size) === Number(size));
    if (!p) return null;
    const price = formData.order_type === 'purchase' ? p.purchase_price : p.refill_price;
    return Number(price);
  };

  // Same formula the backend uses: unit price × quantity
  const total = useMemo(() => {
    const unit = getPriceForSize(formData.size);
    return unit === null ? null : unit * formData.quantity;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing, formData.order_type, formData.size, formData.quantity]);

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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { delivery_lat, delivery_lng, guest_name, guest_phone, payment_phone, ...rest } = formData;

      const payload = {
        ...rest,
        payment_phone: isGuest && samePhone ? guest_phone.trim() : payment_phone.trim(),
        ...(isGuest && { guest_name: guest_name.trim(), guest_phone: guest_phone.trim() }),
        ...(delivery_lat && { delivery_lat }),
        ...(delivery_lng && { delivery_lng }),
      };

      const res = await orderService.createOrder(payload);

      if (isGuest) {
        // Guests can't open /orders/:id (private route), so confirm in place
        setPlacedOrder(res.order);
        setSuccess('Order placed successfully!');
        // TODO: trigger the M-Pesa STK push for res.order.id here
      } else {
        setSuccess('Order placed! Initiating M-Pesa payment...');
        setTimeout(() => navigate(`/orders/${res.order.id}`), 2500);
      }
    } catch (err) {
      const errorData = err.response?.data;
      const message =
        errorData?.error ||
        Object.values(errorData || {}).flat()[0] ||
        'Failed to place order. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAgain = () => {
    setPlacedOrder(null);
    setError(null);
    setActiveStep(0);
    setFormData({ ...EMPTY_FORM });
  };

  const canNext = () => {
    if (activeStep === 0) return !!formData.order_type;
    if (activeStep === 1) return !!(formData.size && formData.quantity >= 1);
    if (activeStep === 2) {
      const contactOk = !isGuest || (formData.guest_name.trim() && formData.guest_phone.trim());
      const payOk = (isGuest && samePhone) || formData.payment_phone.trim();
      return !!(contactOk && payOk && formData.delivery_address.trim());
    }
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
                <Grid size={{ xs: 12, sm: 6 }} key={type}>
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
              {SIZES.map(({ value, label }) => (
                <Grid size={{ xs: 4 }} key={value}>
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
                      <FiDroplet size={28} color={formData.size === value ? '#0066cc' : '#9e9e9e'} style={{ margin: '0 auto' }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>{label}</Typography>
                      {getPriceForSize(value) !== null && (
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
              onChange={(e) => update('quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
              inputProps={{ min: 1, max: 10 }}
              fullWidth
              sx={{ mb: 2 }}
            />

            {total !== null && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Estimated Total</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  {formatCurrency(total)}
                </Typography>
              </Box>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {isGuest && (
              <>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Your details</Typography>
                <TextField
                  fullWidth label="Full Name" sx={{ mb: 2 }}
                  value={formData.guest_name}
                  onChange={(e) => update('guest_name', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiUser size={18} /></InputAdornment> }}
                />
                <TextField
                  fullWidth label="Phone Number" sx={{ mb: 1 }}
                  value={formData.guest_phone}
                  onChange={(e) => update('guest_phone', e.target.value)}
                  placeholder="07XX XXX XXX"
                  helperText="We use this to contact you and to look up your order later"
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone size={18} /></InputAdornment> }}
                />
                <FormControlLabel
                  sx={{ mb: 1 }}
                  control={<Checkbox size="small" checked={samePhone} onChange={(e) => setSamePhone(e.target.checked)} />}
                  label={<Typography variant="body2">Pay with this number on M-Pesa</Typography>}
                />
              </>
            )}

            {(!isGuest || !samePhone) && (
              <TextField
                fullWidth label="M-Pesa Phone Number" sx={{ mb: 2, mt: isGuest ? 1 : 0 }}
                value={formData.payment_phone}
                onChange={(e) => update('payment_phone', e.target.value)}
                placeholder="07XX XXX XXX"
                InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone size={18} /></InputAdornment> }}
              />
            )}

            <TextField
              fullWidth label="Delivery Address" multiline rows={2} sx={{ mb: 2, mt: isGuest ? 1 : 0 }}
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
                  {total !== null ? formatCurrency(total) : '—'}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  /* ── Guest confirmation (shown instead of the form after a successful order) ── */
  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <FiCheckCircle size={56} color="#28a745" />
      <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>
        Order #{placedOrder.id} placed
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Keep your order number. You can look up this order later with your phone number.
      </Typography>

      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'left', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Order</Typography>
          <Typography variant="body2" fontWeight={600}>
            {placedOrder.order_type === 'purchase' ? 'New Bottle' : 'Refill'} — {placedOrder.size}L × {placedOrder.quantity}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Deliver to</Typography>
          <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right', maxWidth: '60%' }}>
            {placedOrder.delivery_address}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            {formatCurrency(placedOrder.total_amount)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => navigate('/')}>Back to home</Button>
        <Button variant="contained" onClick={handleOrderAgain}>Place another order</Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '80vh', bgcolor: '#f7f9fc', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="sm">
        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              bgcolor: 'white', border: '1px solid', borderColor: 'divider',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <FiArrowLeft size={18} />
          </IconButton>

          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Place an Order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {isGuest ? 'Ordering as a guest' : 'Order fresh water or refill your bottle'}
            </Typography>
          </Box>
        </Box>

        {/* ── Form Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={0} sx={{
            borderRadius: 3, border: '1px solid', borderColor: 'divider',
            overflow: 'hidden', bgcolor: 'white',
          }}>
            <Box sx={{ height: 4, background: 'linear-gradient(90deg, #0066cc 0%, #0099e6 100%)' }} />

            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              {placedOrder ? (
                renderConfirmation()
              ) : (
                <>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                      <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                  </Stepper>

                  <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep((s) => s - 1)}
                      startIcon={<FiArrowLeft />}
                    >
                      Back
                    </Button>
                    {activeStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        disabled={!canNext()}
                        onClick={() => setActiveStep((s) => s + 1)}
                        endIcon={<FiArrowRight />}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        disabled={!canNext() || loading}
                        onClick={handleSubmit}
                        endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FiShoppingBag />}
                      >
                        {loading ? 'Placing Order...' : 'Place Order & Pay'}
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>

      <SuccessToast open={!!success} message={success} onClose={() => setSuccess(null)} />
    </Box>
  );
};

export default CreateOrder;