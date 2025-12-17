// Utility function to format currency without decimals (no paisas)
export const formatCurrency = (amount) => {
  return Math.round(amount).toLocaleString('en-IN');
};

// Format currency with sign
export const formatCurrencyWithSign = (amount) => {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
};

// Format currency allowing negative with proper sign
export const formatSignedCurrency = (amount) => {
  const rounded = Math.round(amount);
  return `${rounded < 0 ? '-' : ''}₹${Math.abs(rounded).toLocaleString('en-IN')}`;
};
