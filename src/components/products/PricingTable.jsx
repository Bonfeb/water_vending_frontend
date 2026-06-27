import React from 'react';
import {
  Box, Paper, Typography, Chip, Button, Skeleton, useMediaQuery, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { FiDroplet, FiShoppingBag, FiRefreshCw, FiCheck, FiStar } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

const sizeLabels = {
  5: 'Small',
  10: 'Medium',
  20: 'Large',
};

const PricingTable = ({ pricing, loading, onOrder }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const pricingArray = Array.isArray(pricing)
    ? pricing
    : Object.values(pricing || {});

  if (loading) {
    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        gap: { xs: 1.5, sm: 2 },
      }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={isMobile ? 210 : 230}
            sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (pricingArray.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{
          width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 },
          borderRadius: '50%', bgcolor: 'grey.100',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 1.5,
        }}>
          <FiDroplet size={isMobile ? 20 : 24} color="#999" />
        </Box>
        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
          No pricing information available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      gap: { xs: 1.5, sm: 2 },
      width: '100%',
    }}>
      {pricingArray.map((p, idx) => {
        // ✅ FIX: use p.size (integer) instead of p.capacity_litres
        const sizeNum = Number(p.size) || 20;
        const label = sizeLabels[sizeNum] || 'Standard';
        const isFeatured = sizeNum === 10;

        return (
          <motion.div
            key={p.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', width: '100%' }}
          >
            <Paper elevation={0} sx={{
              width: '100%', borderRadius: 2.5,
              border: '1px solid', borderColor: 'rgba(0,0,0,0.06)',
              overflow: 'hidden', position: 'relative',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 2px 12px rgba(21,101,192,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 28px rgba(21,101,192,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                borderColor: 'primary.light',
              },
            }}>
              {isFeatured && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                  <Chip icon={<FiStar size={11} />} label="Popular" size="small"
                    sx={{
                      bgcolor: 'primary.main', color: 'white', fontWeight: 700,
                      fontSize: '0.6rem', height: 22, borderRadius: 1,
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                  />
                </Box>
              )}

              {/* Header */}
              <Box sx={{
                background: 'linear-gradient(180deg, #e3f2fd 0%, #ffffff 100%)',
                px: 2, pt: 2.5, pb: 1.5, textAlign: 'center', position: 'relative',
              }}>
                <Box sx={{
                  position: 'absolute', top: -20, right: -20,
                  width: 60, height: 60, borderRadius: '50%',
                  bgcolor: 'primary.main', opacity: 0.05,
                }} />
                <Box sx={{
                  width: { xs: 38, sm: 42 }, height: { xs: 38, sm: 42 },
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 1, color: 'white',
                  boxShadow: '0 4px 12px rgba(21,101,192,0.15)',
                }}>
                  <FiDroplet size={isMobile ? 18 : 20} />
                </Box>
                {/* ✅ FIX: use p.size instead of p.capacity_litres */}
                <Typography variant="h6" fontWeight={900}
                  sx={{ color: 'primary.main', letterSpacing: '-0.03em', lineHeight: 1.1,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  {sizeNum}L
                </Typography>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                  {label} Bottle
                </Typography>
              </Box>

              {/* Pricing + Actions */}
              <Box sx={{ px: 2, py: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{
                  display: 'flex', justifyContent: 'space-between', mb: 1.5,
                  bgcolor: 'grey.50', borderRadius: 1.5, p: 1,
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block"
                      sx={{ fontSize: '0.65rem', mb: 0.25, lineHeight: 1 }}>
                      New Bottle
                    </Typography>
                    <Typography variant="body2" fontWeight={800}
                      sx={{ letterSpacing: '-0.01em' }}>
                      {formatCurrency(p.purchase_price)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block"
                      sx={{ fontSize: '0.65rem', mb: 0.25, lineHeight: 1 }}>
                      Refill
                    </Typography>
                    <Typography variant="body2" fontWeight={800}
                      sx={{ letterSpacing: '-0.01em' }}>
                      {formatCurrency(p.refill_price)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mb: 2 }}>
                  {['Free delivery on first order', 'BPA-free material', 'Sanitized before refill'].map((feat, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FiCheck size={11} color="primary.main" strokeWidth={2.5} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {feat}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                  <Button fullWidth variant="contained" size="small"
                    startIcon={<FiShoppingBag size={13} />}
                    onClick={() => onOrder?.('purchase', sizeNum)}
                    sx={{
                      borderRadius: 1.5, fontWeight: 700, textTransform: 'none',
                      fontSize: '0.75rem', py: 0.5,
                      background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                      boxShadow: '0 2px 8px rgba(21,101,192,0.2)',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(21,101,192,0.3)',
                        background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                      },
                    }}>
                    Buy
                  </Button>
                  <Button fullWidth variant="outlined" size="small"
                    startIcon={<FiRefreshCw size={13} />}
                    onClick={() => onOrder?.('refill', sizeNum)}
                    sx={{
                      borderRadius: 1.5, fontWeight: 700, textTransform: 'none',
                      fontSize: '0.75rem', py: 0.5, borderColor: 'divider', color: 'text.primary',
                      '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'primary.50' },
                    }}>
                    Refill
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default PricingTable;