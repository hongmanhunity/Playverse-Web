export const getDiscountedPrice = (price = 0, discount = 0) => {
  if (!price || price <= 0) return 0;
  return discount > 0 ? price * (1 - discount / 100) : price;
};

export const formatDateVi = (dateStr) => {
  if (!dateStr) return 'Mới phát hành';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};
