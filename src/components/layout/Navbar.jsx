import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Menu, MenuItem, Avatar, Box, Container, useMediaQuery,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  FiMenu, FiBell, FiUser, FiLogOut,
  FiHome, FiPackage, FiCreditCard, FiDroplet, FiUsers, FiLayout, FiTag,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const isAdmin = user?.is_admin;
  const avatarInitials = user
    ? `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || '?'
    : '?';

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const adminNavItems = [
    { label: 'Home',      path: '/',          icon: FiHome     },
    { label: 'Dashboard', path: '/dashboard', icon: FiLayout   },
    { label: 'Orders',    path: '/orders',    icon: FiPackage  },
    { label: 'Bottles',   path: '/bottles',   icon: FiDroplet  },
    { label: 'Pricing',   path: '/pricing',   icon: FiTag      },
    { label: 'Payments',  path: '/payments',  icon: FiCreditCard },
    { label: 'Users',     path: '/users',     icon: FiUsers    },
  ];

  const customerNavItems = [
    { label: 'Home', path: '/', icon: FiHome },
  ];

  const visibleItems = isAdmin ? adminNavItems : customerNavItems;

  /* active-path match: exact for '/', prefix for everything else */
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FiDroplet size={32} color={theme.palette.primary.main} />
        <Typography variant="h6" fontWeight={700}>AquaDrop</Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, pt: 1 }}>
        {visibleItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <item.icon size={19} />
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
          </ListItem>
        ))}
      </List>

      {isAuthenticated && (
        <>
          <Divider sx={{ mx: 2, my: 1 }} />
          <List sx={{ px: 1 }}>
            <ListItem
              component={Link}
              to="/profile"
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}><FiUser size={19} /></ListItemIcon>
              <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItem>
            <ListItem
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              sx={{ borderRadius: 2, color: 'error.main', cursor: 'pointer' }}
            >
              <ListItemIcon sx={{ color: 'error.main', minWidth: 36 }}><FiLogOut size={19} /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItem>
          </List>
        </>
      )}

      {!isAuthenticated && (
        <>
          <Divider sx={{ mx: 2, my: 1 }} />
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button fullWidth variant="outlined"
              onClick={() => { setMobileOpen(false); openAuthModal('login'); }}>
              Login
            </Button>
            <Button fullWidth variant="contained"
              onClick={() => { setMobileOpen(false); openAuthModal('register'); }}>
              Register
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <FiMenu />
            </IconButton>
          )}

          {/* Logo */}
          <Box component={Link} to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
              <FiDroplet size={32} color={theme.palette.primary.main} />
            </motion.div>
            <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
              AquaDrop
            </Typography>
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {visibleItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={<item.icon size={16} />}
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive(item.path) ? 700 : 400,
                    bgcolor: isActive(item.path) ? 'primary.50' : 'transparent',
                    borderRadius: 2,
                    px: 1.5,
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
                    <Badge badgeContent={3} color="error">
                      <FiBell size={20} />
                    </Badge>
                  </IconButton>
                )}

                <Tooltip title={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                      {avatarInitials}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 200 } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {user?.first_name} {user?.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.phone_number}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                    <FiUser size={18} style={{ marginRight: 12 }} /> Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <FiLogOut size={18} style={{ marginRight: 12 }} /> Logout
                  </MenuItem>
                </Menu>

                {isAdmin && (
                  <Menu
                    anchorEl={notifAnchor}
                    open={Boolean(notifAnchor)}
                    onClose={() => setNotifAnchor(null)}
                    PaperProps={{ sx: { borderRadius: 2, mt: 1, width: 320 } }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight={600}>Notifications</Typography>
                    </Box>
                    <MenuItem sx={{ py: 1.5 }}>
                      <Typography variant="body2">New order assigned to you</Typography>
                    </MenuItem>
                    <MenuItem sx={{ py: 1.5 }}>
                      <Typography variant="body2">Order #123 delivered successfully</Typography>
                    </MenuItem>
                  </Menu>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => openAuthModal('login')} variant="outlined" size="small">Login</Button>
                <Button onClick={() => openAuthModal('register')} variant="contained" size="small">Register</Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;