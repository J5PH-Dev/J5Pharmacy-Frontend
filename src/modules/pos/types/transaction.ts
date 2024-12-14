import { CartItem } from './cart';
import { DiscountType } from '../components/TransactionSummary/types';

export interface Transaction {
  id: string;
  items: CartItem[];
  timestamp: string;
  total: number;
  subtotal: number;
  discountType: DiscountType;
  discountAmount: number;
  vat: number;
  prescriptionRequired: boolean;
  prescriptionVerified: boolean;
  customerId?: string;
  customerName?: string;
  starPointsId?: string;
  starPointsEarned?: number;
}

export interface HeldTransaction {
  id: string;
  items: CartItem[];
  timestamp: string;
  holdTimestamp: string;
  total: number;
  status: 'held';
  holdReason?: string;
  prescriptionRequired: boolean;
  prescriptionVerified: boolean;
  discountType: DiscountType;
  customerId?: string;
  customerName?: string;
  starPointsId?: string;
}
