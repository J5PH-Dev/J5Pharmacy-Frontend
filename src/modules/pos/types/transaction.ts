import { CartItem } from './cart';

export interface Transaction {
  id: string;
  items: CartItem[];
  timestamp: string;
  total: number;
  status: 'active' | 'held' | 'completed' | 'cancelled';
  notes?: string;
  prescriptionRequired: boolean;
  prescriptionVerified?: boolean;
}

export interface HeldTransaction extends Transaction {
  holdTimestamp: string;
  holdReason?: string;
}
