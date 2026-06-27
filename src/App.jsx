import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext'; // ← New
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal'; 
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import Users from './pages/Users';
import OrderDetailPage from './pages/OrderDetailPage';
import CreateOrder from './components/orders/CreateOrder'
import BottlesPage from './pages/BottlesPage';
import Pricing from './pages/Pricing';
import PaymentsPage from './pages/PaymentsPage';
import AdminPage from './components/admin/AdminPage';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    primary: { main: '#0066cc' },
    secondary: { main: '#00a8e8' },
    success: { main: '#28a745' },
    warning: { main: '#ffc107' },
    error: { main: '#dc3545' },
    background: { default: '#f8f9fa' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AuthModalProvider>
          
            <Router>
              <div className="app-wrapper">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    
                    {/* Redirect old auth routes to home (modals will handle auth) */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />
                    
                    <Route path="/dashboard" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
                    <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
                    <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
                    <Route path="/orders/new" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
                    <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
                    <Route path="/bottles" element={<PrivateRoute><BottlesPage /></PrivateRoute>} />
                    <Route path="/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
                    <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
              
              
              <AuthModal />

            </Router>
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;