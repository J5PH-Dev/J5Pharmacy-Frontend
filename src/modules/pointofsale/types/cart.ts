import { DiscountType } from './discount';

export interface CartItem {
  id: number;
  name: string;
  brand_name: string;
  barcode: string;
  price: number;
  quantity: number;
  stock: number;
  category_name?: string;
  requiresPrescription: boolean;
  unit_price?: number;
  subtotal?: number;
  category?: number;
  category_id?: number;
}

export interface CheckoutRequest {
  paymentMethod: 'cash' | 'card' | 'gcash' | 'maya';
  amountTendered: number;
  change: number;
  customerName?: string;
  starPointsId?: string;
  discountType: DiscountType;
  discountAmount: number;
  discountIdNumber?: string;
  items: CartItem[];
  subtotal: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  branchId: number;
  salesSessionId: number;
  pharmacistSessionId: number;
}

export interface CheckoutResponse {
  success: boolean;
  saleId: number;
  invoiceNumber: string;
  dailySequence: number;
} 