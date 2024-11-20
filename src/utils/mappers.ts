import { CartItem } from '../modules/pos/types/cart';

export const mapCartItemToReceiptItem = (cartItem: CartItem) => ({
  ...cartItem,
  subtotal: cartItem.price * cartItem.quantity,
  discountAmount: cartItem.discount || 0,
  total: (cartItem.price * cartItem.quantity) - (cartItem.discount || 0)
});
