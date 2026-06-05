export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  ASSIGNED: 'assigned',
  PICKED: 'picked',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_TYPE = {
  PURCHASE: 'purchase',
  REFILL: 'refill'
};

export const BOTTLE_SIZES = [
  { value: 5, label: '5 Litres', icon: '💧' },
  { value: 10, label: '10 Litres', icon: '💧💧' },
  { value: 20, label: '20 Litres', icon: '💧💧💧' }
];

export const STATUS_COLORS = {
  pending: 'warning',
  paid: 'info',
  assigned: 'primary',
  picked: 'secondary',
  in_transit: 'info',
  delivered: 'success',
  cancelled: 'error'
};

export const STATUS_LABELS = {
  pending: 'Pending Payment',
  paid: 'Paid - Processing',
  assigned: 'Assigned to Rider',
  picked: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export const MAP_CENTER = { lat: -1.2921, lng: 36.8219 }; // Nairobi