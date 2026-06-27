import React from 'react';
import { Box, Container, Paper, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FiDroplet } from 'react-icons/fi';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      bgcolor: 'grey.50',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', color: 'primary.main' }}>
                <FiDroplet size={120} style={{ marginBottom: 24 }} />
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  AquaDrop
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Fresh water, delivered fresh
                </Typography>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper elevation={0} sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {children}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthLayout;