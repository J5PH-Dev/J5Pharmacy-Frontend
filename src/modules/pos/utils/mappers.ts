import { CartItem } from '../types/cart';

export const cartItemToReceiptItem = (item: CartItem) => ({
  ...item,
  subtotal: item.price * item.quantity,
  discountAmount: item.discount || 0,
  total: (item.price * item.quantity) - (item.discount || 0)
});
