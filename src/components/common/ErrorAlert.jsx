import React from 'react';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Collapse in={!!error}>
          <Alert
            severity="error"
            action={
              onClose && (
                <IconButton color="inherit" size="small" onClick={onClose}>
                  <FiX />
                </IconButton>
              )
            }
            sx={{ mb: 2, borderRadius: 2 }}
          >
            <AlertTitle>Error</AlertTitle>
            {typeof error === 'string' ? error : error.message || 'Something went wrong'}
          </Alert>
        </Collapse>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorAlert;