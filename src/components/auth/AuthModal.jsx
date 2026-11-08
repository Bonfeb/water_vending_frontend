import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDroplet } from 'react-icons/fi';
import { useAuthModal } from '../../context/AuthModalContext';
import SuccessToast from '../common/SuccessToast';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const tabs = ['Sign In', 'Create Account'];

const AuthModal = () => {
  const { open, mode, closeAuthModal } = useAuthModal();
  const [activeTab, setActiveTab] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (open) setActiveTab(mode === 'register' ? 1 : 0);
  }, [mode, open]);

  // Login success: show toast + close modal
  const handleLoginSuccess = (message) => {
    setToastMsg(message);
    closeAuthModal();
  };

  // Register success: show toast + move to Sign In tab (modal stays open)
  const handleRegistered = (message) => {
    setToastMsg(message);
    setActiveTab(0);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={closeAuthModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            m: { xs: 1.5, sm: 3 },
            maxHeight: { xs: '97vh', sm: '92vh' },
          },
        }}
        BackdropProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
          },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(165deg, #0d1b2a 0%, #152238 45%, #0f1d30 100%)',
            borderRadius: { xs: 3, sm: 4 },
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* ── Decorative background ── */}
          <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <Box
              sx={{
                position: 'absolute', width: 350, height: 350, top: -120, right: -80,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,102,204,0.13) 0%, transparent 70%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute', width: 250, height: 250, bottom: -80, left: -60,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,153,230,0.08) 0%, transparent 70%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </Box>

          {/* ── Close ── */}
          <IconButton
            onClick={closeAuthModal}
            sx={{
              position: 'absolute', top: 12, right: 12, zIndex: 10,
              color: 'rgba(255,255,255,0.3)',
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <FiX size={20} />
          </IconButton>

          {/* ── Fixed header ── */}
          <Box sx={{ position: 'relative', px: { xs: 3, sm: 4.5 }, pt: { xs: 3.5, sm: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box
                  sx={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 52, height: 52, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0066cc 0%, #0099e6 100%)',
                    mb: 2,
                    boxShadow: '0 8px 32px rgba(0,102,204,0.35), 0 0 60px rgba(0,102,204,0.12)',
                  }}
                >
                  <FiDroplet size={26} color="white" />
                </Box>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
                      {activeTab === 0 ? 'Welcome Back' : 'Join AquaDrop'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                      {activeTab === 0 ? 'Sign in to continue' : 'Create your account to get started'}
                    </Typography>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </Box>

            {/* ── Tab switcher ── */}
            <Box
              sx={{
                display: 'flex',
                bgcolor: 'rgba(255,255,255,0.04)',
                borderRadius: 2,
                p: 0.5,
                mb: 1,
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {tabs.map((label, idx) => (
                <Box
                  key={label}
                  onClick={() => setActiveTab(idx)}
                  sx={{
                    flex: 1, py: 1.2, textAlign: 'center', cursor: 'pointer',
                    borderRadius: 1.5, transition: 'all 0.25s ease',
                    bgcolor: activeTab === idx ? 'rgba(0,102,204,0.15)' : 'transparent',
                    color: activeTab === idx ? '#4da6ff' : 'rgba(255,255,255,0.3)',
                    fontWeight: activeTab === idx ? 600 : 400,
                    fontSize: '0.875rem',
                    border: activeTab === idx
                      ? '1px solid rgba(0,102,204,0.25)'
                      : '1px solid transparent',
                    '&:hover': {
                      bgcolor: activeTab === idx
                        ? 'rgba(0,102,204,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    },
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Scrollable form area ── */}
          <Box
            sx={{
              px: { xs: 3, sm: 4.5 },
              pb: { xs: 3, sm: 4 },
              pt: 2,
              position: 'relative',
              overflowY: 'auto',
              flex: 1,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 },
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === 0 ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                >
                  <LoginForm
                    onSwitchToRegister={() => setActiveTab(1)}
                    onSuccess={handleLoginSuccess}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <RegisterForm
                    onSwitchToLogin={() => setActiveTab(0)}
                    onRegistered={handleRegistered}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Dialog>

      {/* Lives OUTSIDE the Dialog so it stays visible after the modal closes */}
      <SuccessToast
        open={!!toastMsg}
        message={toastMsg}
        onClose={() => setToastMsg(null)}
      />
    </>
  );
};

export default AuthModal;