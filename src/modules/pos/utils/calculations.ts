import { CartItem } from '../types/cart';
import { DiscountType } from '../components/TransactionSummary/types';

interface Totals {
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  items: CartItem[];
}

const calculateItemDiscount = (price: number, quantity: number, discountType: DiscountType, customValue?: number): number => {
  const subtotal = price * quantity;
  let discountPercentage = 0;

  switch (discountType) {
    case 'Senior':
    case 'PWD':
      discountPercentage = 0.20; // 20% discount
      break;
    case 'Employee':
      discountPercentage = 0.10; // 10% discount
      break;
    case 'Custom':
      if (customValue && customValue > 0) {
        discountPercentage = customValue / 100;
      }
      break;
    default:
      return 0;
  }

  return subtotal * discountPercentage;
};

export const calculateTotals = (
  items: CartItem[],
  discountType: DiscountType,
  customValue?: number
): Totals => {
  const itemsWithDiscounts = items.map(item => ({
    ...item,
    discount: calculateItemDiscount(item.price, item.quantity, discountType, customValue)
  }));

  const subtotal = itemsWithDiscounts.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const discountAmount = itemsWithDiscounts.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  const discountedSubtotal = subtotal - discountAmount;
  const vat = discountedSubtotal * 0.12; // 12% VAT
  const total = discountedSubtotal + vat;

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total,
    items: itemsWithDiscounts
  };
};
