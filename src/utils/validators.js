export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return /^254[0-9]{9}$/.test(cleaned) || /^0[0-9]{9}$/.test(cleaned);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateLocation = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};