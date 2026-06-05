import React from 'react';
import { Container, Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

/* ══════════════════════════════════════════════
   DashboardLayout
   Full-width container with page header + grid
══════════════════════════════════════════════ */
const DashboardLayout = ({ title, subtitle, children, actions }) => {
  return (
    <Box sx={{ bgcolor: '#f8fbff', minHeight: '100vh' }}>

      {/* Header bar */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(8px)',
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0 } }}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' }, lineHeight: 1.2 }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.4, lineHeight: 1.5 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {actions && (
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {actions}
                </Box>
              )}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Page content */}
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Grid container spacing={3}>
          {children}
        </Grid>
      </Container>
    </Box>
  );
};

/* ══════════════════════════════════════════════
   DashboardCard
   Metric/stat card with icon and hover lift
══════════════════════════════════════════════ */

const COLOR_SCHEMES = {
  primary: {
    iconBg: 'linear-gradient(135deg, #dbeeff 0%, #c6e4ff 100%)',
    iconColor: '#0066cc',
    accent: '#0066cc',
    border: '#c6e4ff',
    glow: 'rgba(0,102,204,0.12)',
  },
  success: {
    iconBg: 'linear-gradient(135deg, #d6f5e3 0%, #c0edcf 100%)',
    iconColor: '#1e8449',
    accent: '#1e8449',
    border: '#c0edcf',
    glow: 'rgba(30,132,73,0.10)',
  },
  warning: {
    iconBg: 'linear-gradient(135deg, #fff3d6 0%, #fde8b0 100%)',
    iconColor: '#b77700',
    accent: '#b77700',
    border: '#fde8b0',
    glow: 'rgba(183,119,0,0.10)',
  },
  error: {
    iconBg: 'linear-gradient(135deg, #fde6e6 0%, #f9caca 100%)',
    iconColor: '#c0392b',
    accent: '#c0392b',
    border: '#f9caca',
    glow: 'rgba(192,57,43,0.10)',
  },
};

export const DashboardCard = ({
  title,
  icon: Icon,
  children,
  color = 'primary',
  onClick,
  loading = false,
  colSpan = {},   // custom Grid col override
}) => {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.primary;

  const gridProps = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    ...colSpan,
  };

  return (
    <Grid item {...gridProps}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={onClick ? { y: -4, boxShadow: `0 12px 32px ${scheme.glow}` } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ height: '100%' }}
      >
        <Paper
          elevation={0}
          onClick={onClick}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '16px',
            cursor: onClick ? 'pointer' : 'default',
            border: '1px solid',
            borderColor: scheme.border,
            bgcolor: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'box-shadow 0.2s, transform 0.2s',
            '&:hover': onClick ? {
              boxShadow: `0 8px 28px ${scheme.glow}`,
            } : {},
          }}
        >
          {/* Icon + title row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{
              width: 44, height: 44,
              borderRadius: '12px',
              background: scheme.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {loading
                ? <Skeleton variant="circular" width={24} height={24} />
                : <Icon size={22} color={scheme.iconColor} strokeWidth={2} />
              }
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: '0.8rem', letterSpacing: 0.3, textTransform: 'uppercase' }}
            >
              {loading ? <Skeleton width={80} /> : title}
            </Typography>
          </Box>

          {/* Slot for metric value / content */}
          <Box sx={{ flexGrow: 1 }}>
            {loading
              ? <Skeleton variant="text" width="55%" height={36} />
              : children
            }
          </Box>
        </Paper>
      </motion.div>
    </Grid>
  );
};

export default DashboardLayout;