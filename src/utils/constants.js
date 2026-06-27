export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DISPATCHED: 'dispatched',
  PREPARING: 'preparing',
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
  preparing: 'secondary',
  dispatched: 'info',
  delivered: 'success',
  cancelled: 'error'
};

export const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  preparing: 'Preparing',
  dispatched: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};