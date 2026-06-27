import React, { useState } from 'react';
import { Box, Grid, Tabs, Tab, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import OrderCard from './OrderCard';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { FiShoppingBag } from 'react-icons/fi';

const OrderList = ({ orders, onCancel, loading }) => {
  const [tab, setTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null });

  const tabs = [
    { label: 'All', filter: () => true },
    { label: 'Active', filter: (o) => ['pending', 'paid', 'assigned', 'picked', 'in_transit'].includes(o.status) },
    { label: 'Completed', filter: (o) => o.status === 'delivered' },
    { label: 'Cancelled', filter: (o) => o.status === 'cancelled' }
  ];

  const filteredOrders = orders.filter(tabs[tab].filter);

  const handleCancelConfirm = () => {
    onCancel?.(cancelDialog.orderId);
    setCancelDialog({ open: false, orderId: null });
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
            <Box sx={{ height: 280, borderRadius: 3, bgcolor: 'grey.100' }} className="shimmer" />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((t, index) => (
          <Tab key={t.label} label={t.label} />
        ))}
      </Tabs>

      <AnimatePresence mode="wait">
        {filteredOrders.length > 0 ? (
          <motion.div
            key={tabs[tab].label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Grid container spacing={3}>
              {filteredOrders.map((order) => (
                <Grid item xs={12} md={6} lg={4} key={order.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderCard
                      order={order}
                      onCancel={(id) => setCancelDialog({ open: true, orderId: id })}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        ) : (
          <motion.div
            key={`empty-${tabs[tab].label}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<FiShoppingBag size={48} />}
              title="No Orders Found"
              description={`There are no ${tabs[tab].label.toLowerCase()} orders to display.`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, orderId: null })}
        onConfirm={handleCancelConfirm}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
      />
    </Box>
  );
};

export default OrderList;