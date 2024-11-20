import { CartItem } from '../types/cart';
import { ReceiptItem } from '../components/Receipt/types';

export const cartItemToReceiptItem = (cartItem: CartItem): ReceiptItem => ({
  name: `${cartItem.productName} ${cartItem.dosage}`,
  price: cartItem.price,
  quantity: cartItem.quantity,
  total: cartItem.price * cartItem.quantity,
});
