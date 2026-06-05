import React from 'react';
import { Box, Container, Typography, IconButton, Divider } from '@mui/material';
import { FiDroplet, FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  const socials = [
    { Icon: FiFacebook, href: '#', label: 'Facebook' },
    { Icon: FiTwitter, href: '#', label: 'Twitter' },
    { Icon: FiInstagram, href: '#', label: 'Instagram' },
  ];

  const contacts = [
    { Icon: FiPhone, text: '+254 700 123 456' },
    { Icon: FiMail, text: 'info@aquadrop.co.ke' },
    { Icon: FiMapPin, text: 'Nairobi, Kenya' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0a1929',
        color: 'white',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Main single-row bar ── */}
      <Container maxWidth="xl">
        <Box sx={{
          py: { xs: 2.5, md: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: { xs: 2, md: 0 },
          rowGap: 1.5,
        }}>

          {/* Brand */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            <Box sx={{
              width: 30, height: 30, borderRadius: '8px',
              background: 'linear-gradient(135deg, #0066cc, #0099e6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiDroplet size={16} color="white" strokeWidth={2} />
            </Box>
            <Typography fontWeight={800} sx={{ fontSize: '0.95rem', color: 'white', letterSpacing: 0.3 }}>
              AquaDrop
            </Typography>
          </Box>

          {/* Contact items */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2.5, md: 3.5 },
            flexWrap: 'wrap',
            rowGap: 1,
          }}>
            {contacts.map(({ Icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Icon size={13} color="rgba(255,255,255,0.45)" strokeWidth={2} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Right: socials + copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            {socials.map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                style={{ display: 'flex', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                <Icon size={17} strokeWidth={1.8} />
              </motion.a>
            ))}

            <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.12)', mx: 0.5 }} />

            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              © {new Date().getFullYear()} AquaDrop
            </Typography>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default Footer;