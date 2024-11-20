export type DiscountType = 'None' | 'Senior' | 'PWD' | 'Employee' | 'Custom';

export interface TransactionSummaryProps {
  transactionId: string;
  customerId?: string;
  customerName?: string;
  starPointsId?: string;
  subtotal: number;
  discountType: DiscountType;
  discountAmount: number;
  discountedSubtotal: number;
  vat: number;
  total: number;
  customValue?: number;
  onDiscountChange?: (type: DiscountType, customValue?: number) => void;
  currentDiscount?: DiscountType;
}
