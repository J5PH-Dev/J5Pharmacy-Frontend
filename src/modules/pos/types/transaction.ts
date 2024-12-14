import { CartItem } from './cart';
import { DiscountType } from '../components/TransactionSummary/types';

export interface Transaction {
  id: string;
  items: CartItem[];
  timestamp: string;
  total: number;
  status: 'active' | 'held' | 'completed' | 'cancelled';
  prescriptionRequired: boolean;
  prescriptionVerified?: boolean;
  notes?: string;
}

export interface HeldTransaction {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: string;
  holdTimestamp: string;
  status: 'held';
  prescriptionRequired: boolean;
  prescriptionVerified?: boolean;
  customerId?: string;
  customerName?: string;
  starPointsId?: string;
  discountType: DiscountType;
  holdReason?: string;
}
