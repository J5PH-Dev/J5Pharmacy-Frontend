export interface CartItem {
  id: string;
  itemCode: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  category?: string;
  barcode?: string;
  discount?: number;
  brand?: string;
  dosage?: string;
  requiresPrescription?: boolean;
}

export interface ReceiptItem extends Omit<CartItem, 'discount'> {
  subtotal: number;
  discountAmount: number;
  total: number;
}
