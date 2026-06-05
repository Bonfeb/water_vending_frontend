// src/components/products/BottleCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { FiDroplet, FiTrash2, FiClock } from 'react-icons/fi';
import { formatDate } from '../../utils/formatters';

export const BottleCard = ({ bottle, onDeactivate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ── FIXED: pull size from nested bottle_details ──
  const sizeLitres = bottle.bottle_details?.capacity_litres || bottle.capacity_litres || '?';
  const isActive = bottle.is_active;
  const bottleCode = bottle.bottle_code || `#${bottle.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ height: '100%' }}
    >
      <Card elevation={0} sx={{
        borderRadius: 2.5, position: 'relative', overflow: 'hidden',
        border: '1px solid', borderColor: isActive ? 'rgba(0,0,0,0.06)' : 'error.light',
        bgcolor: isActive ? 'white' : 'error.50',
        boxShadow: isActive
          ? '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
          : '0 1px 3px rgba(211,47,47,0.08), 0 4px 12px rgba(211,47,47,0.06)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': isActive ? {
          boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.08)',
          borderColor: 'primary.light',
        } : {},
        height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: isActive
            ? 'linear-gradient(90deg, #1565c0, #42a5f5)'
            : 'linear-gradient(90deg, #c62828, #ef5350)',
        }} />

        <CardContent sx={{
          p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } },
          flex: 1, display: 'flex', flexDirection: 'column',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{
              width: { xs: 38, sm: 42 }, height: { xs: 38, sm: 42 },
              borderRadius: 2,
              background: isActive
                ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)'
                : 'linear-gradient(135deg, #ffebee, #ffcdd2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.3s ease',
            }}>
              <FiDroplet size={isMobile ? 18 : 20} color={isActive ? '#1565c0' : '#c62828'} />
            </Box>

            <Tooltip title={isActive ? 'Deactivate Bottle' : 'Bottle is inactive'} arrow>
              <IconButton size="small" color="error"
                onClick={() => onDeactivate?.(bottle.id)} disabled={!isActive}
                sx={{
                  bgcolor: isActive ? 'transparent' : 'error.100',
                  '&:hover': isActive ? { bgcolor: 'error.50' } : {},
                  transition: 'all 0.2s ease', p: 0.5,
                }}>
                <FiTrash2 size={isMobile ? 13 : 15} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ mt: { xs: 1.5, sm: 1.5 }, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography variant="h6" fontWeight={800}
                sx={{
                  letterSpacing: '-0.02em',
                  color: isActive ? 'text.primary' : 'error.dark',
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                }}>
                {/* ── FIXED: use capacity_litres from nested bottle_details ── */}
                {sizeLitres}L
              </Typography>
              <Typography variant="caption" fontWeight={600} color="text.secondary"
                sx={{
                  bgcolor: isActive ? 'grey.100' : 'error.100',
                  px: 0.75, py: 0.2, borderRadius: 0.75,
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                }}>
                Bottle
              </Typography>
            </Box>

            <Typography variant="caption"
              sx={{
                fontFamily: 'monospace', color: 'text.secondary',
                fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                letterSpacing: '0.04em', bgcolor: 'grey.50',
                px: 0.75, py: 0.4, borderRadius: 0.75,
                display: 'inline-block', mt: 0.75,
              }}>
              {/* ── FIXED: use bottle_code or fallback to ID ── */}
              {bottleCode}
            </Typography>
          </Box>

          <Box sx={{
            mt: 'auto', pt: { xs: 1.5, sm: 1.5 },
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid', borderColor: 'divider',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FiClock size={11} style={{ opacity: 0.5 }} />
              <Typography variant="caption" color="text.secondary"
                sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                Since {formatDate(bottle.purchase_date)}
              </Typography>
            </Box>

            <Chip label={isActive ? 'Active' : 'Inactive'} size="small"
              color={isActive ? 'success' : 'default'}
              sx={{
                fontWeight: 700, fontSize: { xs: '0.6rem', sm: '0.65rem' },
                height: { xs: 20, sm: 22 }, borderRadius: 1,
                ...(isActive && {
                  bgcolor: 'success.50', color: 'success.dark',
                  border: '1px solid', borderColor: 'success.200',
                }),
                ...(!isActive && { bgcolor: 'grey.100', color: 'grey.600' }),
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BottleCard;