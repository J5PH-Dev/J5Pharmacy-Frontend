export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptProps {
  transactionId: string;
  customerName?: string;
  starPointsId?: string;
  items: ReceiptItem[];
  subtotal: number;
  discountType?: string;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  starPointsEarned: number;
  timestamp: Date;
  paymentMethod: 'CASH' | 'GCASH' | 'MAYA';
  amountTendered?: number;
  change?: number;
  paymentReferenceId?: string;
  cashierName?: string;
  branchId?: string;
  branchAddress?: string;
  branchContact?: string;
}
