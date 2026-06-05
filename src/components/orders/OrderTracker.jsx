import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Chip, Avatar, Button, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { FiPhone, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import orderService from '../../services/orderService';
import { formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import { STATUS_LABELS } from '../../utils/constants';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const OrderTracker = ({ orderId }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTracking = useCallback(async () => {
    try {
      const data = await orderService.trackOrder(orderId);
      setTracking(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch tracking data');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchTracking]);

  const riderLat = parseFloat(tracking?.rider?.lat);
  const riderLng = parseFloat(tracking?.rider?.lng);
  const hasRiderLocation = !isNaN(riderLat) && !isNaN(riderLng);

  const deliveryLat = -1.2921;
  const deliveryLng = 36.8219;

  const mapCenter = hasRiderLocation
    ? [riderLat, riderLng]
    : [deliveryLat, deliveryLng];

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="warning">{error}</Alert>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Status bar */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Order #{tracking?.order_id} Tracking</Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Chip
              label={STATUS_LABELS[tracking?.status] || tracking?.status}
              sx={{
                bgcolor: `${getStatusColor(tracking?.status)}18`,
                color: getStatusColor(tracking?.status),
                fontWeight: 600,
              }}
            />
            <Button size="small" startIcon={<FiRefreshCw size={14} />} onClick={fetchTracking} variant="outlined">
              Refresh
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Rider info */}
      {tracking?.rider && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
                {tracking.rider.name?.[0]}
              </Avatar>
              <Box className="pulse-dot" sx={{ position: 'absolute', bottom: 2, right: 2 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>{tracking.rider.name}</Typography>
              <Typography variant="body2" color="text.secondary">Your delivery rider</Typography>
              {tracking.rider.updated_at && (
                <Typography variant="caption" color="success.main">
                  📍 Location updated {formatDate(tracking.rider.updated_at)}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<FiPhone />}
              href={`tel:${tracking.rider.phone}`}
              size="small"
            >
              Call Rider
            </Button>
          </Box>
        </Paper>
      )}

      {/* Map */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasRiderLocation && (
            <Marker position={[riderLat, riderLng]} icon={riderIcon}>
              <Popup>
                <strong>Rider: {tracking.rider?.name}</strong><br />
                En route to you!
              </Popup>
            </Marker>
          )}
          <Marker position={[deliveryLat, deliveryLng]} icon={deliveryIcon}>
            <Popup>Your delivery location</Popup>
          </Marker>
          {hasRiderLocation && (
            <Polyline
              positions={[[riderLat, riderLng], [deliveryLat, deliveryLng]]}
              color="#0066cc"
              dashArray="8 6"
              opacity={0.6}
            />
          )}
        </MapContainer>
      </Paper>
    </motion.div>
  );
};

export default OrderTracker;