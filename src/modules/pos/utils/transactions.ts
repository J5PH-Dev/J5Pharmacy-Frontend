import { CartItem } from '../types/cart';
import { v4 as uuidv4 } from 'uuid';

export const generateTransactionId = (): string => {
  return uuidv4();
};

export const generateReceiptNumber = (): string => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `RCP-${timestamp}-${random}`;
};

export const calculateStarPoints = (items: CartItem[]): number => {
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  
  // 1 star point for every 100 pesos spent
  return Math.floor(totalAmount / 100);
};
