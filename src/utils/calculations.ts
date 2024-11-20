import { CartItem } from '../types/cart';
import { DiscountType } from '../components/TransactionSummary/types';

const VAT_RATE = 0.12;

export const getDiscountRate = (discountType: DiscountType, customValue?: number): number => {
  switch (discountType) {
    case 'Senior':
    case 'PWD':
      return 0.20;
    case 'Employee':
      return 0.10;
    case 'Custom':
      return (customValue || 0) / 100;
    default:
      return 0;
  }
};

// Calculate subtotal before any discounts
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// Calculate discount for a single item
export const calculateItemDiscount = (price: number, quantity: number, discountType: DiscountType, customValue?: number): number => {
  const discountRate = getDiscountRate(discountType, customValue);
  return price * quantity * discountRate;
};

// Calculate total discount amount for all items
export const calculateDiscount = (items: CartItem[], discountType: DiscountType, customValue?: number): number => {
  return items.reduce((total, item) => {
    return total + calculateItemDiscount(item.price, item.quantity, discountType, customValue);
  }, 0);
};

// Calculate VAT on the discounted amount
export const calculateVAT = (discountedAmount: number): number => {
  return discountedAmount * VAT_RATE;
};

// Calculate all totals
export const calculateTotals = (items: CartItem[], discountType: DiscountType, customValue?: number) => {
  const subtotal = calculateSubtotal(items);
  const discountAmount = calculateDiscount(items, discountType, customValue);
  const discountedSubtotal = subtotal - discountAmount;
  const vat = calculateVAT(discountedSubtotal);
  const total = discountedSubtotal + vat;

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total,
    items: items.map(item => ({
      ...item,
      itemDiscount: calculateItemDiscount(item.price, item.quantity, discountType, customValue),
      discountedTotal: (item.price * item.quantity) - calculateItemDiscount(item.price, item.quantity, discountType, customValue)
    }))
  };
};
