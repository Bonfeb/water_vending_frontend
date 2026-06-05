import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const SIZES = [
  { value: 5, label: '5L', icon: '💧', desc: 'Small' },
  { value: 10, label: '10L', icon: '💧💧', desc: 'Medium' },
  { value: 20, label: '20L', icon: '💧💧💧', desc: 'Large' },
];

const SizeSelector = ({ value, onChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {SIZES.map((size) => (
        <motion.div key={size.value} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={{ flex: 1 }}>
          <Paper
            elevation={0}
            onClick={() => onChange(size.value)}
            sx={{
              p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center',
              border: '2px solid',
              borderColor: value === size.value ? 'primary.main' : 'divider',
              bgcolor: value === size.value ? 'primary.50' : 'white',
              transition: 'all 0.2s',
            }}
          >
            <Typography fontSize={24}>{size.icon}</Typography>
            <Typography variant="subtitle2" fontWeight={700}>{size.label}</Typography>
            <Typography variant="caption" color="text.secondary">{size.desc}</Typography>
          </Paper>
        </motion.div>
      ))}
    </Box>
  );
};

export default SizeSelector;