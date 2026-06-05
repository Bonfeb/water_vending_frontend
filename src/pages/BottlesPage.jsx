// src/pages/BottlesPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { FiDroplet } from 'react-icons/fi';

import PricingTable from '../components/products/PricingTable';
import BottleCard from '../components/products/BottleCard';
import productService from '../services/productService';

/* ─── Section header ─── */
const SectionHeader = ({ label, title }) => (
  <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
    {label && (
      <Typography
        variant="overline"
        color="primary.main"
        fontWeight={700}
        sx={{ letterSpacing: 2, display: 'block', mb: 0.5, fontSize: { xs: '0.65rem', md: '0.75rem' } }}
      >
        {label}
      </Typography>
    )}
    <Typography
      variant="h5"
      fontWeight={800}
      sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' } }}
    >
      {title}
    </Typography>
  </Box>
);

/* ─── Skeleton card ─── */
const BottleSkeleton = () => (
  <Box sx={{
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'white',
    p: 2,
  }}>
    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1.5, mb: 1 }} />
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="40%" height={20} />
  </Box>
);

/* ══════════════════════════════════════════════ */
const BottlesPage = () => {
  const [pricing, setPricing] = useState([]);
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pricingData, bottlesData] = await Promise.all([
          productService.getPricing(),
          productService.getBottles(),
        ]);

        const pricingArray = Array.isArray(pricingData)
          ? pricingData
          : Object.values(pricingData || {});

        const bottlesArray = Array.isArray(bottlesData)
          ? bottlesData
          : Object.values(bottlesData || {});

        const sortedBottles = bottlesArray.sort((a, b) => {
          const sizeA = parseFloat(a.size) || parseFloat(a.capacity) || 0;
          const sizeB = parseFloat(b.size) || parseFloat(b.capacity) || 0;
          return sizeA - sizeB;
        });

        setPricing(pricingArray);
        setBottles(sortedBottles);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Could not load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8fbff', minHeight: '100vh' }}>

      {/* ── Compact Page header banner ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #003d99 0%, #0066cc 50%, #0099e6 100%)',
        pt: { xs: 3, md: 4 },
        pb: { xs: 3, md: 4 },
        px: 2,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        {[
          { w: 250, h: 250, top: -80, right: -40, op: 0.07 },
          { w: 150, h: 150, bottom: -40, left: -30, op: 0.05 },
        ].map((b, i) => (
          <Box key={i} sx={{
            position: 'absolute', width: b.w, height: b.h,
            top: b.top, bottom: b.bottom, left: b.left, right: b.right,
            borderRadius: '50%', bgcolor: 'white', opacity: b.op, pointerEvents: 'none',
          }} />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', textAlign: { xs: 'center', md: 'left' } }}>
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ lineHeight: 1.2, fontSize: { xs: '1.5rem', md: '1.8rem' }, mb: 0.5 }}
            >
              Bottles & Pricing
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 480, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Choose your size, top up with M-Pesa, and get it delivered to your door.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Main Container - Minimized vertical padding */}
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 3 } }}>

        {/* ── Error state ── */}
        {error && (
          <Box sx={{
            p: 2, borderRadius: '12px',
            bgcolor: '#fff0f0', border: '1px solid #fdd',
            mb: 2.5, textAlign: 'center',
          }}>
            <Typography color="error.main" fontWeight={600} fontSize="0.85rem">{error}</Typography>
          </Box>
        )}

        {/* ── Pricing Table ── */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <PricingTable pricing={pricing} loading={loading} />
        </Box>

        {/* ── Divider ── */}
        <Box sx={{ height: '1px', bgcolor: 'divider', mb: { xs: 3, md: 4 } }} />

        {/* ── My Bottles ── */}
        <Box>
          <SectionHeader title="My Bottles" />

          {loading ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}>
              {[1, 2, 3].map((n) => <BottleSkeleton key={n} />)}
            </Box>
          ) : bottles.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{
                py: 4, textAlign: 'center',
                borderRadius: '16px',
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'white',
              }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2.5,
                  bgcolor: '#dbeeff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 1.5,
                }}>
                  <FiDroplet size={22} color="#0066cc" strokeWidth={1.5} />
                </Box>
                <Typography variant="body1" fontWeight={700} gutterBottom>
                  No bottles yet
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                  Your owned bottles will appear here once you place an order.
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}>
              {bottles.map((bottle, idx) => (
                <motion.div
                  key={bottle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                >
                  <BottleCard bottle={bottle} />
                </motion.div>
              ))}
            </Box>
          )}
        </Box>

      </Container>
    </Box>
  );
};

export default BottlesPage;