import React, { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Typography, Button, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FiDroplet, FiTruck, FiSmartphone, FiShield,
  FiArrowRight, FiCheckCircle, FiUser, FiUserCheck,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import PricingTable from '../components/products/PricingTable';
import { useAuthModal } from '../context/AuthModalContext';
import { useAuth } from '../context/AuthContext';

/* ─── Floating water droplet illustration ─── */
const WaterIllustration = () => (
  <motion.div
    animate={{ y: [0, -14, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    style={{ position: 'relative', display: 'inline-block' }}
  >
    <Box sx={{
      width: { md: 240, lg: 300 }, height: { md: 240, lg: 300 },
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 70%)',
      border: '1.5px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 32px 64px rgba(0,60,120,0.3), inset 0 0 60px rgba(255,255,255,0.1)',
    }}>
      <FiDroplet size={90} color="rgba(255,255,255,0.7)" strokeWidth={1.2} />
    </Box>
    {[
      { size: 18, top: '10%', right: '-8%', delay: 0.5 },
      { size: 12, bottom: '18%', right: '-12%', delay: 1.2 },
      { size: 22, top: '55%', left: '-10%', delay: 0.8 },
    ].map((d, i) => (
      <motion.div
        key={i}
        style={{ position: 'absolute', top: d.top, bottom: d.bottom, left: d.left, right: d.right }}
        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
      >
        <Box sx={{
          width: d.size, height: d.size,
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          bgcolor: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.5)',
        }} />
      </motion.div>
    ))}
  </motion.div>
);

/* ─── Feature card ─── */
const Feature = ({ icon: Icon, title, desc, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <Box sx={{
      textAlign: 'center', px: { xs: 1, md: 2 },
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Box sx={{
          width: 68, height: 68, borderRadius: '18px',
          background: 'linear-gradient(135deg, #dbeeff 0%, #e8f5ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5,
          boxShadow: '0 4px 16px rgba(0,102,204,0.12)',
        }}>
          <Icon size={28} color="#0066cc" strokeWidth={1.8} />
        </Box>
      </motion.div>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '1rem' }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>{desc}</Typography>
    </Box>
  </motion.div>
);

/* ─── Order Intent Dialog ─── */
const OrderIntentDialog = ({ open, onClose, onGuest, onSignIn }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 3,
        p: 1,
        maxWidth: 400,
        width: '100%',
        mx: 2,
      }
    }}
  >
    <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
      How would you like to order?
    </DialogTitle>
    <DialogContent sx={{ pb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        You can place an order as a guest or sign in to track it on your account.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ flexDirection: 'column', gap: 1.5, px: 3, pb: 3, alignItems: 'stretch' }}>
      <Button
        variant="contained"
        size="large"
        startIcon={<FiUserCheck size={18} />}
        onClick={onSignIn}
        sx={{ borderRadius: '10px', fontWeight: 600, py: 1.2 }}
      >
        Sign in to my account
      </Button>
      <Button
        variant="outlined"
        size="large"
        startIcon={<FiUser size={18} />}
        onClick={onGuest}
        sx={{ borderRadius: '10px', fontWeight: 600, py: 1.2, borderColor: 'divider', color: 'text.primary' }}
      >
        Continue as guest
      </Button>
    </DialogActions>
  </Dialog>
);

/* ══════════════════════════════════════════ */
const HomePage = () => {
  const [pricing, setPricing] = useState([]);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productService.getPricing().then(setPricing).catch(() => {});
  }, []);

  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (user) {
      scrollToPricing();
    } else {
      openAuthModal('register');
    }
  };

  /* ✅ FIX: Store order type & size, then show dialog */
  const handleOrderIntent = (orderType, size) => {
    setPendingOrder({ orderType, size });
    setOrderDialogOpen(true);
  };

  const handleContinueAsGuest = () => {
    setOrderDialogOpen(false);
    navigate(`/orders/new?order_type=${pendingOrder?.orderType}&size=${pendingOrder?.size}`);
  };

  const handleSignInToOrder = () => {
    setOrderDialogOpen(false);
    openAuthModal('login');
  };

  return (
    <Box>
      <OrderIntentDialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        onGuest={handleContinueAsGuest}
        onSignIn={handleSignInToOrder}
      />

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(145deg, #003d99 0%, #0066cc 45%, #0099e6 100%)',
        pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 },
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { w: 500, h: 500, top: -150, right: -100, opacity: 0.07 },
            { w: 320, h: 320, bottom: -100, left: -80, opacity: 0.05 },
            { w: 200, h: 200, top: '40%', left: '30%', opacity: 0.04 },
          ].map((b, i) => (
            <Box key={i} sx={{
              position: 'absolute', width: b.w, height: b.h,
              top: b.top, bottom: b.bottom, left: b.left, right: b.right,
              borderRadius: '50%', bgcolor: 'white', opacity: b.opacity,
            }} />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65 }}
              >
                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{ lineHeight: 1.15, mb: 2, fontSize: { xs: '2rem', md: '2.6rem', lg: '3rem' } }}
                >
                  Fresh Water,<br />Delivered Fast
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ opacity: 0.88, mb: 3, fontWeight: 400, fontSize: { xs: '0.95rem', md: '1.05rem' }, maxWidth: 460 }}
                >
                  Order 5L, 10L, or 20L water bottles online. Pay instantly with M-Pesa and track your rider live.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                  <Button
                    onClick={handleGetStarted}
                    variant="contained"
                    size="large"
                    endIcon={<FiArrowRight />}
                    sx={{
                      bgcolor: 'white', color: '#0055bb', fontWeight: 700,
                      '&:hover': { bgcolor: '#f0f7ff', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' },
                      borderRadius: '12px', px: 4, py: 1.4, fontSize: '0.95rem',
                      transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    {user ? 'View Pricing' : 'Get Started'}
                  </Button>

                  {!user && (
                    <Button
                      onClick={() => openAuthModal('login')}
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255,255,255,0.5)', color: 'white',
                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                        borderRadius: '12px', px: 4, py: 1.4, fontSize: '0.95rem',
                      }}
                    >
                      Sign In
                    </Button>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 }, opacity: 0.82 }}>
                  {['Fast Delivery', 'M-Pesa Payment', 'Live Tracking'].map((t) => (
                    <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <FiCheckCircle size={15} strokeWidth={2.5} />
                      <Typography variant="body2" fontWeight={500}>{t}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <WaterIllustration />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.2 }}
          >
            Why AquaDrop?
          </Typography>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 3, md: 4 },
        }}>
          {[
            { icon: FiDroplet,     title: 'Pure Water',      desc: 'Fresh, clean water in 5L, 10L, and 20L sizes for every home or office need.',                delay: 0   },
            { icon: FiSmartphone,  title: 'M-Pesa Payments', desc: 'Seamless STK Push payments — no cash, no hassle, instant confirmation.',                    delay: 0.1 },
            { icon: FiTruck,       title: 'Fast Delivery',   desc: 'Riders assigned instantly. Track your delivery live on the map in real time.',               delay: 0.2 },
            { icon: FiShield,      title: 'Refill & Save',   desc: 'Own a bottle and refill it for a fraction of the full-bottle price.',                        delay: 0.3 },
          ].map((f) => <Feature key={f.title} {...f} />)}
        </Box>
      </Container>

      {/* ── Pricing ── */}
      <Box
        id="pricing-section"
        sx={{ bgcolor: '#f0f7ff', py: { xs: 5, md: 7 }, borderTop: '1px solid', borderColor: '#ddeeff' }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mt: 1, fontSize: { xs: '1.75rem', md: '2.1rem' } }}
            >
              Transparent Pricing. No hidden fees, ever
            </Typography>
          </Box>
          {/* ✅ onOrder now receives (orderType, size) */}
          <PricingTable pricing={pricing} onOrder={handleOrderIntent} />
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;