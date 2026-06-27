import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';

const SuccessToast = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
      >
        <Alert
          onClose={onClose}
          severity="success"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >
          {message}
        </Alert>
      </motion.div>
    </Snackbar>
  );
};

export default SuccessToast;