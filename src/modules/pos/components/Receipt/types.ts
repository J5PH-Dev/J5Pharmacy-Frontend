import { CartItem } from '../../types/cart';
import { DiscountType } from '../TransactionSummary/types';

export interface ReceiptProps {
  transactionId: string;
  timestamp: Date;
  cashierName: string;
  customerName?: string;
  starPointsId?: string;
  items: CartItem[];
  subtotal: number;
  discountType: DiscountType;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  amountTendered?: number;
  change?: number;
  starPointsEarned?: number;
  paymentMethod?: 'CASH' | 'GCASH' | 'MAYA';
  paymentReferenceId?: string;
  branchId?: string;
  branchAddress?: string;
  branchContact?: string;
}
