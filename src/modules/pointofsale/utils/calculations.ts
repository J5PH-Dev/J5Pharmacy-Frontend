import { CartItem } from '../types/cart';
import { DiscountType } from '../types/discount';

export const calculateTotals = (
  items: CartItem[],
  discountType: DiscountType,
  customDiscountValue?: number,
  pointsUsed: number = 0
) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;

  switch (discountType) {
    case 'Senior':
    case 'PWD':
      discountAmount = subtotal * 0.2;
      break;
    case 'Employee':
      discountAmount = subtotal * 0.1;
      break;
    case 'Points':
      // Calculate points discount (20 pesos per point)
      discountAmount = pointsUsed * 20;
      break;
    case 'Custom':
      discountAmount = customDiscountValue || 0;
      break;
    default:
      discountAmount = 0;
  }

  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const vat = discountedSubtotal * 0.12;
  const total = discountedSubtotal;

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    vat,
    total
  };
}; 