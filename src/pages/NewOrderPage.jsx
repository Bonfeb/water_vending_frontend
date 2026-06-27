import React, { useState } from 'react';
import { Container, Box, Typography, IconButton, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import orderService from '../services/orderService';
import CreateOrderForm from '../components/orders/CreateOrder';
import SuccessToast from '../components/common/SuccessToast';

const NewOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.createOrder(data);
      setSuccess('Order placed! Initiating M-Pesa payment...');
      setTimeout(() => navigate(`/orders/${res.order.id}`), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '80vh', 
      bgcolor: '#f7f9fc',
      py: { xs: 2, sm: 3, md: 4 } 
    }}>
      <Container maxWidth="sm">
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: { xs: 2, sm: 3 } 
        }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            size="small"
            sx={{ 
              bgcolor: 'white', 
              border: '1px solid', 
              borderColor: 'divider',
              '&:hover': { bgcolor: 'grey.100' } 
            }}
          >
            <FiArrowLeft size={18} />
          </IconButton>
          
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Place an Order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Order fresh water or refill your bottle
            </Typography>
          </Box>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={0} sx={{ 
            borderRadius: 3, 
            border: '1px solid', 
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: 'white'
          }}>
            <Box sx={{ height: 4, background: 'linear-gradient(90deg, #0066cc 0%, #0099e6 100%)' }} />
            
            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2.5, borderRadius: 2 }} 
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <CreateOrderForm onSubmit={handleSubmit} loading={loading} />
            </Box>
          </Paper>
        </motion.div>

      </Container>

      <SuccessToast open={!!success} message={success} onClose={() => setSuccess(null)} />
    </Box>
  );
};

export default NewOrderPage;