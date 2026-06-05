import { createContext, useContext, useState, useCallback } from 'react';

const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const openAuthModal = useCallback((m = 'login') => {
    setMode(m);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ open, mode, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
};